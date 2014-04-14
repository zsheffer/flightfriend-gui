
/**
 * Module dependencies.
 */

var express			= require('express'),
	passport		= require('passport'),
	pass			= require('./config/pass'),
    util			= require('util'),
	http			= require('http'),
	path			= require('path'),
	mail			= require('./routes/mail'),
	bRoutes			= require('./routes/basic'),
	uRoutes			= require('./routes/user'),
	engines 		= require('consolidate'),
	app				= express(),
	flash			= require('connect-flash');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');

// use ejs for html
app.engine('html', engines.ejs);
app.set('view engine', 'html');

// development only
app.configure('development', function(){
	app.use(express.logger('dev'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.logger());
	app.use(express.errorHandler());
});

app.configure(function(){
	/* app.locals.pretty = true; */
	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'keyboard cat' }));
	
	// required for passport
	app.use(passport.initialize());		// Initialize Passport!  Also use passport.session() middleware, to support
	app.use(passport.session());		// persistent login sessions
	app.use(flash());					// use connect-flash for flash messages stored in session
	
	app.use(express.methodOverride());
	app.use(express.errorHandler());
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(app.router);
});

// use for authentication middleware
function checkAuth(req, res, next){
	// console.log(req.session);
    if (req.session.user != null){ return next(); }
    res.redirect('/login');
}


// routes that DO NOT require authentication
app.get('/',				function( req, res ){ res.render('landing') });
app.get('/signup',			function( req, res ){ res.render('signup-rotate') });

app.get('/terms',			function( req, res ){ res.render('404'); });

app.get('/contact-us',		function( req, res ){ res.render('contact-us') });
app.get('/about-us',		function( req, res ){ res.render('about-us') });
app.get('/construction',	function( req, res ){ res.render('construction'); });


// routes that help to authenticate a user
app.get('/login',	uRoutes.getLogin);
app.post('/login',	passport.authenticate('local', {
	failureRedirect: '/login' }),
	function(req, res) { res.redirect('/');
});


// routes that REQUIRE authentication
app.get('/forms',			uRoutes.getForms );
app.get('/invoice/:id',		checkAuth, uRoutes.getInvoiceByID );

app.get('/logout', function(req, res){
	req.session.destroy();
	req.logout();
	res.redirect('/');
});


// routes for errors
app.get('/401',		function(req, res){ res.render('401'); });

// these must be the last routes to work properly
app.get('*',		function(req, res){ res.render('404'); });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
