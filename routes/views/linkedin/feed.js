var keystone = require('keystone'),
	Account = keystone.list('Account'),
	Ticket = keystone.list('Ticket');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Twitter-Feed';
	 
	locals.Id = req.query.Id;

	view.query('Account', Account.model.findOne({accountId: req.query.Id}));

	view.render('linkedin/feed');
};
