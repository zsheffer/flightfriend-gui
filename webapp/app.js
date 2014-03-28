
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
app.engine('ejs', engines.ejs);
// use jade for jade
app.engine('jade', engines.jade);
// .html as default view extension
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


// User pages
app.get('/login',	uRoutes.getLogin);
app.post('/login', passport.authenticate('local', {
	failureRedirect: '/login' }),
	function(req, res) { res.redirect('/');
});


app.get('/public/mentors', uRoutes.getPublicMentors );


// routes that require authentication
app.get('/',						pass.ensureAuthenticated, uRoutes.getMentors);
app.get('/mentors', 				pass.ensureAuthenticated, uRoutes.getMentors);
app.post('/invite',					pass.ensureAuthenticated, mail.invite, function(req,res){ res.redirect('/mentors')} );
app.post('/reinvite',				pass.ensureAuthenticated, mail.invite, function(req,res){ res.redirect('/dashboard')} );
app.get('/mentors/:id',				pass.ensureAuthenticated, uRoutes.getMentorById);
app.post('/mentors/:id/destroy',	pass.ensureAuthenticated, uRoutes.destroyMentorById);
app.get('/find',					pass.ensureAuthenticated, uRoutes.getFind);
app.get('/find/users.json',			pass.ensureAuthenticated, uRoutes.getFindUsers);
app.post('/search',					pass.ensureAuthenticated, uRoutes.postSearch);
app.get('/dashboard', 				pass.ensureAuthenticated, uRoutes.getDashboard);

app.get('/venture',					function(req, res) { res.render('404') });
app.get('/ventures',				function(req, res) { res.render('404') });
app.get('/entrepreneur',			function(req, res) { res.render('404') });
app.get('/entrepreneurs',			function(req, res) { res.render('404') });

app.get('/tokens', 	pass.ensureAuthenticated, uRoutes.getTokens);
app.get('/users', 	pass.ensureAuthenticated, uRoutes.getUsers);

app.post('/mentors/:id/ventureAdd',		pass.ensureAuthenticated, uRoutes.addVentureMentorProfile);
app.post('/mentors/:id/ventureRemove',	pass.ensureAuthenticated, uRoutes.removeVentureMentorProfile);

app.post('/mentors/:id/favoriteAdd',	pass.ensureAuthenticated, uRoutes.addFavoriteMentorProfile);
app.post('/mentors/:id/favoriteRemove',	pass.ensureAuthenticated, uRoutes.removeFavoriteMentorProfile);

app.post('/welcomed',					pass.ensureAuthenticated, uRoutes.welcomeUser);
app.post('/modifyMentorDetails',		pass.ensureAuthenticated, uRoutes.modifyMentorDetails);

app.post('/download/mentors',			pass.ensureAuthenticated, uRoutes.downloadMentors );

app.get("/verify/:token", function (req, res, next) {

	var token = req.params.token;
	console.log( token )
	
	pass.verifyToken(token, function(err) {
        if (err) return res.redirect("/401");
		
		req.session.token	= 'valid';
		req.session.tokenid	= token;
		
		// res.render('admin/mentors', { user: req.user, users: users });
		res.redirect('/auth/linkedin');
	}
)});

// GET /auth/linkedin
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in LinkedIn authentication will involve
//   redirecting the user to linkedin.com.  After authorization, LinkedIn will
//   redirect the user back to this application at /auth/linkedin/callback

// The request will be redirected to LinkedIn for authentication, so this
// function will not be called.

app.get('/auth/linkedin', passport.authenticate('linkedin'), function(req, res){ });


// GET /auth/linkedin/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called
app.get('/auth/linkedin/callback', passport.authenticate('linkedin',
	{ failureRedirect: '/' }),
	function(req, res) {
		res.redirect('/');
	});









app.get('/logout', function(req, res){
	req.session.destroy();
	req.logout();
	res.redirect('/');
});

// construction page
app.get('/construction', function(req, res){ res.render('construction'); });

app.get('/401', function(req, res){ res.render('401'); });

// these must be the last routes to work properly
app.get('*', function(req, res){ res.render('404'); });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
