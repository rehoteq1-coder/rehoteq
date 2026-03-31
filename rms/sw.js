// Rehoteq RMS — Service Worker
// Handles offline caching so the app works without internet

const CACHE_NAME = 'rehoteq-rms-v1';
const OFFLINE_PAGE = '/rms/offline.html';

// Files to cache immediately on install
const PRECACHE_URLS = [
  '/rms/',
  '/rms/index.html',
  '/rms/offline.html',
];

// ── INSTALL: cache core files ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Some files may not exist — fail silently
        return Promise.resolve();
      });
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean up old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: serve from cache, fall back to network ──
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip Firebase and external API calls — always go to network
  const url = event.request.url;
  if (
    url.includes('firebase') ||
    url.includes('firestore') ||
    url.includes('googleapis') ||
    url.includes('gstatic') ||
    url.includes('pagead') ||
    url.includes('cloudflareinsights')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cache successful responses for RMS pages
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Network failed — show offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_PAGE);
        }
      });
    })
  );
});
