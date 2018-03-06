var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'page';

	locals.pageid = req.query.Id;
	locals.pagename = req.query.name;
	view.render('page');

};
