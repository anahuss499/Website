// calendar.js - fetch monthly prayer times and enable CSV download
const LAT = 32.5847, LON = 74.0758; // Gujrat, Fatehpur, Pakistan
const METHOD = 1; // University of Islamic Sciences, Karachi - Sunni Hanafi method (Isha: 18° below horizon)
const JUMMAH_TIME = '14:00'; // Fixed Jummah time (2:00 PM) year-round

function populateSelectors(){
  const monthSelect = document.getElementById('month-select');
  const yearSelect = document.getElementById('year-select');
  const now = new Date();
  // 'All Months' option already in HTML
  for(let m=1;m<=12;m++){ const opt = document.createElement('option'); opt.value = m; opt.textContent = new Date(2000,m-1,1).toLocaleString('en-US',{month:'long'}); monthSelect.appendChild(opt); }
  for(let y=now.getFullYear()-2; y<=now.getFullYear()+2; y++){ const opt = document.createElement('option'); opt.value=y; opt.textContent=y; yearSelect.appendChild(opt); }
  monthSelect.value = now.getMonth()+1; yearSelect.value = now.getFullYear();
}

async function loadCalendar(){
  const month = document.getElementById('month-select').value;
  const year = document.getElementById('year-select').value;
  const area = document.getElementById('calendar-area');
  area.innerHTML = '<p>Loading...</p>';
  
  // If full year is selected
  if(month === 'all'){
    await loadFullYearCalendar(year);
    return;
  }
  
  try{
    const url = `https://api.aladhan.com/v1/calendar?latitude=${LAT}&longitude=${LON}&method=${METHOD}&month=${month}&year=${year}&school=1`;
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
      <th data-en="Jummah" data-urdu="جمعہ">Jummah</th>
      <th data-en="Asr" data-urdu="عصر">Asr</th>
      <th data-en="Maghrib" data-urdu="مغرب">Maghrib</th>
      <th data-en="Isha" data-urdu="عشاء">Isha</th>
    </tr></thead><tbody>`;
    const rows = [];
    days.forEach(d=>{
      const g = d.date.gregorian.date;
      const h = d.date.hijri.date;
      const weekday = d.date.gregorian.weekday.en;
      const t = d.timings;
      const fajr = sanitizeTime(t.Fajr);
      const sunrise = sanitizeTime(t.Sunrise);
      const dhuhr = sanitizeTime(t.Dhuhr);
      const asr = sanitizeTime(t.Asr);
      const maghrib = sanitizeTime(t.Maghrib);
      const isha = sanitizeTime(t.Isha);
      const ishraq = addMinutesToTime(sunrise, 20); // Ishraq ≈ sunrise + 20 minutes
      const duhaKubra = subtractMinutesFromTime(dhuhr, 45); // Duha al Kubra ≈ 45 minutes before Dhuhr
      const jummah = weekday === 'Friday' ? JUMMAH_TIME : '—';
      html += `<tr><td>${g}</td><td>${h}</td><td>${fajr}</td><td>${sunrise}</td><td>${ishraq}</td><td>${duhaKubra}</td><td>${dhuhr}</td><td>${jummah}</td><td>${asr}</td><td>${maghrib}</td><td>${isha}</td></tr>`;
      rows.push({date:g,hijri:h,fajr, sunrise, ishraq, duhaKubra, dhuhr, jummah, asr, maghrib, isha});
    });
    html += `</tbody></table></div>`;
    area.innerHTML = html;
    // Apply Urdu labels if Urdu mode is currently enabled
    if(document.body.classList.contains('urdu-mode')){
      document.querySelectorAll('#calendar-area [data-urdu]').forEach(el=>{
        el.textContent = el.getAttribute('data-urdu');
      });
    }
    // attach download behavior and show button
    document.getElementById('download-btn').style.display = 'inline-block';
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

async function loadFullYearCalendar(year){
  const area = document.getElementById('calendar-area');
  const isUrdu = document.body.classList.contains('urdu-mode');
  
  try{
    // Labels for header
    const mosqueName = isUrdu ? 'محمود مسجد' : 'Mahmood Masjid';
    const address = isUrdu ? 'محمود آباد، گجرات، فتح پور، پنجاب، پاکستان' : 'Mahmood Abad, Gujrat, Fatehpur, Punjab, Pakistan';
    const calendarTitle = isUrdu ? 'نماز کا کیلنڈر' : 'Prayer Times Calendar';
    const labels = {
      date: isUrdu ? 'تاریخ' : 'Date',
      hijri: isUrdu ? 'حجری' : 'Hijri',
      fajr: isUrdu ? 'فجر' : 'Fajr',
      sunrise: isUrdu ? 'طلوع' : 'Sunrise',
      ishraq: isUrdu ? 'اشراق' : 'Ishraq',
      duha: isUrdu ? 'چاشت' : 'Duha',
      dhuhr: isUrdu ? 'ظہر' : 'Dhuhr',
      jummah: isUrdu ? 'جمعہ' : 'Jummah',
      asr: isUrdu ? 'عصر' : 'Asr',
      maghrib: isUrdu ? 'مغرب' : 'Maghrib',
      isha: isUrdu ? 'عشاء' : 'Isha'
    };
    
    // Create header
    let html = `
      <div class="full-year-header">
        <img src="/assets/img/logo.png" alt="${mosqueName} logo" class="year-logo">
        <div class="year-header-text">
          <h2 class="mosque-name" ${isUrdu ? 'style="font-family: Jameel Noori Nastaleeq, serif;"' : ''}>${mosqueName}</h2>
          <p class="mosque-address" ${isUrdu ? 'style="font-family: Jameel Noori Nastaleeq, serif;"' : ''}>${address}</p>
        </div>
      </div>
      <h1 class="year-title" ${isUrdu ? 'style="font-family: Jameel Noori Nastaleeq, serif;"' : ''}>${calendarTitle}</h1>
      <div class="full-year-grid">
    `;
    
    // Load all 12 months
    for(let m=1; m<=12; m++){
      const url = `https://api.aladhan.com/v1/calendar?latitude=${LAT}&longitude=${LON}&method=${METHOD}&month=${m}&year=${year}&school=1`;
      const res = await fetch(url);
      const json = await res.json();
      if(json.code !== 200){ throw new Error('API error'); }
      const days = json.data;
      const monthLabel = new Date(year,m-1,1).toLocaleString('en-US',{month:'long'});
      const monthLabelUrdu = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'][m-1];
      
      // Get Islamic month names from the data
      const firstDay = days[0];
      const lastDay = days[days.length - 1];
      const hijriMonthStart = firstDay.date.hijri.month.en;
      const hijriMonthEnd = lastDay.date.hijri.month.en;
      const hijriMonthStartAr = firstDay.date.hijri.month.ar;
      const hijriMonthEndAr = lastDay.date.hijri.month.ar;
      
      // Determine if month spans two Hijri months
      const hijriDisplay = hijriMonthStart === hijriMonthEnd 
        ? (isUrdu ? hijriMonthStartAr : hijriMonthStart)
        : (isUrdu ? `${hijriMonthStartAr} / ${hijriMonthEndAr}` : `${hijriMonthStart} / ${hijriMonthEnd}`);
      
      const gregMonth = isUrdu ? monthLabelUrdu : monthLabel;
      const displayMonth = `${gregMonth}<br><span style="font-size:0.75em;color:#666;font-weight:500;">${hijriDisplay}</span>`;
      
      // Create month table
      html += `<div class="month-container">
        <h3 class="month-title" ${isUrdu ? 'style="font-family: Jameel Noori Nastaleeq, serif;"' : ''}>${displayMonth}</h3>
        <table class="compact-prayer-table" ${isUrdu ? 'style="font-family: Jameel Noori Nastaleeq, serif;"' : ''}>
          <thead><tr>
            <th>${labels.date}</th>
            <th>${labels.hijri}</th>
            <th>${labels.fajr}</th>
            <th>${labels.sunrise}</th>
            <th>${labels.ishraq}</th>
            <th>${labels.duha}</th>
            <th>${labels.dhuhr}</th>
            <th>${labels.jummah}</th>
            <th>${labels.asr}</th>
            <th>${labels.maghrib}</th>
            <th>${labels.isha}</th>
          </tr></thead>
          <tbody>`;
      
      days.forEach(d=>{
        const date = d.date.gregorian.day;
        const hijri = d.date.hijri.day;
        const weekday = d.date.gregorian.weekday.en;
        const t = d.timings;
        const fajr = sanitizeTime(t.Fajr);
        const sunrise = sanitizeTime(t.Sunrise);
        const dhuhr = sanitizeTime(t.Dhuhr);
        const asr = sanitizeTime(t.Asr);
        const maghrib = sanitizeTime(t.Maghrib);
        const isha = sanitizeTime(t.Isha);
        const ishraq = addMinutesToTime(sunrise, 20);
        const duhaKubra = subtractMinutesFromTime(dhuhr, 45);
        const jummah = weekday === 'Friday' ? JUMMAH_TIME : '—';
        
        html += `<tr>
          <td>${date}</td>
          <td>${hijri}</td>
          <td>${fajr}</td>
          <td>${sunrise}</td>
          <td>${ishraq}</td>
          <td>${duhaKubra}</td>
          <td>${dhuhr}</td>
          <td>${jummah}</td>
          <td>${asr}</td>
          <td>${maghrib}</td>
          <td>${isha}</td>
        </tr>`;
      });
      
      html += `</tbody></table></div>`;
    }
    
    html += `</div>`;
    
    // Add moon sighting note
    const moonNote = isUrdu 
      ? '<p class="moon-sighting-note" style="text-align:center;margin-top:20px;padding:12px;background:rgba(50,205,50,0.08);border-radius:8px;color:#042204;font-size:0.85rem;font-style:italic;font-family:Jameel Noori Nastaleeq, serif;">* نوٹ: حجری تاریخیں چاند دیکھنے کی بنیاد پر تبدیل ہو سکتی ہیں</p>'
      : '<p class="moon-sighting-note" style="text-align:center;margin-top:20px;padding:12px;background:rgba(50,205,50,0.08);border-radius:8px;color:#042204;font-size:0.85rem;font-style:italic;">* Note: Dates may vary slightly based on moon sighting</p>';
    html += moonNote;
    
    area.innerHTML = html;
    
    // Hide download button for full year view
    document.getElementById('download-btn').style.display = 'none';
    
  }catch(err){
    console.error('Full year calendar error',err);
    area.innerHTML = '<p>Error loading full year calendar. Try again later.</p>';
  }
}

