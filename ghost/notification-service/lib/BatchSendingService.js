const logging = require('@tryghost/logging');
const errors = require('@tryghost/errors');
const tpl = require('@tryghost/tpl');

const messages = {
    notificationError: 'An error occurred sending the notification.',
    partialFailure: 'Some notifications failed to send. Please retry the failed ones.'
};

const MAX_BATCH_SIZE = 500; // Firebase allows up to 500 messages per batch
const MAX_SENDING_CONCURRENCY = 2;

class BatchSendingService {
    #sendingService;
    #jobsService;
    #models;
    #db;
    #sentry;

    /**
     * @param {object} dependencies
     * @param {object} dependencies.sendingService Service to send notifications
     * @param {object} dependencies.jobsService Service to manage background jobs
     * @param {object} dependencies.models Model instances
     * @param {object} dependencies.models.NotificationRecipient
     * @param {object} dependencies.models.NotificationBatch
     * @param {object} dependencies.models.Notification
     * @param {object} dependencies.db Database instance
     * @param {object} [dependencies.sentry] Sentry error reporting
     */
    constructor({
        sendingService,
        jobsService,
        models,
        db,
        sentry
    }) {
        this.#sendingService = sendingService;
        this.#jobsService = jobsService;
        this.#models = models;
        this.#db = db;
        this.#sentry = sentry;
    }

    /**
     * Schedule a notification for sending
     * @param {object} notification Notification to schedule
     */
    scheduleNotification(notification) {
        return this.#jobsService.addJob({
            name: 'batch-notification-service-job',
            job: this.notificationJob.bind(this),
            data: {notificationId: notification.id},
            offloaded: false
        });
    }

    /**
     * Process a notification job
     * @private
     */
    async notificationJob({notificationId}) {
        logging.info(`Starting notification job for notification ${notificationId}`);

        let notification = await this.updateStatusLock(
            this.#models.Notification,
            notificationId,
            'submitting',
            ['pending', 'failed']
        );

        if (!notification) {
            logging.error(`Tried sending notification that is not pending or failed ${notificationId}`);
            return;
        }

        try {
            await this.sendNotification(notification);
            await notification.save({
                status: 'submitted',
                submitted_at: new Date(),
                error: null
            }, {patch: true});
        } catch (err) {
            logging.error(err);
            if (this.#sentry) {
                this.#sentry.captureException(err);
            }

            await notification.save({
                status: 'failed',
                error: err.message || 'Unknown error occurred'
            }, {patch: true});
        }
    }

    /**
     * Send a notification to all recipients
     * @private
     */
    async sendNotification(notification) {
        logging.info(`Sending notification ${notification.id}`);

        // Get all recipients for this notification
        // const recipients = await this.#models.NotificationRecipient.findAll({
        //     filter: `notification_id:'${notification.id}'`
        // });

        // // Create batches of recipients
        // const batches = [];
        // for (let i = 0; i < recipients.length; i += MAX_BATCH_SIZE) {
        //     const batchRecipients = recipients.slice(i, i + MAX_BATCH_SIZE);
        //     const batch = await this.#models.NotificationBatch.add({
        //         notification_id: notification.id,
        //         status: 'pending'
        //     });

            // Link recipients to batch
            // await this.#db.knex('notification_recipients')
            //     .whereIn('id', batchRecipients.map(r => r.id))
            //     .update({batch_id: batch.id});

            // batches.push(batch);

            //2nd Approach

             // Get all members who have a push notification token
             console.log('this.#models: ', this.#models);
    const membersWithTokens = await this.#models.Member.findAll({
            filter: 'fcm_token:-null' // Fetch only those with an FCM token
        });

    if (membersWithTokens.length === 0) {
        logging.warn(`No members found with push notification tokens.`);
        return;
    }

    // Create batches of tokens
    const batches = [];
    for (let i = 0; i < membersWithTokens.length; i += MAX_BATCH_SIZE) {
        const batchMembers = membersWithTokens.slice(i, i + MAX_BATCH_SIZE);
        const batchTokens = batchMembers.map(m => m.fcm_token);

        const batch = await this.#models.NotificationBatch.add({
            notification_id: notification.id,
            status: 'pending'
        });

        // Store tokens with the batch (optional: for tracking)
        // await this.#db.knex('notification_batches')
        //     .where('id', batch.id)
        //     .update({tokens: JSON.stringify(batchTokens)});

        batches.push({
            batchId: batch.id,
            tokens: batchTokens
        });
        }

        await this.#sendingService.send({
                notification,
                // recipients: recipients.map(recipient => ({
                //     token: recipient.get('token'),
                //     data: recipient.get('data')
                // }))
                recipients: []
            });
        // await this.sendBatches({notification, batches});
    }

    /**
     * Send notification batches
     * @private
     */
    async sendBatches({notification, batches}) {
        logging.info(`Sending ${batches.length} batches for notification ${notification.id}`);

        let succeededCount = 0;
        const queue = batches.slice();

        const runNext = async () => {
            const batch = queue.shift();
            if (batch) {
                if (await this.sendBatch({notification, batch})) {
                    succeededCount += 1;
                }
                await runNext();
            }
        };

        // Run maximum MAX_SENDING_CONCURRENCY at the same time
        await Promise.all(new Array(MAX_SENDING_CONCURRENCY).fill(0).map(() => runNext()));

        if (succeededCount < batches.length) {
            if (succeededCount > 0) {
                throw new errors.NotificationError({
                    message: tpl(messages.partialFailure)
                });
            }
            throw new errors.NotificationError({
                message: tpl(messages.notificationError)
            });
        }
    }

    /**
     * Send a single batch of notifications
     * @private
     */
    async sendBatch({notification, batch: originalBatch}) {
        logging.info(`Sending batch ${originalBatch.id} for notification ${notification.id}`);

        const batch = await this.updateStatusLock(
            this.#models.NotificationBatch,
            originalBatch.id,
            'submitting',
            ['pending', 'failed']
        );

        if (!batch) {
            logging.error(`Tried sending notification batch that is not pending or failed ${originalBatch.id}`);
            return true;
        }

        let succeeded = false;

        try {
            const recipients = await this.#models.NotificationRecipient.findAll({
                filter: `batch_id:'${batch.id}'`
            });

            await this.#sendingService.send({
                notification,
                recipients: recipients.map(recipient => ({
                    token: recipient.get('token'),
                    data: recipient.get('data')
                }))
            });

            succeeded = true;

            await batch.save({
                status: 'submitted',
                error: null
            }, {patch: true});
        } catch (err) {
            logging.error(err);
            if (this.#sentry) {
                this.#sentry.captureException(err);
            }

            if (!succeeded) {
                await batch.save({
                    status: 'failed',
                    error: err.message || 'Unknown error occurred'
                }, {patch: true});
            }
        }

        // Mark recipients as processed
        await this.#models.NotificationRecipient
            .where({batch_id: batch.id})
            .save({processed_at: new Date()}, {patch: true});

        return succeeded;
    }

    /**
     * Update status of a model with a lock
     * @private
     */
    async updateStatusLock(Model, id, status, allowedStatuses) {
        let model;
        await Model.transaction(async (transacting) => {
            model = await Model.findOne({id}, {require: true, transacting, forUpdate: true});
            if (!allowedStatuses.includes(model.get('status'))) {
                model = undefined;
                return;
            }
            await model.save({status}, {patch: true, transacting});
        });
        return model;
    }
}

module.exports = BatchSendingService;