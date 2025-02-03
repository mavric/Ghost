const admin = require('firebase-admin');
const logging = require('@tryghost/logging');

module.exports = class FirebaseClient {
    #config;
    #app;

    constructor({ config }) {
        this.#config = config;
        this.#app = config.firebase.serviceAccount;

       try {
            admin.initializeApp({
                credential: admin.credential.cert(config.firebase.serviceAccount),
                // databaseURL: 'https://<your-database-name>.firebaseio.com'
            });
            const message = {
                token: 'eCqcpQPxw_PKW1PKr2SDzC:APA91bETH1QWbLXiRKUt6WLp73TKh3EPLgvIZVDBwf2LgG8W8WtzF0aoOiUuRVGjyS9h6Le22Z1v2qXAgiHKWGmDCnJSg5kCrVIFsd2BmssDYk7c3gW-tQY',
                notification: {
                    title: 'From Code',
                    body: 'This is a test notification'
                }
            };
            admin.messaging().send(message);
       } catch (error) {
        console.log('error: ', error);
        
       }
        
    }

    /**
     * Initializes the Firebase Admin SDK with the provided configuration
     */
    initialize() {
        if (!this.#config.get('firebase')) {
            logging.warn('Firebase is not configured');
            return;
        }

        const firebaseConfig = this.#config.get('firebase');
        try {
            if (!this.#app) {
                this.#app = admin.initializeApp({
                    credential: admin.credential.cert(firebaseConfig.serviceAccount),
                    // databaseURL: firebaseConfig.databaseURL
                });
                logging.info('Firebase Admin SDK initialized successfully');
            }
        } catch (error) {
            logging.error('Failed to initialize Firebase Admin SDK', error);
            throw error;
        }
    }

    /**
     * Returns the Firebase Admin app instance
     * @returns {admin.app.App | null}
     */
    getInstance() {
        if (!this.#app) {
            this.initialize();
        }
        return this.#app;
    }

    /**
     * Sends a message using Firebase Cloud Messaging
     * @param {Object} message - The FCM message payload
     */
    async sendMessage(message) {
        const instance = this.getInstance();
        if (!instance) {
            logging.warn('Firebase is not configured or initialized');
            return null;
        }

        try {
            const result = await instance.messaging().send(message);
            logging.info('Message sent successfully:', result);
            return result;
        } catch (error) {
            logging.error('Failed to send message via Firebase', error);
            throw error;
        }
    }

    /**
     * Verifies a Firebase ID token
     * @param {string} idToken - The Firebase ID token to verify
     * @returns {Object} - Decoded token information
     */
    async verifyIdToken(idToken) {
        const instance = this.getInstance();
        if (!instance) {
            logging.warn('Firebase is not configured or initialized');
            return null;
        }

        try {
            const decodedToken = await instance.auth().verifyIdToken(idToken);
            logging.info('Token verified successfully:', decodedToken);
            return decodedToken;
        } catch (error) {
            logging.error('Failed to verify token:', error);
            throw error;
        }
    }
};
