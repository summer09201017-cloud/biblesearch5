const VERSION = "20260416b";
const STATIC_CACHE = `bible-static-${VERSION}`;
const API_CACHE = `bible-api-${VERSION}`;
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css?v=20260416b",
  "/app.js?v=20260416b",
  "/pwa.js?v=20260416b",
  "/manifest.webmanifest?v=20260416b",
  "/offline.html",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Navigation request failed with ${response.status}`);
          }

          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match("/index.html");
          return cached || caches.match("/offline.html");
        })
    );
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request, { ignoreSearch: false });
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }

  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = await caches.match(request, { ignoreSearch: false });
    if (cached) {
      return cached;
    }

    return new Response(
      JSON.stringify({
        status: "error",
        message: "Offline and no cached data available."
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }
}
