var keystone = require('keystone'),
	passport = require('passport'),
	Account = keystone.list('Account'),
	Page = keystone.list('Page'),
	FacebookStrategy = require('passport-facebook').Strategy,
	TwitterStrategy = require('passport-twitter').Strategy,
	LinkedInStrategy = require('passport-linkedin-oauth2').Strategy,
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
	view.query('Facebookcount', Account.model.find().where({company: req.user.company}).where({accountType:'facebook'}).count());
	view.query('Twitter', Account.model.find().where({company: req.user.company}).where({accountType:'twitter'}));
	view.query('Twittercount', Account.model.find().where({company: req.user.company}).where({accountType:'twitter'}).count());
	view.query('Pages', Page.model.find().where({company: req.user.company}).where({pageType: 'facebook'}));
	view.query('InstaPages', Page.model.find().where({company: req.user.company}).where({pageType: 'instagram'}));
	view.query('InstaPagescount', Page.model.find().where({company: req.user.company}).where({pageType: 'instagram'}).count());
	view.query('LinkedIn', Account.model.find().where({company: req.user.company}).where({accountType:'linkedin'}));
	view.query('LinkedIncount', Account.model.find().where({company: req.user.company}).where({accountType:'linkedin'}).count());

	var host = req.get('host');
	if(host == 'localhost:3000'){
		var callbackUrlHost = "http://localhost:3000";
	}
	else{
		var callbackUrlHost = "https://"+host;
	}



	var TWITTER_APP_ID = "Zcq93EVMlbNjOm0uT9HGNTvKQ";
	var TWITTER_CLIENT_SECRET = "eunEbSx0QcRFnLUD0xtNJPuGvfXE5M5wgSKRJQdLgoRIONDti1";

	var TWITTERcallback = callbackUrlHost+"/twitter/callback";

	passport.use(new TwitterStrategy({
	    consumerKey: TWITTER_APP_ID,
	    consumerSecret: TWITTER_CLIENT_SECRET,
	    callbackURL: TWITTERcallback
	  },
	  function(token, tokenSecret, profile, done) {

	  	console.log(profile)
    	Account.model.findOne({'accountId': profile.id }, function(err,account){
    		if(err)
    			return done(err);
    		if(account){
    			account.accessToken = token;
    			account.tokenSecret = tokenSecret;
    			account.save(function(err){
    				if(err){
    					throw err;
    				}
    				else{
    					return done(null, account);
    				}
    			})
    		}
    		else {
    			var newAccount= new Account.model();
    			newAccount.accountId = profile.id;
    			newAccount.accessToken = token;
    			newAccount.tokenSecret = tokenSecret;
    			newAccount.name.first = profile.username;
    			newAccount.accountType = 'twitter';
    			newAccount.company = req.user.company;
    			newAccount.save(function(err){
    				if(err)
    				{
    					throw err;
    				}
    				else{
    					return done(null,newAccount);
    				}
    			});	    			
    		}
    	})
/*	  	return done(null,profile)
*/	  })
	)


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
	    			    account.accessToken = accessToken;
	    			    account.save(function(err){
	    			    	if(err){
	    			    		throw err;
	    			    	}
	    			    	else{
	    						return done(null, account);
	    			    	}
	    			    })
	    			})
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
				    					        		FB.api(
				    					        			"/"+newPage.pageId+"?fields=instagram_business_account{name}&access_token="+accessToken,
				    					        			function(response){
				    					        				if(response && !response.error){
				    					        					if(response.instagram_business_account !== undefined){
					    					        					var newPage= new Page.model();
					    					        					newPage.pagename = response.instagram_business_account.name;
					    					        					newPage.pageId = response.instagram_business_account.id;
					    					        					newPage.accessToken = accessToken;
					    					        					newPage.accountId = newAccount.accountId;
					    					        					newPage.company = newAccount.company;
					    					        					newPage.pageType = 'instagram';
					    					        					newPage.status = 'unsubscribe';
					    					        					newPage.save(function(err){
					    					        						if(err){
					    					        							throw err;
					    					        						}
					    					        					});
				    					        					}
				    					        				}
				    					        				else{
				    					        					console.log(response.error)				    					        					
				    					        				}
				    					        			}
				    					        		);
				    					        	});
				    					        })
				    					      }
				    					      else{
				    					      	console.log(response.error)
				    					      }
				    					    }
				    					);
	    								return done(null,newAccount);  		
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

	passport.use(new LinkedInStrategy({
	  clientID: process.env.LINKEDIN_APP_KEY,
	  clientSecret: process.env.LINKEDIN_APP_SECRET,
	  callbackURL: callbackUrlHost+"/auth/linkedin/callback",
	  scope: ['r_emailaddress', 'r_basicprofile','rw_company_admin','w_share'],
	  state: true
	}, function(accessToken, refreshToken, profile, done) {
	  // asynchronous verification, for effect...
	  process.nextTick(function () {
	  	Account.model.findOne({'accountId': profile.id }, function(err,account){
	  		if(err)
	  			return done(err);
	  		if(account){
	  			account.accessToken = accessToken;
	  			account.tokenSecret = refreshToken;
	  			account.save(function(err){
	  				if(err){
	  					throw err;
	  				}
	  				else{
	  					return done(null, account);
	  				}
	  			})
	  		}
	  		else {
	  			var newAccount= new Account.model();
	  			newAccount.accountId = profile.id;
	  			newAccount.accessToken = accessToken;
	  			newAccount.tokenSecret = refreshToken;
	  			newAccount.name.first = profile.name.givenName;
	  			newAccount.name.last = profile.name.familyName;
	  			newAccount.accountType = 'linkedin';
	  			newAccount.company = req.user.company;
	  			newAccount.save(function(err){
	  				if(err)
	  				{
	  					throw err;
	  				}
	  				else{
	  					return done(null,newAccount);
	  				}
	  			});	    			
	  		}
	  	})
	  });
	}));

/*
	passport.use(new LinkedInStrategy({
	    consumerKey: process.env.LINKEDIN_APP_KEY,
	    consumerSecret: process.env.LINKEDIN_APP_SECRET,
	    callbackURL: callbackUrlHost+"/auth/linkedin/callback"
	  },
	  function(token, tokenSecret, profile, done) {
	  	console.log(token);
	  	Account.model.findOne({'accountId': profile.id }, function(err,account){
	  		if(err)
	  			return done(err);
	  		if(account){
	  			account.accessToken = token;
	  			account.tokenSecret = tokenSecret;
	  			account.save(function(err){
	  				if(err){
	  					throw err;
	  				}
	  				else{
	  					return done(null, account);
	  				}
	  			})
	  		}
	  		else {
	  			var newAccount= new Account.model();
	  			newAccount.accountId = profile.id;
	  			newAccount.accessToken = token;
	  			newAccount.tokenSecret = tokenSecret;
	  			newAccount.name.first = profile.name.givenName;
	  			newAccount.name.last = profile.name.familyName;
	  			newAccount.accountType = 'linkedin';
	  			newAccount.company = req.user.company;
	  			newAccount.save(function(err){
	  				if(err)
	  				{
	  					throw err;
	  				}
	  				else{
	  					return done(null,newAccount);
	  				}
	  			});	    			
	  		}
	  	})
	  }
	))
*/
	view.render('channel');
};
