/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for more information on how to use workbox.

// Version of the cache
const CACHE_VERSION = 'v1';

// Names of the different caches
const STATIC_CACHE_NAME = `ospain-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `ospain-dynamic-${CACHE_VERSION}`;
const API_CACHE_NAME = `ospain-api-${CACHE_VERSION}`;

// Assets to cache immediately on service worker install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/static/css/',
  '/static/js/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...', event);
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell');
        // Cache our known assets ahead of time
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting makes the service worker active immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...', event);
  
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          // Remove any old caches that don't match our current version
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME && key !== API_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        // Claim control immediately, rather than waiting for reload
        return self.clients.claim();
      })
  );
  
  return self.clients.claim();
});

// Helper function to check if URL is in the same origin as our app
const isInAppUrl = (url) => {
  const { hostname, pathname } = new URL(url);
  const isLocalhost = hostname === 'localhost';
  
  // Check if the URL is requesting a static file
  const isStaticAsset = STATIC_ASSETS.some(asset => pathname.startsWith(asset));
  
  return isLocalhost || isStaticAsset;
};

// Helper function to check if URL is an API request
const isApiRequest = (url) => {
  return url.includes('/api/');
};

// Helper function to check if response is valid
const isValidResponse = (response) => {
  return response && response.status === 200 && response.type === 'basic';
};

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;
  
  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || url.startsWith('chrome-extension')) {
    return;
  }
  
  // Handle API requests - Network First with Fallback
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response since we will consume it twice
          const clonedResponse = response.clone();
          
          caches.open(API_CACHE_NAME)
            .then(cache => {
              // Store in cache with expiry
              cache.put(request, clonedResponse);
              
              // Clean up old API cache entries periodically
              cleanupCache(API_CACHE_NAME, 50); // Keep 50 most recent requests
            });
          
          return response;
        })
        .catch(() => {
          // If network fails, try from cache
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If no cache, return a basic offline response for API
              return new Response(
                JSON.stringify({ 
                  error: 'You are currently offline. Please check your connection.',
                  offline: true,
                  timestamp: new Date().toISOString()
                }),
                { 
                  headers: { 'Content-Type': 'application/json' } 
                }
              );
            });
        })
    );
    return;
  }
  
  // For app shell and static assets - Cache First with Network Fallback
  if (isInAppUrl(url)) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return the cached version
            return cachedResponse;
          }
          
          // Not in cache, get from network
          return fetch(request)
            .then(response => {
              // Check if we received a valid response
              if (!isValidResponse(response)) {
                return response;
              }
              
              // Clone the response since we will consume it twice
              const clonedResponse = response.clone();
              
              caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => {
                  cache.put(request, clonedResponse);
                  
                  // Clean up old entries in dynamic cache
                  cleanupCache(DYNAMIC_CACHE_NAME, 100); // Keep 100 most recent items
                });
              
              return response;
            })
            .catch(() => {
              // If both cache and network fail, return offline page for HTML requests
              if (request.headers.get('Accept').includes('text/html')) {
                return caches.match('/offline.html');
              }
              
              // For other types of requests, just show the error
              return new Response('You are offline and this resource is not cached.', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        })
    );
    return;
  }
  
  // For all other requests (like external resources) - basic fetch with timeout
  event.respondWith(
    Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ])
    .catch(() => {
      // Check if we have it in cache first
      return caches.match(request);
    })
  );
});

// Limit the number of items in a cache
function cleanupCache(cacheName, maxItems) {
  caches.open(cacheName)
    .then(cache => {
      cache.keys()
        .then(keys => {
          if (keys.length > maxItems) {
            // Delete the oldest items beyond our max
            cache.delete(keys[0])
              .then(() => cleanupCache(cacheName, maxItems)); // Recursively call until we're under the limit
          }
        });
    });
}

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Notification received', event);

  let data = { title: 'New Notification', content: 'Something happened!', openUrl: '/' };
  
  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  const options = {
    body: data.content,
    icon: '/logo192.png',
    badge: '/badge-icon.png',
    data: {
      url: data.openUrl
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event - handle user clicking on notifications
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const url = notification.data.url;

  console.log('[Service Worker] Notification click', action);
  
  notification.close();

  // Open a window when user clicks notification
  event.waitUntil(
    clients.matchAll()
      .then(clis => {
        const client = clis.find(c => c.visibilityState === 'visible');
        if (client) {
          client.navigate(url);
          client.focus();
        } else {
          clients.openWindow(url);
        }
      })
  );
});

// Background sync - handle deferred actions when connectivity is restored
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync', event);
  
  if (event.tag === 'sync-todo-updates') {
    event.waitUntil(
      // Get all pending actions from IndexedDB and process them
      syncPendingActions()
    );
  }
});

// Process any pending actions stored in IndexedDB
function syncPendingActions() {
  // This would integrate with IndexedDB to find pending actions
  // For this example, we're just logging
  console.log('[Service Worker] Syncing pending actions');
  
  // Here you would implement IndexedDB access and API calls
  // to synchronize any offline changes
  
  return Promise.resolve();
} 