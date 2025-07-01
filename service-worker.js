const CACHE_NAME = 'byteforge-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// INSTALL: Cache core app shell
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ACTIVATE: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH: Cache First with Fallback to Network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// SYNC: Background Sync Trigger
self.addEventListener('sync', event => {
  if (event.tag === 'sync-transactions') {
    console.log('[SW] Sync triggered: sync-transactions');
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  // Example: send offline transactions to server
  console.log('🔄 Syncing transactions...');
  // TODO: Replace with real sync logic (fetch/post)
  return Promise.resolve();
}

// PERIODIC SYNC: Update plans or balance in background
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-data') {
    console.log('⏰ Running periodic background update...');
    event.waitUntil(updateAppData());
  }
});

async function updateAppData() {
  // TODO: Add fetch logic to update app content
  console.log('📡 Fetching latest plans or prices...');
  return Promise.resolve();
}

// PUSH: Show notifications
self.addEventListener('push', event => {
  const data = event.data?.json() || {};

  const title = data.title || 'ByteForge';
  const options = {
    body: data.body || 'New update available!',
    icon: 'icon-192.png',
    badge: 'icon-192.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// OPTIONAL: Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // You can redirect to a specific page if needed
  );
});