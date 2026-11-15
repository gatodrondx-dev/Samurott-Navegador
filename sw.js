// Guarda la aplicación para abrirla rápido. Los mapas y los datos se piden siempre a internet.
const CACHE = 'mapa-espana-v12';
const BASE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin && /^\/(dgt|dgtimg|ign)\//.test(url.pathname)) return;   // datos y fotos en directo: siempre de internet
  if (req.mode === 'navigate') {            // la página: primero internet, si no hay, la guardada
    e.respondWith(
      fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put('./index.html', c)); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  if (url.hostname === 'cdnjs.cloudflare.com' || url.origin === self.location.origin) {   // librería del mapa e iconos
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put(req, c)); return r; }))
    );
  }
});
