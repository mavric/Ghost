const logging = require('@tryghost/logging');
const errors = require('@tryghost/errors');
const FirebaseClient  = require('@tryghost/firebase-client')
const configService = require('../../../ghost/core/core/shared/config/env/config.development.json');
const models = require('../../../ghost/core/core/server/models');
const debug = require('@tryghost/debug')('notification-service:firebase-provider');

class FirebaseNotificationProvider {
    #firebaseAdmin;
    #sentry;

    /**
     * @param {object} dependencies
     * @param {object} dependencies.firebaseAdmin Initialized Firebase Admin instance
     * @param {object} [dependencies.sentry] Sentry error reporting
     */
    constructor({
        // firebaseAdmin,
        // sentry
    }) {
        // this.#firebaseAdmin = firebaseAdmin;
        // this.#sentry = sentry;
    }

    /**
     * Get maximum number of recipients per batch
     * Firebase allows up to 500 messages per batch
     * @returns {number}
     */
    getMaximumRecipients() {
        return 500;
    }

    /**
     * Send notification via Firebase Cloud Messaging
     * @param {import('./SendingService').NotificationData} data
     * @returns {Promise<import('./SendingService').NotificationProviderSuccessResponse>}
     */
    async send(data) {
        // const {title, body, data: notificationData, recipients} = data;
        // const startTime = Date.now();
        // debug(`sending notification to ${recipients.length} recipients`);

        try {
            // Prepare messages for each recipient
            // const messages = recipients.map(recipient => ({
            //     token: recipient.token,
            //     notification: {
            //         title,
            //         body
            //     },
            //     data: {
            //         ...notificationData,
            //         ...recipient.data
            //     }
            // }));

            // Send messages in batch
            const firebase = new FirebaseClient({
                        config: configService,
                        models: models,
                        url: "https://www.youtube.com"
            })
            const response = await firebase.sendNotifications()
            // Check for partial failures
            if (response.failureCount > 0) {
                const failures = response.responses.filter(resp => !resp.success);
                logging.error(`Failed to send ${response.failureCount} notifications:`, failures);

                if (this.#sentry) {
                    this.#sentry.captureMessage('Partial notification send failure', {
                        level: 'error',
                        extra: {
                            failureCount: response.failureCount,
                            failures
                        }
                    });
                }

                // If all messages failed, throw error
                if (response.failureCount === messages.length) {
                    throw new errors.NotificationError({
                        message: 'All notifications failed to send',
                        context: JSON.stringify(failures)
                    });
                }
            }

            debug(`sent notification (${Date.now() - startTime}ms)`);
            logging.info(`Successfully sent ${response.successCount} notifications`);

            return {
                id: `batch-${Date.now()}`, // Firebase doesn't provide a batch ID, so we create one
                response: response
            };
        } catch (err) {
            debug(`failed to send notification (${Date.now() - startTime}ms)`);

            const error = new errors.NotificationError({
                message: 'Error sending Firebase notification',
                err,
                context: err.message
            });

            if (this.#sentry) {
                this.#sentry.captureException(err);
            }

            throw error;
        }
    }

    /**
     * Handle Firebase token errors
     * @private
     * @param {string} token
     * @param {Error} error
     */
    handleTokenError(token, error) {
        // TODO: Implement token error handling
        // - Remove invalid tokens
        // - Update token status
        // - Notify system about invalid tokens
        logging.error(`Firebase token error for ${token}:`, error);
    }
}

module.exports = FirebaseNotificationProvider;