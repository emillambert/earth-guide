const CACHE_NAME = "hitchhikers-guide-shell-v8";
const CACHE_PREFIX = "hitchhikers-guide-shell-";
const SHELL_ASSETS = [
  "/",
  "/cover",
  "/guide",
  "/saved",
  "/identify",
  "/offline",
  "/hitchhikers-guide.webmanifest",
  "/icons/hitchhikers-icon-192.png",
  "/icons/hitchhikers-icon-512.png",
];
const CORE_SHELL_ASSETS = ["/guide", "/saved", "/offline"];
const STATIC_PREFIXES = ["/_next/static/", "/icons/"];

async function cacheResponse(cache, request, response) {
  if (
    response.ok &&
    response.type === "basic" &&
    !response.redirected &&
    response.status === 200
  ) {
    await cache.put(request, response.clone());
  }
}

async function cachePageAndAssets(cache, path, strictAssets = false) {
  const response = await fetch(path, { cache: "reload" });
  if (!response.ok || response.redirected) {
    throw new Error(`Could not cache ${String(path)}`);
  }
  await cacheResponse(cache, path, response);

  if (!response.headers.get("Content-Type")?.includes("text/html")) return;
  const html = await response.text();
  const assetUrls = new Set();
  const assetPattern = /(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g;
  for (const match of html.matchAll(assetPattern)) {
    if (match[1]) {
      assetUrls.add(new URL(match[1], self.location.origin).href);
    }
  }
  await Promise.all(
    Array.from(assetUrls).map(async (url) => {
      try {
        const request = new Request(url, { cache: "reload" });
        const assetResponse = await fetch(request);
        await cacheResponse(cache, request, assetResponse);
      } catch (error) {
        if (strictAssets) throw error;
        // A later online visit can fill this asset.
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        await Promise.all(
          CORE_SHELL_ASSETS.map((path) =>
            cachePageAndAssets(cache, path, true),
          ),
        );
        await Promise.all(
          SHELL_ASSETS.filter(
            (path) => !CORE_SHELL_ASSETS.includes(path),
          ).map(async (path) => {
            try {
              await cachePageAndAssets(cache, path);
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
            .filter(
              (key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "CACHE_RESOURCES" && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        await Promise.all(
          data.urls.map(async (value) => {
            try {
              const url = new URL(value, self.location.origin);
              if (
                url.origin !== self.location.origin ||
                !STATIC_PREFIXES.some((prefix) =>
                  url.pathname.startsWith(prefix),
                )
              ) {
                return;
              }
              const request = new Request(url.href, { cache: "reload" });
              if (await cache.match(request, { ignoreVary: true })) return;
              const response = await fetch(request);
              await cacheResponse(cache, request, response);
            } catch {
              // Individual resources are best-effort.
            }
          }),
        );
      }),
    );
  }

  if (
    data.type === "CACHE_ENTRY_ROUTE" &&
    typeof data.path === "string" &&
    /^\/entry\/[^/]+$/.test(data.path)
  ) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          if (await cache.match(data.path, { ignoreVary: true })) return;
          const request = new Request(data.path, {
            cache: "reload",
            headers: { Accept: "text/html" },
          });
          await cachePageAndAssets(cache, request);
        } catch {
          // The route can be warmed on the next online visit.
        }
      }),
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(
      caches.match(request, { ignoreVary: true }).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            void caches
              .open(CACHE_NAME)
              .then((cache) => cacheResponse(cache, request, response))
              .catch(() => {
                // A cache write must not break a valid network response.
              });
            return response;
          }),
      ),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        void caches
          .open(CACHE_NAME)
          .then((cache) => cacheResponse(cache, request, response))
          .catch(() => {
            // A cache write must not break a valid network response.
          });
        return response;
      })
      .catch(async () => {
        const cached =
          (await caches.match(request)) ||
          (request.mode === "navigate"
            ? await caches.match(url.pathname, { ignoreVary: true })
            : undefined);
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
