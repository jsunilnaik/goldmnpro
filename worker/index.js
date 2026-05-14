/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

console.log('[GoldMine SW] Service Worker script loaded');

// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)
const CACHE = "goldmine-offline-v1";
const offlineFallbackPage = "/offline";

if (typeof workbox === 'undefined') {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
}

if (workbox) {
  console.log('[GoldMine SW] Workbox is loaded');
}

// listen to message event from window
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  console.log('[GoldMine SW] Install event');
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        console.log('[GoldMine SW] Caching offline fallback page');
        return cache.add(offlineFallbackPage);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[GoldMine SW] Activate event');
  event.waitUntil(clients.claim());
});

if (workbox && workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// --------------------------------------------------------------------------------
// OFFLINE COPY OF PAGES (StaleWhileRevalidate)
// --------------------------------------------------------------------------------
workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE
  })
);

// --------------------------------------------------------------------------------
// NAVIGATION FALLBACK
// --------------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});

// --------------------------------------------------------------------------------
// BACKGROUND SYNC
// --------------------------------------------------------------------------------
// Allows the app to defer tasks until the user has a stable connection.
self.addEventListener('sync', event => {
  if (event.tag === 'sync-mining-claims') {
    event.waitUntil(syncMiningClaims());
  }
});

async function syncMiningClaims() {
  console.log('[GoldMine SW] Background Sync: Processing mining claims...');
  try {
    // In production, we would use idb-keyval or similar to get queued actions
    // For now, we log the attempt. This prevents the sync from retrying indefinitely
    // if the logic isn't fully connected yet.
    console.log('[GoldMine SW] Sync logic triggered. Pending client-side IndexedDB implementation.');
    return Promise.resolve();
  } catch (error) {
    console.error('[GoldMine SW] Background Sync failed:', error);
  }
}

// --------------------------------------------------------------------------------
// PUSH NOTIFICATIONS
// --------------------------------------------------------------------------------
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'GoldMine Pro', body: 'New update available!' };
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192-maskable.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard'
    },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(event.notification.data.url);
    })
  );
});

// --------------------------------------------------------------------------------
// PERIODIC BACKGROUND SYNC
// --------------------------------------------------------------------------------
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-sync') {
    event.waitUntil(refreshContent());
  }
});

async function refreshContent() {
  console.log('[SW] Periodic content refresh...');
}
