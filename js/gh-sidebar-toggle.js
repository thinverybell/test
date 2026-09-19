(function(){
  'use strict';

  // This script is intentionally scoped to unlocked pages only.
  // Do not include it on login/register/panel/auth pages.
  if(!document.body || !document.body.classList.contains('gh-unlocked')) return;
  if(document.body.dataset.sidebarToggleReady === '1') return;
  document.body.dataset.sidebarToggleReady = '1';

  const STORAGE_KEY = 'giahuy-sidebar-collapsed-v1';
  const DESKTOP_QUERY = window.matchMedia('(min-width: 821px)');
  const isLegacyHome = document.body.classList.contains('gh-home');

  function sidebar(){
    return document.querySelector('.gh-sidebar, aside.sidebar, .sidebar');
  }

  function getLabel(el){
    if(!el) return '';
    const explicit = el.getAttribute('data-sidebar-label');
    if(explicit) return explicit.trim();
    const text = [...el.childNodes]
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent || '')
      .join(' ')
      .trim();
    if(text) return text;
    const span = el.querySelector(':scope > span:not(.side-icon)');
    return (span?.textContent || el.textContent || '').trim().replace(/›$/,'').trim();
  }

  function addToggle(side){
    if(!side || side.querySelector('.gh-sidebar-toggle,.sidebar-toggle-control')) return;
    const isGh = side.classList.contains('gh-sidebar');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = isGh ? 'gh-sidebar-toggle' : 'sidebar-toggle-control';
    btn.setAttribute('aria-controls', isGh ? 'ghSidebar' : 'legacySidebar');
    btn.setAttribute('aria-label', 'Thu gọn thanh chức năng');
    btn.setAttribute('title', 'Thu gọn thanh chức năng');
    btn.innerHTML = '<span class="gh-toggle-icon"><i class="cil-chevron-left" aria-hidden="true"></i></span><span class="gh-toggle-text">Thu gọn</span><kbd class="gh-toggle-shortcut">Ctrl B</kbd><span class="gh-toggle-sr">Thu gọn</span>';
    if(isGh) side.id = side.id || 'ghSidebar';
    else side.id = side.id || 'legacySidebar';
    side.appendChild(btn);
    btn.addEventListener('click', toggle);
  }

  function syncLabels(collapsed){
    const side = sidebar();
    if(!side) return;
    const links = side.querySelectorAll('a.gh-side-link, a.side-item');
    links.forEach(link=>{
      const label=getLabel(link);
      if(label && !link.title) link.title=label;
      if(collapsed){
        link.setAttribute('aria-label', label || 'Điều hướng');
      }else{
        // Keep a useful title without forcing a browser tooltip on every link while open.
        if(label) link.removeAttribute('title');
      }
    });
  }

  function updateButton(){
    const side=sidebar();
    const btn=side?.querySelector('.gh-sidebar-toggle,.sidebar-toggle-control');
    if(!btn) return;
    const collapsed=document.body.classList.contains('gh-sidebar-collapsed');
    const icon=btn.querySelector('i');
    const text=btn.querySelector('.gh-toggle-text');
    const shortcut=btn.querySelector('.gh-toggle-shortcut');
    const sr=btn.querySelector('.gh-toggle-sr');
    const label=collapsed ? 'Mở rộng' : 'Thu gọn';
    const fullLabel=collapsed ? 'Mở rộng thanh chức năng' : 'Thu gọn thanh chức năng';
    if(icon) icon.className=collapsed ? 'cil-chevron-right' : 'cil-chevron-left';
    if(text) text.textContent=label;
    if(shortcut) shortcut.textContent=collapsed ? 'Ctrl B' : 'Ctrl B';
    if(sr) sr.textContent=fullLabel;
    btn.setAttribute('aria-expanded', String(!collapsed));
    btn.setAttribute('aria-label', fullLabel);
    btn.title=fullLabel;
    btn.dataset.state=collapsed ? 'collapsed' : 'expanded';
    syncLabels(collapsed);
  }

  function apply(collapsed, persist=true){
    const safeCollapsed=Boolean(collapsed && DESKTOP_QUERY.matches);
    document.body.classList.toggle('gh-sidebar-collapsed', safeCollapsed);
    if(persist){
      try{ localStorage.setItem(STORAGE_KEY, safeCollapsed ? '1' : '0'); }catch{}
    }
    updateButton();
    window.dispatchEvent(new CustomEvent('giahuy:sidebar-change',{detail:{collapsed:safeCollapsed}}));
  }

  function toggle(){
    apply(!document.body.classList.contains('gh-sidebar-collapsed'), true);
  }

  function init(){
    const side=sidebar();
    if(!side){
      // gh-platform pages create the sidebar synchronously during pageShell(); retry once.
      window.setTimeout(init, 0);
      return;
    }
    addToggle(side);
    let stored=false;
    try{ stored=localStorage.getItem(STORAGE_KEY)==='1'; }catch{}
    apply(stored, false);
  }

  // A single keyboard shortcut: Ctrl/Cmd + B toggles sidebar on desktop.
  document.addEventListener('keydown', e=>{
    if(!DESKTOP_QUERY.matches) return;
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='b'){
      e.preventDefault();
      toggle();
    }
  });

  const onViewportChange=()=>{
    if(!DESKTOP_QUERY.matches && document.body.classList.contains('gh-sidebar-collapsed')){
      apply(false, false);
    }else{
      updateButton();
    }
  };
  if(typeof DESKTOP_QUERY.addEventListener==='function') DESKTOP_QUERY.addEventListener('change', onViewportChange);
  else if(typeof DESKTOP_QUERY.addListener==='function') DESKTOP_QUERY.addListener(onViewportChange);

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
