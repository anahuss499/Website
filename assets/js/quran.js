// quran.js - list of 114 surah names & simple UI
const surahNames = [
  "Al-Fatihah","Al-Baqarah","Aal-i-Imran","An-Nisa'","Al-Ma'idah","Al-An'am","Al-A'raf","Al-Anfal","At-Tawbah","Yunus",
  "Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr","An-Nahl","Al-Isra'","Al-Kahf","Maryam","Ta-Ha",
  "Al-Anbiya'","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Ash-Shu'ara'","An-Naml","Al-Qasas","Al-Ankabut","Ar-Rum",
  "Luqman","As-Sajdah","Al-Ahzab","Saba'","Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir",
  "Fussilat","Ash-Shura","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah","Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf",
  "Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'ah","Al-Hadid","Al-Mujadila","Al-Hashr","Al-Mumtahanah",
  "As-Saff","Al-Jumu'ah","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim","Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij",
  "Nuh","Al-Jinn","Al-Muzzammil","Al-Muddaththir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba'","An-Nazi'at","Abasa",
  "At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq","Al-Buruj","At-Tariq","Al-A'la","Al-Ghashiyah","Al-Fajr","Al-Balad",
  "Ash-Shams","Al-Layl","Ad-Duha","Ash-Sharh","At-Tin","Al-Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-Adiyat",
  "Al-Qari'ah","At-Takathur","Al-Asr","Al-Humazah","Al-Fil","Quraysh","Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr",
  "Al-Masad","Al-Ikhlas","Al-Falaq","An-Nas"
];

const listEl = document.getElementById('surah-list');
const contentEl = document.getElementById('surah-content');
const searchEl = document.getElementById('surah-search');
const selectEl = document.getElementById('surah-select');
const indoToggle = document.getElementById('indo-toggle');

function populateSelect(){
  selectEl.innerHTML = '';
  surahNames.forEach((name, idx)=>{
    const i = idx+1;
    const opt = document.createElement('option');
    opt.value = i; opt.textContent = `${i}. ${name}`;
    selectEl.appendChild(opt);
  });
}

function renderList(filter=''){
  listEl.innerHTML = '';
  surahNames.forEach((name, idx)=>{
    const i = idx+1;
    const label = `${i}. ${name}`;
    if(filter && !label.toLowerCase().includes(filter.toLowerCase())) return;
    const el = document.createElement('div');
    el.className = 'surah-item';
    el.tabIndex = 0;
    el.innerHTML = `<span class="idx">${i}</span> <span class="name">${name}</span>`;
    el.addEventListener('click', ()=> loadSurah(i));
    el.addEventListener('keypress', (e)=>{ if(e.key === 'Enter') loadSurah(i); });
    listEl.appendChild(el);
  });
}

async function loadSurah(number){
  contentEl.innerHTML = `<p>Loading Surah ${number}...</p>`;
  try{
    // Fetch Uthmani edition for Arabic text
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`);
    const json = await res.json();
    if(json.status !== 'OK'){ throw new Error('API error'); }
    const data = json.data;
    // Build HTML
    let html = `<h2>${data.englishName} — ${data.name} <small>(${data.numberOfAyahs} ayahs)</small></h2>`;
    html += '<div class="ayahs">';
    data.ayahs.forEach(a=>{
      html += `<p class="ayah"><span class="aya-num">(${a.numberInSurah})</span> <span class="arab">${a.text}</span></p>`;
    });
    html += '</div>';
    contentEl.innerHTML = html;
    contentEl.scrollTop = 0;
  }catch(err){
    console.error('Quran API error',err);
    contentEl.innerHTML = '<p>Error loading surah. Try again later.</p>';
  }
}

searchEl.addEventListener('input', (e)=> renderList(e.target.value));
renderList();

