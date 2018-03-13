var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var Ticket = new keystone.List('Ticket');

Ticket.add({
	entryId: { type: String },
	field: { type: String },
	fromId: { type: String },
	fromName: { type: String },
	item: { type: String },
	postId: { type: String },
	commentId: { type: String },
	action: { type: String },
	status: { type: String, default: 'New'}
});

/**
 * Registration
 */
Ticket.defaultColumns = '';
Ticket.register();