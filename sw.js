/* MFC Quiz — service worker : permet l'utilisation hors-ligne */
const CACHE = 'mfc-quiz-v18';
const FILES = [
  './',
  './index.html',
  './questions.js',
  './questions-lot2.js',
  './questions-lot3.js',
  './questions-lot4.js',
  './questions-lot5.js',
  './questions-lot6.js',
  './questions-lot7.js',
  './missions.js',
  './lessons.js', './prepa.js',
  './avatar.js',
  './toon/manifest.json',
  './vendor/three.module.min.js',
  './vendor/RoomEnvironment.js',
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

/* Rappels quotidiens : le serveur envoie un « push » vide, le message est choisi ici */
const MSGS = [
  ['☀️ Tes 2 minutes de science', 'Démarre la journée un peu plus cultivé : 5 questions, c’est parti.'],
  ['🧠 Le quiz du jour t’attend', '2 minutes pour comprendre un peu mieux ton corps.'],
  ['🔥 Ta série compte sur toi', 'Un défi de 5 questions et ta série continue.'],
  ['💪 Petit entraînement… de cerveau', 'Tes 2 minutes de quiz avant le café ?'],
  ['✅ Nouvelle mission du jour', 'Une action simple, prouvée par la science. Viens la découvrir.'],
  ['⚡ 2 minutes, 50 XP à prendre', 'Ton défi du jour est prêt.']
];
self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = {}; }
  const day = Math.floor(Date.now() / 86400000);
  const m = MSGS[day % MSGS.length];
  e.waitUntil(self.registration.showNotification(data.title || m[0], {
    body: data.body || m[1],
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    tag: 'mfc-daily',
    data: { url: data.url || './?src=rappel' }
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
