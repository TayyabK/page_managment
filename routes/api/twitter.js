var keystone = require('keystone'),
	Twit = require('twit'),
	Account = keystone.list('Account');

const config = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_SECRET
};


exports.postTweet = function(req,res){

	Account.model.findOne({accountId: req.body.accountId}).exec(function(err,account){
		if(err){
			throw err;
			return res.status(422).json({message: 'Error'});
		}
		if(account){
			config.access_token = account.accessToken; 
			config.access_token_secret = account.tokenSecret;

			var T = new Twit(config);
			var params = {
				status: req.body.status
			};

			T.post('statuses/update', params, callback);

			function callback(error, tweets, response) {
			  if (!error) {
			  	console.log(tweets);
		  		return res.status(200).json({
		  	        success: true,
		  	        message: 'Status Tweeted'
		  	    });
			  }
			  else{
			  	console.log(error);
			  	return res.status(422).json({message: 'Error'});
			  }
			}
		}
		else{
			return res.status(200).json({
		        success: false,
		        message: 'Account does not exist'
		    });
		}
	})
}


exports.getTweets = function(req,res){

	Account.model.findOne({accountId: req.query.accountId}).exec(function(err,account){
		if(err){
			throw err;
			return res.status(422).json({message: 'Error'});
		}
		if(account){
			config.access_token = account.accessToken; 
			config.access_token_secret = account.tokenSecret;

			var T = new Twit(config);

			T.get('statuses/user_timeline', callback);

			function callback(error, tweets, response) {
			  if (!error) {
		  		return res.status(200).json({
		  	        success: true,
		  	        message: 'Tweets Received',
		  	        tweets
		  	    });
			  }
			  else{
			  	console.log(error);
			  	return res.status(422).json({message: 'Error'});
			  }
			}
		}
		else{
			return res.status(200).json({
		        success: false,
		        message: 'Account does not exist'
		    });
		}
	})
}

exports.getMessages = function(req,res){

	Account.model.findOne({accountId: req.query.accountId}).exec(function(err,account){
		if(err){
			throw err;
			return res.status(422).json({message: 'Error'});
		}
		if(account){
			config.access_token = account.accessToken; 
			config.access_token_secret = account.tokenSecret;

			var T = new Twit(config);

			T.get('direct_messages', callback);

			function callback(error, tweets, response) {
			  if (!error) {
		  		return res.status(200).json({
		  	        success: true,
		  	        message: 'Direct tweets Received',
		  	        tweets
		  	    });
			  }
			  else{
			  	console.log(error);
			  	return res.status(422).json({message: 'Error'});
			  }
			}
		}
		else{
			return res.status(200).json({
		        success: false,
		        message: 'Account does not exist'
		    });
		}
	})
}