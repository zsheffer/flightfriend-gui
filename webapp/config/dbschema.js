var mongoose			= require('mongoose'),
	bcrypt				= require('bcrypt'),
	uuid				= require('node-uuid'),
	SALT_WORK_FACTOR	= 10;
	
	exports.mongoose = mongoose;

// Database connect
var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/flightfriend';

var mongoOptions = { db: { safe: true }};

mongoose.connect(uristring, mongoOptions, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Successfully connected to: ' + uristring);
  }
});

//******* Database schema TODO add more validation
var Schema		= mongoose.Schema, 
	ObjectId	= Schema.ObjectId;

// User schema
var userSchema = new Schema({

	roles : {
		mentor	: { type: Boolean, default: false },
		admin	: { type: Boolean, default: false }
	},	
	auth : {
		local : {
			email:				{ type: String, default: '' },
			username:			{ type: String, default: '' },
			password:			{ type: String, default: '' },
			hashed_password:	{ type: String, default: '' },
			salt:				{ type: String, default: '' },
			authToken:			{ type: String, default: '' }
		},
	},
	profile			: {
		firstName:				{ type: String, default: '' },
		lastName:				{ type: String, default: '' },
		organization:			{ type: String, default: '' },
		bio:					{ type: String, default: '' },
		interests:				{ type: String, default: '' },
		referred:				{ type: String, default: '' },
		networks:				{ type: Array, default: [] },
		email:					{ type: String, default: '' },
		skype:					{ type: String, default: '' },
		phone:					{ type: String, default: '' },
		address:				{
			city : { type : String, default : '' },
			street : { type : String, default : '' },
			building : { type : String, default : '' }
		},
		contactMethod:			{ type: String, default: 'phone' },
		contactFrequency:		{ type: String, default: '' }
	},
	favorite		: { type: String, default: '' },
	verified 		: { type: Boolean, default: false },
	verifiedDate	: { type: String, default: '' },
	createdDate		: { type: String, default: '' },
	welcomed		: { type: Boolean, default: false }
})

// Token schema
var tokenSchema = new Schema({

	token		: { type: String, default: '' },
	verified	: { type: Boolean, default: false },
	createdDate	: { type: Date, default: Date.now },
	createdBy	: { type: String, default: '' },
	organization: { type: String, default: '' },
	sentTo		: { type: String, default: '' },
	acceptedDate: { type: Date }
	
})

// Claim schema
var claimSchema = new Schema({

	claimID		: { type: String, default: '' },
	data		: { type: Object }
	
})



// Bcrypt middleware
userSchema.pre('save', function(next) {
	var user = this;

	if(!user.auth.local.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) return next(err);

		bcrypt.hash(user.auth.local.password, salt, function(err, hash) {
			if(err) return next(err);
			user.auth.local.password = hash;
			next();
		});
	});
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err) return cb(err);
		cb(null, isMatch);
	});
};


// Export user model
var userModel = mongoose.model('User', userSchema);
exports.userModel = userModel;


var tokenModel = mongoose.model('Token', tokenSchema);
exports.tokenModel = tokenModel;


var claimModel = mongoose.model('Claim', claimSchema);
exports.claimModel = claimModel;


// exports when using grunt
/*
var userModel = mongoose.model('User', userSchema);
exports.userModel = userModel;
*/


// ==================================================
// ==================================================

/*
// Verification token model
var verificationTokenSchema = new Schema({
    _userId: {type: ObjectId, required: true, ref: 'User'},
});

verificationTokenSchema.methods.createVerificationToken = function (done) {
    var verificationToken = this;
    var token = uuid.v4();
    verificationToken.set('token', token);
    verificationToken.save( function (err) {
        if (err) return done(err);
        return done(null, token);
        console.log("Verification token", verificationToken);
    });
};

var verificationTokenModel = mongoose.model('VerificationToken', verificationTokenSchema);
exports.verificationTokenModel = verificationTokenModel;
*/