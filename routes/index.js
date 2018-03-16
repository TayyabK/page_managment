var keystone = require('keystone'),
	middleware = require('./middleware'),
	passport = require('passport'),
	importRoutes = keystone.importer(__dirname),
	User = keystone.list('User'),
	Ticket = keystone.list('Ticket'),
	bodyParser = require('body-parser');

var xhub = require('express-x-hub');
var methodOverride = require('method-override');


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
	app.use(bodyParser.json());
	app.use(methodOverride());
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
			scope : ['email','manage_pages','publish_pages','read_page_mailboxes']
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
	  console.log("Field:",req.body.entry[0].changes[0].field);
	  console.log("Changes:", req.body.entry[0].changes[0]);
/*	  console.log("FROMID:",req.body.entry[0].changes[0].value.from.id);
	  console.log("FROMID:",req.body.entry[0].changes[0].value.from.name);
	  console.log("ITEM:",req.body.entry[0].changes[0].value.item);
	  console.log("PostId:",req.body.entry[0].changes[0].value.comment_id);
	  console.log("CommentId:",req.body.entry[0].changes[0].value.post_id);
	  console.log("Time:",req.body.entry[0].changes[0].value.created_time);
	  console.log("message:",req.body.entry[0].changes[0].value.message);
	  console.log("Action:",req.body.entry[0].changes[0].value.verb);
*/

	  if(req.body.entry[0].changes[0].value.item == 'comment')
	  {
	  	if(req.body.entry[0].changes[0].value.verb == 'add')
	  	{
	  		var new_comment = {
	  			entryId: req.body.entry[0].id,
	  			field: req.body.entry[0].changes[0].field,
	  			fromId: req.body.entry[0].changes[0].value.from.id,
	  			fromName: req.body.entry[0].changes[0].value.from.name,
	  			item: req.body.entry[0].changes[0].value.item,
	  			postId: req.body.entry[0].changes[0].value.post_id,
	  			commentId: req.body.entry[0].changes[0].value.comment_id,
	  			action: req.body.entry[0].changes[0].value.verb,
	  			message: req.body.entry[0].changes[0].value.message
	  		}

	  		var Ticket = keystone.list('Ticket').model,
	  			newTicket = new Ticket(new_comment);

	  			newTicket.save(function(err){
	  				if(err)
	  					throw err;
	  			})

	  	}
	  }

	  if(req.body.entry[0].changes[0].field == 'conversations')
	  {
	  	var new_converstation = {
	  		entryId: req.body.entry[0].id,
	  		field: req.body.entry[0].changes[0].field,
	  		threadId: req.body.entry[0].changes[0].value.thread_id
	  	}

	  	var Ticket = keystone.list('Ticket').model,
	  		newTicket = new Ticket(new_converstation);

	  		newTicket.save(function(err){
	  			if(err)
	  				throw err;
	  		})
	  }


	  res.sendStatus(200);

/*	  var isXHub = req.isXHub;
	  if(!isXHub) { console.log('No X-Hub Signature')}
	  	console.log(req.headers);
	  var isValid = req.isXHubValid();
	  if (!isValid) {
	    console.log('Warning - request header X-Hub-Signature not present or invalid');
	    res.sendStatus(401);
	    return;
	  }

	  console.log('request header X-Hub-Signature validated');
*/	  // Process the Facebook updates here
	});


};
