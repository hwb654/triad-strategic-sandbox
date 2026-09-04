const CACHE_NAME = 'triad-v1';
const STATIC_ASSETS = [
  '/triad-strategic-sandbox/',
  '/triad-strategic-sandbox/index.html',
  '/triad-strategic-sandbox/css/variables.css',
  '/triad-strategic-sandbox/css/layout.css',
  '/triad-strategic-sandbox/css/chat.css',
  '/triad-strategic-sandbox/css/components.css',
  '/triad-strategic-sandbox/js/config.js',
  '/triad-strategic-sandbox/js/main.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).catch(() => cached);
    })
  );
});