var passport		= require('passport'),
	pass			= require("../config/pass"),
	path			= require('path'),
	db				= require('../config/dbschema'),
	uuid			= require('node-uuid'),
	ejs				= require("ejs");
	
var mail			= require('../routes/mail');
	
/*
exports.getUsers = function(req, res) {
	res.render('users', { users: req.user.list });
};
*/

/*

function sendVerificationEmail(options, done) {
    var deliver = function (textBody, htmlBody) {
        postmark.send({
            "From":		"zsheffer@samurai-investments.com",
            "To":		options.email,
            "Subject":	"Invitation to Northeastern Mentors",
            "TextBody":	textBody,
            "HtmlBody":	htmlBody
        }, done);
    };
    
    console.log( __dirname )
    
    ejs.renderFile( __dirname + '/email-templates/email-text.ejs', options, function (err, textBody) {
    	if (err) return done(err);
    	ejs.renderFile( __dirname + '/email-templates/NUMentors.ejs' , options, function (err, htmlBody) {
            if (err) return done(err);
            deliver(textBody, htmlBody)
        });
    });
}

exports.postInvite = function ( req, res ) {

	console.log( 'post invite' )
	
	var body			= req.body,
		relationship	= req.user.auth.local.organization;
		
	console.log( 'createUser' )
	
	var uToken = uuid.v4();
		
    var newToken = new Token({
    	token:			uToken,
    	organization: 	relationship,
    	createdBy:		req.user.profile.firstName + ' ' + req.user.profile.lastName    	
    });
    	
    newToken.save(function(err) {
        if(err) {
            res.json(401, {token: newToken, message: err.code === 11000 ? "Token already exists" : err.message});
        } else {
		    var message = {
			    email: body.email,
		        verifyURL: req.protocol + "://" + req.get('host') + "/verify/" + uToken};
		        
		    sendVerificationEmail(message, function (error, success) {
		        if (error) {
		            // not much point in attempting to send again, so we give up
		            // will need to give the user a mechanism to resend verification
		            console.error("Unable to send via postmark: " + error.message);
		            return;
		        }
		        console.info("Sent to postmark for delivery")
		        res.send( 'user invited!' );
		    });
        }
    });
    
};

*/


exports.getPublicMentors	= function ( req, res ){
	
	return db.userModel.find(function(err, users) {
		res.render('public/mentors', { users: users });
	});
	
};

// ========

exports.getFind			= function ( req, res) {
	return db.userModel.find(function(err, users) {
	
		curPage = {}
		curPage['current'] = 'find';
	
		res.render('find', { user: req.user, users: users, reqPage:curPage });
	});
};

exports.getFindUsers	= function ( req, res) {
	return db.userModel.find(function(err, users) {
	
		var mentors = [];
	
		for (var i = 0; i < users.length; i++) {
			
			// only pull good* users
			
			if ( users[i].roles.mentor == true && users[i].roles.admin == false && users[i].verified == true ) {
				
				var curMentor = {};
				curMentor.id		= users[i].id;
				curMentor.linkedin	= users[i].auth.linkedin;
				curMentor.profile	= users[i].profile;
				
				// push the mentor into a nice little array
				mentors.push( curMentor );
				
			}
		}
		
		// send all the stuff we actually want
		res.send( mentors );
		
	});
};

exports.welcomeUser	= function ( req, res ){
	
	// console.log( req.body )
	mentorID	= req.body.id;
	field		= 'welcomed';
	
	var update = {};
	update[field] = true ;
	
	// find by document id and update
	db.userModel.findByIdAndUpdate( mentorID, { $set: update },
		function(err, data) {
			if (err){
				console.log(err);
			} else {
				res.send('success');
			}
		}
	);
	
}

exports.modifyMentorDetails			= function ( req, res ){
	
	// console.log( req.body )
	mentorID	= req.body.pk;
	field		= 'profile.' + req.body.name.split('_')[1];
	newVal		= req.body.value;
	
	console.log( mentorID )
	console.log( field )
	console.log( newVal )

	var update = {};
	update[field] = newVal ;
	
	// find by document id and update
	db.userModel.findByIdAndUpdate( mentorID, { $set: update },
		function(err, data) {
			if (err){
				console.log(err);
			} else {
				res.send('success');
			}
		}
	);
	
}

exports.addFavoriteMentorProfile	= function ( req, res ){

	var mentorID		= req.route.params.id;
	var assignedBy		= req.body.msg;
	
	// find by document id and update
	db.userModel.findByIdAndUpdate( mentorID, {'favorite': assignedBy},
		function(err, data) {
			if (err){
				console.log(err);
			} else {
				res.send('success');
			}
		}
	);	
	
}

