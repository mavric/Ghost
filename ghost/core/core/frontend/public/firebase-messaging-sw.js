// Service Worker
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');


const firebaseConfig = {
    apiKey: "AIzaSyB70ryuwEQKvP6WblIBtFPJmyfpsVB5m5s",
    authDomain: "pwa-push-abd9f.firebaseapp.com",
    projectId: "pwa-push-abd9f",
    storageBucket: "pwa-push-abd9f.firebasestorage.app",
    messagingSenderId: "1089769545304",
    appId: "1:1089769545304:web:141ba857650a0dd560742d"
};

// // Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = firebase.messaging(app)



// const CACHE_NAME = 'ghost-frontend-v1';
// const urlsToCache = [
//     '/',
//     '/manifest.json',
//     '/assets/css/styles.css',
//     '/assets/js/script.js'
// ];

// self.addEventListener('install', (event) => {
//     event.waitUntil(
//         caches.open(CACHE_NAME)
//             .then((cache) => {
//                 console.log('Opened cache for Theme-One');
//                 return cache.addAll(urlsToCache);
//             })
//     );
// });

// self.addEventListener('fetch', (event) => {
//     event.respondWith(
//         caches.match(event.request)
//             .then((response) => response || fetch(event.request))
//     );
// });

// self.addEventListener('activate', (event) => {
//     const cacheWhitelist = [CACHE_NAME];
//     event.waitUntil(
//         caches.keys().then((cacheNames) => {
//             return Promise.all(
//                 cacheNames.map((cacheName) => {
//                     if (!cacheWhitelist.includes(cacheName)) {
//                         return caches.delete(cacheName);
//                     }
//                 })
//             );
//         })
//     );
// });


messaging.onBackgroundMessage(payload => {
    // Customize notification here
    // console.log(payload)
    const { notification } = payload
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
        body: notification.body,
        title: notification.title,
        icon: notification.image
    };

    self.registration.showNotification(notification.title,
        notificationOptions);
});