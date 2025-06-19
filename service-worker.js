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

// Install: Cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches (optional)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Background Sync
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

function syncTransactions() {
  // Placeholder: Add real sync logic
  return Promise.resolve(console.log('🔄 Background sync triggered'));
}

// Periodic Background Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-data') {
    event.waitUntil(updateAppData());
  }
});

async function updateAppData() {
  // Placeholder: Add real fetch/update logic
  console.log('⏰ Periodic background update ran.');
}

// Push Notification Support
self.addEventListener('push', function(event) {
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