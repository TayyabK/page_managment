var keystone = require('keystone');
var Types = keystone.Field.Types;
var moment = require('moment');

/**
 * User Model
 * ==========
 */
var Ticket = new keystone.List('Ticket');

Ticket.add({
		entryId: { type: String },
		field: { type: String },
		status: { type: String, default: 'New'},
		startTime: { type: Date, default: moment().subtract(20, 'seconds')},
		endTime: { type: Date},
		linkedAccount: { type: String}
	},'Comments',{
		fromId: { type: String },
		fromName: { type: String },
		item: { type: String },
		postId: { type: String },
		commentId: { type: String },
		action: { type: String },
		message: { type: String },
		parentid: { type: String},
		commentType: { type: String }
	},'Conversations',{
		threadId: { type: String }
	},'InstagramComment',{
		comment: { type: String },
		comId: { type: String },
		mediaId: { type: String }
	}
);

/**
 * Registration
 */
Ticket.defaultColumns = 'field,fromName,item,action,message,status';
Ticket.register();