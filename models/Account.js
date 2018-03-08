var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var Account = new keystone.List('Account');

Account.add({
	name: { type: Types.Name},
	email: { type: Types.Email },
	accountType: { type: String },
	accountId: { type: String },
	accessToken: { type: String},
	company: { type: String}
});

/**
 * Registration
 */
Account.defaultColumns = 'name,email,accountType';
Account.register();