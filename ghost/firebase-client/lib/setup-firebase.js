const FirebaseClient = require('./FirebaseClient');

let firebaseClient;

/**
 * Initializes the FirebaseClient instance with configuration
 * @param {Object} config - Configuration object
 */
function setupFirebase(config) {
    firebaseClient = new FirebaseClient({ config });
    firebaseClient.initialize();
}

/**
 * Retrieves the FirebaseClient instance
 * @returns {FirebaseClient}
 */
function getFirebaseClient() {
    if (!firebaseClient) {
        throw new Error('FirebaseClient is not set up. Call setupFirebase first.');
    }
    return firebaseClient;
}

module.exports = {
    setupFirebase,
    getFirebaseClient
};