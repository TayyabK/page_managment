var keystone = require('keystone'),
	Page = keystone.list('Page'),
	Ticket = keystone.list('Ticket');
var Twit = require('twit');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Twitter-Feed';

	locals.Id = req.query.id;

	view.render('twitter/feed');
};
