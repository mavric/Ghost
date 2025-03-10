const logging = require('@tryghost/logging');
const { url } = require('@tryghost/security');

/**
 * @typedef {object} NotificationData
 * @prop {string} title
 * @prop {string} body
 * @prop {object} data Additional data to send with notification
 * @prop {NotificationRecipient[]} recipients
 */

/**
 * @typedef {object} NotificationRecipient
 * @prop {string} token Firebase token
 * @prop {object} data Recipient-specific data
 */

/**
 * @typedef {object} INotificationProvider
 * @prop {(data: NotificationData) => Promise<NotificationProviderSuccessResponse>} send
 * @prop {() => number} getMaximumRecipients
 */

/**
 * @typedef {object} NotificationProviderSuccessResponse
 * @prop {string} id
 * @prop {object} response Raw provider response
 */

class SendingService {
    #notificationProvider;

    /**
     * @param {object} dependencies
     * @param {INotificationProvider} dependencies.notificationProvider
     */
    constructor({
        notificationProvider
    }) {
        this.#notificationProvider = notificationProvider;
    }

    /**
     * Get maximum number of recipients per batch
     * @returns {number}
     */
    getMaximumRecipients() {
        return this.#notificationProvider.getMaximumRecipients();
    }

    /**
     * Send notification to recipients
     * @param {object} data
     * @param {object} data.notification Notification model
     * @param {NotificationRecipient[]} data.recipients Recipients to send to
     * @returns {Promise<NotificationProviderSuccessResponse>}
     */
    async send({notification, recipients}) {
        logging.info(`Sending notification to ${recipients.length} recipients`);

        // Filter out any recipients with invalid tokens
        // const validRecipients = recipients.filter(recipient => {
        //     if (!recipient.token) {
        //         logging.warn('Recipient has no Firebase token, skipping');
        //         return false;
        //     }
        //     return true;
        // });

        // if (validRecipients.length === 0) {
        //     logging.warn('No valid recipients found for notification');
        //     return {
        //         id: 'no-recipients',
        //         response: null
        //     };
        // }

        // // Prepare notification data
        const notificationData = {
            title: "notification.get('title')",
            body: "notification.get('body')",
            // data: notification.get('data') || {},
            data: {
                url: "https://www.youtube.com"
            },
            recipients: []//validRecipients
        };

        // Send via provider
        return await this.#notificationProvider.send(notificationData); //hardcoded
        // return await this.#notificationProvider.send(notificationData);
    }
}

module.exports = SendingService;