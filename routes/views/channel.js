var keystone = require('keystone'),
	passport = require('passport'),
	Account = keystone.list('Account'),
	Page = keystone.list('Page'),
	FacebookStrategy = require('passport-facebook').Strategy,
	FB = require('fb');

	FB.options({
	  appId            : '172494766720528',
	  autoLogAppEvents : true,
	  xfbml            : true,
	  version          : 'v2.12'
	});

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'channel';

	view.query('Accounts', Account.model.find().where({company: req.user.company}).where({accountType:'facebook'}));
	view.query('Pages', Page.model.find().where({company: req.user.company}).where({pageType: 'facebook'}));

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
	    	Account.model.findOne({'accountId': profile.id }, function(err,account){
	    		if(err)
	    			return done(err);
	    		if(account){
	    			return done(null, account);
	    		}
	    		else {
	    			var newAccount= new Account.model();
	    			newAccount.accountId = profile.id;
	    			newAccount.accessToken = accessToken;
	    			newAccount.name.first = profile.name.givenName;
	    			newAccount.name.last = profile.name.familyName;
	    			newAccount.email = profile.emails[0].value;
	    			newAccount.accountType = 'facebook';
	    			newAccount.company = req.user.company;
	    			newAccount.save(function(err){
	    				if(err)
	    				{
	    					throw err;
	    				}
	    				else{
	    					FB.api('oauth/access_token', {
	    					    client_id: FACEBOOK_APP_ID,
	    					    client_secret: FACEBOOK_CLIENT_SECRET,
	    					    grant_type: 'fb_exchange_token',
	    					    fb_exchange_token: accessToken
	    					}, function (res) {
	    					    if(!res || res.error) {
	    					        console.log(!res ? 'error occurred' : res.error);
	    					        return;
	    					    }
	    					    var accessToken = res.access_token;
	    					    var expires = res.expires ? res.expires : 0;
	    					    newAccount.accessToken = accessToken;
	    					    newAccount.save(function(err){
	    					    	if(err){
	    					    		throw err;
	    					    	}
	    					    	else{
				    					FB.api(
				    					    "/me/accounts?access_token="+accessToken,
				    					    function (response) {
				    					      if (response && !response.error) {
				    					        console.log(response.data)
				    					        response.data.forEach(function(result){
				    					        	var newPage= new Page.model();
				    					        	newPage.pagename = result.name;
				    					        	newPage.pageId = result.id;
				    					        	newPage.accessToken = result.access_token;
				    					        	newPage.accountId = newAccount.accountId;
				    					        	newPage.company = newAccount.company;
				    					        	newPage.pageType = 'facebook';
				    					        	newPage.status = 'unsubscribe';
				    					        	newPage.save(function(err){
				    					        		if(err){
				    					        			throw err;
				    					        		}
				    					        	});
				    					        })
	    										return done(null,newAccount);  					    		
				    					      }
				    					      else{
				    					      	console.log(response.error)
				    					      }
				    					    }
				    					);
	    					    	}
	    					    })
	    					});
	    				}
	    			});	    			
	    		}
	    	})
	    })
	  }
	));

	view.render('channel');
};