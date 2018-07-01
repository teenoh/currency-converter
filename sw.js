let cache = "converter";
let version = "2.2.2";
let cacheName = `${cache}_${version}`;
let filesToCache = [
  "/currency-converter/",
  "/currency-converter/index.html",
  "./manifest.json",
  //"/",
  "./transfer-512.png",
  "./transfer-192.png",
  "./css/materialize.min.css",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://code.jquery.com/jquery-2.1.1.min.js",
  "./js/materialize.min.js",
  "./js/main.js",
  "./js/idb.js",
  "https://free.currencyconverterapi.com/api/v5/currencies"
];

self.addEventListener("install", event => {
  console.log("[Service Worker] installing ");

  event.waitUntil(
    caches
      .open(cacheName)
      .then(cache => {
        console.log("[Service Worker] caching all files");
        cache.addAll(filesToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("fetch", event => {
  //console.log(event.request.url)

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      Promise.all(
        keyList.map(key => {
          if (key !== cacheName) {
            caches.delete(key);
          }
        })
      );
    })
  );
});
