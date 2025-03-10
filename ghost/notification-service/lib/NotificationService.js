const errors = require('@tryghost/errors');
const tpl = require('@tryghost/tpl');
const logging = require('@tryghost/logging');
const { v4: uuidv4 } = require('uuid');

const messages = {
    retryNotificationStatusError: 'Can only retry notifications for published posts'
};

class NotificationService {
    #batchSendingService;
    #sendingService;
    #models;
    #settingsCache;
    #limitService;

    /**
     * @param {object} dependencies
     * @param {object} dependencies.batchSendingService
     * @param {object} dependencies.sendingService
     * @param {object} dependencies.models Model instances
     * @param {object} dependencies.models.Notification Model instance for notifications
     * @param {object} dependencies.settingsCache Settings cache instance
     * @param {object} dependencies.limitService Service to check notification limits
     */
    constructor({
        batchSendingService,
        sendingService,
        models,
        settingsCache,
        limitService
    }) {
        this.#batchSendingService = batchSendingService;
        this.#sendingService = sendingService;
        this.#models = models;
        this.#settingsCache = settingsCache;
        this.#limitService = limitService;
    }

    /**
     * Create a new notification
     * @param {object} post Post to send notification for
     * @returns {Promise<object>} Created notification
     */
    async createNotification(post) {
        // Check if we're allowed to send more notifications
        await this.checkLimits();

            const notification = await this.#models.Notification.add({
                uuid: uuidv4(),
                post_id: post.id,
                status: 'pending',
                title: "title",
                body: "Only Body",
                data: {
                    url: "https://www.youtube.com",
                },
                error: null,
                error_data: null,
                notification_count: 10,
                delivered_count: 5,
                failed_count: 2,
                message: "Check out our latest blog post on web development trends.",
                submitted_at: new Date("2025-02-13T10:25:11Z"),
                created_at: new Date("2025-02-13T10:25:11Z"),
                created_by: "67adc887b33d3306ee584fb3",
                updated_at: new Date("2025-02-13T10:30:00Z"),
                updated_by: "67adc887b33d3306ee584fb3"
            });
        try {
            this.#batchSendingService.scheduleNotification(notification);
        } catch (e) {
            await notification.save({
                status: 'failed',
                error: e.message || 'Something went wrong while scheduling the notification'
            }, {patch: true});
        }

        return notification;
    }

    /**
     * Retry a failed notification
     * @param {object} notification Notification to retry
     * @returns {Promise<object>} Updated notification
     */
    async retryNotification(notification) {
        // Block accidentally retrying non-published posts
        const post = await notification.getLazyRelation('post');
        if (post.get('status') !== 'published' && post.get('status') !== 'sent') {
            throw new errors.IncorrectUsageError({
                message: tpl(messages.retryNotificationStatusError)
            });
        }

        await this.checkLimits();

        // Change notification status back to 'pending' before scheduling
        if (notification.get('status') === 'failed') {
            await notification.save({status: 'pending'}, {patch: true});
        }

        this.#batchSendingService.scheduleNotification(notification);
        return notification;
    }

    /**
     * Check if we're allowed to send more notifications
     * @private
     */
    async checkLimits() {
        if (this.#limitService.isLimited('notifications')) {
            await this.#limitService.errorIfWouldGoOverLimit('notifications');
        }
    }

    /**
     * Truncate notification body to fit Firebase limits
     * @private
     * @param {string} body
     * @returns {string}
     */
    truncateBody(body) {
        // Firebase has a limit of 4096 bytes for the notification body
        // We'll be conservative and limit to 1000 chars
        return body.length > 1000 ? body.substring(0, 997) + '...' : body;
    }
}

module.exports = NotificationService;