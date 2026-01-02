const CACHE_NAME = 'mahmood-masjid-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
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
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request)
        .then(response => {
          // Don't cache if not a success response
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          // Clone the response before caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Return a custom offline page if available
          return caches.match('/index.html');
        });
    })
  );
});

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
