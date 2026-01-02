// main.js - handles clock, prayer times, and next-prayer countdown
const PK_TZ = 'Asia/Karachi';
const GUJRAT_LAT = 32.5847, GUJRAT_LON = 74.0758; // Gujrat, Fatehpur, Pakistan
const JUMMAH_TIME = '14:00'; // Fixed Jummah time (2:00 PM) for Fridays

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
      const canvas = await html2canvas(card, { backgroundColor:'#f8f5ec', scale:2 });
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

// set current year
document.getElementById('current-year').textContent = new Date().getFullYear();
initJummahDownload();
