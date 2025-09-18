// ODIC Finance System Service Worker v3 (versioned path)
// - Cache-first for static assets (App Shell)
// - Network-first for /api/* requests
// - Navigation fallback for SPA deep links

const STATIC_CACHE = 'odic-static-v6';
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
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isApi = url.pathname.startsWith('/api/');

  // Network-first for API requests
  if (isApi) {
    event.respondWith(
      fetch(req).then((res) => res).catch(() => caches.match(req))
    );
    return;
  }

  if (req.method !== 'GET') return;

  // SPA navigation fallback (for deep links)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      // If nosw=1 is present, bypass cache entirely for this navigation
      if (url.searchParams.get('nosw') === '1') {
        try { return await fetch(req); } catch (e) { return caches.match('/index.html'); }
      }
      const cached = await caches.match('/index.html');
      try {
        const res = await fetch(req);
        // If successful, prefer network and update cache for next time
        const resClone = res.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put('/index.html', resClone));
        return res;
      } catch (e) {
        return cached || Response.error();
      }
    })());
    return;
  }

  // Cache-first for static requests
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => cached);
    })
  );
});
