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

const listEl = document.getElementById('surah-list');
const contentEl = document.getElementById('surah-content');
const searchEl = document.getElementById('surah-search');
const selectEl = document.getElementById('surah-select');
// Indo‑Pak toggle removed from markup — page defaults to Indo‑Pak style
const clearBtn = document.getElementById('search-clear');

let currentActive = null;

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
    el.innerHTML = `<span class="idx">${i}</span><div class="surah-meta"><span class="name">${m.name}</span><small class="names">${m.english || ''}${m.urdu ? ' • ' + m.urdu : ''}</small></div>`;
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
  try{
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`);
    const json = await res.json();
    if(json.status !== 'OK'){ throw new Error('API error'); }
    const data = json.data;
    // find metadata if available
    const meta = surahMeta[number-1] || {};
    let title = `${data.name}`;
    if(meta.english) title = `${meta.english} — ${data.name}`;
    if(meta.urdu) title += ` <small>• ${meta.urdu}</small>`;
    let html = `<h2 class="surah-title">${title} <small>(${data.numberOfAyahs} ayahs)</small></h2>`;
    html += '<div class="ayahs">';
    data.ayahs.forEach(a=>{
      const clean = stripDiacritics(a.text);
      html += `<p class="ayah"><span class="aya-num">(${a.numberInSurah})</span> <span class="arab">${clean}</span></p>`;
    });
    html += '</div>';
    contentEl.innerHTML = html;
    contentEl.scrollTop = 0;
    highlightActive(number);
  }catch(err){
    console.error('Quran API error',err);
    contentEl.innerHTML = '<p>Error loading surah. Try again later.</p>';
  }
} 

// Indo-Pak mode (default only)
function setIndoPak(on){
  if(on) contentEl.classList.add('indo-pak'); else contentEl.classList.remove('indo-pak');
  try{ localStorage.setItem('quranIndo', on ? '1' : '0'); }catch(e){}
}
// Force Indo‑Pak as the only mode
setIndoPak(true);

searchEl && searchEl.addEventListener('input', (e)=> renderList(e.target.value));
clearBtn && clearBtn.addEventListener('click', ()=>{ searchEl.value=''; renderList(''); searchEl.focus(); });
populateSelect();
renderList();
selectEl && selectEl.addEventListener('change', (e)=> loadSurah(Number(e.target.value)));

