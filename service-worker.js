const CACHE_NAME = 'incidencias-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/admin-login.html',
  '/admin.html',
  '/manifest.json',
  '/icon.svg',
  '/fondo_a.png',
  '/fondo_b.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : 'Tienes una nueva alerta.' };
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Sistema de incidencias', {
    body: data.body || 'Tienes una nueva alerta.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: { url: '/admin.html', incidenteId: data.incidenteId }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
    const client = clientList.find(item => 'focus' in item);
    if (client) return client.focus();
    return clients.openWindow(event.notification.data?.url || '/admin.html');
  }));
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin || requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(response => response || caches.match('/index.html')))
  );
});
