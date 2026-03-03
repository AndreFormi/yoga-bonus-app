const CACHE_NAME = "stuhl-yoga-v13";

// Percorsi RELATIVI: così funziona anche in sottocartella (Netlify, /bonus/, ecc.)
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js",

  // immagini routine
  "./img/atmung-entspannung-10-minuten.png",
  "./img/routine-schiena-colonna.png",
  "./img/routine-collo-spalle.png",
  "./img/routine-huefte-beine.png",

  // RESPIRO & RELAX
  "./img/respirazione-addominale.png",
  "./img/respirazione-4-6.png",
  "./img/respirazione-5-5.png",
  "./img/entspannendes-sitzen.png",

  // SCHIENA & COLONNA
  "./img/gatto-mucca-da-seduti.png",
  "./img/torsione-seduta-destra-sinistra.png",
  "./img/piegamento-in-avanti-seduti-schiena-lunga.png",
  "./img/allungamento-laterale-busto-seduti.png",
  "./img/apertura-petto-braccia-indietro.png",

  // COLLO & SPALLE
  "./img/inclinazione-laterale-collo.png",
  "./img/rotazioni-lente-del-collo.png",
  "./img/circonduzioni-spalle.png",
  "./img/spremi-scapole.png",

  // HÜFTE & BEINE
  "./img/estensione-gamba-seduto.png",
  "./img/sollevamento-ginocchio-seduto.png",
  "./img/figura-4-apertura-anca.png",
  "./img/rotazioni-delle-caviglie.png",

  // icone
  "./img/icon-192.png",
  "./img/icon-512.png"
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

  // Solo same-origin
  if (url.origin !== self.location.origin) return;

  // 1) FILE "CRITICI" (sempre aggiornati): index + manifest + icone
  //    Network-first, fallback cache
  const isCritical =
    req.mode === "navigate" ||
    url.pathname.endsWith("index.html") ||
    url.pathname.endsWith("manifest.webmanifest") ||
    url.pathname.includes("/img/icon-");

  if (isCritical) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  // 2) ASSET STATICI (immagini ecc.): cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
