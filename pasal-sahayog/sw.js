/* sw.js — Service Worker: Cache First strategy */

const CACHE_NAME = 'pasal-sahayog-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/onboarding.css',
  '/css/dashboard.css',
  '/css/stock.css',
  '/css/settings.css',
  '/js/app.js',
  '/js/store.js',
  '/js/router.js',
  '/js/utils/helpers.js',
  '/js/utils/backup.js',
  '/js/components/toast.js',
  '/js/components/chart.js',
  '/js/components/itemCard.js',
  '/js/components/modal.js',
  '/js/components/notifications.js',
  '/js/pages/onboarding.js',
  '/js/pages/dashboard.js',
  '/js/pages/stock.js',
  '/js/pages/settings.js',
];

// Install: cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET and cross-origin requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => {
        // Offline fallback for HTML navigation
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});