// quran.js - surah metadata (English and Urdu names for all 114 surahs)
// English names are common accepted translations; Urdu names are provided in Arabic script (widely used Urdu names).
const surahMeta = [
  {name: "Al-Fatihah",    english: "The Opening",                   urdu: "الفاتحہ"},
  {name: "Al-Baqarah",    english: "The Cow",                         urdu: "البقرہ"},
  {name: "Aal-i-Imran",   english: "Family of Imran",                urdu: "آلِ عمران"},
  {name: "An-Nisa'",      english: "The Women",                      urdu: "النساء"},
  {name: "Al-Ma'idah",    english: "The Table Spread",               urdu: "المائدہ"},
  {name: "Al-An'am",      english: "The Cattle",                     urdu: "الانعام"},
  {name: "Al-A'raf",      english: "The Heights",                    urdu: "الاعراف"},
  {name: "Al-Anfal",      english: "The Spoils of War",             urdu: "الانفال"},
  {name: "At-Tawbah",     english: "Repentance",                    urdu: "التوبہ"},
  {name: "Yunus",         english: "Jonah",                         urdu: "یونس"},
  {name: "Hud",           english: "Hud",                            urdu: "ہود"},
  {name: "Yusuf",         english: "Joseph",                         urdu: "یوسف"},
  {name: "Ar-Ra'd",       english: "The Thunder",                   urdu: "الرعد"},
  {name: "Ibrahim",       english: "Abraham",                        urdu: "ابراہیم"},
  {name: "Al-Hijr",       english: "The Rocky Tract",               urdu: "الحجر"},
  {name: "An-Nahl",       english: "The Bee",                        urdu: "النحل"},
  {name: "Al-Isra'",      english: "The Night Journey",              urdu: "الاسراء"},
  {name: "Al-Kahf",       english: "The Cave",                       urdu: "الکہف"},
  {name: "Maryam",        english: "Mary",                           urdu: "مریم"},
  {name: "Ta-Ha",         english: "Ta‑Ha",                          urdu: "طٰہٰ"},
  {name: "Al-Anbiya'",    english: "The Prophets",                   urdu: "الانبیاء"},
  {name: "Al-Hajj",       english: "The Pilgrimage",                urdu: "الحج"},
  {name: "Al-Mu'minun",   english: "The Believers",                 urdu: "المؤمنون"},
  {name: "An-Nur",        english: "The Light",                      urdu: "النور"},
  {name: "Al-Furqan",     english: "The Criterion",                 urdu: "الفرقان"},
  {name: "Ash-Shu'ara'",  english: "The Poets",                     urdu: "الشعراء"},
  {name: "An-Naml",       english: "The Ant",                        urdu: "النمل"},
  {name: "Al-Qasas",      english: "The Stories",                    urdu: "القصص"},
  {name: "Al-Ankabut",    english: "The Spider",                     urdu: "العنکبوت"},
  {name: "Ar-Rum",        english: "The Romans",                     urdu: "الروم"},
  {name: "Luqman",        english: "Luqman",                         urdu: "لقمان"},
  {name: "As-Sajdah",     english: "The Prostration",               urdu: "السجدہ"},
  {name: "Al-Ahzab",      english: "The Combined Forces",           urdu: "الاحزاب"},
  {name: "Saba'",         english: "Sheba",                          urdu: "سبا"},
  {name: "Fatir",         english: "Originator",                     urdu: "فاطر"},
  {name: "Ya-Sin",        english: "Ya‑Sin",                         urdu: "یٰسٓ"},
  {name: "As-Saffat",     english: "Those Who Set the Ranks",       urdu: "الصافات"},
  {name: "Sad",           english: "The Letter Sad",                urdu: "ص"},
  {name: "Az-Zumar",      english: "Groups",                         urdu: "الزمر"},
  {name: "Ghafir",        english: "The Forgiver",                  urdu: "غافر"},
  {name: "Fussilat",      english: "Explained in Detail",           urdu: "فصلت"},
  {name: "Ash-Shura",     english: "Consultation",                  urdu: "الشورٰی"},
  {name: "Az-Zukhruf",    english: "Ornaments of Gold",             urdu: "الزخرف"},
  {name: "Ad-Dukhan",     english: "The Smoke",                     urdu: "الدخان"},
  {name: "Al-Jathiyah",   english: "Crouching",                     urdu: "الجاثیہ"},
  {name: "Al-Ahqaf",      english: "The Wind‑Curved Sandhills",     urdu: "الاحقاف"},
  {name: "Muhammad",      english: "Muhammad",                       urdu: "محمد"},
  {name: "Al-Fath",       english: "The Victory",                   urdu: "الفتح"},
  {name: "Al-Hujurat",    english: "The Rooms",                      urdu: "الحجرات"},
  {name: "Qaf",           english: "The Letter Qaf",                urdu: "ق"},
  {name: "Adh-Dhariyat",  english: "The Winnowing Winds",           urdu: "الذاریات"},
  {name: "At-Tur",        english: "The Mount",                      urdu: "الطور"},
  {name: "An-Najm",       english: "The Star",                       urdu: "النجم"},
  {name: "Al-Qamar",      english: "The Moon",                       urdu: "القمَر"},
  {name: "Ar-Rahman",     english: "The Beneficent",                urdu: "الرحمن"},
  {name: "Al-Waqi'ah",    english: "The Inevitable",                urdu: "الواقعہ"},
  {name: "Al-Hadid",      english: "The Iron",                       urdu: "الحدید"},
  {name: "Al-Mujadila",   english: "She Who Disputes",              urdu: "المجادلہ"},
  {name: "Al-Hashr",      english: "The Exile",                      urdu: "الحشر"},
  {name: "Al-Mumtahanah", english: "Examined One",                  urdu: "الممتحنہ"},
  {name: "As-Saff",       english: "The Ranks",                      urdu: "الصف"},
  {name: "Al-Jumu'ah",    english: "Friday",                         urdu: "الجمعة"},
  {name: "Al-Munafiqun",  english: "The Hypocrites",                 urdu: "المنافقون"},
  {name: "At-Taghabun",   english: "Mutual Disillusion",            urdu: "التغابن"},
  {name: "At-Talaq",      english: "Divorce",                        urdu: "الطلاق"},
  {name: "At-Tahrim",     english: "Prohibition",                   urdu: "التحریم"},
  {name: "Al-Mulk",       english: "The Sovereignty",               urdu: "الملك"},
  {name: "Al-Qalam",      english: "The Pen",                        urdu: "القلم"},
  {name: "Al-Haqqah",     english: "The Reality",                    urdu: "الحاقة"},
  {name: "Al-Ma'arij",    english: "The Ascending Stairways",       urdu: "المعارج"},
  {name: "Nuh",           english: "Noah",                           urdu: "نوح"},
  {name: "Al-Jinn",       english: "The Jinn",                       urdu: "الجن"},
  {name: "Al-Muzzammil",  english: "The Enshrouded One",            urdu: "المزمّل"},
  {name: "Al-Muddaththir",english: "The Cloaked One",               urdu: "المدثر"},
  {name: "Al-Qiyamah",    english: "The Resurrection",              urdu: "القیٰمۃ"},
  {name: "Al-Insan",      english: "Man",                            urdu: "الانسان"},
  {name: "Al-Mursalat",   english: "Those Sent Forth",              urdu: "المرسلات"},
  {name: "An-Naba'",      english: "The Tidings",                   urdu: "النبأ"},
  {name: "An-Nazi'at",    english: "Those Who Pull Out",            urdu: "النازعٰت"},
  {name: "Abasa",         english: "He Frowned",                     urdu: "عبس"},
  {name: "At-Takwir",     english: "Overthrowing",                   urdu: "التکویر"},
  {name: "Al-Infitar",    english: "The Cleaving",                   urdu: "الانفطار"},
  {name: "Al-Mutaffifin", english: "Defrauding",                    urdu: "المطفّفین"},
  {name: "Al-Inshiqaq",   english: "Splitting Open",                 urdu: "الانشقاق"},
  {name: "Al-Buruj",      english: "The Mansions of the Stars",      urdu: "البروج"},
  {name: "At-Tariq",      english: "The Morning Star",               urdu: "الطارق"},
  {name: "Al-A'la",       english: "The Most High",                  urdu: "الاعلی"},
  {name: "Al-Ghashiyah",  english: "The Overwhelming",              urdu: "الغاشیہ"},
  {name: "Al-Fajr",       english: "The Dawn",                       urdu: "الفجر"},
  {name: "Al-Balad",      english: "The City",                       urdu: "البلد"},
  {name: "Ash-Shams",     english: "The Sun",                        urdu: "الشمس"},
  {name: "Al-Layl",       english: "The Night",                      urdu: "اللیل"},
  {name: "Ad-Duha",       english: "The Morning Hours",              urdu: "الضحی"},
  {name: "Ash-Sharh",     english: "The Relief",                     urdu: "الشرح"},
  {name: "At-Tin",        english: "The Fig",                        urdu: "التین"},
  {name: "Al-Alaq",       english: "The Clot",                       urdu: "العلق"},
  {name: "Al-Qadr",       english: "The Power",                      urdu: "القدر"},
  {name: "Al-Bayyinah",   english: "The Clear Proof",                urdu: "البیّنہ"},
  {name: "Az-Zalzalah",   english: "The Earthquake",                 urdu: "الزلزلہ"},
  {name: "Al-Adiyat",     english: "The Chargers",                   urdu: "العادیات"},
  {name: "Al-Qari'ah",    english: "The Calamity",                   urdu: "القارعة"},
  {name: "At-Takathur",   english: "Rivalry in world increase",      urdu: "التکاثر"},
  {name: "Al-Asr",        english: "The Declining Day",              urdu: "العصر"},
  {name: "Al-Humazah",    english: "The Traducer",                   urdu: "الهمزہ"},
  {name: "Al-Fil",        english: "The Elephant",                   urdu: "الفیل"},
  {name: "Quraysh",       english: "Quraysh",                        urdu: "قریش"},
  {name: "Al-Ma'un",      english: "Small Kindnesses",               urdu: "الماعون"},
  {name: "Al-Kawthar",    english: "Abundance",                      urdu: "الکوثر"},
  {name: "Al-Kafirun",    english: "The Disbelievers",               urdu: "الکافرون"},
  {name: "An-Nasr",       english: "Divine Support",                 urdu: "النصر"},
  {name: "Al-Masad",      english: "Palm Fiber",                     urdu: "المسد"},
  {name: "Al-Ikhlas",     english: "Sincerity",                      urdu: "الاخلاص"},
  {name: "Al-Falaq",      english: "The Daybreak",                   urdu: "الفلق"},
  {name: "An-Nas",        english: "Mankind",                        urdu: "الناس"}
];

