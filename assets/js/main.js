// main.js - handles clock, prayer times, and next-prayer countdown

// User Welcome Banner Functionality
(function() {
  function waitForFirebase(callback) {
    if (typeof firebase !== 'undefined' && window.firebaseAuth && window.firebaseDB) {
      callback();
    } else {
      setTimeout(() => waitForFirebase(callback), 100);
    }
  }

  function showWelcomeBanner(userName) {
    const banner = document.getElementById('user-welcome-banner');
    const nameEl = document.getElementById('welcome-name');
    const closeBtn = document.getElementById('welcome-close');
    
    if (!banner || !nameEl) {
      console.log('Welcome banner elements not found');
      return;
    }

    // Check if banner was dismissed in this session
    if (sessionStorage.getItem('welcomeBannerDismissed') === 'true') {
      console.log('Welcome banner was dismissed in this session');
      return;
    }

    console.log('Showing welcome banner for:', userName);
    nameEl.textContent = userName;
    banner.style.display = 'block';

    // Close button handler
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        banner.style.display = 'none';
        sessionStorage.setItem('welcomeBannerDismissed', 'true');
      }, { once: true });
    }
  }

  function initWelcomeBanner() {
    console.log('Initializing welcome banner...');
    
    // Wait for Firebase and check authentication
    waitForFirebase(() => {
      console.log('Firebase is ready');
      const auth = window.firebaseAuth;
      const db = window.firebaseDB;

      if (!auth || !db) {
        console.log('Auth or DB not available');
        return;
      }

      auth.onAuthStateChanged(async (user) => {
        if (user) {
          console.log('User is logged in:', user.email);
          try {
            // Get user data from Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            let displayName = user.displayName || user.email.split('@')[0];

            if (userDoc.exists) {
              const userData = userDoc.data();
              displayName = userData.name || displayName;
              console.log('User data loaded from Firestore:', displayName);
            }

            // Show welcome banner
            showWelcomeBanner(displayName);
          } catch (error) {
            console.error('Error loading user profile:', error);
            // Fallback to basic display name
            const displayName = user.displayName || user.email.split('@')[0];
            showWelcomeBanner(displayName);
          }
        } else {
          console.log('No user logged in');
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWelcomeBanner);
  } else {
    initWelcomeBanner();
  }
})();

const PK_TZ = 'Asia/Karachi';
const GUJRAT_LAT = 32.5847, GUJRAT_LON = 74.0758; // Gujrat, Fatehpur, Pakistan
const JUMMAH_TIME = '14:00'; // Fixed Jummah time (2:00 PM) for Fridays
// Globals for Jummah auto-toggle window
let gMaghribToday = null;
let gIsThursday = false;
let gIsFriday = false;
// Globals for Shabe Miraj auto-toggle window
let gMaghribTomorrow = null;
let gIsShabe27Rajab = false;
let gIsShabe28Rajab = false;

function buildPkDate(base, year, month, day, timeStr){
  const [hh, mm] = timeStr.split(' ')[0].split(':').map(Number);
  const d = new Date(base);
  d.setFullYear(Number(year), Number(month)-1, Number(day));
  d.setHours(hh, mm, 0, 0);
  return d;
}

function shouldShowJummah(pkNow, maghribToday, isThursday, isFriday){
  if(isThursday) return pkNow >= maghribToday; // from Thu Maghrib onward
  if(isFriday) return pkNow < maghribToday;    // until Fri Maghrib
  return false;
}

function isFridayPk(){
  const pkNow = new Date(new Date().toLocaleString('en-US',{timeZone:PK_TZ}));
  const weekday = pkNow.toLocaleDateString('en-US',{weekday:'long', timeZone:PK_TZ});
  return weekday === 'Friday';
}

function updateJummahBanner(show){
  const banner = document.getElementById('jummah-banner');
  if(!banner) return;
  banner.style.display = show ? '' : 'none';
}

// Re-evaluate Jummah visibility periodically so it flips exactly at Maghrib
function reevaluateJummah(){
  if(!gMaghribToday) return;
  const pkNowStr = new Date().toLocaleString('en-US',{timeZone:PK_TZ});
  const pkNow = new Date(pkNowStr);
  const show = shouldShowJummah(pkNow, gMaghribToday, gIsThursday, gIsFriday);
  updateJummahBanner(show);
}

function initJummahDownload(){
  const btn = document.getElementById('jummah-download-btn');
  if(!btn) return;
  btn.addEventListener('click', async ()=>{
    const card = document.getElementById('jummah-share-card');
    if(!card){ return; }
    if(typeof html2canvas === 'undefined'){
      alert('Download unavailable offline. Please check your connection.');
      return;
    }
    try{
      const canvas = await html2canvas(card, { backgroundColor:'#f8f5ec', scale:2, allowTaint:true, useCORS:true });
      const link = document.createElement('a');
      link.download = 'Jummah-Mubarak-Mahmood-Masjid.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }catch(err){
      console.warn('Jummah card download failed', err);
      alert('Could not generate the image. Please try again.');
    }
  });
}

function updateJummahLanguage(){
  const isUrdu = document.body.classList.contains('urdu-mode');
  const msgEn = document.getElementById('jummah-msg-en');
  const msgUrdu = document.getElementById('jummah-msg-urdu');
  const blessingEn = document.getElementById('jummah-blessing-en');
  const blessingUrdu = document.getElementById('jummah-blessing-urdu');
  const descEn = document.getElementById('jummah-desc-en');
  const descUrdu = document.getElementById('jummah-desc-urdu');
  const btnEn = document.getElementById('jummah-btn-en');
  const btnUrdu = document.getElementById('jummah-btn-urdu');
  const addrEn = document.getElementById('jummah-addr-en');
  const addrUrdu = document.getElementById('jummah-addr-urdu');
  const connectEn = document.getElementById('jummah-connect-en');
  const connectUrdu = document.getElementById('jummah-connect-urdu');
  const donateLabelEn = document.getElementById('jummah-donate-label-en');
  const donateLabelUrdu = document.getElementById('jummah-donate-label-urdu');
  const reminderEn = document.getElementById('jummah-reminder-en');
  const reminderUrdu = document.getElementById('jummah-reminder-urdu');
  const cardReminderEn = document.getElementById('jummah-card-reminder-en');
  const cardReminderUrdu = document.getElementById('jummah-card-reminder-urdu');
  
  if(msgEn) msgEn.style.display = isUrdu ? 'none' : '';
  if(msgUrdu) msgUrdu.style.display = isUrdu ? '' : 'none';
  if(blessingEn) blessingEn.style.display = isUrdu ? 'none' : '';
  if(blessingUrdu) blessingUrdu.style.display = isUrdu ? '' : 'none';
  if(descEn) descEn.style.display = isUrdu ? 'none' : '';
  if(descUrdu) descUrdu.style.display = isUrdu ? '' : 'none';
  if(btnEn) btnEn.style.display = isUrdu ? 'none' : '';
  if(btnUrdu) btnUrdu.style.display = isUrdu ? '' : 'none';
  if(addrEn) addrEn.style.display = isUrdu ? 'none' : '';
  if(addrUrdu) addrUrdu.style.display = isUrdu ? '' : 'none';
  if(connectEn) connectEn.style.display = isUrdu ? 'none' : '';
  if(connectUrdu) connectUrdu.style.display = isUrdu ? '' : 'none';
  if(donateLabelEn) donateLabelEn.style.display = isUrdu ? 'none' : '';
  if(donateLabelUrdu) donateLabelUrdu.style.display = isUrdu ? '' : 'none';
  if(reminderEn) reminderEn.style.display = isUrdu ? 'none' : '';
  if(reminderUrdu) reminderUrdu.style.display = isUrdu ? '' : 'none';
  if(cardReminderEn) cardReminderEn.style.display = isUrdu ? 'none' : '';
  if(cardReminderUrdu) cardReminderUrdu.style.display = isUrdu ? '' : 'none';
}

// Shabe Miraj functions
function shouldShowShabeMiraj(pkNow, maghribToday, maghribTomorrow, isShabe27Rajab, isShabe28Rajab){
  if(isShabe27Rajab) return pkNow >= maghribToday; // from 26th Rajab Maghrib onward
  if(isShabe28Rajab) return pkNow < maghribToday;  // until 27th Rajab Maghrib
  return false;
}

function updateShabeMirajBanner(show){
  const banner = document.getElementById('shabe-miraj-banner');
  if(!banner) return;
  banner.style.display = show ? '' : 'none';
  console.log('Shabe Miraj banner display:', show);
}

// Re-evaluate Shabe Miraj visibility periodically so it flips exactly at Maghrib
function reevaluateShabeMiraj(){
  if(!gMaghribToday && !gMaghribTomorrow) return;
  const pkNowStr = new Date().toLocaleString('en-US',{timeZone:PK_TZ});
  const pkNow = new Date(pkNowStr);
  const show = shouldShowShabeMiraj(pkNow, gMaghribToday, gMaghribTomorrow, gIsShabe27Rajab, gIsShabe28Rajab);
  updateShabeMirajBanner(show);
}

function updateShabeMirajLanguage(){
  const isUrdu = document.body.classList.contains('urdu-mode');
  const reminderEn = document.getElementById('shabe-miraj-reminder-en');
  const reminderUrdu = document.getElementById('shabe-miraj-reminder-urdu');
  const descEn = document.getElementById('shabe-miraj-desc-en');
  const descUrdu = document.getElementById('shabe-miraj-desc-urdu');
  const btnEn = document.getElementById('shabe-miraj-btn-en');
  const btnUrdu = document.getElementById('shabe-miraj-btn-urdu');
  const connectEn = document.getElementById('shabe-miraj-connect-en');
  const connectUrdu = document.getElementById('shabe-miraj-connect-urdu');
  const donateLabelEn = document.getElementById('shabe-miraj-donate-label-en');
  const donateLabelUrdu = document.getElementById('shabe-miraj-donate-label-urdu');
  
  if(reminderEn) reminderEn.style.display = isUrdu ? 'none' : '';
  if(reminderUrdu) reminderUrdu.style.display = isUrdu ? '' : 'none';
  if(descEn) descEn.style.display = isUrdu ? 'none' : '';
  if(descUrdu) descUrdu.style.display = isUrdu ? '' : 'none';
  if(btnEn) btnEn.style.display = isUrdu ? 'none' : '';
  if(btnUrdu) btnUrdu.style.display = isUrdu ? '' : 'none';
  if(connectEn) connectEn.style.display = isUrdu ? 'none' : '';
  if(connectUrdu) connectUrdu.style.display = isUrdu ? '' : 'none';
  if(donateLabelEn) donateLabelEn.style.display = isUrdu ? 'none' : '';
  if(donateLabelUrdu) donateLabelUrdu.style.display = isUrdu ? '' : 'none';
}

function initShabeMirajDownload(){
  const btn = document.getElementById('shabe-miraj-download-btn');
  if(!btn) return;
  btn.addEventListener('click', async ()=>{
    // Create a simple card-like element for download
    const cardDiv = document.createElement('div');
    cardDiv.style.cssText = 'position:absolute;left:-9999px;width:600px;height:700px;padding:40px;background:linear-gradient(180deg,rgba(0,0,0,0.55),rgba(0,0,0,0.7)),url(/assets/img/Masjid1.jpg);background-size:cover;background-position:center;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-family:\'Inter\',sans-serif;color:#fff;box-shadow:0 20px 60px rgba(0,0,0,0.4);';
    
    const isUrdu = document.body.classList.contains('urdu-mode');
    const message = isUrdu ? 'نبی کریم ﷺ کی معراج کی رات' : 'Night of the Prophet\'s Ascension';
    const activities = isUrdu ? 'قرآن کریم • درود شریف • نوافل' : 'Quran • Durood • Nawafil';
    const masjidText = 'محمود مسجد | Mahmood Masjid';
    const location = 'Gujrat, Punjab, Pakistan';
    const socialsLabel = isUrdu ? 'سوشلز' : 'Socials';
    const supportLabel = isUrdu ? 'سپورٹ کریں' : 'Support';
    
    cardDiv.innerHTML = `
      <img src="/assets/img/Shab-E-Miraj.png" alt="Shabe Miraj" style="width:280px;height:auto;margin-bottom:25px;filter:brightness(0) invert(1) drop-shadow(0 6px 16px rgba(0,0,0,0.7));">
      
      <div style="font-family:'Jameel Noori Nastaleeq',serif;font-size:19px;margin-bottom:10px;opacity:0.95;text-shadow:0 2px 6px rgba(0,0,0,0.6);line-height:1.5;">${message}</div>
      
      <div style="font-family:'Jameel Noori Nastaleeq',serif;font-size:17px;font-weight:600;margin-bottom:30px;opacity:0.9;text-shadow:0 2px 6px rgba(0,0,0,0.6);letter-spacing:1px;">${activities}</div>
      
      <div style="border-top:2px solid rgba(255,255,255,0.6);padding-top:18px;width:85%;margin-bottom:18px;">
        <div style="font-family:'Jameel Noori Nastaleeq',serif;font-size:14px;font-weight:700;margin-bottom:4px;text-shadow:0 2px 6px rgba(0,0,0,0.6);">${masjidText}</div>
        <div style="font-size:12px;opacity:0.9;text-shadow:0 1px 4px rgba(0,0,0,0.6);">${location}</div>
      </div>
      
      <div style="border-top:2px solid rgba(255,255,255,0.6);padding-top:18px;width:85%;margin-bottom:16px;">
        <div style="font-family:'Jameel Noori Nastaleeq',serif;font-size:13px;font-weight:700;margin-bottom:10px;text-shadow:0 2px 6px rgba(0,0,0,0.6);">${socialsLabel}</div>
        <div style="display:flex;justify-content:center;gap:14px;margin-bottom:8px;">
          <img src="/assets/img/fblogo.png" alt="Facebook" style="width:26px;height:26px;border-radius:6px;background:#fff;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.4));">
          <img src="/assets/img/tiktoklogo.png" alt="TikTok" style="width:26px;height:26px;border-radius:6px;background:#fff;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.4));">
          <img src="/assets/img/ytlogo.png" alt="YouTube" style="width:26px;height:26px;border-radius:6px;background:#fff;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.4));">
        </div>
        <div style="font-size:12px;opacity:0.95;text-shadow:0 1px 4px rgba(0,0,0,0.6);">@mahmoodmasjid</div>
      </div>
      
      <div style="border-top:2px solid rgba(255,255,255,0.6);padding-top:18px;width:85%;">
        <div style="font-family:'Jameel Noori Nastaleeq',serif;font-size:13px;font-weight:700;margin-bottom:6px;text-shadow:0 2px 6px rgba(0,0,0,0.6);">${supportLabel}</div>
        <div style="font-size:11px;letter-spacing:0.4px;font-weight:600;text-shadow:0 2px 6px rgba(0,0,0,0.6);">PK41ABPA0010154454310012</div>
      </div>
    `;
    
    document.body.appendChild(cardDiv);
    
    if(typeof html2canvas === 'undefined'){
      alert('Download unavailable offline. Please check your connection.');
      document.body.removeChild(cardDiv);
      return;
    }
    try{
      const canvas = await html2canvas(cardDiv, { backgroundColor:'transparent', scale:2, allowTaint:true, useCORS:true });
      const link = document.createElement('a');
      link.download = 'Shabe-Miraj-Mahmood-Masjid.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      document.body.removeChild(cardDiv);
    }catch(err){
      console.warn('Shabe Miraj card download failed', err);
      alert('Could not generate the image. Please try again.');
      document.body.removeChild(cardDiv);
    }
  });
}

// Make nextPrayer globally accessible
window.nextPrayer = null;
let countdownInterval = null;

function updateLocalTime(){
  const now = new Date();
  // Format time in PK timezone
  const time = now.toLocaleTimeString('en-GB',{hour12:false,timeZone:PK_TZ});
  const pkEl = document.getElementById('pk-time');
  if(pkEl) pkEl.textContent = time;
  // also update small date fields
  const greg = now.toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric',timeZone:PK_TZ});
  const gEl = document.getElementById('gregorian');
  if(gEl) gEl.textContent = 'Gregorian: ' + greg;
}

async function fetchPrayerTimes(){
  try{
    console.log('Fetching prayer times...');
    // Use AlAdhan API with method=1 (University of Islamic Sciences, Karachi) and school=1 (Hanafi madhab)
    const url = `https://api.aladhan.com/v1/timings?latitude=${GUJRAT_LAT}&longitude=${GUJRAT_LON}&method=1&school=1`;
    const res = await fetch(url);
    const data = await res.json();
    console.log('Prayer API response received');
    if(data.code !== 200){ throw new Error('Prayer API error'); }
    const timings = data.data.timings;
    const weekdayEn = data.data.date.gregorian.weekday.en;
    const isFriday = weekdayEn === 'Friday';
    const isThursday = weekdayEn === 'Thursday';
    gIsFriday = isFriday;
    gIsThursday = isThursday;

    // Base prayers from API
    const mapping = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
    mapping.forEach(name=>{
      const li = Array.from(document.querySelectorAll('.prayer-list li')).find(l => {
        const nameSpan = l.querySelector('.prayer-name');
        return nameSpan && nameSpan.getAttribute('data-en') === name;
      });
      if(li && timings[name]){ li.querySelector('.time-val').textContent = timings[name].split(' ')[0]; }
    });

    // PK now and today's Maghrib for conditional Jummah display
    const pkNowStr = new Date().toLocaleString('en-US',{timeZone:PK_TZ});
    const pkNow = new Date(pkNowStr);
    const [day, month, year] = data.data.date.gregorian.date.split('-').map(Number); // dd-mm-yyyy
    const maghribToday = buildPkDate(pkNow, year, month, day, timings['Maghrib']);
    gMaghribToday = maghribToday;
    const showJummah = shouldShowJummah(pkNow, maghribToday, isThursday, isFriday);
    updateJummahBanner(showJummah);

    // Jummah: show only in the Thursday-after-Maghrib to Friday-before-Maghrib window
    const jummahLi = Array.from(document.querySelectorAll('.prayer-list li')).find(l => {
      const nameSpan = l.querySelector('.prayer-name');
      return nameSpan && nameSpan.getAttribute('data-en') === 'Jummah';
    });
    if(jummahLi){
      jummahLi.style.display = showJummah ? '' : 'none';
      jummahLi.querySelector('.time-val').textContent = showJummah ? JUMMAH_TIME : '—';
    }

    // Shabe Miraj logic (27th of Rajab - starting from Maghrib on 26th Rajab)
    const hijriDate = data.data.date.hijri.date; // format: "dd-mm-yyyy"
    const [hijriDay, hijriMonth, hijriYear] = hijriDate.split('-').map(Number);
    const isShabe27Rajab = hijriMonth === 7 && hijriDay === 27; // 27 Rajab (Shabe Miraj night)
    const isShabe28Rajab = hijriMonth === 7 && hijriDay === 28; // 28 Rajab (until Maghrib)
    gIsShabe27Rajab = isShabe27Rajab;
    gIsShabe28Rajab = isShabe28Rajab;
    
    console.log('Hijri Date:', hijriDate, 'Day:', hijriDay, 'Month:', hijriMonth);
    console.log('Is 27 Rajab:', isShabe27Rajab, 'Is 28 Rajab:', isShabe28Rajab);
    
    // For Shabe Miraj, we need tomorrow's Maghrib if today is 27 Rajab
    let maghribTomorrow = null;
    if(isShabe27Rajab || isShabe28Rajab){
      // Calculate tomorrow's date
      const tomorrow = new Date(pkNow);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toLocaleString('en-US',{timeZone:PK_TZ});
      const tomorrowDate = new Date(tomorrowStr);
      const tomorrowDay = tomorrowDate.getDate();
      const tomorrowMonth = tomorrowDate.getMonth() + 1;
      const tomorrowYear = tomorrowDate.getFullYear();
      
      // Tomorrow's Maghrib time (using today's Maghrib time as approximation)
      maghribTomorrow = buildPkDate(pkNow, tomorrowYear, tomorrowMonth, tomorrowDay, timings['Maghrib']);
      gMaghribTomorrow = maghribTomorrow;
    }
    
    const showShabeMiraj = shouldShowShabeMiraj(pkNow, maghribToday, maghribTomorrow, isShabe27Rajab, isShabe28Rajab);
    console.log('Show Shabe Miraj:', showShabeMiraj);
    updateShabeMirajBanner(showShabeMiraj);

    document.getElementById('prayer-updated').textContent = data.data.date.readable + ' (Hijri: ' + data.data.date.hijri.date + ')';
    document.getElementById('hijri').textContent = 'Hijri: ' + data.data.date.hijri.date + ' AH';

    // Compute next prayer using PK local date/time
    const candidates = [];
    const middayName = isFriday ? 'Jummah' : 'Dhuhr';
    const middayTime = isFriday ? JUMMAH_TIME : timings['Dhuhr'].split(' ')[0];
    ['Fajr',middayName,'Asr','Maghrib','Isha'].forEach(name=>{
      const t = name === 'Jummah' ? middayTime : timings[name].split(' ')[0];
      const [hh,mm] = t.split(':').map(Number);
      const dt = new Date(pkNow);
      dt.setFullYear(Number(year), Number(month)-1, Number(day));
      dt.setHours(hh,mm,0,0);
      candidates.push({name, dt, time: t});
    });
    let next = candidates.find(c=> c.dt > pkNow);
    if(!next){
      // tomorrow's Fajr
      const t = timings['Fajr'].split(' ')[0];
      const [hh,mm] = t.split(':').map(Number);
      const dt = new Date(pkNow);
      dt.setDate(dt.getDate()+1);
      dt.setHours(hh,mm,0,0);
      next = {name: 'Fajr', dt, time: t};
    }
    console.log('Next prayer calculated:', next);
    setNextPrayer(next);
  }catch(err){
    console.error('Prayer times error',err);
  }
}

function setNextPrayer(obj){
  console.log('setNextPrayer called with:', obj);
  window.nextPrayer = obj;
  const nameEl = document.getElementById('next-name');
  const timeEl = document.getElementById('next-time');
  
  // Set next prayer name with translation support
  if(nameEl) {
    // Map English prayer names to Urdu
    const urduNames = {
      'Fajr': 'فجر',
      'Dhuhr': 'ظہر',
      'Jummah': 'جمعہ',
      'Asr': 'عصر',
      'Maghrib': 'مغرب',
      'Isha': 'عشاء'
    };
    
    // Check if Urdu mode is active
    const isUrdu = document.body.classList.contains('urdu-mode');
    nameEl.textContent = isUrdu && urduNames[obj.name] ? urduNames[obj.name] : obj.name;
    console.log('Next prayer name set to:', nameEl.textContent);
  }
  
  if(timeEl) {
    timeEl.textContent = obj.time;
    console.log('Next prayer time set to:', obj.time);
  }
  // highlight active prayer in list
  document.querySelectorAll('.prayer-list li').forEach(li=>{
    const nameSpan = li.querySelector('.prayer-name');
    const isActive = nameSpan && nameSpan.getAttribute('data-en') === obj.name && li.style.display !== 'none';
    li.classList.toggle('active', isActive);
  });
  if(countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(updateCountdown,1000);
  updateCountdown();
  console.log('Countdown started');
}

function updateCountdown(){
  if(!window.nextPrayer) return;
  const pkNowStr = new Date().toLocaleString('en-US',{timeZone:PK_TZ});
  const pkNow = new Date(pkNowStr);
  const diff = window.nextPrayer.dt - pkNow;
  if(diff <= 0){ fetchPrayerTimes(); return; }
  const s = Math.floor(diff/1000)%60;
  const m = Math.floor(diff/60000)%60;
  const h = Math.floor(diff/3600000);
  const pad = (n)=> String(n).padStart(2,'0');
  const el = document.getElementById('next-countdown');
  if(el) el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function scheduleDailyRefresh(){
  // Calculate ms until next midnight in PK timezone
  const now = new Date();
  // Convert current time to PK time components
  const pkNowStr = now.toLocaleString('en-US',{timeZone:PK_TZ});
  const pkNow = new Date(pkNowStr);
  // next midnight
  const next = new Date(pkNow);
  next.setHours(24,0,5,0);
  const ms = next - pkNow;
  // set timeout to re-fetch after ms
  setTimeout(()=>{ fetchPrayerTimes().then(()=> scheduleDailyRefresh()); }, ms);
}

// Init
updateLocalTime(); setInterval(updateLocalTime,1000);
fetchPrayerTimes(); scheduleDailyRefresh();
// update prayer times hourly as a fallback
setInterval(fetchPrayerTimes,1000*60*60);
// ensure Jummah window flips exactly at Maghrib without waiting for hourly refresh
setInterval(reevaluateJummah, 60*1000);
// ensure Shabe Miraj window flips exactly at Maghrib without waiting for hourly refresh
setInterval(reevaluateShabeMiraj, 60*1000);

// set current year
document.getElementById('current-year').textContent = new Date().getFullYear();
initJummahDownload();
updateJummahLanguage();
initShabeMirajDownload();
updateShabeMirajLanguage();

// Side Menu Functionality
function initSideMenu() {
  const sideMenu = document.getElementById('side-menu');
  const sideMenuToggle = document.getElementById('side-menu-toggle');
  const sideMenuOverlay = document.getElementById('side-menu-overlay');
  const sideMenuItems = document.querySelectorAll('.side-menu-item');
  const body = document.body;

  if (!sideMenu || !sideMenuToggle) return;

  // Toggle menu on button click - only open side menu, close any nav menu
  sideMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Close main nav if it's open
    if (body.classList.contains('nav-open')) {
      body.classList.remove('nav-open');
      document.querySelectorAll('.nav-toggle').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }
    
    // Toggle side menu
    sideMenu.classList.toggle('open');
  }, { capture: true });

  // Close menu on overlay click
  if (sideMenuOverlay) {
    sideMenuOverlay.addEventListener('click', () => {
      sideMenu.classList.remove('open');
    });
  }

  // Close menu on item click
  sideMenuItems.forEach((item) => {
    item.addEventListener('click', () => {
      sideMenu.classList.remove('open');
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      sideMenu.classList.remove('open');
    }
  });

  // Swipe to open/close menu - Right-to-left opens, left-to-right closes
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let isSwiping = false;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeDistanceX = touchEndX - touchStartX;
    const swipeDistanceY = Math.abs(touchEndY - touchStartY);
    const minSwipeDistance = 80; // Minimum swipe distance in pixels

    // Ignore if mostly vertical swipe
    if (swipeDistanceY > Math.abs(swipeDistanceX)) return;

    const isMenuOpen = sideMenu.classList.contains('open');

    // Swipe RIGHT to LEFT (negative distance) = OPEN menu
    if (!isMenuOpen && swipeDistanceX < -minSwipeDistance) {
      sideMenu.classList.add('open');
    }
    // Swipe LEFT to RIGHT (positive distance) = CLOSE menu
    else if (isMenuOpen && swipeDistanceX > minSwipeDistance) {
      sideMenu.classList.remove('open');
    }
  }

  // Set active menu item based on current page
  const currentPath = window.location.pathname;
  sideMenuItems.forEach((item) => {
    const href = item.getAttribute('href');
    if (href === currentPath || (currentPath === '/' && href === '/')) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Initialize side menu when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSideMenu);
} else {
  initSideMenu();
}

