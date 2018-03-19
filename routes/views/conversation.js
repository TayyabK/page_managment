var keystone = require('keystone');
var Page = keystone.list('Page');
var Ticket = keystone.list('Ticket');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'conversation';

	locals.conversationid = req.query.Id;
	locals.pageId = req.query.pageid;
	locals.ticketId = req.query.ticketid;
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

	view.render('conversation');
};