// Strict Arabic names (without relying on Urdu-script field)
const surahArabic = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
  "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
  "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
  "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
  "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
  "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
  "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
  "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
  "التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
  "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
  "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
  "المسد","الإخلاص","الفلق","الناس"
];

const listEl = document.getElementById('surah-list');
const contentEl = document.getElementById('surah-content');
const searchEl = document.getElementById('surah-search');
const selectEl = document.getElementById('surah-select');
// Indo‑Pak toggle removed from markup — page defaults to Indo‑Pak style
const clearBtn = document.getElementById('search-clear');
const statusEl = document.getElementById('quran-status');
// Tajweed toggle removed; plain rendering only

let currentActive = null;
// Indo‑Pak text source (optional): when available, verses will be rendered from this dataset
let indoPakData = null; // { surahNumber: [ { ayah: number, text: string }, ... ] }
let indoPakLoading = null;
const INDO_PAK_VERSION = '9.6.1';

// Configure an optional source URL for Indo‑Pak text (raw GitHub or local JSON)
// You can set window.IndopakSource = { type: 'txt', url: 'https://.../Indopak.v.9.6-Madinah-Ayah%20by%20Ayah%20with%20Ayah%20Numbers.txt' }
// or window.IndopakSource = { type: 'json', url: '/assets/data/indopak.json' }
const defaultIndoPakSource = {
  type: 'txt',
  url: 'https://raw.githubusercontent.com/junnunkarim/backup__indopak_quran_text/master/Data/Madinah%20Version%20v.9.6.1/Ayah%20by%20Ayah/Indopak.v.9.6-Madinah-Ayah%20by%20Ayah%20with%20Ayah%20Numbers.txt'
};

