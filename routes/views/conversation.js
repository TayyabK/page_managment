var keystone = require('keystone');
var Page = keystone.list('Page');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'conversation';

	locals.conversationid = req.query.Id;
	locals.pageId = req.query.pageid;
	view.query('Page', Page.model.findOne({pageId: req.query.pageid}));

	view.render('conversation');
};
