const CACHE_NAME = 'mahmood-masjid-v5';
const NETWORK_FIRST_PATHS = ['/prayer-calendar.html', '/assets/js/calendar.js'];
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/notification-preview.html',
  '/test-notifications.html',
  '/quran.html',
  '/azkar.html',
  '/durood.html',
  '/prayer-calendar.html',
  '/about.html',
  '/contact.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/js/ui.js',
  '/assets/js/calendar.js',
  '/assets/js/counter.js',
  '/assets/js/quran.js'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isNetworkFirst = NETWORK_FIRST_PATHS.some(path => url.pathname.endsWith(path));

  if (isNetworkFirst) {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request, { cache: 'reload' });
    if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'error') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match('/index.html');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'error') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    return caches.match('/index.html');
  }
}

// Handle push notifications
self.addEventListener('push', event => {
  const defaultTitles = {
    en: '📖 Daily Quran Reading',
    urdu: '📖 روزانہ قرآن کی تلاوت'
  };
  
  const defaultBodies = {
    en: '✨ Time to read and reflect on the Quran',
    urdu: 'قرآن کو پڑھنے اور غور و فکر کرنے کا وقت ہے'
  };

  const options = {
    body: event.data ? event.data.text() : defaultBodies.en,
    icon: '/assets/img/logo.png',
    badge: '/assets/img/logo.png',
    tag: 'daily-reminder',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(defaultTitles.en, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }

  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].url === '/' && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      // Open new window if not already open
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Store scheduled notifications
const scheduledNotifications = [];

// Schedule daily notification (when app is open or in background)
self.addEventListener('message', event => {
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const notifications = event.data.notifications || [];
    // Clear previous schedules
    scheduledNotifications.length = 0;
    // Schedule new notifications
    notifications.forEach(notif => {
      scheduledNotifications.push(notif);
      scheduleNotificationAtTime(notif.title, notif.body, notif.time);
    });
  }
});

function scheduleNotificationAtTime(title, body, timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  function checkAndNotify() {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    if (currentHours === hours && currentMinutes === minutes) {
      self.registration.showNotification(title, {
        body: body,
        icon: '/assets/img/logo.png',
        badge: '/assets/img/logo.png',
        tag: 'daily-reminder',
        requireInteraction: true,
        actions: [
          { action: 'open', title: 'Open' },
          { action: 'close', title: 'Dismiss' }
        ]
      });
    }
  }
  
  // Check every minute
  setInterval(checkAndNotify, 60000);
}
