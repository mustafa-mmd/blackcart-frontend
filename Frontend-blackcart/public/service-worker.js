// public/service-worker.js
const CACHE_NAME = 'blackcart-v1.0.1';
const OFFLINE_URL = '/offline.html';

// Keep only stable offline assets in the install cache. Do not precache / or
// /index.html, because that can make deployed React bundles stay stale.
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
        return null;
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  const requestUrl = new URL(event.request.url);
  const isApiRequest = requestUrl.pathname.includes('/api/');
  const isNavigation = event.request.mode === 'navigate';

  if (isApiRequest) {
    event.respondWith(
      fetch(event.request).catch(() => new Response(
        JSON.stringify({
          error: 'Network connection failed',
          message: 'You are offline. Please check your connection.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      ))
    );
    return;
  }

  // Pages must be network-first so a new deploy loads the latest index.html.
  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Static assets can stay cache-first, but newly hashed Vite assets are fetched
  // from the network when they are not already in the current cache.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New notification from BlackCart.store',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'close', title: 'Close' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'BlackCart.store', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

async function syncOrders() {
  console.log('Syncing orders...');
}