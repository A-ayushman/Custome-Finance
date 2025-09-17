// Minimal Service Worker for ODIC Finance System
// Purpose: Avoid MIME errors and enable future enhancements
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Currently network-pass-through; no caching yet
// self.addEventListener('fetch', (event) => {
//   // Intentionally left blank for now
// });
