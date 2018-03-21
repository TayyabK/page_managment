var keystone = require('keystone'),
	middleware = require('./middleware'),
	passport = require('passport'),
	importRoutes = keystone.importer(__dirname),
	User = keystone.list('User'),
	Tickets = keystone.list('Ticket'),
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
	app.all('/channel',middleware.requireUser, routes.views.channel);
	app.all('/conversations',middleware.requireUser, routes.views.conversation);
	app.all('/comments',middleware.requireUser, routes.views.comment);
	app.get('/page',middleware.requireUser, routes.views.page);
	app.get('/policy', routes.views.policy);
	app.get('/post',middleware.requireUser, routes.views.post);
	app.get('/subscribe',middleware.requireUser, routes.views.subscribe);


	// API's

	app.post('/api/channel/subscribe', routes.api.channel.subscribe);
	app.post('/api/channel/unsubscribe', routes.api.channel.unsubscribe);


	app.get('/auth/facebook',
		passport.authenticate('facebook', {
			scope : ['email','manage_pages','publish_pages','read_page_mailboxes','instagram_basic','instagram_manage_comments']
		}
	));

	app.get('/auth/facebook/callback',
  		passport.authenticate('facebook', {
  			successRedirect: '/channel',
            failureRedirect: '/error'
        })
    );

	app.get('/facebook', function(req, res) {   
	  if (req.params('hub.mode') == 'subscribe' && req.params('hub.verify_token') == token ) {
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
	  		if(req.body.entry[0].id == req.body.entry[0].changes[0].value.from.id)
	  		{
	  			console.log("On going Comment Ticket");
	  		}
	  		else
	  		{
	  			Tickets.model.findOne({commentId: req.body.entry[0].changes[0].value.parent_id}).exec(function(err,doc){
	  				if(err){
	  					throw err
	  				}
	  				if(doc){
	  					doc.status = 'New';
	  					doc.endTime = null;
	  					doc.save();
	  					console.log("On going Comment Ticket");
	  				}
	  				else{
			  			console.log("New Comment Ticket");
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
	  			})
	  		}
	  	}
	  }

	  if(req.body.entry[0].changes[0].field == 'conversations')
	  {
	  	var threadIdval = req.body.entry[0].changes[0].value.thread_id;
	  	console.log(threadIdval);
	  	Tickets.model.findOne({threadId: threadIdval}).where('status', 'New').exec(function(err,doc){
	  		if(err){
	  			throw err;
	  		}
	  		if(doc){
	  			console.log("On Going Conversation Ticket ---->");
	  		}
	  		else{
	  			console.log("New Conversation Ticket");
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


		app.get('/instagram', function(req, res) {   
		  if ( req.param('hub.mode') == 'subscribe' && req.param('hub.verify_token') == token) {
		    res.send(req.param('hub.challenge'));
		  } else {
		    res.sendStatus(400);
		  }
		});

		app.post('/instagram', function(req, res) {
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

		  res.sendStatus(200);
		});


};
