const ghostBookshelf = require('./base');

const NotificationRecipient = ghostBookshelf.Model.extend({
    tableName: 'notification_recipients',

    notification() {
        return this.belongsTo('Notification', 'notification_id');
    },

    batch() {
        return this.belongsTo('NotificationBatch', 'batch_id');
    },

    failure() {
        return this.hasOne('NotificationRecipientFailure', 'notification_recipient_id');
    }
});

module.exports = {
    NotificationRecipient: ghostBookshelf.model('NotificationRecipient', NotificationRecipient)
};
