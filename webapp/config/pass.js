var passport			= require('passport'),
	LocalStrategy		= require('passport-local').Strategy,
	db					= require('./dbschema'),
	ejs					= require("ejs"),
	uuid				= require('node-uuid');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete LinkedIn profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.userModel.findById(id, function (err, user) {
    done(err, user);
  });
});


// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use(new LocalStrategy({
	passReqToCallback : true	// allows us to pass back the entire request to the callback	
},
	function(req, username, password, done) {
		db.userModel.findOne({ 'auth.local.username': username }, function (err, user) {
			// if there are any errors, return the error before anything else
			if (err)
				return done(err);
				
			// if no user is found, return the message
			if (!user)
				return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
				
			// if the user is found but the password is wrong
			if (user.auth.local.password !== password)
				return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
			
			// all is well, return successful user
			return done(null, user);
		});
	}
));

exports.verifyToken = function(token, done) {
    db.tokenModel.findOne({token: token}, function (err, token){
        if (err) return done(err);
        
        token.verified = true;
        token.acceptedDate = Date.now();
        
        token.save(function(err) {
        	done(err);
        })
    })
};

exports.verifyUser = function(token, done) {
    db.userModel.findOne({token: token}, function (err, user){
        if (err) return done(err);
        user["verified"] = true;            
        user.save(function(err) {
        	done(err);
        })
    })
};



// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {

	if ( req.isAuthenticated() && req.user.verified ){
		return next();
	}
	res.redirect('/login')
}


// Check for admin middleware, this is unrelated to passport.js
// You can delete this if you use different method to check for admins or don't need admins
exports.ensureAdmin = function ensureAdmin(req, res, next) {
    return function(req, res, next) {

	/* 	console.log(req.user); */
	if ( req.user && req.user.roles.admin === true )
		return next();
    }
    res.send(403);
}
