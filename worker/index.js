/* eslint-disable no-restricted-globals */

// listen to message event from window
self.addEventListener('message', event => {
  // HOW TO USE THIS:
  // window.navigator.serviceWorker.controller.postMessage({
  //   type: 'SYNC_MINING',
  //   data: { ... }
  // });
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
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
  console.log('[SW] Syncing mining claims...');
  try {
    // 1. Get queued claims from IndexedDB (implementation needed on client)
    // 2. Fetch /api/mining/claim for each
    // 3. Notify user on success
  } catch (error) {
    console.error('[SW] Sync failed:', error);
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
// Refreshes data in the background periodically (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-sync') {
    event.waitUntil(refreshContent());
  }
});

async function refreshContent() {
  console.log('[SW] Periodic content refresh...');
  // Fetch latest rates or balance to have them ready for the user
}
