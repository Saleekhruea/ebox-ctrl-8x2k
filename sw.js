// Service worker ของ Electronic Box Control
// หน้าที่เดียว: cache ไฟล์เปลือกแอป (HTML/manifest/icons) ไว้ เพื่อให้เปิดแอปได้ทันทีแม้เน็ตช้า/หลุดชั่วคราว
// ไม่ยุ่งกับการเชื่อมต่อ MQTT (WebSocket) เพราะ service worker ดัก fetch() ปกติเท่านั้น ไม่ดัก WebSocket
const CACHE_NAME = 'ebox-control-shell-v3';
const SHELL_FILES = ['./', './manifest.json', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
