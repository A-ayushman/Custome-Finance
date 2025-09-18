// Minimal Service Worker for ODIC Finance System
// Purpose: Avoid MIME errors and enable future enhancements
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Basic cache strategy: cache-first for static; network-first for API
const STATIC_CACHE = 'odic-static-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isApi = url.pathname.startsWith('/api/');
  if (isApi) {
    // network-first for API
    event.respondWith(
      fetch(event.request).then(res => {
        return res;
      }).catch(() => caches.match(event.request))
    );
  } else if (event.request.method === 'GET') {
    // cache-first for static
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(res => {
          const resClone = res.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(event.request, resClone));
          return res;
        }).catch(() => cached);
      })
    );
  }
});
