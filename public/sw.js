const CACHE_NAME = "serviceflow-cache-v1";
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/manifest.webmanifest",
  "/icons/icon-180.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/data/menus/index.json",
  "/data/menus/2025Q4.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(PRECACHE_URLS);
      } catch (error) {
        console.error("Service worker precache failed", error);
      }
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = (await cache.match("/index.html")) || (await cache.match("/"));

  try {
    const networkResponse = await fetch(request);
    cache.put("/index.html", networkResponse.clone());
    cache.put("/", networkResponse.clone());
    return networkResponse;
  } catch (error) {
    if (cached) {
      return cached;
    }
    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/html" }
    });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    if (cached) {
      return cached;
    }
    throw error;
  }
}
