const CACHE_NAME = 'ley-lines-v1';
const ASSETS = [
  '/mapa-ley-lines/',
  '/mapa-ley-lines/index.html',
  '/mapa-ley-lines/manifest.json',
  '/mapa-ley-lines/icon-512.png',
  '/mapa-ley-lines/js/config.js',
  '/mapa-ley-lines/js/generator.js',
  '/mapa-ley-lines/js/renderer.js',
  '/mapa-ley-lines/js/state.js',
  '/mapa-ley-lines/js/ui.js',
  '/mapa-ley-lines/js/utils.js'
];

// Instalación: guardar todos los assets en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación: limpiar cachés viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: servir desde caché, y si no está, ir a la red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
