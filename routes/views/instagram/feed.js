var keystone = require('keystone'),
	Page = keystone.list('Page');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Instagram-Feed';

	locals.Id = req.query.Id;
	view.query('Page', Page.model.findOne({pageId: req.query.Id}));

	view.render('instagram/feed');
};