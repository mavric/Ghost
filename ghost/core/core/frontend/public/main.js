
const firebaseConfig = {
    apiKey: "AIzaSyB70ryuwEQKvP6WblIBtFPJmyfpsVB5m5s",
    authDomain: "pwa-push-abd9f.firebaseapp.com",
    projectId: "pwa-push-abd9f",
    storageBucket: "pwa-push-abd9f.firebasestorage.app",
    messagingSenderId: "1089769545304",
    appId: "1:1089769545304:web:141ba857650a0dd560742d"
};

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
        vapidKey: 'BNCwrDIfcFmC6voRrv88m3pA99Qo42Q1i-DX_HxRBmLnoE64vJingC0itdsmZQ5JOPyv14Lghx7cv42OxqyGMLA'
    }).then((currentToken) => {
        if (currentToken) {
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
// messaging.onMessage(payload => {
//     console.log('Message received foreground. ', payload);
//     const { notification } = payload;
//     const notificationTitle = notification.title;
//     const notificationOptions = {
//         body: notification.body,
//         icon: notification.image
//     };

//     // Create a custom popup element
//     const popup = document.createElement('div');
//     popup.style.position = 'fixed';
//     popup.style.top = '50%';
//     popup.style.left = '50%';
//     popup.style.transform = 'translate(-50%, -50%)';
//     popup.style.width = '300px';
//     popup.style.padding = '20px';
//     popup.style.backgroundColor = '#fff';
//     popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
//     popup.style.borderRadius = '8px';
//     popup.style.zIndex = '1000';
//     popup.style.display = 'flex';
//     popup.style.flexDirection = 'column';
//     popup.style.alignItems = 'center';

//     // Add image
//     const img = document.createElement('img');
//     img.src = notification.image;
//     img.style.width = '100%';
//     img.style.borderRadius = '8px';
//     popup.appendChild(img);

//     // Add title
//     const title = document.createElement('h4');
//     title.innerText = notification.title;
//     title.style.margin = '10px 0';
//     popup.appendChild(title);

//     // Add body
//     const body = document.createElement('p');
//     body.innerText = notification.body;
//     body.style.margin = '10px 0';
//     popup.appendChild(body);

//     // Add close button
//     const closeButton = document.createElement('button');
//     closeButton.innerText = 'Close';
//     closeButton.style.marginTop = '10px';
//     closeButton.style.padding = '5px 10px';
//     closeButton.style.border = 'none';
//     closeButton.style.backgroundColor = '#007bff';
//     closeButton.style.color = '#fff';
//     closeButton.style.borderRadius = '4px';
//     closeButton.style.cursor = 'pointer';
//     closeButton.addEventListener('click', () => {
//         document.body.removeChild(popup);
//     });
//     popup.appendChild(closeButton);

//     // Append popup to body
//     document.body.appendChild(popup);
// });

// Handle foreground messages
// messaging.onMessage(payload => {
//     console.log('Message received foreground. ', payload);
//     const { notification } = payload;
//     const notificationTitle = notification.title;
//     const notificationOptions = {
//         body: notification.body,
//         icon: notification.image
//     };

//     // Create a custom popup element
//     const popup = document.createElement('div');
//     popup.style.position = 'fixed';
//     popup.style.top = '20px';
//     popup.style.right = '-350px'; // Start off-screen
//     popup.style.width = '300px';
//     popup.style.padding = '20px';
//     popup.style.backgroundColor = '#fff';
//     popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
//     popup.style.borderRadius = '8px';
//     popup.style.zIndex = '1000';
//     popup.style.display = 'flex';
//     popup.style.flexDirection = 'column';
//     popup.style.alignItems = 'center';
//     popup.style.transition = 'right 0.5s ease'; // Add transition for sliding effect

//     // Add image
//     const img = document.createElement('img');
//     img.src = notification.image;
//     img.style.width = '100%';
//     img.style.borderRadius = '8px';
//     popup.appendChild(img);

//     // Add title
//     const title = document.createElement('h4');
//     title.innerText = notification.title;
//     title.style.margin = '10px 0';
//     popup.appendChild(title);

//     // Add body
//     const body = document.createElement('p');
//     body.innerText = notification.body;
//     body.style.margin = '10px 0';
//     popup.appendChild(body);

//     // Add close button
//     const closeButton = document.createElement('button');
//     closeButton.innerText = 'Close';
//     closeButton.style.marginTop = '10px';
//     closeButton.style.padding = '5px 10px';
//     closeButton.style.border = 'none';
//     closeButton.style.backgroundColor = '#007bff';
//     closeButton.style.color = '#fff';
//     closeButton.style.borderRadius = '4px';
//     closeButton.style.cursor = 'pointer';
//     closeButton.addEventListener('click', () => {
//         popup.style.right = '-350px'; // Slide out
//         setTimeout(() => {
//             document.body.removeChild(popup);
//         }, 500); // Wait for the slide-out transition to complete
//     });
//     popup.appendChild(closeButton);

//     // Append popup to body
//     document.body.appendChild(popup);

//     // Trigger the slide-in effect
//     setTimeout(() => {
//         popup.style.right = '20px';
//     }, 10); // Slight delay to ensure the transition is applied
// });
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
    img.src = notification.image;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.borderRadius = '4px';
    img.style.marginRight = '10px';
    snackbar.appendChild(img);

    // Add content container
    const content = document.createElement('div');
    content.style.flex = '1';

    // Add title
    const title = document.createElement('h4');
    title.innerText = notification.title;
    title.style.margin = '0';
    title.style.fontSize = '16px';
    content.appendChild(title);

    // Add body
    const body = document.createElement('p');
    body.innerText = notification.body;
    body.style.margin = '5px 0 0 0';
    body.style.fontSize = '14px';
    body.style.overflow = 'hidden';
    body.style.textOverflow = 'ellipsis';
    body.style.whiteSpace = 'nowrap'; // Ensure the text is limited to one line
    content.appendChild(body);

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

    // Append snackbar to body
    document.body.appendChild(snackbar);

    // Trigger the slide-in effect
    setTimeout(() => {
        snackbar.style.right = '20px';
    }, 10); // Slight delay to ensure the transition is applied
});

// Call the function to request notification permission
requestNotificationPermission();

// Call the function to request notification permission
requestNotificationPermission();