// Service worker : réseau d'abord, cache en secours (l'app s'ouvre même hors ligne)
const CACHE = "jacq-appli-v1";
const FICHIERS = ["./", "./index.html", "./style.css", "./script.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((rep) => { const copie = rep.clone(); caches.open(CACHE).then((c) => c.put(req, copie)); return rep; })
      .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
  );
});