async function ensureIndoPakLoaded(){
  if(indoPakData) return indoPakData;
  if(indoPakLoading) return indoPakLoading;
  const src = window.IndopakSource || defaultIndoPakSource;
  // Try cache first
  try{
    const cacheKey = `IndoPakCache::${src.url}::${INDO_PAK_VERSION}`;
    const cached = localStorage.getItem(cacheKey);
    if(cached){
      const parsed = JSON.parse(cached);
      if(parsed && typeof parsed === 'object'){
        indoPakData = parsed;
        return indoPakData;
      }
    }
  }catch(e){/* ignore cache errors */}
  indoPakLoading = (async()=>{
    try{
      setStatus('Loading Indo‑Pak text…', 'loading');
      const res = await fetch(src.url, { cache: 'no-store' });
      if(!res.ok) throw new Error('Indo‑Pak source not reachable');
      if(src.type === 'json'){
        const json = await res.json();
        // Expect { surahs: [ { number, ayahs: ["text", ...] } ] } or { "1": ["..."], "2": ["..."] }
        const map = {};
        if(Array.isArray(json.surahs)){
          json.surahs.forEach(s=>{ map[Number(s.number)] = (s.ayahs||[]).map((t, idx)=>({ ayah: idx+1, text: String(t) })) });
        }else{
          Object.keys(json).forEach(k=>{ const arr = json[k]; if(Array.isArray(arr)) map[Number(k)] = arr.map((t, idx)=>({ ayah: idx+1, text: String(t) })); });
        }
        indoPakData = map;
      }else{
        const txt = await res.text();
        const lines = txt.split(/\r?\n/);
        const map = {};
        const re = /^(\d+):(\d+)\s+(.+)$/;
        for(const line of lines){
          const m = re.exec(line.trim());
          if(!m) continue;
          const s = Number(m[1]);
          const a = Number(m[2]);
          const t = m[3];
          if(!map[s]) map[s] = [];
          map[s].push({ ayah: a, text: t });
        }
        indoPakData = map;
      }
      // Save to cache
      try{
        const cacheKey = `IndoPakCache::${src.url}::${INDO_PAK_VERSION}`;
        localStorage.setItem(cacheKey, JSON.stringify(indoPakData));
      }catch(e){/* ignore cache errors */}
      setStatus('Indo‑Pak text loaded.', 'info', 1400);
      return indoPakData;
    }catch(e){
      console.warn('Indo‑Pak text load failed:', e);
      indoPakData = null;
      setStatus('Indo‑Pak source unavailable — falling back to Uthmani.', 'error');
      return null;
    }
  })();
  return indoPakLoading;
}

