/*
 * GIA HUY — Master navigation controller.
 * Single source of truth for sidebar + top navigation.
 * It intentionally re-applies after platform/auth code mutates the DOM.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  const MENU = [
    {type:'link', href:'index.html', icon:'cil-home', label:'Trang chủ', key:'home'},
    {type:'group', label:'Thư viện', items:[
      {href:'plugins.html', icon:'cil-book', label:'Bài giảng', key:'plugins'},
      {href:'config.html', icon:'cil-notes', label:'Giáo án', key:'config'},
      {href:'mods.html', icon:'cil-task', label:'Bài tập', key:'mods'},
      {href:'assets.html', icon:'cil-education', label:'Học liệu', key:'assets'}
    ]},
    {type:'group', label:'Tiện ích', items:[
      {href:'tools.html', icon:'cil-settings', label:'Công cụ', key:'tools'},
      {href:'resources.html', icon:'cil-folder-open', label:'Tài nguyên', key:'resources'},
      {href:'guide.html', icon:'cil-lightbulb', label:'Hướng dẫn', key:'guide'},
      {href:'flashcards.html', icon:'cil-layers', label:'Flashcard', key:'flashcards'},
      {href:'quiz.html', icon:'cil-list-numbered', label:'Quiz', key:'quiz'},
      {href:'videos.html', icon:'cil-video', label:'Video', key:'videos'},
      {href:'games.html', icon:'cil-videogame', label:'Game Center', key:'games'},
      {href:'lab.html', icon:'cil-beaker', label:'Phòng thí nghiệm', key:'lab'}
    ]},
    {type:'group', label:'Cá nhân & Hỗ trợ', items:[
      {href:'my-library.html', icon:'cil-heart', label:'Kho cá nhân', key:'library'},
      {href:'qna.html', icon:'cil-speech', label:'Hỏi đáp / Hàng chờ', key:'qna', attrs:'data-open-ticket-nav=""'},
      {href:'settings.html', icon:'cil-cog', label:'Cài đặt', key:'settings', attrs:'data-open-settings=""'},
      {href:'admin-panel.html', icon:'cil-shield-alt', label:'Panel Admin', key:'admin', roles:['admin']},
      {href:'teacher.html', icon:'cil-school', label:'Khu giáo viên', key:'teacher', roles:['teacher','manager','admin']},
      {href:'statistics.html', icon:'cil-chart', label:'Thống kê', key:'statistics', roles:['teacher','manager','admin']}
    ]}
  ];

  const PAGE_KEYS = {
    'index':'home','index.html':'home','':'home','/':'home',
    'plugins':'plugins','plugins.html':'plugins',
    'config':'config','config.html':'config',
    'mods':'mods','mods.html':'mods',
    'assets':'assets','assets.html':'assets',
    'tools':'tools','tools.html':'tools',
    'resources':'resources','resources.html':'resources',
    'guide':'guide','guide.html':'guide',
    'flashcards':'flashcards','flashcards.html':'flashcards',
    'quiz':'quiz','quiz.html':'quiz',
    'videos':'videos','videos.html':'videos',
    'games':'games','games.html':'games',
    'lab':'lab','lab.html':'lab',
    'my-library':'library','my-library.html':'library','library':'library',
    'qna':'qna','qna.html':'qna',
    'settings':'settings','settings.html':'settings',
    'admin-panel':'admin','admin-panel.html':'admin','admin':'admin',
    'teacher':'teacher','teacher.html':'teacher',
    'statistics':'statistics','statistics.html':'statistics',
    'notifications':'notifications','notifications.html':'notifications',
    'profile':'profile','profile.html':'profile'
  };

  const TOP_KEYS = ['home','plugins','config','mods','assets','tools','resources','guide','flashcards','quiz','videos','games','lab','library','qna'];

  function role() {
    try {
      if (window.Auth && typeof window.Auth.getSession === 'function') {
        const s = window.Auth.getSession();
        if (s && s.role) return String(s.role).toLowerCase();
      }
    } catch (_) {}
    try {
      const raw = localStorage.getItem('giahuy-session');
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.role) return String(s.role).toLowerCase();
      }
    } catch (_) {}
    try { if (localStorage.getItem('giahuy-admin') === '1') return 'admin'; } catch (_) {}
    return 'guest';
  }

  function allowed(item, r) {
    return !item.roles || item.roles.indexOf(r) !== -1;
  }

  function currentKey() {
    const p = String(location.pathname || '').split('/').filter(Boolean).pop() || 'index.html';
    const lower = p.toLowerCase();
    if (PAGE_KEYS[lower]) return PAGE_KEYS[lower];
    const clean = lower.replace(/\.html$/,'');
    if (PAGE_KEYS[clean]) return PAGE_KEYS[clean];
    const body = document.body;
    const dp = body && String(body.getAttribute('data-page') || '').toLowerCase();
    if (PAGE_KEYS[dp]) return PAGE_KEYS[dp];
    if (dp) return dp;
    return 'home';
  }

  function icon(name) { return '<i class="' + name + '" aria-hidden="true"></i>'; }

  function renderItems(active) {
    const r = role();
    let out = '';
    MENU.forEach(block => {
      if (block.type === 'link') {
        if (!allowed(block,r)) return;
        const on = block.key === active ? ' gh-nav-current active' : '';
        out += `<a class="side-item gh-side-link${on}" href="${block.href}" data-nav-key="${block.key}"><span class="side-icon">${icon(block.icon)}</span><span class="side-label">${block.label}</span><span class="chev" aria-hidden="true">›</span></a>`;
        return;
      }
      const items = block.items.filter(x => allowed(x,r));
      if (!items.length) return;
      out += `<div class="side-group"><div class="side-group-label">${block.label}</div>`;
      items.forEach(item => {
        const on = item.key === active ? ' gh-nav-current active' : '';
        const attrs = item.attrs ? ' ' + item.attrs : '';
        out += `<a class="side-item gh-side-link${on}" href="${item.href}" data-nav-key="${item.key}"${attrs}><span class="side-icon">${icon(item.icon)}</span><span class="side-label">${item.label}</span><span class="chev" aria-hidden="true">›</span></a>`;
      });
      out += '</div>';
    });
    out += '<div class="side-quote">“Không có<br>thành công nào<br>mà không bắt đầu<br>từ những bước nhỏ.”<small>— Thầy Gia Huy</small></div>';
    return out;
  }

  function toggleFor(side) {
    if (!side) return;
    let btn = side.querySelector('.gh-sidebar-toggle, .sidebar-toggle-control');
    if (btn) return;
    const isGh = side.classList.contains('gh-sidebar');
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = isGh ? 'gh-sidebar-toggle' : 'sidebar-toggle-control';
    btn.setAttribute('aria-label','Thu gọn thanh chức năng');
    btn.title = 'Thu gọn thanh chức năng (Ctrl B)';
    btn.innerHTML = '<span class="gh-toggle-icon"><i class="cil-chevron-left" aria-hidden="true"></i></span><span class="gh-toggle-text">Thu gọn</span><kbd class="gh-toggle-shortcut">Ctrl B</kbd><span class="gh-toggle-sr">Thu gọn</span>';
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (window.GiaHuySidebarToggle && typeof window.GiaHuySidebarToggle.toggle === 'function') window.GiaHuySidebarToggle.toggle();
      else document.body.classList.toggle('gh-sidebar-collapsed');
    });
    side.appendChild(btn);
  }

  function renderSide(side, active) {
    if (!side) return;
    const beforeCollapsed = document.body.classList.contains('gh-sidebar-collapsed');
    side.innerHTML = '<div class="side-inner">' + renderItems(active) + '</div>';
    toggleFor(side);
    side.dataset.masterNav = '1';
    if (beforeCollapsed) document.body.classList.add('gh-sidebar-collapsed');
  }

  function topHTML(active) {
    const labels = new Map();
    MENU.forEach(block => {
      if (block.type === 'link') labels.set(block.key,block);
      else block.items.forEach(x => labels.set(x.key,x));
    });
    return TOP_KEYS.map(key => {
      const item = labels.get(key); if (!item) return '';
      const on = key===active ? ' active gh-nav-current' : '';
      const extra = item.key==='qna' ? ' data-open-ticket-nav=""' : '';
      return `<a href="${item.href}" class="${on.trim()}" data-nav-key="${key}"${extra}>${icon(item.icon)}<span>${item.label}</span></a>`;
    }).join('');
  }

  function syncTop(active) {
    document.querySelectorAll('.topnav, .gh-header-nav').forEach(nav => {
      nav.innerHTML = topHTML(active);
      nav.dataset.masterNav = '1';
    });
  }

  function cleanBodyRoleInterference() {
    // script.js can inject a role panel after auth. Give it the master geometry and active state.
    const active = currentKey();
    document.querySelectorAll('.sidebar .side-item, .gh-sidebar .side-item').forEach(a => {
      a.classList.remove('active','gh-nav-current');
      if ((a.getAttribute('data-nav-key') || '') === active) a.classList.add('active','gh-nav-current');
    });
  }

  let applying = false;
  function apply() {
    if (applying || !document.body || document.body.classList.contains('locked-zone')) return;
    if (!document.body.classList.contains('gh-unlocked')) return;
    applying = true;
    try {
      const active = currentKey();
      document.body.dataset.ghMasterActive = active;
      document.querySelectorAll('aside.sidebar, aside.gh-sidebar, .sidebar, .gh-sidebar').forEach(side => renderSide(side, active));
      syncTop(active);
      cleanBodyRoleInterference();
      if (window.GiaHuySidebarToggle && typeof window.GiaHuySidebarToggle.setup === 'function') {
        try { window.GiaHuySidebarToggle.setup(); } catch (_) {}
      }
      try { window.dispatchEvent(new CustomEvent('giahuy:master-nav-ready',{detail:{active}})); } catch (_) {}
    } finally {
      applying = false;
    }
  }

  // Click navigation is normal page navigation; we only need a visual state for this page.
  document.addEventListener('gh:platform-ready', () => setTimeout(apply, 0));
  window.addEventListener('giahuy:login', () => setTimeout(apply, 0));
  window.addEventListener('giahuy:logout', () => setTimeout(apply, 0));
  window.addEventListener('popstate', () => setTimeout(apply, 0));
  window.addEventListener('hashchange', () => setTimeout(apply, 0));

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();

  // Catch auth/role code that inserts or rewrites a sidebar after initial render.
  try {
    let timer = null;
    const observer = new MutationObserver(() => {
      if (applying) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const side = document.querySelector('aside.sidebar, aside.gh-sidebar, .sidebar, .gh-sidebar');
        const top = document.querySelector('.topnav, .gh-header-nav');
        const active = currentKey();
        const sideNeeds = side && side.dataset.masterNav !== '1';
        const topNeeds = top && top.dataset.masterNav !== '1';
        const activeNeeds = document.querySelector('.sidebar a[data-nav-key="'+active+'"].active, .gh-sidebar a[data-nav-key="'+active+'"].active') === null;
        if (sideNeeds || topNeeds || activeNeeds) apply();
      }, 60);
    });
    observer.observe(document.body,{childList:true,subtree:true});
  } catch (_) {}

  window.GiaHuyMasterNavigation = { apply, currentKey, MENU };
})();
