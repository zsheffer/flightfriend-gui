var passport		= require('passport'),
	pass			= require("../config/pass"),
	path			= require('path'),
	db				= require('../config/dbschema'),
	uuid			= require('node-uuid'),
	ejs				= require("ejs");
	
var mail			= require('../routes/mail');

// ==========
// ==========

exports.getDashboard		= function(req, res) {

	return db.tokenModel.find(function(err, tokens) {
	
		openInviteCount = 0;
		for(var key in tokens) {
			tokens[key].verified !== true ? openInviteCount += 1 : null;
		}
			
		return db.userModel.find(function(err, users) {
		
			curPage = {}
			curPage['current'] = 'dashboard';
		
			res.render('dashboard', { user: req.user, users: users, tokens: tokens, inviteCount:openInviteCount, reqPage:curPage, message: req.flash('inviteMessage')  });
		});
	});
	
};

exports.getCustomers		= function(req, res) {
	return db.userModel.find(function(err, users) {
	
		curPage = {}
		curPage['current'] = 'mentor';
	
		res.render('mentors', { user: req.user, users: users, reqPage:curPage, message: req.flash('inviteMessage') });
	});
};

exports.getCustomerByID		= function( req, res ) {
		
	var _id = req.route.params.id;
	// console.log("find by: " + _id);
	
	db.userModel.findOne({ '_id' : _id }, function (err, newUser) {
	
		curPage = {}
		curPage['current'] = 'mentor';
		
		res.render('mentor', { user: req.user, display: newUser, reqPage:curPage  });
	})
};

exports.destroyCustomerByID = function( req, res ) {
		
	var _id = req.route.params.id;
	// console.log("find by: " + _id);
	
	db.userModel.remove({ '_id' : _id }, function (err) {
		res.redirect('/');
	})
};

exports.getInvoiceByID		= function( req, res ){
	
	var _id = req.route.params.id;
	// console.log("find by: " + _id);
	
	res.send( 200 );
	
};

exports.getForms			= function( req, res ){
	
	res.render( 'forms' );
	
};



exports.getTokens	= function(req, res) {
	return db.tokenModel.find(function(err, tokens) {
		res.send( tokens );
	});
};

exports.getAllUsers	= function(req, res) {
	return db.userModel.find(function(err, users) {
		res.send( users );
	});
};

exports.account = function(req, res) {
	res.render('account', { user: req.user });
};

exports.getsuccess = function(req, res) {
	res.render('success', { user: req.user });
};

exports.getLogin = function(req, res) {
  res.render('login', { user: req.user, message: req.flash('loginMessage') });
};

exports.admin = function(req, res) {
	res.send('access granted admin!');
};

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
//   
// ***** This version has a problem with flash messages
/*
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });
*/

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};
