const CACHE_NAME = "massage-barrel-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
];

// Installation → met tout ça en cache
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// Activation → supprime les vieux caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Récupération des fichiers → réseau d'abord, cache si hors-ligne
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req).then((res) => res || caches.match("./")))
  );
});
