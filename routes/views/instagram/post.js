var keystone = require('keystone'),
	Page = keystone.list('Page');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Instagram-Post';

	locals.Id = req.query.Id;
	locals.postid = req.query.postid;
	
	view.query('Page', Page.model.findOne({pageId: req.query.Id}));

	view.on('post', { action: 'makeTicket' }, function(next){
		var Data = {
			comment: req.body.comment,
			comId: req.body.comId,
			mediaId: req.body.mediaId,
			fromId: req.body.fromId,
			fromName: req.body.fromName,
			linkedAccount: 'instagram',
			entryId: req.query.Id
		}

		var Ticket = keystone.list('Ticket').model,
			newTicket = new Ticket(Data);

			newTicket.save(function(err){
				if(err){
					throw err;
				}
				else{
					next();
				}
			})
	})

	view.render('instagram/post');
};
