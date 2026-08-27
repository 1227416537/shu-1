// 书伴 PWA Service Worker —— 离线缓存
// 策略：页面(导航)走 network-first 保证更新；静态资源走 cache-first 保证离线。
const CACHE_NAME = 'read-something-cache-v1';
const PRECACHE_URLS = ['./', './manifest.webmanifest', './icons/icon-192.jpg', './icons/icon-512.jpg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => { /* 预缓存失败不阻塞安装 */ })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // 只缓存同源资源；外部请求(LLM API 等)一律放行，避免缓存敏感/动态数据
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // 页面：网络优先，断网时回退到缓存的 index.html
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', clone));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 静态资源：缓存优先
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
