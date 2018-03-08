var keystone = require('keystone'),
passport = require('passport'),
User = keystone.list('User'),
FacebookStrategy = require('passport-facebook').Strategy;

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

	// Render the view

	view.on('post', { action: 'signin' }, function(next) {
		
		if (!req.body.email || !req.body.password) {
			req.flash('error', {title:'Please enter your username and password.'});
			return next();
		}
		
		var onSuccess = function() {
			if (req.body.target && !/join|signin/.test(req.body.target)) {
				console.log('[signin] - Set target as [' + req.body.target + '].');
					res.redirect('/welcome/');
				}
			else{
				return res.redirect('/channel');
			}
		}
		
		var onFail = function() {
			req.flash('error',{title: 'Your username or password were incorrect, please try again.'});
			return next();
		}
		
		keystone.session.signin({ email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail);
		
	});
	


	var host = req.get('host');
	if(host == 'localhost:3000'){
		var callbackUrlHost = "http://localhost:3000";
	}
	else{
		var callbackUrlHost = "https://"+host;
	}


	var FACEBOOK_APP_ID = "172494766720528";
	var FACEBOOK_CLIENT_SECRET = "0907269263cfba523062e9849288dc53";

	var FACEBOOKcallback = callbackUrlHost+"/auth/facebook/callback";



	passport.use(new FacebookStrategy({
	    clientID: FACEBOOK_APP_ID,
	    clientSecret: FACEBOOK_CLIENT_SECRET,
	    callbackURL: FACEBOOKcallback,
	    profileFields: ['emails','name','picture.type(large)']
	  },
	  function(accessToken, refreshToken, profile, done) {
	    process.nextTick(function(){
	    	User.model.findOne({'email': profile.emails[0].value}, function(err,user){
	    		if(err)
	    			return done(err);
	    		if(user){
	    			user.accesstoken = accessToken;
	    			user.save();
	    			return done(null, user);
	    		}
	    		else {
	    			var newUser= new User.model();
	    			newUser.facebookid = profile.id;
	    			newUser.accesstoken = accessToken;
	    			newUser.name.first = profile.name.givenName;
	    			newUser.name.last = profile.name.familyName;
	    			newUser.email = profile.emails[0].value;
	    			newUser.save(function(err){
	    				if(err)
	    				{
	    					throw err;
	    				}
	    				return done(null,newUser);
	    			});	    			
	    		}
	    	})
	    })
	  }
	));


	view.render('index');
};