async function downloadFullYearPDF(year){
  const isUrdu = document.body.classList.contains('urdu-mode');
  const mosqueName = isUrdu ? 'محمود مسجد' : 'Mahmood Masjid';
  const address = isUrdu ? 'محمود آباد، گجرات، فتح پور، پنجاب، پاکستان' : 'Mahmood Abad, Gujrat, Fatehpur, Punjab, Pakistan';
  const calendarTitle = isUrdu ? 'نماز کا کیلنڈر' : 'Prayer Times Calendar';
  const labels = {
    date: isUrdu ? 'تاریخ' : 'D',
    hijri: isUrdu ? 'حجری' : 'H',
    fajr: isUrdu ? 'فجر' : 'Fajr',
    sunrise: isUrdu ? 'طلوع' : 'Sun',
    ishraq: isUrdu ? 'اشراق' : 'Ish',
    duha: isUrdu ? 'چاشت' : 'Duha',
    dhuhr: isUrdu ? 'ظہر' : 'Dhuhr',
    jummah: isUrdu ? 'جمعہ' : 'Jum',
    asr: isUrdu ? 'عصر' : 'Asr',
    maghrib: isUrdu ? 'مغرب' : 'Mag',
    isha: isUrdu ? 'عشاء' : 'Isha'
  };
  
  let monthsHTML = '';
  
  // Fetch all 12 months
  for(let m=1; m<=12; m++){
    const url = `https://api.aladhan.com/v1/calendar?latitude=${LAT}&longitude=${LON}&method=${METHOD}&month=${m}&year=${year}&school=1`;
    const res = await fetch(url);
    const json = await res.json();
    if(json.code !== 200){ continue; }
    const days = json.data;
    const monthLabelUrdu = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'][m-1];
    const monthLabel = new Date(year,m-1,1).toLocaleString('en-US',{month:'short'});
    
    // Get Islamic month names
    const firstDay = days[0];
    const lastDay = days[days.length - 1];
    const hijriMonthStart = firstDay.date.hijri.month.en;
    const hijriMonthEnd = lastDay.date.hijri.month.en;
    const hijriMonthStartAr = firstDay.date.hijri.month.ar;
    const hijriMonthEndAr = lastDay.date.hijri.month.ar;
    
    const hijriDisplay = hijriMonthStart === hijriMonthEnd 
      ? (isUrdu ? hijriMonthStartAr : hijriMonthStart)
      : (isUrdu ? `${hijriMonthStartAr}/${hijriMonthEndAr}` : `${hijriMonthStart}/${hijriMonthEnd}`);
    
    const gregMonth = isUrdu ? monthLabelUrdu : monthLabel;
    const displayMonth = `${gregMonth}<br><span style="font-size:3.2px;color:#666;">${hijriDisplay}</span>`;
    
    let tableHTML = `<div style="break-inside:avoid;margin-bottom:1px;">
      <h4 style="text-align:center;font-size:4.5px;margin:0 0 0.5px 0;color:#32cd32;font-weight:700;line-height:0.95;${isUrdu ? 'font-family:Jameel Noori Nastaleeq;' : ''}">${displayMonth}</h4>
      <table style="width:100%;border-collapse:collapse;font-size:3.5px;line-height:0.9;${isUrdu ? 'font-family:Jameel Noori Nastaleeq;' : ''}">
        <thead><tr style="background:#f5f5f5;">
          <th style="border:0.2px solid #aaa;padding:0.4px;font-size:3.3px;">${labels.date}</th>
          <th style="border:0.2px solid #aaa;padding:0.4px;font-size:3.3px;">${labels.hijri}</th>
          <th style="border:0.2px solid #aaa;padding:0.4px;font-size:3.3px;">${labels.fajr}</th>
          <th style="border:0.2px solid #aaa;padding:0.4px;font-size:3.3px;">${labels.sunrise}</th>
          <th style="border:0.2px solid #aaa;padding:0.4px;font-size:3.3px;">${labels.ishraq}</th>
          <th style="border:0.2px solid #aaa;padding:0.4px;font-size:3.3px;">${labels.duha}</th>
          <th style="border:0.2px solid #aaa;padding:0.4px;font-size:3.3px;">${labels.dhuhr}</th>
          <th style="border:0.2px solid #aaa;padding:0.4px;font-size:3.3px;">${labels.jummah}</th>
          <th style="border:0.2px solid #aaa;padding:0.4px;font-size:3.3px;">${labels.asr}</th>
          <th style="border:0.2px solid #aaa;padding:0.4px;font-size:3.3px;">${labels.maghrib}</th>
          <th style="border:0.2px solid #aaa;padding:0.4px;font-size:3.3px;">${labels.isha}</th>
        </tr></thead>
        <tbody>`;
    
    days.forEach(d=>{
      const date = d.date.gregorian.day;
      const hijri = d.date.hijri.day;
      const weekday = d.date.gregorian.weekday.en;
      const t = d.timings;
      const fajr = sanitizeTime(t.Fajr);
      const sunrise = sanitizeTime(t.Sunrise);
      const dhuhr = sanitizeTime(t.Dhuhr);
      const asr = sanitizeTime(t.Asr);
      const maghrib = sanitizeTime(t.Maghrib);
      const isha = sanitizeTime(t.Isha);
      const ishraq = addMinutesToTime(sunrise, 20);
      const duhaKubra = subtractMinutesFromTime(dhuhr, 45);
      const jummah = weekday === 'Friday' ? JUMMAH_TIME : '—';
      
      tableHTML += `<tr>
        <td style="border:0.2px solid #aaa;padding:0.4px;text-align:center;">${date}</td>
        <td style="border:0.2px solid #aaa;padding:0.4px;text-align:center;">${hijri}</td>
        <td style="border:0.2px solid #aaa;padding:0.4px;text-align:center;">${fajr}</td>
        <td style="border:0.2px solid #aaa;padding:0.4px;text-align:center;">${sunrise}</td>
        <td style="border:0.2px solid #aaa;padding:0.4px;text-align:center;">${ishraq}</td>
        <td style="border:0.2px solid #aaa;padding:0.4px;text-align:center;">${duhaKubra}</td>
        <td style="border:0.2px solid #aaa;padding:0.4px;text-align:center;">${dhuhr}</td>
        <td style="border:0.2px solid #aaa;padding:0.4px;text-align:center;">${jummah}</td>
        <td style="border:0.2px solid #aaa;padding:0.4px;text-align:center;">${asr}</td>
        <td style="border:0.2px solid #aaa;padding:0.4px;text-align:center;">${maghrib}</td>
        <td style="border:0.2px solid #aaa;padding:0.4px;text-align:center;">${isha}</td>
      </tr>`;
    });
    
    tableHTML += `</tbody></table></div>`;
    monthsHTML += tableHTML;
  }
  
  const moonNote = isUrdu
    ? '<p style="text-align:center;margin-top:1.5px;padding:1px;background:rgba(50,205,50,0.08);border-radius:1px;color:#042204;font-size:3.5px;font-style:italic;font-family:Jameel Noori Nastaleeq;">* نوٹ: حجری تاریخیں چاند دیکھنے کی بنیاد پر تبدیل ہو سکتی ہیں</p>'
    : '<p style="text-align:center;margin-top:1.5px;padding:1px;background:rgba(50,205,50,0.08);border-radius:1px;color:#042204;font-size:3.5px;font-style:italic;">* Note: Dates may vary slightly based on moon sighting</p>';
  
  const html = `
    <div style="padding:2px;font-family:Arial,sans-serif;">
      <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:2px;">
        <img src="/assets/img/logo.png" alt="${mosqueName}" style="width:22px;height:22px;border-radius:3px;">
        <div style="text-align:center;">
          <div style="font-size:8px;font-weight:800;color:#042204;margin:0;line-height:0.95;${isUrdu ? 'font-family:Jameel Noori Nastaleeq;' : ''}">${mosqueName}</div>
          <div style="font-size:6px;color:#666;line-height:0.95;${isUrdu ? 'font-family:Jameel Noori Nastaleeq;' : ''}">${address}</div>
        </div>
      </div>
      <h2 style="text-align:center;margin:1px 0 2px;font-size:7px;line-height:0.95;${isUrdu ? 'font-family:Jameel Noori Nastaleeq;' : ''}">${calendarTitle} - ${year}</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.5px;">
        ${monthsHTML}
      </div>
      ${moonNote}
    </div>
  `;
  
  const opt = {
    margin: [1.5, 1.5, 1.5, 1.5],
    filename: `Mahmood Masjid ${year} Full Year Prayer Calendar.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 3.5, letterRendering: true, useCORS: true },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4', compress: true }
  };
  
  html2pdf().set(opt).from(html).save();
}

function downloadPDF(rows, month, year){
  const isUrdu = document.body.classList.contains('urdu-mode');
  const monthName = new Date(2000,month-1,1).toLocaleString('en-US',{month:'long'});
  const title = isUrdu ? 'نماز کا کیلنڈر' : 'Prayer Times Calendar';
  const mosqueName = isUrdu ? 'محمود مسجد' : 'Mahmood Masjid';
  const address = isUrdu ? 'محمود آباد، گجرات، فتح پور، پنجاب، پاکستان' : 'Mahmood Abad, Gujrat, Fatehpur, Punjab, Pakistan';
  const dateRange = `${monthName} ${year}`;
  const hdr = {
    date: isUrdu ? 'تاریخ' : 'Date',
    hijri: isUrdu ? 'حجری' : 'Hijri',
    fajr: isUrdu ? 'فجر' : 'Fajr',
    sunrise: isUrdu ? 'طلوع آفتاب' : 'Sunrise',
    ishraq: isUrdu ? 'اشراق' : 'Ishraq',
    duha: isUrdu ? 'چاشت کبریٰ' : 'Duha al Kubra',
    dhuhr: isUrdu ? 'ظہر' : 'Dhuhr',
    jummah: isUrdu ? 'جمعہ' : 'Jummah',
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
            <th style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${hdr.jummah}</th>
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
              <td style="border: 1px solid #ddd; padding: 5px; text-align: center; white-space:nowrap;">${r.jummah}</td>
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
    filename: `Mahmood Masjid ${monthName} ${year} namaz calendar.pdf`,
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
