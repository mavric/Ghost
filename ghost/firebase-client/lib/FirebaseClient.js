const admin = require('firebase-admin');
const logging = require('@tryghost/logging');
module.exports = class FirebaseClient {
    #config;
    #app;
    #models;
    #url;
    constructor({ config, models, url }) {
        this.#config = config;
        this.#app = config.firebase.serviceAccount;
        this.#models = models;
        this.#url = url;

       try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(config.firebase.serviceAccount),
            });
        }
       } catch (error) {
        console.log('error: ', error);
        
       }
        
    }
    async fetchTokens() {
        try {
           const members = await this.#models.Member.findAll({
            columns: ['fcm_token'],
            filter: 'fcm_token:-null' // Fetch only those with an FCM token
        });
            let tokens =  members.map(member => member.get('fcm_token')).filter(Boolean);
            console.log("_______TOKEN_________",tokens)
            return tokens;
        } catch (error) {
            console.error('Error fetching FCM tokens:', error);
            return [];
        }
    }
    async sendNotifications() {
        const tokens = await this.fetchTokens();
        if (tokens.length === 0) {
            console.log('No tokens available to send notifications.');
            return;
        }
        const message = {
            // We can pass the title and body from the actual post the way we are passing URL
                tokens: tokens,
                notification: {
                    title: 'From Code',
                    body: 'This is a test Hello Codenotification',
                   
                },
                data: {
                    url: this.#url
                }
        };
        try {
            const response = await admin.messaging().sendEachForMulticast(message);
            console.log("________RESPONSE____________",response)
        } catch (error) {
            console.error('Failed to send FCM message:', error);
        }
    }


};
