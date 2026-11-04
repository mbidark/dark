const CACHE = 'mbi-dark-v3';
const ASSETS = [
  './',
  './index.html',
  './about.html',
  './projects.html',
  './contact.html',
  './404.html',
  './style.css',
  './script.js',
  './projects.json',
  './logo.jpg',
  './logo-192.png',
  './logo-512.png',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(e.request);
          return cached || caches.match('./index.html');
        })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(response => {
        if (response.ok && new URL(e.request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
        }
        return response;
      })
    )
  );
});
