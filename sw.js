const CACHE_NAME = "stuhl-yoga-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/sw.js",
  "/img/routine-schiena-beta.png",
  "/img/gatto-mucca.png",
  "/img/torsione-seduta.png",
  "/img/solleva-braccio-gamba-opposta.png",
  "/img/icon-192.png",
  "/img/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo same-origin (il resto tipo Google Fonts lo lasciamo alla rete)
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});

