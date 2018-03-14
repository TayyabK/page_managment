var keystone = require('keystone'),
	Ticket = keystone.list('Ticket'),
	Page = keystone.list('Page');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'page';

	locals.pageid = req.query.Id;
	locals.pagename = req.query.name;

	view.query('Tickets', Ticket.model.find({entryId: req.query.Id}));
	view.query('ticketcount', Ticket.model.find({entryId: req.query.Id}).where('status', 'New').count());
	view.query('Page', Page.model.findOne({pageId: req.query.Id}));

	view.render('page');

};
