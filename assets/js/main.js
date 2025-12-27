// main.js - handles clock, prayer times, and next-prayer countdown
const PK_TZ = 'Asia/Karachi';
const GUJRAT_LAT = 32.5734, GUJRAT_LON = 74.0781; // Gujrat city coords

let nextPrayer = null;
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
    // Use AlAdhan API with method=1 (University of Islamic Sciences, Karachi)
    const url = `https://api.aladhan.com/v1/timings?latitude=${GUJRAT_LAT}&longitude=${GUJRAT_LON}&method=1`;
    const res = await fetch(url);
    const data = await res.json();
    if(data.code !== 200){ throw new Error('Prayer API error'); }
    const timings = data.data.timings;
    const mapping = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
    mapping.forEach(name=>{
      const li = Array.from(document.querySelectorAll('.prayer-list li')).find(l => l.textContent.includes(name));
      if(li && timings[name]){ li.querySelector('.time-val').textContent = timings[name].split(' ')[0]; }
    });
    document.getElementById('prayer-updated').textContent = data.data.date.readable + ' (Hijri: ' + data.data.date.hijri.date + ')';
    document.getElementById('hijri').textContent = 'Hijri: ' + data.data.date.hijri.date + ' AH';

    // Compute next prayer using PK local date/time
    const pkNowStr = new Date().toLocaleString('en-US',{timeZone:PK_TZ});
    const pkNow = new Date(pkNowStr);
    const [day, month, year] = data.data.date.gregorian.date.split('-').map(Number); // dd-mm-yyyy
    const candidates = [];
    ['Fajr','Dhuhr','Asr','Maghrib','Isha'].forEach(name=>{
      const t = timings[name].split(' ')[0];
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
    setNextPrayer(next);
  }catch(err){
    console.error('Prayer times error',err);
  }
}

function setNextPrayer(obj){
  nextPrayer = obj;
  const nameEl = document.getElementById('next-name');
  const timeEl = document.getElementById('next-time');
  if(nameEl) nameEl.textContent = obj.name;
  if(timeEl) timeEl.textContent = obj.time;
  // highlight active prayer in list
  document.querySelectorAll('.prayer-list li').forEach(li=>{
    li.classList.toggle('active', li.textContent.trim().startsWith(obj.name));
  });
  if(countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(updateCountdown,1000);
  updateCountdown();
}

function updateCountdown(){
  if(!nextPrayer) return;
  const pkNowStr = new Date().toLocaleString('en-US',{timeZone:PK_TZ});
  const pkNow = new Date(pkNowStr);
  const diff = nextPrayer.dt - pkNow;
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
