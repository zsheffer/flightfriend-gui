
var passport		= require('passport'),
	pass			= require("../config/pass"),
	path			= require('path');

var uuid	= require('node-uuid')
	db		= require('../config/dbschema');
// 
// mandrill docs:
// https://mandrillapp.com/api/docs/index.nodejs.html
// https://npmjs.org/package/mandrill-api
//

var mandrill		= require('mandrill-api/mandrill'),
	MANDRILL_KEY	= 'sZkyfUitVLtronkk3wZjvA',
	mandrill_client	= new mandrill.Mandrill( MANDRILL_KEY );
	
var mandrillTemplates = {};
	
	mandrillTemplates['invite'] = 'nu-mentors-invitation';


// ===

exports.invite = function( req, res, done ){

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
}
