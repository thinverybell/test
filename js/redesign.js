(function(){
  'use strict';
  function iconFor(href){
    const h=(href||'').toLowerCase();
    if(h.includes('index')) return 'cil-home';
    if(h.includes('plugins')) return 'cil-book';
    if(h.includes('video')) return 'cil-media-play';
    if(h.includes('assign')) return 'cil-task';
    if(h.includes('quiz')) return 'cil-education';
    if(h.includes('notes')) return 'cil-notes';
    if(h.includes('progress')) return 'cil-chart';
    if(h.includes('assets')) return 'cil-education';
    if(h.includes('resources')) return 'cil-folder-open';
    if(h.includes('guide')) return 'cil-lightbulb';
    if(h.includes('my-library')) return 'cil-heart';
    if(h.includes('config')) return 'cil-notes';
    return 'cil-grid';
  }
  function currentPage(){
    const p=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    return p==='/'?'index.html':p;
  }
  function setupCommonNav(){
    const nav=document.querySelector('.topnav');
    if(!nav) return;
    const links=[...nav.querySelectorAll('a')].filter(a=>{
      const href=a.getAttribute('href')||'';
      return !/^#/.test(href) && !/config\.html|mods\.html|tools\.html/i.test(href);
    });
    const parent=nav.parentElement;
    if(parent && !parent.querySelector('.mobile-menu-toggle')){
      const b=document.createElement('button');
      b.type='button'; b.className='mobile-menu-toggle'; b.setAttribute('aria-label','Mở menu'); b.innerHTML='<i class="cil-menu"></i>';
      parent.insertBefore(b,nav);
      b.addEventListener('click',()=>document.body.classList.toggle('mobile-menu-open'));
      nav.dataset.redesigned='1';
      buildDrawer(links);
    }
    buildBottomNav(links);
    [...nav.querySelectorAll('a')].forEach(a=>{
      const href=(a.getAttribute('href')||'').split('?')[0].split('#')[0];
      if(href && href===currentPage()) a.classList.add('active');
    });
  }
  function buildDrawer(links){
    if(document.querySelector('.mobile-drawer')) return;
    const backdrop=document.createElement('div');
    backdrop.className='mobile-nav-backdrop';
    const drawer=document.createElement('div');
    drawer.className='mobile-drawer';
    drawer.innerHTML='<div class="mobile-drawer-head"><strong>Menu học tập</strong><button type="button" aria-label="Đóng">×</button></div><div class="mobile-drawer-links"></div>';
    const wrap=drawer.querySelector('.mobile-drawer-links');
    links.forEach(a=>{
      const x=a.cloneNode(true); x.classList.remove('active');
      const i=x.querySelector('i'); if(i) i.className=iconFor(x.getAttribute('href'));
      wrap.appendChild(x);
    });
    document.body.append(backdrop,drawer);
    const close=()=>document.body.classList.remove('mobile-menu-open');
    backdrop.addEventListener('click',close); drawer.querySelector('button').addEventListener('click',close);
    drawer.addEventListener('click',e=>{ if(e.target.closest('a')) close(); });
  }
  function buildBottomNav(links){
    if(document.querySelector('.mobile-bottom-nav')) return;
    const wanted=['index.html','plugins.html','assignments.html','quiz.html','progress.html'];
    const found=[];
    wanted.forEach(w=>{const a=links.find(x=>(x.getAttribute('href')||'').split('?')[0]===w); if(a) found.push(a);});
    if(found.length<3) return;
    const bar=document.createElement('nav'); bar.className='mobile-bottom-nav'; bar.setAttribute('aria-label','Điều hướng nhanh');
    found.forEach(a=>{const x=a.cloneNode(true); x.classList.remove('active'); const href=(x.getAttribute('href')||'').split('?')[0]; if(href===currentPage()) x.classList.add('active'); bar.appendChild(x);});
    document.body.appendChild(bar);
  }
  function injectAdminCleanup(){
    const music=document.getElementById('tabMusic');
    if(music) music.remove();
  }
  function injectPublicCleanup(){
    document.querySelectorAll('.music-home,.donate-fab,.donate-modal').forEach(el=>el.remove());
    document.querySelectorAll('.weather,.visit-counter,.jp-tag').forEach(el=>el.remove());
  }
  document.addEventListener('DOMContentLoaded',function(){
    setupCommonNav(); injectAdminCleanup(); injectPublicCleanup();
  });
})();
