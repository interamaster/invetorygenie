
// Service Worker for StockGenius
const CACHE_NAME = 'stockgenius-cache-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // For HTML navigation requests, use a "network-first" strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request)
            .then((cachedResponse) => {
              // Return the cached home page for all navigation requests if offline
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/');
            });
        })
    );
    return;
  }
  
  // For all other requests, use a "stale-while-revalidate" strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clonedResponse = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, clonedResponse);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('Fetch failed:', error);
            // Return nothing, which will allow the cached response to be used
          });
          
        return cachedResponse || fetchPromise;
      })
  );
});

// Background sync for offline changes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-inventory') {
    event.waitUntil(syncInventory());
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Inventory notification',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'StockGenius Notification',
        options
      )
    );
  } catch (error) {
    console.error('Push event error:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then((clientList) => {
        const url = event.notification.data.url;
        
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window/tab, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Function to sync inventory changes
async function syncInventory() {
  try {
    // Get all pending sync requests from IDB
    // In a real app, you'd likely use IndexedDB for this
    // For now, this is a placeholder
    console.log('Syncing inventory changes');
    
    // This would be where we'd implement the actual syncing logic
    // to a backend server when the user is back online
    
    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
}
