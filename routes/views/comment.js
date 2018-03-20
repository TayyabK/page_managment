var keystone = require('keystone'),
	Ticket = keystone.list('Ticket'),
	Page = keystone.list('Page');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'comment';

	locals.commentid = req.query.Id;
	locals.pageid = req.query.pageid;
	locals.ticketid = req.query.ticketid;
	view.query('Page', Page.model.findOne({pageId: req.query.pageid}));
	view.query('Ticket', Ticket.model.findOne({_id: req.query.ticketid}));

	view.on('post', { action: 'CloseTicket' }, function(next){
		Ticket.model.findOne({_id: req.query.ticketid}).exec(function(err,doc){
			if(err)
			{
				throw err;
			}
			if(doc){
				doc.status = 'Closed';
				doc.endTime = Date.now();
				doc.save();
				next();
			}
			else{
				next();
			}
		})
	});

	view.render('comment');

};
