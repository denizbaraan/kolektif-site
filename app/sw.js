/* Çevrimdışı kabuk. Dosya değiştiğinde SURUM artırılır, eski önbellek silinir. */
const SURUM = "kolektif-v3";
const KABUK = [
  "./", "index.html", "app.css", "app.js", "talimatlar.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/apple-180.png",
  "../assets/js/klinik.js", "../assets/fonts/Gabarito.ttf", "../assets/fonts/InstrumentSerif-Italic.ttf",
  "../assets/img/kolektif-kavaklidere-antrasit.svg", "../assets/img/favicon.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(KABUK)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== SURUM).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
// Ağ önce (güncel içerik), ağ yoksa önbellek.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const kopya = r.clone(); caches.open(SURUM).then(c => c.put(e.request, kopya)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
