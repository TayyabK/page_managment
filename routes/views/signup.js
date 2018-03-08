var keystone = require('keystone'),
	async = require('async');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'signup';

	view.on('post', { action: 'signup' }, function(next) {
		
		async.series([
			
			function(cb) {

				if (!req.body.firstname || !req.body.lastname || !req.body.company || !req.body.email || !req.body.password || !req.body.confirm_password) {
					req.flash('error', {title:'Please enter a name, company name, email and password.'});
					return cb(true);
				}
				
				return cb();

			},
			
			function(cb) {

				if (req.body.password != req.body.confirm_password) {
					req.flash('error',{title: 'Your password deos not match'});
					return cb(true);
				}
				
				return cb();
				
			},

			function(cb) {

				keystone.list('User').model.findOne({ email: req.body.email }, function(err, user) {
					
					if (err || user) {
						req.flash('error', {title:'User already exists with that email address.'});
						return cb(true);
					}
					
					return cb();
					
				});
				
			},
			
			function(cb) {

				var userData = {
					name: {
						first: req.body.firstname,
						last: req.body.lastname,
					},
					email: req.body.email,
					password: req.body.password,
					company: req.body.company
				};
				
				var User = keystone.list('User').model,
					newUser = new User(userData);

				newUser.save(function(err) {
					if(err){
						throw err;
					}
					else{
						return cb();
					}
				});
				
			}
			
		], function(err){

			if (err) return next();
			
			var onSuccess = function() {

				if (req.body.target && !/join|signin/.test(req.body.target)) {
					console.log('[join] - Set target as [' + req.body.target + '].');
					res.redirect(req.body.target);
				} else {
					res.redirect('/channel');
				}
			}
			
			var onFail = function(e) {
				req.flash('error', {title:'There was a problem signing you in, please try again.'});
				return next();
			}
			
			keystone.session.signin({ email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail);
			
		});
		
	});

	view.render('signup');
};
