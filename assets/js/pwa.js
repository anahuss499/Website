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
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
        if (permission === 'granted') {
          console.log('Notifications granted, scheduling...');
          scheduleDefaultNotifications();
        }
      });
    } else if (Notification.permission === 'granted') {
      console.log('Notifications already granted');
      scheduleDefaultNotifications();
    } else {
      console.log('Notifications blocked:', Notification.permission);
    }
  } else {
    console.log('Notifications not supported');
  }
}

// Get current language
function getCurrentLanguage() {
  try {
    const lang = localStorage.getItem('lang');
    return lang === 'urdu' ? 'urdu' : 'en';
  } catch (e) {
    return 'en';
  }
}

// Get localized prayer names
function getPrayerNames() {
  const language = getCurrentLanguage();
  
  if (language === 'urdu') {
    return {
      Fajr: 'فجر',
      Dhuhr: 'ظہر',
      Asr: 'عصر',
      Maghrib: 'مغرب',
      Isha: 'عشاء'
    };
  } else {
    return {
      Fajr: 'Fajr',
      Dhuhr: 'Dhuhr',
      Asr: 'Asr',
      Maghrib: 'Maghrib',
      Isha: 'Isha'
    };
  }
}


// Fetch prayer times from API
async function fetchPrayerTimes() {
  const GUJRAT_LAT = 32.5847, GUJRAT_LON = 74.0758;
  try {
    const url = `https://api.aladhan.com/v1/timings?latitude=${GUJRAT_LAT}&longitude=${GUJRAT_LON}&method=1&school=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 200) throw new Error('Prayer API error');
    return data.data.timings;
  } catch (error) {
    console.error('Failed to fetch prayer times:', error);
    return null;
  }
}

// Get prayer time notifications
async function getPrayerNotifications() {
  const language = getCurrentLanguage();
  const prayerNames = getPrayerNames();
  const timings = await fetchPrayerTimes();
  
  if (!timings) return [];
  
  const notifications = [];
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  
  prayers.forEach(prayer => {
    const time = timings[prayer]?.split(' ')[0]; // Get HH:MM format
    if (!time) return;
    
    if (language === 'urdu') {
      notifications.push({
        title: `🕌 ${prayerNames[prayer]} کا وقت`,
        body: `${prayerNames[prayer]} کی نماز کا وقت ${time} ہے`,
        time: time
      });
    } else {
      notifications.push({
        title: `🕌 ${prayerNames[prayer]} Prayer Time`,
        body: `${prayerNames[prayer]} prayer time is ${time}`,
        time: time
      });
    }
  });
  
  return notifications;
}

// Get notifications in the user's language with emojis
function getLocalizedNotifications() {
  const language = getCurrentLanguage();
  
  if (language === 'urdu') {
    return [
      {
        title: '📖 روزانہ قرآن کی تلاوت',
        body: 'قرآن کو پڑھنے اور غور و فکر کرنے کا وقت ہے',
        time: '07:00'
      },
      {
        title: '🤲 درود شریف',
        body: 'حضرت محمد صلی اللہ علیہ وسلم پر درود بھیجیں',
        time: '18:00'
      }
    ];
  } else {
    return [
      {
        title: '📖 Daily Quran Reading',
        body: '✨ Time to read and reflect on the Quran',
        time: '07:00'
      },
      {
        title: '🤲 Durood on Prophet Muhammad',
        body: '✨ Send blessings upon the Prophet Muhammad (Peace Be Upon Him)',
        time: '18:00'
      }
    ];
  }
}

// Schedule daily notifications for Quran, Durood, and Prayer Times
async function scheduleDefaultNotifications() {
  // Check if notifications are actually enabled
  if (Notification.permission !== 'granted') {
    console.log('Cannot schedule notifications - permission not granted');
    return;
  }
  
  const baseNotifications = getLocalizedNotifications();
  const prayerNotifications = await getPrayerNotifications();
  
  const allNotifications = [...baseNotifications, ...prayerNotifications];
  console.log('Scheduling notifications:', allNotifications);

  // Use service worker controller if available
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      notifications: allNotifications
    });
  }
  
  // Also directly register with service worker registration
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          notifications: allNotifications
        });
      }
    } catch (e) {
      console.error('Failed to post message to service worker:', e);
    }
  }
  
  // Store prayer times for later use
  try {
    localStorage.setItem('prayerNotifications', JSON.stringify(prayerNotifications));
  } catch (e) {
    console.error('Failed to store prayer notifications:', e);
  }
}

// Get or create notification settings
function getNotificationSettings() {
  const settings = localStorage.getItem('notificationSettings');
  return settings ? JSON.parse(settings) : {
    enabled: false,
    quranTime: '07:00',
    duroodTime: '18:00'
  };
}

// Save notification settings
function saveNotificationSettings(settings) {
  localStorage.setItem('notificationSettings', JSON.stringify(settings));
  scheduleNotifications(settings);
}

// Schedule notifications based on settings
async function scheduleNotifications(settings) {
  if (!settings.enabled) return;

  const language = getCurrentLanguage();
  const notifications = [];
  
  if (language === 'urdu') {
    if (settings.quranEnabled !== false) {
      notifications.push({
        title: '📖 روزانہ قرآن کی تلاوت',
        body: 'قرآن کو پڑھنے اور غور و فکر کرنے کا وقت ہے',
        time: settings.quranTime || '08:00'
      });
    }
    
    if (settings.duroodEnabled !== false) {
      notifications.push({
        title: '🤲 درود شریف',
        body: 'حضرت محمد صلی اللہ علیہ وسلم پر درود بھیجیں',
        time: settings.duroodTime || '18:00'
      });
    }
  } else {
    if (settings.quranEnabled !== false) {
      notifications.push({
        title: '📖 Daily Quran Reading',
        body: '✨ Time to read and reflect on the Quran',
        time: settings.quranTime || '07:00'
      });
    }
    
    if (settings.duroodEnabled !== false) {
      notifications.push({
        title: '🤲 Durood on Prophet Muhammad',
        body: '✨ Send blessings upon the Prophet Muhammad (Peace Be Upon Him)',
        time: settings.duroodTime || '18:00'
      });
    }
  }
  
  // Add prayer time notifications if enabled
  if (settings.prayerTimesEnabled !== false) {
    const prayerNotifications = await getPrayerNotifications();
    notifications.push(...prayerNotifications);
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
  
  // Add a small delay to ensure service worker is registered before requesting permission
  setTimeout(() => {
    requestNotificationPermission();
    // Update prayer times daily
    updatePrayerTimesDaily();
  }, 500);
});

// Update prayer times daily (since they change each day)
function updatePrayerTimesDaily() {
  // Update immediately
  scheduleDailyPrayerUpdate();
  
  // Update at midnight every day
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 5, 0, 0); // 12:05 AM
  
  const timeUntilMidnight = tomorrow - now;
  
  setTimeout(() => {
    scheduleDailyPrayerUpdate();
    // Then repeat every 24 hours
    setInterval(scheduleDailyPrayerUpdate, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
}

// Schedule prayer time updates
async function scheduleDailyPrayerUpdate() {
  if (Notification.permission === 'granted') {
    const baseNotifications = getLocalizedNotifications();
    const prayerNotifications = await getPrayerNotifications();
    const allNotifications = [...baseNotifications, ...prayerNotifications];
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        notifications: allNotifications
      });
    }

    // Send a once-per-Friday greeting in the user's language
    await sendJummahMubarakIfFriday();
  }
}

// Check for app installed
window.addEventListener('appinstalled', () => {
  console.log('Mahmood Masjid app installed successfully');
  const installBtn = document.getElementById('install-app-btn');
  if (installBtn) {
    installBtn.style.display = 'none';
  }
});

// Send a single Jummah Mubarak notification each Friday (PK timezone)
async function sendJummahMubarakIfFriday(){
  if(Notification.permission !== 'granted') return;
  const pkNow = new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Karachi'}));
  const weekday = pkNow.toLocaleDateString('en-US',{weekday:'long', timeZone:'Asia/Karachi'});
  if(weekday !== 'Friday') return;

  const todayKey = pkNow.toLocaleDateString('en-CA',{timeZone:'Asia/Karachi'}); // YYYY-MM-DD
  try{
    const lastSent = localStorage.getItem('jummahMubarakSent');
    if(lastSent === todayKey) return;
  }catch(err){ /* ignore storage errors */ }

  const lang = getCurrentLanguage();
  const title = lang === 'urdu' ? 'جمعہ مبارک' : 'Jummah Mubarak';
  const body = lang === 'urdu'
    ? 'اللہ آپ کی جمعہ کو برکت دے'
    : 'May Allah bless your Jummah';

  try{
    const reg = await navigator.serviceWorker.getRegistration();
    if(reg){
      await reg.showNotification(title, {
        body,
        icon: '/assets/img/logo.png',
        badge: '/assets/img/logo.png',
        tag: 'jummah-mubarak',
        renotify: false
      });
      localStorage.setItem('jummahMubarakSent', todayKey);
    }
  }catch(err){ console.warn('Jummah notification failed', err); }
}
