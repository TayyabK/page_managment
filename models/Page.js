var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var Page = new keystone.List('Page');

Page.add({
	pagename: { type: String},
	pageId: { type: String },
	accessToken: { type: String},
	accountId: { type: String},
	company: { type: String},
	pageType: { type: String},
	status: { type: String}
});

/**
 * Registration
 */
Page.defaultColumns = 'name,email,pageId';
Page.register();