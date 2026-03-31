// ═══════════════════════════════════════════════════════════════════
//  ANM LineeVivo – Service Worker
//  Gestisce cache offline e installazione PWA
// ═══════════════════════════════════════════════════════════════════

const CACHE_NAME = "anm-lineevivo-v1";

// File da cachare per funzionamento offline
const STATIC_ASSETS = [
  "/ANM-LineeVivo/",
  "/ANM-LineeVivo/index.html",
  "/ANM-LineeVivo/manifest.json",
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

// ── INSTALL ──────────────────────────────────────────────────────
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[SW] Pre-caching assets");
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn("[SW] Pre-cache partial failure (ok):", err);
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE ─────────────────────────────────────────────────────
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH ─────────────────────────────────────────────────────────
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Non intercettare Firebase (sempre live)
  if (url.hostname.includes("firebaseio.com")) return;

  // Non intercettare YouTube (sempre live)
  if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) return;

  // Strategia: Network first → fallback cache (per dati freschi)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline: usa cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback per navigazione
          if (event.request.mode === "navigate") {
            return caches.match("/ANM-LineeVivo/index.html");
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});
