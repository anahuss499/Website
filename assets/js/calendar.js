// calendar.js - fetch monthly prayer times and enable CSV download
const LAT = 32.5734, LON = 74.0781; // Gujrat
const METHOD = 1; // Karachi

function populateSelectors(){
  const monthSelect = document.getElementById('month-select');
  const yearSelect = document.getElementById('year-select');
  const now = new Date();
  for(let m=1;m<=12;m++){ const opt = document.createElement('option'); opt.value = m; opt.textContent = new Date(2000,m-1,1).toLocaleString('en-US',{month:'long'}); monthSelect.appendChild(opt); }
  for(let y=now.getFullYear()-2; y<=now.getFullYear()+2; y++){ const opt = document.createElement('option'); opt.value=y; opt.textContent=y; yearSelect.appendChild(opt); }
  monthSelect.value = now.getMonth()+1; yearSelect.value = now.getFullYear();
}

async function loadCalendar(){
  const month = document.getElementById('month-select').value;
  const year = document.getElementById('year-select').value;
  const area = document.getElementById('calendar-area');
  area.innerHTML = '<p>Loading...</p>';
  try{
    const url = `https://api.aladhan.com/v1/calendar?latitude=${LAT}&longitude=${LON}&method=${METHOD}&month=${month}&year=${year}`;
    const res = await fetch(url);
    const json = await res.json();
    if(json.code !== 200){ throw new Error('API error'); }
    const days = json.data;
    // Build table
    let html = `<h3>Prayer times — ${document.getElementById('month-select').selectedOptions[0].text} ${year}</h3>`;
    html += `<div class="table-wrap"><table class="prayer-table"><thead><tr><th>Date</th><th>Hijri</th><th>Fajr</th><th>Sunrise</th><th>Dhuhr</th><th>Asr</th><th>Maghrib</th><th>Isha</th></tr></thead><tbody>`;
    const rows = [];
    days.forEach(d=>{
      const g = d.date.gregorian.date;
      const h = d.date.hijri.date;
      const t = d.timings;
      const fajr = sanitizeTime(t.Fajr);
      const sunrise = sanitizeTime(t.Sunrise);
      const dhuhr = sanitizeTime(t.Dhuhr);
      const asr = sanitizeTime(t.Asr);
      const maghrib = sanitizeTime(t.Maghrib);
      const isha = sanitizeTime(t.Isha);
      html += `<tr><td>${g}</td><td>${h}</td><td>${fajr}</td><td>${sunrise}</td><td>${dhuhr}</td><td>${asr}</td><td>${maghrib}</td><td>${isha}</td></tr>`;
      rows.push({date:g,hijri:h,fajr, sunrise, dhuhr, asr, maghrib, isha});
    });
    html += `</tbody></table></div>`;
    area.innerHTML = html;
    // attach download behavior
    document.getElementById('download-btn').onclick = ()=> downloadCSV(rows, month, year);
  }catch(err){
    console.error('Calendar load error',err);
    area.innerHTML = '<p>Error loading calendar. Try again later.</p>';
  }
}

function sanitizeTime(t){ return t.split(' ')[0].replace('(+05:00)','').trim(); }

function downloadCSV(rows, month, year){
  const header = ['Date','Hijri','Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
  const lines = [header.join(',')];
  rows.forEach(r=>{
    const line = [r.date, r.hijri, r.fajr, r.sunrise, r.dhuhr, r.asr, r.maghrib, r.isha].map(v=>`"${v.replace(/"/g,'""')}"`).join(',');
    lines.push(line);
  });
  const csv = lines.join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prayer-calendar-${year}-${String(month).padStart(2,'0')}-gujrat.csv`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

// init
populateSelectors();
document.getElementById('load-btn').addEventListener('click', loadCalendar);
// auto-load current month
loadCalendar();
