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

// INSTALL: Cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// ACTIVATE: Clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// FETCH: Serve from cache first, then fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedRes => {
      return cachedRes || fetch(event.request).catch(() => {
        // Fallback to index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// SYNC: Background data synchronization
self.addEventListener('sync', event => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  console.log('🔄 Background sync triggered');
  // TODO: Replace with real sync logic (e.g. send offline transactions)
  return Promise.resolve();
}

// PERIODIC SYNC: Periodic background fetch
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-data') {
    event.waitUntil(updateAppData());
  }
});

async function updateAppData() {
  console.log('⏰ Periodic background update ran');
  // TODO: Add fetch logic to sync new plans, prices, etc.
}

// PUSH: Handle push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New update available!',
    icon: 'icon-192.png',
    badge: 'icon-192.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'ByteForge', options)
  );
});