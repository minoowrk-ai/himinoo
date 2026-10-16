const CACHE_NAME = 'exhibit-cache-v11';
const MEDIA_CACHE = 'exhibit-media-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './images/logo-full.svg',
  './images/logo-wordmark.svg',
  './images/brand-symbol.svg',
  './images/background-corridor.webp',
  './images/exposure-platform.webp',
  './images/exposure-busstop.webp'
];
const MEDIA = ['./videos/product.mp4'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.all([
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
    caches.open(MEDIA_CACHE).then((cache) =>
      Promise.all(MEDIA.map((url) =>
        cache.match(url).then((hit) => hit || cache.add(url)).catch(() => {})
      ))
    )
  ]));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== MEDIA_CACHE).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function isMedia(url) {
  return url.origin === location.origin &&
    MEDIA.some((path) => new URL(path, location.href).pathname === url.pathname);
}

async function serveMedia(request) {
  const cache = await caches.open(MEDIA_CACHE);
  const cached = await cache.match(request.url);
  if (!cached) return fetch(request);

  const range = request.headers.get('range');
  const match = range && /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) return cached;

  const blob = await cached.blob();
  const size = blob.size;
  const start = match[1] === '' ? Math.max(size - Number(match[2]), 0) : Number(match[1]);
  const end = match[1] === '' || match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1);
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
  }
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
      'Content-Length': String(end - start + 1)
    }
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (isMedia(new URL(request.url))) {
    event.respondWith(serveMedia(request));
    return;
  }
  event.respondWith(
    fetch(request, { cache: 'no-cache' })
      .then((response) => {
        if (response.ok && new URL(request.url).origin === location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
