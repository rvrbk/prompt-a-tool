// Service Worker for Prompt A Tool PWA
// Version: 1.0.0

const CACHE_NAME = 'prompt-a-tool-v1';
const ASSETS_CACHE_NAME = 'prompt-a-tool-assets-v1';
const API_CACHE_NAME = 'prompt-a-tool-api-v1';

// Core assets to cache for offline use
const CORE_ASSETS = [
  '/',
  '/index.php',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon.svg',
];

// Asset patterns to cache
const ASSET_PATTERNS = [
  /\.js$/,         // JavaScript files
  /\.css$/,        // CSS files
  /\.png$/,        // PNG images
  /\.jpg$/,        // JPG images
  /\.jpeg$/,       // JPEG images
  /\.gif$/,        // GIF images
  /\.svg$/,        // SVG images
  /\.woff2?$/,     // Font files
  /\.woff?$/,      // Font files
  /\.ttf?$/,       // Font files
];

// API endpoints to cache with stale-while-revalidate strategy
const API_PATTERNS = [
  /^\/api\//,
  /^\/sanctum\//,
];

// Installation: Cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Core assets cached successfully');
        return self.skipWaiting(); // Force the waiting service worker to become active
      })
      .catch((error) => {
        console.error('[SW] Failed to cache core assets:', error);
      })
  );
});

// Activation: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const cachesToDelete = cacheNames.filter((name) => {
        return name !== CACHE_NAME && 
               name !== ASSETS_CACHE_NAME && 
               name !== API_CACHE_NAME;
      });
      
      return Promise.all(
        cachesToDelete.map((cacheName) => {
          console.log(`[SW] Deleting old cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    })
    .then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim(); // Take control of all clients
    })
  );
});

// Fetch: Serve cached assets or fetch from network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip requests to other origins
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Handle API requests with stale-while-revalidate
  if (API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(API_CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              // Return cached response if available, and update cache in background
              if (cachedResponse) {
                // Fetch fresh data and update cache
                fetch(request)
                  .then((response) => {
                    if (response && response.status === 200) {
                      cache.put(request, response.clone());
                    }
                  })
                  .catch((error) => {
                    console.error('[SW] Failed to update API cache:', error);
                  });
                return cachedResponse;
              }
              
              // No cached response, fetch from network
              return fetch(request)
                .then((response) => {
                  if (response && response.status === 200) {
                    cache.put(request, response.clone());
                  }
                  return response;
                });
            });
        })
    );
    return;
  }
  
  // Handle asset requests with cache-first strategy
  if (ASSET_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(ASSETS_CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              return fetch(request)
                .then((response) => {
                  if (response && response.status === 200) {
                    cache.put(request, response.clone());
                  }
                  return response;
                });
            });
        })
    );
    return;
  }
  
  // Handle core assets and other requests with cache-first, network fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response && response.status === 200 && 
                !url.pathname.startsWith('/hot') &&
                !url.pathname.includes('build/')) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, response.clone());
                });
            }
            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            // Return a fallback page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/');
            }
            return new Response(null, { status: 503 });
          });
      })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!self.Notification) {
    console.log('[SW] Notifications not supported');
    return;
  }
  
  event.waitUntil(
    event.data.json().then((data) => {
      const notification = self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: data.badge || '/favicon.ico',
        data: data.data,
        actions: data.actions,
        vibrate: data.vibrate || [200, 100, 200, 100, 200, 100, 200],
        tag: data.tag,
        renotify: data.renotify,
        requireInteraction: data.requireInteraction,
      });
      
      return notification;
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      }).then((clientList) => {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].visibilityState === 'visible') {
              client = clientList[i];
              break;
            }
          }
          return client.navigate(event.notification.data.url);
        } else {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});

// Notification close handler
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-prompt-data') {
    event.waitUntil(
      syncPromptData()
    );
  }
});

async function syncPromptData() {
  console.log('[SW] Syncing prompt data');
  
  try {
    const registration = await self.registration.sync;
    const syncData = await caches.match('/api/sync-data');
    
    if (syncData) {
      const response = await fetch('/api/sync', {
        method: 'POST',
        body: await syncData.json(),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('[SW] Data synced successfully');
      } else {
        console.error('[SW] Sync failed with status:', response.status);
      }
    }
  } catch (error) {
    console.error('[SW] Sync error:', error);
  }
}

// Message handler for communication with the app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'CACHE_ASSET':
        caches.open(ASSETS_CACHE_NAME)
          .then((cache) => {
            return cache.add(event.data.url);
          })
          .then(() => {
            event.source.postMessage({
              type: 'CACHE_SUCCESS',
              url: event.data.url,
            });
          })
          .catch((error) => {
            event.source.postMessage({
              type: 'CACHE_ERROR',
              url: event.data.url,
              error: error.message,
            });
          });
        break;
      
      case 'CLEAR_CACHE':
        caches.delete(event.data.cacheName || CACHE_NAME)
          .then(() => {
            event.source.postMessage({
              type: 'CLEAR_CACHE_SUCCESS',
              cacheName: event.data.cacheName || CACHE_NAME,
            });
          });
        break;
      
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
    }
  }
});

// Offline page fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate' && 
      event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/');
        })
    );
  }
});
