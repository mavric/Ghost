const { NotificationService } = require('@tryghost/notification-service');
const { BatchSendingService, SendingService, FirebaseNotificationProvider } = require('@tryghost/notification-service');
const configService = require('../../../shared/config/env/config.development.json');
const settingsCache = require('../../../shared/settings-cache');
const jobsService = require('../jobs');
const db = require('../../data/db');
const models = require('../../models');
const limitService = require('../limits');
const sentry = require('../../../shared/sentry');
const logging = require('@tryghost/logging');
const events = require('../../lib/common/events');
const FirebaseClient = require('@tryghost/firebase-client/lib/FirebaseClient');

class NotificationServiceWrapper {
    constructor() {
        this.service = null;
        this.init(); // Automatically initialize
    }


    async init() {
        if (this.service) {
            return this.service; // Return the existing instance if already initialized
        }

        const notificationProvider = new FirebaseNotificationProvider({
            firebaseAdmin: new FirebaseClient({
                config: configService,
                models: models,
                url: "https://www.youtube.com" // This should probably be dynamic
            })
        });

        const sendingService = new SendingService({
            notificationProvider
        });
        
        const batchSendingService = new BatchSendingService({
            sendingService,
            jobsService,
            models: {
                NotificationRecipient: models.NotificationRecipient,
                NotificationBatch: models.NotificationBatch,
                Notification: models.Notification,
                Member: models.Member
            },
            db,
            sentry
        });

        this.service = new NotificationService({
            batchSendingService,
            sendingService,
            models,
            settingsCache,
            limitService
        });
        return this.service;
    }

    registerEventListeners() {
        events.on('settings.labs.edited', () => {
            logging.info('Settings labs edited');
        });

        events.on('settings.locale.edited', (model) => {
            logging.info(`Locale changed to ${model.get('value')}`);
        });
    }
}

module.exports = NotificationServiceWrapper
