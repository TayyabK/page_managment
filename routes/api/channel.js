var keystone = require('keystone'),
	Page = keystone.list('Page');

exports.subscribe = function(req, res) {
	Page.model.findOne({pageId: req.body.Id}).exec(function(err,result){
		if(err){
			throw err;
			return res.status(422).json({message: 'Error'});
		}
		if(result){
			result.status = 'subscribe';
			result.save(function(err){
				if(err){
					throw err;
					return res.status(422).json({message: 'Error'});
				}
				else{
					return res.status(200).json({
				        success: true,
				        message: 'subscribed this page'
				    });
				}
			})
		}
		else{
			return res.status(200).json({
		        success: false,
		        message: 'No Data found'
		    });
		}
	})
}

exports.unsubscribe = function(req, res) {
	Page.model.findOne({pageId: req.body.Id}).exec(function(err,result){
		if(err){
			throw err;
			return res.status(422).json({message: 'Error'});
		}
		if(result){
			result.status = 'unsubscribe';
			result.save(function(err){
				if(err){
					throw err;
					return res.status(422).json({message: 'Error'});
				}
				else{
					return res.status(200).json({
				        success: true,
				        message: 'unsubscribed this page'
				    });
				}
			})
		}
		else{
			return res.status(200).json({
		        success: false,
		        message: 'No Data found'
		    });
		}
	})
}