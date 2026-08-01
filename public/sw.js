const CACHE_NAME = "earth-guide-shell-v3";
const SHELL_ASSETS = [
  "/",
  "/cover",
  "/guide",
  "/saved",
  "/identify",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        await Promise.all(
          SHELL_ASSETS.map(async (path) => {
            try {
              const response = await fetch(path, { cache: "reload" });
              if (response.ok && !response.redirected) {
                await cache.put(path, response);
              }
            } catch {
              // Best-effort precache.
            }
          }),
        );
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (
          response.ok &&
          response.type === "basic" &&
          !response.redirected &&
          response.status === 200
        ) {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const offline = await caches.match("/offline");
          if (offline) return offline;
        }
        return new Response("The Guide is offline.", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        });
      }),
  );
});
