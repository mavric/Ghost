const ghostBookshelf = require('./base');

const Notification = ghostBookshelf.Model.extend({
    tableName: 'notifications',

    batches() {
        return this.hasMany('NotificationBatch', 'notification_id');
    },

    recipients() {
        return this.hasMany('NotificationRecipient', 'notification_id');
    },

    failures() {
        return this.hasMany('NotificationRecipientFailure', 'notification_id');
    }
});

module.exports = {
    Notification: ghostBookshelf.model('Notification', Notification)
};
