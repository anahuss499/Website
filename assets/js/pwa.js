// PWA functionality - service worker registration and notifications

// Register service worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
        // Check for updates periodically
        setInterval(() => registration.update(), 60000);
      })
      .catch(error => console.log('Service Worker registration failed:', error));
  }
}

// Request notification permission
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        scheduleDefaultNotifications();
      }
    });
  }
}

// Schedule daily notifications for Quran and Durood
function scheduleDefaultNotifications() {
  const notifications = [
    {
      title: 'Daily Quran Reading',
      body: 'Time to read and reflect on the Quran',
      time: '08:00' // 8 AM
    },
    {
      title: 'Durood on Prophet Muhammad',
      body: 'Send blessings upon the Prophet Muhammad',
      time: '18:00' // 6 PM
    }
  ];

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.controller?.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      notifications: notifications
    });
  }
}

// Get or create notification settings
function getNotificationSettings() {
  const settings = localStorage.getItem('notificationSettings');
  return settings ? JSON.parse(settings) : {
    enabled: false,
    quranTime: '08:00',
    duroodTime: '18:00'
  };
}

// Save notification settings
function saveNotificationSettings(settings) {
  localStorage.setItem('notificationSettings', JSON.stringify(settings));
  scheduleNotifications(settings);
}

// Schedule notifications based on settings
function scheduleNotifications(settings) {
  if (!settings.enabled) return;

  const notifications = [];
  
  if (settings.quranEnabled !== false) {
    notifications.push({
      title: 'Daily Quran Reading',
      body: 'Time to read and reflect on the Quran',
      time: settings.quranTime || '08:00'
    });
  }
  
  if (settings.duroodEnabled !== false) {
    notifications.push({
      title: 'Durood on Prophet Muhammad',
      body: 'Send blessings upon the Prophet Muhammad',
      time: settings.duroodTime || '18:00'
    });
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      notifications: notifications
    });
  }
}

// Show "Add to Home Screen" prompt (on supported devices)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  showInstallPrompt();
});

function showInstallPrompt() {
  const installBtn = document.getElementById('install-app-btn');
  if (installBtn) {
    installBtn.style.display = 'block';
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
        installBtn.style.display = 'none';
      }
    });
  }
}

// Initialize PWA on page load
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  requestNotificationPermission();
});

// Check for app installed
window.addEventListener('appinstalled', () => {
  console.log('Mahmood Masjid app installed successfully');
  const installBtn = document.getElementById('install-app-btn');
  if (installBtn) {
    installBtn.style.display = 'none';
  }
});