// Remove private-use glyphs and stray placeholders that may render as empty boxes
function sanitizeAyahText(t){
  if(!t) return t;
  // Strip Private Use Area characters (commonly used for custom ayah markers in some fonts)
  let out = String(t).replace(/[\uE000-\uF8FF]/g, '');
  // Remove trailing whitespace
  out = out.replace(/\s+$/, '');
  return out;
}

// Tajweed colorization removed

function populateSelect(){
  selectEl.innerHTML = '';
  surahMeta.forEach((m, idx)=>{
    const i = idx+1;
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${i}. ${m.name} ${m.english ? '— ' + m.english : ''}${m.urdu ? ' / ' + m.urdu : ''}`;
    selectEl.appendChild(opt);
  });
}

function renderList(filter=''){
  listEl.innerHTML = '';
  let found = 0;
  surahMeta.forEach((m, idx)=>{
    const i = idx+1;
    const label = `${i}. ${m.name} ${m.english || ''} ${m.urdu || ''}`;
    if(filter && !label.toLowerCase().includes(filter.toLowerCase())) return;
    found++;
    const el = document.createElement('div');
    el.className = 'surah-item';
    el.tabIndex = 0;
    el.dataset.idx = i;
    const arabicName = surahArabic[i-1] || m.urdu || m.name;
    el.innerHTML = `<span class=\"idx\">${i}</span>
      <div class=\"surah-meta\">
        <div class=\"name-line\">
          <span class=\"name-arabic\" dir=\"rtl\" lang=\"ar\">${arabicName}</span>
          <span class=\"sep\">•</span>
          <span class=\"name-roman\">${m.name}</span>
        </div>
        <div class=\"translation-line\">
          ${m.english ? `<span class=\"trans-en\">${m.english}</span>` : ''}
          ${m.english && m.urdu ? `<span class=\"sep\">•</span>` : ''}
          ${m.urdu ? `<span class=\"trans-urdu\" dir=\"rtl\" lang=\"ur\">${m.urdu}</span>` : ''}
        </div>
      </div>`;
    el.addEventListener('click', ()=> loadSurah(i));
    el.addEventListener('keypress', (e)=>{ if(e.key === 'Enter') loadSurah(i); });
    listEl.appendChild(el);
  });
  if(!found){
    listEl.innerHTML = '<div class="no-results">No surah matches your search.</div>';
  }
  // restore active highlight if any
  if(currentActive) highlightActive(currentActive);
}

function highlightActive(i){
  currentActive = i;
  document.querySelectorAll('.surah-item').forEach(el=> el.classList.remove('active'));
  const el = document.querySelector(`.surah-item[data-idx="${i}"]`);
  if(el){ el.classList.add('active'); el.scrollIntoView({behavior:'smooth', block:'center', inline:'nearest'}); }
  try{ selectEl.value = String(i); }catch(e){}
}

function stripDiacritics(str){
  if(!str) return str;
  // Preserve essential recitation marks: shadda (U+0651), sukun (U+0652), maddah (U+0653), small high hamza (U+0654) and superscript alef (U+0670)
  const preserve = new Set(['\u0651','\u0652','\u0653','\u0654','\u0670']);
  // Remove tatweel (kashida)
  let out = String(str).replace(/\u0640/g,'');
  // Remove combining marks (Unicode category "M") except those we explicitly preserve.
  // This approach preserves other visible symbols used in Qur'anic text (waqf signs, sajdah markers, rub el hizb etc.)
  try{
    out = out.replace(/\p{M}/gu, (m) => preserve.has(m) ? m : '');
  }catch(e){
    // Fallback: if Unicode property escapes aren't supported, use a conservative regex removing common tashkeel ranges but keep preserve set
    out = out.split('').filter(ch=>{
      if(preserve.has(ch)) return true;
      const code = ch.charCodeAt(0);
      if((code>=0x0610 && code<=0x061A) || (code>=0x064B && code<=0x065F) || (code>=0x06D6 && code<=0x06ED) || (code>=0x08D4 && code<=0x08E1)) return false;
      return true;
    }).join('');
  }
  return out.trim();
}

async function loadSurah(number){
  contentEl.innerHTML = `<p>Loading Surah ${number}...</p>`;
  setStatus(`Loading Surah ${number}…`, 'loading');
  try{
    // Prefer Indo‑Pak source when available
    const indo = await ensureIndoPakLoaded();
    const meta = surahMeta[number-1] || {};
    let html = `<div class="surah-divider"><span class="divider-mark">✦</span></div>`;
    if(indo && indo[number]){
      const ayahs = indo[number];
      const titleName = meta.name || `Surah ${number}`;
      html += `<h2 class="surah-title">${titleName} <small>(${ayahs.length} ayahs)</small></h2>`;
      
      // Add audio player for Surah Yasin (36) - Qari Abdul Basit
      if(number === 36){
        html += `<div class="audio-player-container">
          <div class="audio-player-header">
            <svg class="audio-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13M9 18c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm12-3c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/>
            </svg>
            <img class="reciter-avatar" src="assets/img/qari-abdul-basit.svg" alt="Qari Abdul Basit"/>
            <span class="audio-player-title">Recitation by Qari Abdul Basit</span>
          </div>
          <audio id="yasin-audio" controls preload="metadata" style="width: 100%; margin: 10px 0;">
            <source src="assets/img/Surah-Yaseen-Tilawat-Beautiful-Quran-Recitation-by-Qari-Abdul-Basit-Full-HD-128.mp3" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
          <button class="btn download-audio" onclick="downloadYasinAudio()" style="margin-top: 10px;">
            <svg style="width: 20px; height: 20px; margin-right: 5px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Download Audio
          </button>
        </div>`;
      }
      
      // Visual Bismillah for surahs except 9
      if(number !== 9){ html += '<div class="bismillah">بسم الله الرحمن الرحيم</div>'; }
      html += '<div class="ayahs">';
      // Display ayahs in blocks of 16 for mushaf-style layout
      const blockSize = 16;
      for(let i = 0; i < ayahs.length; i += blockSize){
        let ayahText = '';
        const blockEnd = Math.min(i + blockSize, ayahs.length);
        for(let j = i; j < blockEnd; j++){
          const a = ayahs[j];
          const cleaned = sanitizeAyahText(a.text);
          ayahText += `${cleaned}<span class="aya-num-inline">${a.ayah}</span>`;
        }
        html += `<p class="arab-text">${ayahText}</p>`;
      }
      html += '</div>';
      contentEl.innerHTML = html;
      contentEl.scrollTop = 0;
      highlightActive(number);
      clearStatus();
      return;
    }

    // Fallback: Uthmani API
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`);
    const json = await res.json();
    if(json.status !== 'OK'){ throw new Error('API error'); }
    const data = json.data;
    let title = `${data.name}`;
    if(meta.english && meta.urdu){
      title = `${meta.english} / ${meta.urdu} — ${data.name}`;
    } else if(meta.english){
      title = `${meta.english} — ${data.name}`;
    } else if(meta.urdu){
      title = `${meta.urdu} — ${data.name}`;
    }
    html += `<h2 class="surah-title">${title} <small>(${data.numberOfAyahs} ayahs)</small></h2>`;
    
    // Add audio player for Surah Yasin (36) - Qari Abdul Basit
    if(number === 36){
      html += `<div class="audio-player-container">
        <div class="audio-player-header">
          <svg class="audio-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13M9 18c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/>
          </svg>
          <img class="reciter-avatar" src="assets/img/qari-abdul-basit.svg" alt="Qari Abdul Basit"/>
          <span class="audio-player-title">Recitation by Qari Abdul Basit</span>
        </div>
        <audio id="yasin-audio" controls preload="metadata" style="width: 100%; margin: 10px 0;">
          <source src="assets/img/Surah-Yaseen-Tilawat-Beautiful-Quran-Recitation-by-Qari-Abdul-Basit-Full-HD-128.mp3" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
        <button class="btn download-audio" onclick="downloadYasinAudio()" style="margin-top: 10px;">
          <svg style="width: 20px; height: 20px; margin-right: 5px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Download Audio
        </button>
      </div>`;
    }
    
    const hasBismillah = data.number !== 9;
    if(hasBismillah){ html += '<div class="bismillah">بسم الله الرحمن الرحيم</div>'; }
    html += '<div class="ayahs">';
    // Display ayahs in blocks of 16 for mushaf-style layout
    const blockSize = 16;
    const offset = hasBismillah ? 1 : 0;
    const filteredAyahs = data.ayahs.filter(a => !(hasBismillah && a.numberInSurah === 1));
    for(let i = 0; i < filteredAyahs.length; i += blockSize){
      let ayahText = '';
      const blockEnd = Math.min(i + blockSize, filteredAyahs.length);
      for(let j = i; j < blockEnd; j++){
        const a = filteredAyahs[j];
        const ayahNum = a.numberInSurah - offset;
        const cleaned = sanitizeAyahText(a.text);
        ayahText += `${cleaned}<span class="aya-num-inline">${ayahNum}</span>`;
      }
      html += `<p class="arab-text">${ayahText}</p>`;
    }
    html += '</div>';
    contentEl.innerHTML = html;
    contentEl.scrollTop = 0;
    highlightActive(number);
    clearStatus();
  }catch(err){
    console.error('Quran load error',err);
    contentEl.innerHTML = '<p>Error loading surah. Try again later.</p>';
    setStatus('Error loading surah. Try again later.', 'error');
  }
} 

