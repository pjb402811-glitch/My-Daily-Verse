const CACHE_NAME = 'malssum-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Other assets will be cached on-the-fly by the fetch handler.
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
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
        .then(response => {
            // Cache hit - return response
            if (response) {
                return response;
            }

            return fetch(event.request).then(
                (response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type === 'opaque') {
                        return response;
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
