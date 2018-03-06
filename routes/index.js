var keystone = require('keystone');
var middleware = require('./middleware');
var passport = require('passport');
var importRoutes = keystone.importer(__dirname);
var User = keystone.list('User');



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
};

// Setup Route Bindings
exports = module.exports = function (app) {
	// Views
	app.get('/', routes.views.index);
	app.get('/page', routes.views.page);
	app.get('/post', routes.views.post);


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


};
