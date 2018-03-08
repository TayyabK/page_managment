var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var Ticket = new keystone.List('Ticket');

Ticket.add({

});

/**
 * Registration
 */
Ticket.defaultColumns = '';
Ticket.register();