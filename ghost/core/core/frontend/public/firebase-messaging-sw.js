// Service Worker
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');


const firebaseConfig = {
    apiKey: "AIzaSyBQJy86c4GcjxQTjs9nSXk_EFxi8v-mB0s",
    authDomain: "ghost-testing-6e295.firebaseapp.com",
    projectId: "ghost-testing-6e295",
    storageBucket: "ghost-testing-6e295.firebasestorage.app",
    messagingSenderId: "933331723568",
    appId: "1:933331723568:web:73f6b62c7a8098835ad4f5"
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

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	// This looks to see if the current window is already open and
	// focuses if it is
	event.waitUntil(
		clients
			.matchAll({
				type: "window",
			})
			.then((clientList) => {
				for (const client of clientList) {
					if (client.url === "/" && "focus" in client)
						return client.focus();
				}
				if (clients.openWindow) return clients.openWindow("/");
			})
	);
});

messaging.onBackgroundMessage(payload => {
    // Customize notification here
    console.log(payload)
    const { notification } = payload
    const notificationOptions = {
        body: notification.body,
        title: notification.title,
        icon: notification.image
    };

    self.registration.showNotification(notification.title,
        notificationOptions);
});