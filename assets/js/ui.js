// ui.js - mobile nav toggle and small UI helpers
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