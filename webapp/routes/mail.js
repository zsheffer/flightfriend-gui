
var path			= require('path');

var shortId = require('shortid'),
	db		= require('../config/dbschema');
// 
// mandrill docs:
// https://mandrillapp.com/api/docs/index.nodejs.html
// https://npmjs.org/package/mandrill-api
//

var mandrill		= require('mandrill-api/mandrill'),
	MANDRILL_KEY	= '-qSfV1ML5H8LluD360i3uA',
	mandrill_client	= new mandrill.Mandrill( MANDRILL_KEY );
	
var mandrillTemplates = {};
	
	mandrillTemplates['claim-client']	= 'claim-customer';		// self explanatory
	mandrillTemplates['claim-support']	= 'claim-support';		// self explanatory


// ===

exports.invite		= function( req, res, done ){

	var body			= req.body,
		relationship	= req.user.profile.organization,
		rcptEmail		= body.email;
	
    var newToken = new db.tokenModel;
    	
    	var uToken = uuid.v4();
    	newToken.token			= uToken;
    	newToken.organization	= relationship;
    	newToken.createdBy		= req.user.profile.firstName + ' ' + req.user.profile.lastName;
    	newToken.sentTo			= rcptEmail;
    	
    newToken.save(function(err) {
        if(err) {
            res.json(401, {token: uToken, message: err.code === 11000 ? "Token already exists" : err.message});
        } else {
        	
        	
        	var verifyURL = req.protocol + "://" + req.get('host') + "/verify/" + uToken;
        	
			var template_name = mandrillTemplates['invite'];
			var template_content = [{
				"name": "example name",
				"content": "example content"
			}];
			var message = {
			    "subject"		: "You're invited to Northeastern's Mentoring Program",
			    "from_email"	: "admin@umentors.nu",
			    "from_name"		: "NU Mentors",
			    "to": [{
			            "email"	: rcptEmail,
			            "name"	: "New Mentor",
			            "type"	: "to"
			        }],
			    "headers": {
			        "Reply-To": "admin@umentors.nu"
			    },
			    "important"		: false,
			    "track_opens"	: null,
			    "track_clicks"	: false,
			    "auto_text"		: null,
			    "auto_html"		: null,
			    "inline_css"	: null,
			    "url_strip_qs"	: null,
			    "preserve_recipients": null,
			    "view_content_link"	: null,
			    "tracking_domain"	: null,
			    "signing_domain"	: null,
			    "return_path_domain": null,
			    "merge": true,
			    "merge_vars": [{
			    	"rcpt": rcptEmail,
			    	"vars": [{
			    		"name": "verifyURL",
			    		"content" : verifyURL
			    	}]
			    }]
			    
			};
				
			var async = false;
			var ip_pool = "Main Pool";
			
			mandrill_client.messages.sendTemplate({
				"template_name"		: template_name,
				"template_content"	: template_content,
				"message"			: message,
				"async"				: async,
				"ip_pool"			: ip_pool
			}, 
				function(result) {
				    /*
				    [{
				            "email": "recipient.email@example.com",
				            "status": "sent",
				            "reject_reason": "hard-bounce",
				            "_id": "abc123abc123abc123abc123abc123"
				        }]
				    */
				    
				    return done(null, req.flash('inviteMessage', 'Invite sent successfully'));
				    
				}, function(e) {
				    // Mandrill returns the error as an object with name and message keys
				    return done(null, req.flash('inviteMessage', 'Well this sucks... A mandrill error occurred: ' + e.name + ' - ' + e.message));
				    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
				    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
				}
			);
		    
		    
        }
    });	
};

exports.submitClaim	= function( _email, _claim ){

	var newClaim		= new db.claimModel();
	
	var _claimID		= shortId.generate();
	newClaim.claimID	= _claimID;
	newClaim.data		= _claim;
	
	newClaim.save(function(err) {
		if( err ){
			console.log( 'Error: ' + err.message );
		} else {
		
			claimEmail_client( _email, _claimID );
			claimEmail_support( _email, _claim, _claimID );
	
		}
	});	
	
};

function claimEmail_client( _email, _claimID ){
	
	var template_name = mandrillTemplates['claim-client'];
	var template_content = [{
	        "name"		: "example name",
	        "content"	: "example content"
	    }];
	var message = {
	    "subject"		: "[Flight-Friend Claim Submitted]",
	    "from_email"	: "contact@flight-friend.com",
	    "from_name"		: "Your Flight Friend",
	    "to": [{
	            "email"	: _email,
	            "name"	: "Our Flight Friend",
	            "type"	: "to"
	        }],
	    "headers": {
	        "Reply-To": "contact@flight-friend.com"
	    },
	    "important"		: false,
	    "track_opens"	: null,
	    "track_clicks"	: null,
	    "auto_text"		: null,
	    "auto_html"		: null,
	    "inline_css"	: null,
	    "url_strip_qs"	: null,
	    "preserve_recipients": null,
	    "view_content_link"	: null,
	    "tracking_domain"	: null,
	    "signing_domain"	: null,
	    "return_path_domain": null,
	    "merge": true,
	    "merge_vars": [{
	    	"rcpt": _email,
	    	"vars": [{
	    		"name" : "claimID",
	    		"content" : _claimID
	    	}]
	    }]
	};
		
	var async = false;
	var ip_pool = "Main Pool";
	
	sendViaMandrill( template_name, template_content, message, async, ip_pool );
	
};

