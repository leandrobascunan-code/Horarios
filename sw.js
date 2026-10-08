/* Service worker: deja la app instalable y abre rápido.
   Archivos propios: primero la red (para ver cambios) y, sin internet, la copia guardada.
   Para forzar actualización en todos los equipos, cambie el número de VERSION. */
const VERSION = 'horarios-v5';
const ARCHIVOS = ['./', 'index.html', 'data.js', 'config.js', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return; // Apps Script y fuentes van directo
  e.respondWith(
    fetch(r).then(res => { const copia = res.clone(); caches.open(VERSION).then(c => c.put(r, copia)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
