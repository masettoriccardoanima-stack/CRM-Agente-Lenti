// sw.js (v6.2)
const CACHE_NAME = 'crm-lenti-pwa-single-v6_2';
const FILES_TO_CACHE = [
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE_NAME ? null : caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  const url = new URL(evt.request.url);
  // Bypass caching for cross-origin (e.g., Firebase CDN)
  if (url.origin !== self.location.origin) {
    evt.respondWith(fetch(evt.request));
    return;
  }
  evt.respondWith(
    fetch(evt.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(evt.request, copy));
      return res;
    }).catch(() => caches.match(evt.request).then(r => r || caches.match('./index.html')))
  );
});
