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
		status: { type: String, default: 'New'}
	},'Comments',{
		fromId: { type: String },
		fromName: { type: String },
		item: { type: String },
		postId: { type: String },
		commentId: { type: String },
		action: { type: String },
		message: { type: String }
	},'Conversations',{
		threadId: { type: String }
	}
);

/**
 * Registration
 */
Ticket.defaultColumns = 'field,fromName,item,action,message,status';
Ticket.register();