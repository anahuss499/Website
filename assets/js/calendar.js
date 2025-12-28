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
    const monthLabel = document.getElementById('month-select').selectedOptions[0].text;
    let html = `<h3 data-en="Prayer times — ${monthLabel} ${year}" data-urdu="نماز کے اوقات — ${monthLabel} ${year}">Prayer times — ${monthLabel} ${year}</h3>`;
    html += `<div class="table-wrap"><table class="prayer-table"><thead><tr>
      <th data-en="Date" data-urdu="تاریخ">Date</th>
      <th data-en="Hijri" data-urdu="حجری">Hijri</th>
      <th data-en="Fajr" data-urdu="فجر">Fajr</th>
      <th data-en="Sunrise" data-urdu="طلوع آفتاب">Sunrise</th>
      <th data-en="Ishraq" data-urdu="اشراق">Ishraq</th>
      <th data-en="Duha al Kubra" data-urdu="چاشت کبریٰ">Duha al Kubra</th>
      <th data-en="Dhuhr" data-urdu="ظہر">Dhuhr</th>
      <th data-en="Asr" data-urdu="عصر">Asr</th>
      <th data-en="Maghrib" data-urdu="مغرب">Maghrib</th>
      <th data-en="Isha" data-urdu="عشاء">Isha</th>
    </tr></thead><tbody>`;
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
      const ishraq = addMinutesToTime(sunrise, 20); // Ishraq ≈ sunrise + 20 minutes
      const duhaKubra = subtractMinutesFromTime(dhuhr, 45); // Duha al Kubra ≈ 45 minutes before Dhuhr
      html += `<tr><td>${g}</td><td>${h}</td><td>${fajr}</td><td>${sunrise}</td><td>${ishraq}</td><td>${duhaKubra}</td><td>${dhuhr}</td><td>${asr}</td><td>${maghrib}</td><td>${isha}</td></tr>`;
      rows.push({date:g,hijri:h,fajr, sunrise, ishraq, duhaKubra, dhuhr, asr, maghrib, isha});
    });
    html += `</tbody></table></div>`;
    area.innerHTML = html;
    // Apply Urdu labels if Urdu mode is currently enabled
    if(document.body.classList.contains('urdu-mode')){
      document.querySelectorAll('#calendar-area [data-urdu]').forEach(el=>{
        el.textContent = el.getAttribute('data-urdu');
      });
    }
    // attach download behavior
    document.getElementById('download-btn').onclick = ()=> downloadPDF(rows, month, year);
  }catch(err){
    console.error('Calendar load error',err);
    area.innerHTML = '<p>Error loading calendar. Try again later.</p>';
  }
}

function sanitizeTime(t){ return t.split(' ')[0].replace('(+05:00)','').trim(); }

function addMinutesToTime(timeStr, minutes){
  if(!timeStr || !/^[0-2]?\d:\d{2}$/.test(timeStr)) return timeStr;
  const [hh, mm] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  d.setMinutes(d.getMinutes() + minutes);
  const h = String(d.getHours()).padStart(2,'0');
  const m = String(d.getMinutes()).padStart(2,'0');
  return `${h}:${m}`;
}

function subtractMinutesFromTime(timeStr, minutes){
  if(!timeStr || !/^[0-2]?\d:\d{2}$/.test(timeStr)) return timeStr;
  return addMinutesToTime(timeStr, -minutes);
}

function downloadPDF(rows, month, year){
  const isUrdu = document.body.classList.contains('urdu-mode');
  const monthName = new Date(2000,month-1,1).toLocaleString('en-US',{month:'long'});
  const title = isUrdu ? 'نماز کا کیلنڈر' : 'Prayer Times Calendar';
  const mosqueName = isUrdu ? 'محمود مسجد' : 'Mahmood Masjid';
  const address = isUrdu ? 'محمود آباد، گجرات، پنجاب، پاکستان' : 'Mahmood Abad, Gujrat, Punjab, Pakistan';
  const dateRange = `${monthName} ${year}`;
  const hdr = {
    date: isUrdu ? 'تاریخ' : 'Date',
    hijri: isUrdu ? 'حجری' : 'Hijri',
    fajr: isUrdu ? 'فجر' : 'Fajr',
    sunrise: isUrdu ? 'طلوع آفتاب' : 'Sunrise',
    ishraq: isUrdu ? 'اشراق' : 'Ishraq',
    duha: isUrdu ? 'چاشت کبریٰ' : 'Duha al Kubra',
    dhuhr: isUrdu ? 'ظہر' : 'Dhuhr',
    asr: isUrdu ? 'عصر' : 'Asr',
    maghrib: isUrdu ? 'مغرب' : 'Maghrib',
    isha: isUrdu ? 'عشاء' : 'Isha'
  };

  const html = `
    <div style="padding: 14px 16px; font-family: Arial, sans-serif;">
      <div style="display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:8px;">
        <img src="/assets/img/logo.png" alt="${mosqueName} logo" style="width:42px;height:42px;border-radius:6px;box-shadow:0 0 9px rgba(50,205,50,0.35);border:2px solid rgba(50,205,50,0.28)">
        <div style="text-align:center">
          <div style="font-size:15px;font-weight:800;color:#042204;margin-bottom:3px">${mosqueName}</div>
          <div style="font-size:11px;color:#666">${address}</div>
        </div>
      </div>
      <h2 style="text-align: center; margin: 6px 0 10px; font-size:14px;">${title}</h2>
      <p style="text-align: center; margin: 0 0 10px; color: #666; font-size:11px;">${dateRange}</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="border: 1px solid #ddd; padding: 5px; text-align: left; white-space:nowrap;">${hdr.date}</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: left; white-space:nowrap;">${hdr.hijri}</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${hdr.fajr}</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${hdr.sunrise}</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${hdr.ishraq}</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${hdr.duha}</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${hdr.dhuhr}</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${hdr.asr}</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${hdr.maghrib}</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${hdr.isha}</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r=>`
            <tr>
              <td style="border: 1px solid #ddd; padding: 5px; white-space:nowrap;">${r.date}</td>
              <td style="border: 1px solid #ddd; padding: 5px; white-space:nowrap;">${r.hijri}</td>
              <td style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${r.fajr}</td>
              <td style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${r.sunrise}</td>
              <td style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${r.ishraq}</td>
              <td style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${r.duhaKubra}</td>
              <td style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${r.dhuhr}</td>
              <td style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${r.asr}</td>
              <td style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${r.maghrib}</td>
              <td style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${r.isha}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  const opt = {
    margin: 8,
    filename: `prayer-calendar-${year}-${String(month).padStart(2,'0')}-gujrat.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1.8 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  
  html2pdf().set(opt).from(html).save();
}

// init
populateSelectors();
document.getElementById('load-btn').addEventListener('click', loadCalendar);
// auto-load current month
loadCalendar();
