var keystone = require('keystone');
var middleware = require('./middleware');
var passport = require('passport');
var importRoutes = keystone.importer(__dirname);
var User = keystone.list('User');
/*var xhub = require('express-x-hub');
*/var bodyParser = require('body-parser');
/*var methodOverride = require('method-override');
*/

// Common Middleware
keystone.pre('routes', passport.initialize());
keystone.pre('routes', passport.session());
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);


passport.serializeUser(function(user, done) {
  done(null, user._id);
});


passport.deserializeUser(function(userId, done) {
  User.model.findOne({_id: userId} ,function(err, user){
    done(err, user);
  });
});

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
	api: importRoutes('./api'),
};


var token = process.env.TOKEN || 'token';

// Setup Route Bindings
exports = module.exports = function (app) {
	// Views

/*	app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
*/	app.use(bodyParser.json());
/*	app.use(methodOverride());
*/
	app.all('/', routes.views.index);
	app.all('/signup', routes.views.signup);
	app.get('/signout', routes.views.signout);
	app.all('/channel', routes.views.channel);
	app.get('/page', routes.views.page);
	app.get('/post', routes.views.post);
	app.get('/subscribe', routes.views.subscribe);


	// API's

	app.post('/api/channel/subscribe', routes.api.channel.subscribe);
	app.post('/api/channel/unsubscribe', routes.api.channel.unsubscribe);


	app.get('/auth/facebook',
		passport.authenticate('facebook', {
			scope : ['email','manage_pages','publish_pages']
		}
	));

	app.get('/auth/facebook/callback',
  		passport.authenticate('facebook', {
  			successRedirect: '/',
            failureRedirect: '/error' 
        })
    );

	app.get('/facebook', function(req, res) {   
	  if (
	    req.params('hub.mode') == 'subscribe' &&
	    req.params('hub.verify_token') == token
	  ) {
	    res.send(req.params('hub.challenge'));
	  } else {
	    res.sendStatus(400);
	  }
	});

	app.post('/facebook', function(req, res) {
	  console.log('Facebook request body:', req.body);
	  console.log("ENTRY:",req.body.entry);
	  console.log("ID:",req.body.entry[0].id);
	  console.log("Changes:",req.body.entry[0].changes);
	  console.log("Time:",req.body.entry[0].time);
/*	  if (!req.isXHubValid()) {
	    console.log('Warning - request header X-Hub-Signature not present or invalid');
	    res.sendStatus(401);
	    return;
	  }

	  console.log('request header X-Hub-Signature validated');
*/	  // Process the Facebook updates here
	  res.sendStatus(200);
	});
};
