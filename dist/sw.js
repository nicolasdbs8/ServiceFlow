const CACHE_PREFIX = "serviceflow-cache";
const FALLBACK_VERSION = "static-v2";
const MANIFEST_URL = "/precache-manifest.json";
const CORE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/manifest.webmanifest",
  "/icons/icon-180.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

let activeCacheName = `${CACHE_PREFIX}-${FALLBACK_VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(installServiceWorker());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(cleanOldCaches());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function installServiceWorker() {
  const { urls, version } = await loadPrecacheManifest();
  activeCacheName = `${CACHE_PREFIX}-${version}`;
  const cache = await caches.open(activeCacheName);

  await Promise.all(
    urls.map(async (url) => {
      try {
        await cache.add(url);
      } catch (error) {
        console.warn("[sw] Failed to precache", url, error);
      }
    })
  );
}

async function cleanOldCaches() {
  const keys = await caches.keys();
  const allowed = new Set([activeCacheName]);
  await Promise.all(
    keys
      .filter((key) => !allowed.has(key) && key.startsWith(CACHE_PREFIX))
      .map((key) => caches.delete(key))
  );
  await self.clients.claim();
}

async function handleNavigation(request) {
  const cache = await caches.open(activeCacheName);
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
      headers: { "Content-Type": "text/html" },
    });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(activeCacheName);
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

async function loadPrecacheManifest() {
  try {
    const response = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Bad response (${response.status})`);
    }
    const { urls = [], version } = await response.json();
    const safeVersion =
      typeof version === "string" && version.trim()
        ? version.trim()
        : FALLBACK_VERSION;
    const allUrls = Array.from(new Set([...urls, ...CORE_URLS]));
    return { urls: allUrls, version: safeVersion };
  } catch (error) {
    console.warn("[sw] Falling back to core precache list", error);
    return { urls: CORE_URLS, version: FALLBACK_VERSION };
  }
}
