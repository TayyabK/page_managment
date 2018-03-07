var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'subscribe';
	locals.pageId = req.query.Id;
	locals.pageToken = req.query.token;
	view.render('subscribe');

};