exports.removeFavoriteMentorProfile	= function ( req, res ){

	var mentorID		= req.route.params.id;
	
	// find by document id and update
	db.userModel.findByIdAndUpdate( mentorID, {'favorite': ''},
		function(err, data) {
			if (err){
				console.log(err);
			} else {
				res.send('success');
			}
		}
	);	
	
}

exports.addVentureMentorProfile	= function ( req, res ){

	var mentorID		= req.route.params.id;
	var assignedBy		= req.body.msg.split(':')[0];
	var organization	= req.body.msg.split(':')[1];
	var ventureName		= req.body.msg.split(':')[2];
	
	var venture = {
		name: ventureName,
		assignedBy: assignedBy,
		organization: organization,
		dateAssigned: Date.now().toString()
	};
	
	// find by document id and update
	db.userModel.findByIdAndUpdate( mentorID,
		{$push: {'auth.linkedin.assigned_ventures': venture}},
		{safe: true, upsert: true},
		function(err, data) {
			if (err){
				console.log(err);
			} else {
				res.send('success');
			}
		}
	);	
}

exports.removeVentureMentorProfile	= function ( req, res ){

	var mentorID		= req.route.params.id;
	var removeVenture	= req.body.msg;
	
	var ourList = [];
		
	// find by document id and update
	db.userModel.findById( mentorID,'auth.linkedin.assigned_ventures',
		function(err, user) {
			if (err){
				console.log(err);
			} else {
			
				for ( var a = 0; a < user.auth.linkedin.assigned_ventures.length ; a++ ){
					
					venture = user.auth.linkedin.assigned_ventures[a]
					
					if ( venture.name !== removeVenture ){
						ourList.push( venture )
					}
				}
				
				// find by document id and update
				db.userModel.findByIdAndUpdate( mentorID,
					{'auth.linkedin.assigned_ventures': ourList},
					function(err, data) {
						if (err){
							console.log(err);
						} else {
							res.send('success');
						}
					}
				);
				
			}
		}
	);	
}

