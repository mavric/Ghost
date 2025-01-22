const firebaseConfig = {
    apiKey: "AIzaSyBQJy86c4GcjxQTjs9nSXk_EFxi8v-mB0s",
    authDomain: "ghost-testing-6e295.firebaseapp.com",
    projectId: "ghost-testing-6e295",
    storageBucket: "ghost-testing-6e295.firebasestorage.app",
    messagingSenderId: "933331723568",
    appId: "1:933331723568:web:73f6b62c7a8098835ad4f5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
const db = firebase.firestore();

// Request notification permission
function requestNotificationPermission() {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            getTokenAndStore();
        } else {
            console.log('Notification permission denied.');
        }
    });
}

// Get token and store it in Firestore
function getTokenAndStore() {
    messaging.getToken({
        vapidKey: 'BBRsN1JYXXucQcB06F3rDcItC8t0jIQLVQbHldFnctQzShY3Yl8IQS0jeovxWIf3Nkn9xJ8cVkbS5XQJAmJXCS0'
    }).then((currentToken) => {
        if (currentToken) {
            //save in local db
            //pubId: 
            console.log('Token retrieved: ', currentToken);
            db.collection('tokens').doc(currentToken).set({
                token: currentToken,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                console.log('Token stored in Firestore');
            }).catch((error) => {
                console.error('Error storing token in Firestore: ', error);
            });
        } else {
            console.log('No registration token available. Request permission to generate one.');
        }
    }).catch((error) => {
        console.error('An error occurred while retrieving token. ', error);
    });
}

// Handle foreground messages
messaging.onMessage(payload => {
    console.log('Message received foreground. ', payload);
    const { notification } = payload;
    const notificationTitle = notification.title;
    const notificationOptions = {
        body: notification.body,
        icon: notification.image
    };

    // Create a custom snackbar element
    const snackbar = createSnackbar(notificationTitle, notificationOptions);

    // Append snackbar to body
    document.body.appendChild(snackbar);

    // Trigger the slide-in effect
    setTimeout(() => {
        snackbar.style.right = '20px';
    }, 10); // Slight delay to ensure the transition is applied

    // Automatically hide the snackbar after 5 seconds
    setTimeout(() => {
        snackbar.style.right = '-350px'; // Slide out
        setTimeout(() => {
            document.body.removeChild(snackbar);
        }, 500); // Wait for the slide-out transition to complete
    }, 5000);
});

// Create a custom snackbar element
function createSnackbar(title, options) {
    const snackbar = document.createElement('div');
    snackbar.style.position = 'fixed';
    snackbar.style.top = '20px';
    snackbar.style.right = '-350px'; // Start off-screen
    snackbar.style.width = '300px';
    snackbar.style.padding = '10px 20px';
    snackbar.style.backgroundColor = '#323232';
    snackbar.style.color = '#fff';
    snackbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    snackbar.style.borderRadius = '4px';
    snackbar.style.zIndex = '1000';
    snackbar.style.display = 'flex';
    snackbar.style.alignItems = 'center';
    snackbar.style.transition = 'right 0.5s ease'; // Add transition for sliding effect

    // Add image
    const img = document.createElement('img');
    img.src = options.icon;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.borderRadius = '50%'; // Make image rounded
    img.style.marginRight = '10px';
    snackbar.appendChild(img);

    // Add content container
    const content = document.createElement('div');
    content.style.flex = '1';

    // Add title
    const titleElement = document.createElement('h4');
    titleElement.innerText = title;
    titleElement.style.margin = '0';
    titleElement.style.fontSize = '16px';
    content.appendChild(titleElement);

    snackbar.appendChild(content);

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.style.marginLeft = '10px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.border = 'none';
    closeButton.style.backgroundColor = '#007bff';
    closeButton.style.color = '#fff';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        snackbar.style.right = '-350px'; // Slide out
        setTimeout(() => {
            document.body.removeChild(snackbar);
        }, 500); // Wait for the slide-out transition to complete
    });
    snackbar.appendChild(closeButton);

    return snackbar;
}

if(Notification.permission !== 'granted') {
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '4px';
    modalContent.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    modalContent.style.textAlign = 'center';

    const modalText = document.createElement('p');
    modalText.textContent = 'We would like to send you notifications. Please grant permission.';

    const modalButton = document.createElement('button');
    modalButton.textContent = 'Enable Notifications';
    modalButton.style.marginTop = '10px';
    modalButton.addEventListener('click', () => {
        requestNotificationPermission();
        document.body.removeChild(modal);
    });

    modalContent.appendChild(modalText);
    modalContent.appendChild(modalButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
});
}