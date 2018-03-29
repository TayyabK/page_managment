var keystone = require('keystone'),
	Page = keystone.list('Page'),
	Ticket = keystone.list('Ticket');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Instagram-Feed';

	locals.Id = req.query.Id;
	locals.Commentid = req.query.Commentid;

	view.query('Page', Page.model.findOne({pageId: req.query.Id}));
	
	view.render('instagram/details');
};