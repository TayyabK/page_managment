var keystone = require('keystone'),
	Page = keystone.list('Page'),
	Ticket = keystone.list('Ticket');
var Twit = require('Twit');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Twitter-Feed';

	locals.Id = req.query.id;
		
	var T = new Twit({
	  consumer_key: process.env.TWITTER_CONSUMER_KEY,
	  consumer_secret: process.env.TWITTER_SECRET,
	  access_token: '383324085-Wzcf4Saar3DrYU55bNy5LmxqdyUMiAsH0NZG29Ay',
	  access_token_secret: 'uw4LWL0OwToxs28xUMazW8KJ5q01qL1UeHFe38fQ98Vw1'
	});
	 
	var params = {
		status: 'Posting this using node js app #twitterApi #twitterIntegration'
	};

	T.get('statuses/user_timeline', callback);

	function callback(error, tweets, response) {
	  if (!error) {
	    console.log(tweets);
	  }
	  else{
	  	console.log(error);
	  }
	}
	 
	view.render('twitter/feed');
};
