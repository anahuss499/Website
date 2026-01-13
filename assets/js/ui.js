// ui.js - mobile nav toggle, small UI helpers, and logo modal
(function(){
  const body = document.body;
  const toggle = document.querySelectorAll('.nav-toggle');
  // compact menu removed
  const breakpoint = 800;
  
  // Lightweight perf tweaks: lazy-load images, async decode
  function optimizeMedia(){
    try{
      document.querySelectorAll('img').forEach(img=>{
        if(!img.classList.contains('brand-logo')){
          if(!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
        }else{
          img.setAttribute('loading','eager');
          img.setAttribute('fetchpriority','high');
          img.setAttribute('decoding','async');
        }
        if(!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
      });
      document.querySelectorAll('iframe').forEach(f=>{
        if(!f.hasAttribute('loading')) f.setAttribute('loading','lazy');
      });
    }catch(e){}
  }
  
  // Language selection modal on first visit
  function initLanguageModal(){
    const langModalOverlay = document.getElementById('lang-modal-overlay');
    if(!langModalOverlay) return; // Only on pages with the modal
    
    try{
      const langSelected = localStorage.getItem('lang');
      if(!langSelected){
        // First visit - show language modal
        setTimeout(()=>{
          langModalOverlay.classList.add('show');
        }, 300);
      } else {
        // Already selected - apply saved language
        setLanguage(langSelected === 'urdu');
      }
    } catch(e){
      // If localStorage fails, default to English
      setLanguage(false);
    }
    
    // Handle language button clicks
    const langButtons = langModalOverlay.querySelectorAll('.lang-btn');
    langButtons.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const lang = btn.getAttribute('data-lang');
        const isUrdu = lang === 'urdu';
        setLanguage(isUrdu);
        try{
          localStorage.setItem('lang', isUrdu ? 'urdu' : 'en');
        } catch(e){}
        langModalOverlay.classList.remove('show');
        setTimeout(()=>{
          langModalOverlay.style.display = 'none';
        }, 400);
      });
    });
  }
  
  // Initialize on page load
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ initLanguageModal(); optimizeMedia(); });
  } else {
    initLanguageModal();
    optimizeMedia();
  }
  
  function setOpen(btn, open){
    btn.setAttribute('aria-expanded', String(open));
    if(open) body.classList.add('nav-open'); else body.classList.remove('nav-open');
  }
  function closeSideMenuIfOpen(){
    const sideMenu = document.getElementById('side-menu');
    if(sideMenu && sideMenu.classList.contains('open')){
      sideMenu.classList.remove('open');
    }
  }
  toggle.forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      e.preventDefault();
      // Toggle side menu instead of old dropdown
      const sideMenu = document.getElementById('side-menu');
      if(sideMenu){
        sideMenu.classList.toggle('open');
        btn.setAttribute('aria-expanded', sideMenu.classList.contains('open'));
      }
    });
  });

  // compact mode removed

  // no compact toggle listeners

  // initialize compact from localStorage
  // ignore legacy navCompact; always show labels

  // close nav on escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      if(body.classList.contains('nav-open')){
        body.classList.remove('nav-open');
        document.querySelectorAll('.nav-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));
      }
      closeSideMenuIfOpen();
    }
  });
  // close nav on resize > breakpoint
  window.addEventListener('resize', ()=>{
    if(window.innerWidth > breakpoint && body.classList.contains('nav-open')){
      body.classList.remove('nav-open');
      document.querySelectorAll('.nav-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));
    }
  });

  // Swipe gesture detection for menu (installed app only)
  function isInstalledApp(){
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  if(isInstalledApp()){
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 100; // pixels

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, false);

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      
      // Swiped left (close menu)
      if(diff > swipeThreshold && body.classList.contains('nav-open')){
        body.classList.remove('nav-open');
        document.querySelectorAll('.nav-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));
      }
      
      // Swiped right (open menu) - only if nav-open is not already open
      if(diff < -swipeThreshold && !body.classList.contains('nav-open')){
        body.classList.add('nav-open');
        document.querySelectorAll('.nav-toggle').forEach(b=>b.setAttribute('aria-expanded','true'));
      }
    }
  }

  // Logo modal support
  let logoModal = null;
  function createLogoModal(){
    if(logoModal) return logoModal;
    const overlay = document.createElement('div');
    overlay.className = 'logo-modal-overlay';
    overlay.innerHTML = `<div class="logo-modal" role="dialog" aria-modal="true" aria-label="Logo preview">
      <img src="" alt="Mahmood Masjid logo preview">
      <button class="logo-close" aria-label="Close logo preview">Close</button>
    </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (ev)=>{
      if(ev.target === overlay) closeLogoModal();
    });
    const closeBtn = overlay.querySelector('.logo-close');
    closeBtn.addEventListener('click', closeLogoModal);
    // keyboard
    overlay.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') closeLogoModal();
    });
    logoModal = overlay;
    return logoModal;
  }

  function openLogoModal(src, alt){
    const modal = createLogoModal();
    const img = modal.querySelector('img');
    img.src = src;
    img.alt = alt || 'Mahmood Masjid logo preview';
    modal.classList.add('open');
    setTimeout(()=> modal.classList.add('visible'), 20);
    modal.classList.add('open');
    // focus close button for accessibility
    const closeBtn = modal.querySelector('.logo-close');
    closeBtn.focus();
  }
  function closeLogoModal(){
    if(!logoModal) return;
    logoModal.classList.remove('open');
    setTimeout(()=>{
      if(logoModal) logoModal.remove();
      logoModal = null;
    }, 180);
  }

  // click handler on logo image (and keyboard on brand)
  document.addEventListener('click', (e)=>{
    const logo = e.target.closest('.brand-logo');
    if(logo){
      e.preventDefault();
      openLogoModal(logo.getAttribute('src'), logo.getAttribute('alt'));
    }
  });
  // keyboard: Enter or Space on focused .brand-logo (or focused brand link)
  document.addEventListener('keydown', (e)=>{
    const active = document.activeElement;
    if(active && active.classList && active.classList.contains('brand-logo')){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        openLogoModal(active.getAttribute('src'), active.getAttribute('alt'));
      }
    }
  });

  // smooth scroll for internal links
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a');
    if(!a) return;
    const href = a.getAttribute('href');
    if(href && href.startsWith('#')){
      e.preventDefault();
      const el = document.querySelector(href);
      if(el) el.scrollIntoView({behavior:'smooth'});
    }
  });

  // Language toggle functionality
  function setLanguage(urdu){
    const applyText = (selector, attr)=>{
      document.querySelectorAll(selector).forEach(el=>{
        const val = el.getAttribute(attr);
        if(val !== null) el.textContent = val;
      });
    };
    const applyHTML = (selector, attr)=>{
      document.querySelectorAll(selector).forEach(el=>{
        const val = el.getAttribute(attr);
        if(val !== null) el.innerHTML = val;
      });
    };
    const applyPlaceholder = (selector, attr)=>{
      document.querySelectorAll(selector).forEach(el=>{
        const val = el.getAttribute(attr);
        if(val !== null) el.setAttribute('placeholder', val);
      });
    };

    if(urdu){
      body.classList.add('urdu-mode');
      applyText('[data-urdu]', 'data-urdu');
      applyHTML('[data-urdu-html]', 'data-urdu-html');
      applyPlaceholder('[data-urdu-placeholder]', 'data-urdu-placeholder');
      // Update language toggle button to show opposite language
      const langText = document.querySelector('.lang-text');
      if(langText) langText.textContent = 'EN';
      // Update next prayer name if available
      updateNextPrayerName();
    } else {
      body.classList.remove('urdu-mode');
      applyText('[data-urdu]', 'data-en');
      applyHTML('[data-urdu-html]', 'data-en-html');
      applyPlaceholder('[data-urdu-placeholder]', 'data-en-placeholder');
      // Update language toggle button to show opposite language
      const langText = document.querySelector('.lang-text');
      if(langText) langText.textContent = 'UR';
      // Update next prayer name if available
      updateNextPrayerName();
    }
    try{ localStorage.setItem('lang', urdu ? 'urdu' : 'en'); } catch(e){}
  }

  // Helper function to update next prayer name in the correct language
  function updateNextPrayerName(){
    // This will be called when language is toggled
    // Check if nextPrayer exists in main.js and update the display
    if(typeof window.nextPrayer !== 'undefined' && window.nextPrayer){
      const nameEl = document.getElementById('next-name');
      if(nameEl){
        const urduNames = {
          'Fajr': 'فجر',
          'Dhuhr': 'ظہر',
          'Asr': 'عصر',
          'Maghrib': 'مغرب',
          'Isha': 'عشاء'
        };
        const isUrdu = body.classList.contains('urdu-mode');
        nameEl.textContent = isUrdu && urduNames[window.nextPrayer.name] ? urduNames[window.nextPrayer.name] : window.nextPrayer.name;
      }
    }
  }

  const langToggle = document.getElementById('lang-toggle');
  if(langToggle){
    // Initialize from localStorage
    try{
      const savedLang = localStorage.getItem('lang');
      if(savedLang === 'urdu') setLanguage(true);
      else setLanguage(false);
    } catch(e){
      setLanguage(false);
    }
    
    langToggle.addEventListener('click', ()=>{
      const isUrdu = body.classList.contains('urdu-mode');
      setLanguage(!isUrdu);
      if(typeof updateJummahLanguage === 'function') updateJummahLanguage();
    });
  }
})();