exports.postSearch		= function ( req, res ){
	
	var SELECTOR = req.body.content;
	
	curPage = {}
	curPage['current'] = 'find';

	console.log( "search: " + SELECTOR )
	
	db.userModel.find(
	    { $or:[
	    	{ 'profile.firstName': 					{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'profile.lastName': 					{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'profile.email': 						{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'profile.skype': 						{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'profile.phone': 						{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'profile.address.city': 				{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'profile.address.street': 			{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'profile.address.building':			{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'profile.contactMethod': 				{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'profile.contactFrequency': 			{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'auth.linkedin.gender': 				{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'auth.linkedin.ethnicity': 			{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'profile.organization':				{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'auth.linkedin.industry': 			{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'auth.linkedin.location': 			{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'auth.linkedin.summary': 				{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'auth.linkedin.headline': 			{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'auth.linkedin.educations': 			{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'auth.linkedin.current_positions':	{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'auth.linkedin.past_positions':		{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'auth.linkedin.skills':				{ $regex: RegExp(SELECTOR), $options: 'i' } },
			{ 'auth.linkedin.assigned_ventures':	{ $regex: RegExp(SELECTOR), $options: 'i' } } ]},
		function ( err, users ){
			if( err ) return next( err );
			res.render('find', { user: req.user, users: users, reqPage:curPage });
	});
};

exports.getDashboard	= function(req, res) {

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

exports.getTokens	= function(req, res) {
	return db.tokenModel.find(function(err, tokens) {
		res.send( tokens );
	});
};

exports.getUsers	= function(req, res) {
	return db.userModel.find(function(err, users) {
		res.send( users );
	});
};

/*
exports.temp		= function( req, res ){

	var _ta = [];

	return db.userModel.find(function(err, users) {
	

		for (var i = 0; i < users.length; i++) {
			if ( users[i].roles.mentor == true && users[i].roles.admin == false && users[i].verified == true ) {
				_ta.push( [ users[i]._id, users[i].profile ] )
			}
		}
	
		res.send( _ta );
	});

};


exports.fixer	= function( req, res ){
	
	var _changes = [
		[ '5278c2c6a5087d995c000007', 'IDEA' ],
		[ '5278db94a5087d995c000008', 'IDEA' ],
		[ '52790d02a5087d995c00001a', 'IDEA' ],
		[ '526991784c4583295c000002', 'IDEA' ],
		[ '52f11ec40eb963a23500001b', 'HSE' ],
		[ '52fa8e87e7de23a526000001', 'IDEA' ],
		[ '52fac30c38eaffac27000001', 'HSE' ],
		[ '52fce04e5a6bbc2f69000010', 'IDEA' ],
		[ '52fcdf575a6bbc2f69000002', 'IDEA' ],
		[ '52fce5315a6bbc2f69000027', 'IDEA' ],
		[ '52fce5965a6bbc2f69000028', 'IDEA' ],
		[ '52fce6b45a6bbc2f69000029', 'IDEA' ],
		[ '52fce9025a6bbc2f6900002a', 'IDEA' ],
		[ '52fce9625a6bbc2f6900002b', 'IDEA' ],
		[ '52fce9675a6bbc2f6900002c', 'IDEA' ],
		[ '52fceaf15a6bbc2f6900002d', 'IDEA' ],
		[ '52fcf5645a6bbc2f6900002e', 'IDEA' ],
		[ '52fcf79a5a6bbc2f6900002f', 'IDEA' ],
		[ '52fd10af5a6bbc2f69000030', 'IDEA' ],
		[ '52fd19ed5a6bbc2f69000031', 'IDEA' ],
		[ '52fe6ae25a6bbc2f69000032', 'IDEA' ],
		[ '5301374b5a6bbc2f69000033', 'IDEA' ],
		[ '53023b6d5a6bbc2f69000034', 'IDEA' ],
		[ '530266475a6bbc2f69000035', 'IDEA' ],
		[ '530274655a6bbc2f69000036', 'IDEA' ],
		[ '530379b85a6bbc2f69000037', 'IDEA' ],
		[ '530b608b5a8da4bd5c000001', 'IDEA' ]
	]
	
	
	field = 'profile.organization';
	
	for ( var i = 0; i < _changes.length; i++ ){
	
		var update = {};
		update[field] = _changes[i][1] ;
	
		// find by document id and update
		db.userModel.findByIdAndUpdate( _changes[i][0], { $set: update },
			function(err, data) {
				if (err){
					console.log(err);
				} else {
					res.send( 200 );
				}
			}
		);
	
	}
	
}

*/

exports.getMentors	= function(req, res) {
	return db.userModel.find(function(err, users) {
	
		curPage = {}
		curPage['current'] = 'mentor';
	
		res.render('mentors', { user: req.user, users: users, reqPage:curPage, message: req.flash('inviteMessage') });
	});
};



exports.downloadMentors	= function( req, res ){

	var _ta = [],
		_tb = [];

	_tb.push( ['Firstname,Lastname,Industry Experience,Education,LinkedIn Headline,Email,Phone,Skype,Address,Currently Mentoring\n'] );

	return db.userModel.find(function(err, users) {
		
		for (var i = 0; i < users.length; i++) {
			if ( users[i].roles.mentor == true && users[i].roles.admin == false && users[i].verified == true ) {
			
				u = users[i];
				
				var _t = [];
				
				_t.push( u.profile.firstName.replace(/,/g, '","') )
				_t.push( u.profile.lastName.replace(/,/g, '","') )
				_t.push( u.auth.linkedin.industry.replace(/,/g, '","') )
				
				var _t1 = [];
				for ( var e = 0; e < u.auth.linkedin.educations.length; e++ ){
					u.auth.linkedin.educations[e].schoolName !== undefined ? _t1.push( u.auth.linkedin.educations[e].schoolName ) : null;
				}
				_t.push( _t1.join(' ').replace(/,/g, '","') );
				
				_t.push( u.auth.linkedin.headline.replace(/,/g, '","') )
				_t.push( u.profile.email.replace(/,/g, '","') )
				_t.push( u.profile.phone.replace(/,/g, '","') )
				_t.push( u.profile.skype.replace(/,/g, '","') )
				_t.push( [ u.profile.address.city, u.profile.address.street, u.profile.address.building ].join(',').replace(/,/g, '","') )
				
				var _t1 = [];
				for (var j = 0; j < u.auth.linkedin.assigned_ventures.length; j++ ){
					_t1.push( u.auth.linkedin.assigned_ventures[j].name );
				}
				_t.push( _t1.join(',').replace(/,/g, '","') );
				
				_t.join(',')
				
				_tb.push( _t + '\n' )
			}
		}
		
		res.send( _tb );
	});
}

/*
exports.findById = function(req, res) {
    
    var id = req.params.id;
    console.log('Retrieving user: ' + id);
    
    db.collection('wines', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};
*/

exports.getMentorById = function( req, res ) {
		
	var _id = req.route.params.id;
	// console.log("find by: " + _id);
	
	db.userModel.findOne({ '_id' : _id }, function (err, newUser) {
	
		curPage = {}
		curPage['current'] = 'mentor';
	
		res.render('mentor', { user: req.user, display: newUser, reqPage:curPage  });
	})
};

exports.destroyMentorById = function( req, res ) {
		
	var _id = req.route.params.id;
	// console.log("find by: " + _id);
	
	db.userModel.remove({ '_id' : _id }, function (err) {
		res.redirect('/');
	})
};

/*
exports.getUsers = function(req, res) {
	return db.userModel.list(function(err, users) {
		res.render('users', { users: users });
	});
};
*/

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
