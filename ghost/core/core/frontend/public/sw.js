const CACHE_NAME = 'ghost-frontend-v1';
const urlsToCache = [
    '/',
    '/manifest.json?v=1.0.1',
    '/assets/css/styles.css?v=1.0.1',
    '/assets/js/script.js?v=1.0.1',
    '/offline.html'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache for Theme-One');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Failed to cache assets:', error);
            })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches.open('api-cache').then((cache) => {
                return fetch(event.request)
                    .then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    })
                    .catch(() => caches.match(event.request));
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then((response) => response || fetch(event.request))
                .catch(() => caches.match('/offline.html')) // Fallback to offline page
        );
    }
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
