/* MFC Quiz — service worker : permet l'utilisation hors-ligne */
const CACHE = 'mfc-quiz-v6';
const FILES = [
  './',
  './index.html',
  './questions.js',
  './questions-lot2.js',
  './questions-lot3.js',
  './questions-lot4.js',
  './questions-lot5.js',
  './questions-lot6.js',
  './manifest.json',
  './assets/logo-full.png',
  './assets/logo-shine.png',
  './assets/logo-mark.png',
  './assets/apple-touch-icon.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Réseau d'abord (pour recevoir les nouvelles questions), cache si hors-ligne */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