function claimEmail_support( _email, _claim, _claimID ){
	
	var template_name = mandrillTemplates['claim-support'];
	var template_content = [{
	        "name"		: "example name",
	        "content"	: "example content"
	    }];
	var message = {
	    "subject"		: "[Flight-Friend Claim Submitted]",
	    "from_email"	: _email,
	    "from_name"		: "Our New Flight Friend",
	    "to": [{
	            "email"	: "contact@flight-friend.com",
	            "name"	: "Flight Friend",
	            "type"	: "to"
	        }],
	    "headers": {
	        "Reply-To": _email
	    },
	    "important"		: false,
	    "track_opens"	: null,
	    "track_clicks"	: null,
	    "auto_text"		: null,
	    "auto_html"		: null,
	    "inline_css"	: null,
	    "url_strip_qs"	: null,
	    "preserve_recipients": null,
	    "view_content_link"	: null,
	    "tracking_domain"	: null,
	    "signing_domain"	: null,
	    "return_path_domain": null,
	    "merge": true,
	    "merge_vars": [{
	    	"rcpt": "contact@flight-friend.com",
	    	"vars": [{
	    		"name" : "email",
	    		"content" : _email
	    	},{
	    		"name" : "claimID",
	    		"content" : _claimID
	    	},{
	    		"name" : "TITLE",
	    		"content" : _claim['title']
	    	},{
	    		"name" : "YOURFIRSTNAME",
	    		"content" : _claim['yourFirstName']
	    	},{
	    		"name" : "YOURLASTNAME",
	    		"content" : _claim['yourLastName']
	    	},{
	    		"name" : "THEIRFIRSTNAME",
	    		"content" : _claim['theirFirstName']
	    	},{
	    		"name" : "THEIRLASTNAME",
	    		"content" : _claim['theirLastName']
	    	},{
	    		"name" : "RELATIONSHIP",
	    		"content" : _claim['yourRelationship']
	    	},{
	    		"name" : "AIRLINECODE",
	    		"content" : _claim['airlinecode']
	    	},{
	    		"name" : "FLIGHTNUMBER",
	    		"content" : _claim['flightnumber']
	    	},{
	    		"name" : "AIRLINECODEOTHER",
	    		"content" : _claim['airlinecodeother']
	    	},{
	    		"name" : "DATEPICKER",
	    		"content" : _claim['datepicker']
	    	},{
	    		"name" : "ITINERARY",
	    		"content" : _claim['flightitinerary']
	    	},{
	    		"name" : "COMPENSATIONBEFORE",
	    		"content" : _claim['Submitted-request-for-compensation-before']
	    	},{
	    		"name" : "ADDITIONAL",
	    		"content" : _claim['additional']
	    	},{
	    		"name" : "STREET",
	    		"content" : _claim['street']
	    	},{
	    		"name" : "CITY",
	    		"content" : _claim['city']
	    	},{
	    		"name" : "STATE",
	    		"content" : _claim['state']
	    	},{
	    		"name" : "ZIP",
	    		"content" : _claim['zip']
	    	},{
	    		"name" : "EMAIL",
	    		"content" : _claim['email']
	    	},{
	    		"name" : "PHONE",
	    		"content" : _claim['phone']
	    	},{
	    		"name" : "STATEANDLOCAL",
	    		"content" : _claim['StateAndLocal']
	    	},{
	    		"name" : "FEDERAL",
	    		"content" : _claim['Federal']
	    	},{
	    		"name" : "INTERNATIONAL",
	    		"content" : _claim['International']
	    	},{
	    		"name" : "HIDDEN",
	    		"content" : _claim['hiddenDetails']
	    	}]
	    }]
	};
		
	var async = false;
	var ip_pool = "Main Pool";
	
	sendViaMandrill( template_name, template_content, message, async, ip_pool );
	
};

function sendViaMandrill( _template_name, _template_content, _message, _async, _ip_pool ){

	mandrill_client.messages.sendTemplate({
		"template_name"		: _template_name,
		"template_content"	: _template_content,
		"message"			: _message,
		"async"				: _async,
		"ip_pool"			: _ip_pool
	}, 
		function(result) {
		    /*
		    [{
		            "email": "recipient.email@example.com",
		            "status": "sent",
		            "reject_reason": "hard-bounce",
		            "_id": "abc123abc123abc123abc123abc123"
		        }]
		    */
		}, function(e) {
		    // Mandrill returns the error as an object with name and message keys
		    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
		    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
		}
	);
	
};
