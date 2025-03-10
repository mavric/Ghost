const ghostBookshelf = require('./base');

const NotificationRecipientFailure = ghostBookshelf.Model.extend({
    tableName: 'notification_recipient_failures',

    notification() {
        return this.belongsTo('Notification', 'notification_id');
    },

    recipient() {
        return this.belongsTo('NotificationRecipient', 'notification_recipient_id');
    }
});

module.exports = {
    NotificationRecipientFailure: ghostBookshelf.model('NotificationRecipientFailure', NotificationRecipientFailure)
};
