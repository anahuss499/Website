// ui.js - mobile nav toggle, small UI helpers, and logo modal
(function(){
  const body = document.body;
  const toggle = document.querySelectorAll('.nav-toggle');
  const compactToggles = document.querySelectorAll('.compact-toggle');
  const breakpoint = 800;
  function setOpen(btn, open){
    btn.setAttribute('aria-expanded', String(open));
    if(open) body.classList.add('nav-open'); else body.classList.remove('nav-open');
  }
  toggle.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      setOpen(btn, !expanded);
    });
  });

  function setCompact(on){
    compactToggles.forEach(b => b.setAttribute('aria-pressed', String(on)));
    if(on){
      body.classList.add('nav-compact');
      compactToggles.forEach(b=> b.setAttribute('title', 'Expand menu (show labels)'));
    } else {
      body.classList.remove('nav-compact');
      compactToggles.forEach(b=> b.setAttribute('title', 'Compact menu (icons only)'));
    }
    try{ localStorage.setItem('navCompact', on ? '1' : '0'); } catch(e){}
  }

  compactToggles.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const pressed = btn.getAttribute('aria-pressed') === 'true';
      setCompact(!pressed);
    });
  });

  // initialize compact from localStorage
  try{
    const stored = localStorage.getItem('navCompact');
    if(stored === '1') setCompact(true);
    else setCompact(false);
  } catch(e){}

  // close nav on escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && body.classList.contains('nav-open')){
      body.classList.remove('nav-open');
      document.querySelectorAll('.nav-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));
    }
  });
  // close nav on resize > breakpoint
  window.addEventListener('resize', ()=>{
    if(window.innerWidth > breakpoint && body.classList.contains('nav-open')){
      body.classList.remove('nav-open');
      document.querySelectorAll('.nav-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));
    }
  });

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
})();