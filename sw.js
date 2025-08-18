const CACHE_NAME = 'malssum-cache-v3'; // Cache version updated
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Add main script to initial cache
  '/manifest.json',
  '/icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching core assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Force the waiting service worker to become the active service worker.
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
        .then(cachedResponse => {
            // Cache hit - return response
            if (cachedResponse) {
                return cachedResponse;
            }

            // Not in cache - fetch from network
            return fetch(event.request).then(
                networkResponse => {
                    // Check if we received a valid response to cache.
                    // We will cache opaque responses to allow cross-origin assets (like from esm.sh) to work offline.
                    if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
                        return networkResponse;
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return networkResponse;
                }
            ).catch(error => {
                console.error('Fetch failed:', error);
                // If the fetch fails (e.g., offline), you might want to return a fallback page.
                // For now, we'll just let the browser handle the error.
            });
        })
    );
});

// Update a service worker and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open pages.
  );
});