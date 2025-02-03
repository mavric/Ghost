// Service Worker
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

fetch("/config.json")
    .then((response) => response.json())
    .then((config)=>{
        const app = firebase.initializeApp(config);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = firebase.messaging(app)
//TODO:Need it for offline

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
// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification?.data?.url;
    console.log(url)
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
        data: {
            url: payload.data.url // Pass the URL to the notification data
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

    })

