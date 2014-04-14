var db	= require('./config/dbschema');

module.exports = function(grunt) {

grunt.registerTask('go', function(){

	// async mode
	var done = this.async();
	
	db.mongoose.connection.on('open', function () { 
	  db.mongoose.connection.db.dropDatabase(function(err) {
	    if(err) {
	      console.log('Error: ' + err);
	      done(false);
	    } else {
	      console.log('Successfully dropped db');
	      done();
	    }
	  });
	});

	grunt.task.run('adduser:asd:Zac:Sheffer:zsheffer@example.com:asd:true:Samurai:');
	
});

grunt.registerTask('dbseed', 'seed the database', function() {
	grunt.task.run('adduser:admin:admin:admin:zsheffer@gmail.com:secret:true::');
});

grunt.registerTask('deleteZac', 'destory Zac from system', function(){
	
	// async mode
	var done = this.async();
	
	db.mongoose.connection.on('open', function () {	
		db.userModel.findOne({ '_id': "526990ecb99f40145c000002" }, function (err, user) {
			user.remove();
			//db.tokenModel.remove( {_id: ObjectId("526990ecb99f40145c000002")});
			done();
			
		});
	});
		
});


grunt.registerTask('destroyTokens', 'destroy all tokens', function(){
	
	// async mode
	var done = this.async();
	
	db.mongoose.connection.on('open', function () {
		db.tokenModel.remove().exec();
		done();
	});
		
});

grunt.registerTask('adduser', 'add a user to the database', function(usr, firstName, lastName, emailAddress, pass, adm, relationship) {
	// convert adm string to bool
	adm = (adm === "true");
	
	var user = new db.userModel();
	
	user.roles.admin = adm;
	user.auth.local.username		= usr;
	user.auth.local.password		= pass;
	user.auth.local.email			= emailAddress;
	user.profile.firstName			= firstName;
	user.profile.lastName			= lastName;
	user.profile.organization		= relationship;
	user.verified					= true;
	user.welcomed					= true;
	
	// save call is async, put grunt into async mode to work
	var done = this.async();
	
	user.save(function(err) {
	  if(err) {
	    console.log('Error: ' + err);
	    done(false);
	  } else {
	    console.log('saved user: ' + user.auth.local.username);
	    done();
	  }
	});
});

grunt.registerTask('dbdrop', 'drop the database', function() {
	// async mode
	var done = this.async();
	
	User.mongoose.connection.on('open', function () { 
	  User.mongoose.connection.db.dropDatabase(function(err) {
	    if(err) {
	      console.log('Error: ' + err);
	      done(false);
	    } else {
	      console.log('Successfully dropped db');
	      done();
	    }
	  });
	});
});

};
