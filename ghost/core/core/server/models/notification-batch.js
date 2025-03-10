const ghostBookshelf = require('./base');

const NotificationBatch = ghostBookshelf.Model.extend({
    tableName: 'notification_batches',

    notification() {
        return this.belongsTo('Notification', 'notification_id');
    },

    recipients() {
        return this.hasMany('NotificationRecipient', 'batch_id');
    }
});

module.exports = {
    NotificationBatch: ghostBookshelf.model('NotificationBatch', NotificationBatch)
};