// Indo-Pak mode enabled by default (harakat marks are preserved)
function setIndoPak(on){
  if(on) contentEl.classList.add('indo-pak'); else contentEl.classList.remove('indo-pak');
  try{ localStorage.setItem('quranIndo', on ? '1' : '0'); }catch(e){}
}
// Force Indo‑Pak as the only mode
setIndoPak(true);

function handleSearch(value){
  renderList(value);
  // On mobile, also filter the select dropdown
  if(window.innerWidth <= 800){
    const matchedSurahs = [];
    selectEl.innerHTML = '';
    surahMeta.forEach((m, idx)=>{
      const i = idx+1;
      const label = `${i}. ${m.name} ${m.english || ''} ${m.urdu || ''}`;
      if(value && !label.toLowerCase().includes(value.toLowerCase())) return;
      matchedSurahs.push(i);
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i}. ${m.name} ${m.english ? '— ' + m.english : ''}${m.urdu ? ' / ' + m.urdu : ''}`;
      selectEl.appendChild(opt);
    });
    // Auto-load surah if only one match
    if(matchedSurahs.length === 1){
      loadSurah(matchedSurahs[0]);
    }
  } else {
    // On desktop, auto-load when only one result matches
    let matchedCount = 0;
    let matchedIdx = 0;
    surahMeta.forEach((m, idx)=>{
      const i = idx+1;
      const label = `${i}. ${m.name} ${m.english || ''} ${m.urdu || ''}`;
      if(!value || label.toLowerCase().includes(value.toLowerCase())){
        matchedCount++;
        matchedIdx = i;
      }
    });
    if(matchedCount === 1 && value){
      loadSurah(matchedIdx);
    }
  }
}

searchEl && searchEl.addEventListener('input', (e)=> handleSearch(e.target.value));
clearBtn && clearBtn.addEventListener('click', ()=>{ searchEl.value=''; handleSearch(''); searchEl.focus(); });
populateSelect();
renderList();
selectEl && selectEl.addEventListener('change', (e)=> loadSurah(Number(e.target.value)));

// Status helpers
function setStatus(msg, type='info', autoHideMs){
  if(!statusEl) return;
  statusEl.textContent = msg;
  statusEl.hidden = false;
  statusEl.classList.remove('is-loading','is-error');
  if(type==='loading') statusEl.classList.add('is-loading');
  else if(type==='error') statusEl.classList.add('is-error');
  if(autoHideMs){
    setTimeout(()=>{ clearStatus(); }, autoHideMs);
  }
}
function clearStatus(){ if(!statusEl) return; statusEl.hidden = true; statusEl.textContent = ''; statusEl.classList.remove('is-loading','is-error'); }

// Download audio function for Surah Yasin
function downloadYasinAudio(){
  const audioUrl = 'assets/img/Surah-Yaseen-Tilawat-Beautiful-Quran-Recitation-by-Qari-Abdul-Basit-Full-HD-128.mp3';
  const link = document.createElement('a');
  link.href = audioUrl;
  link.download = 'Surah-Yasin-Abdul-Basit.mp3';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Tajweed toggle removed; no persistence needed

