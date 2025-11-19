self.addEventListener("install", () => {
  // Placeholder service worker; real caching logic will be added in Phase 6.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
