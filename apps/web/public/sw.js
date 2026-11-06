const CACHE_NAME = 'tamalate-pwa-v1';
const PRECACHE_URLS = [
  '/mobile',
  '/dashboard',
  '/assets/css/tokens.css',
  '/assets/css/mobile.css',
  '/assets/css/dashboard.css',
  '/assets/vendor/fonts/fonts.css',
  '/assets/vendor/icons/style.css'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
