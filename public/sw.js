const CACHE_NAME = "touch-radio-v2";
const APP_SHELL = [
    "/",
    "/stations.json",
    "/favicon.ico",
    "/favicon-32x32.png",
    "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key)),
            ),
        ),
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    const requestUrl = new URL(event.request.url);
    if (requestUrl.origin !== self.location.origin) return;

    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request).catch(() => caches.match("/")),
        );
        return;
    }

    if (requestUrl.pathname === "/stations.json") {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const responseCopy = response.clone();
                    caches.open(CACHE_NAME).then((cache) =>
                        cache.put(event.request, responseCopy),
                    );
                    return response;
                })
                .catch(() => caches.match(event.request)),
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(
            (cachedResponse) => cachedResponse || fetch(event.request),
        ),
    );
});
