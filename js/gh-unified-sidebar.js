/**
 * Thầy Gia Huy — Unified Sidebar (single source of truth)
 * Same groups, icons, active state, quote on every unlocked page.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || window.__ghUnifiedSidebarReady) return;
  window.__ghUnifiedSidebarReady = true;

  var QUOTE =
    '“Không có<br/>thành công nào<br/>mà không bắt đầu<br/>từ những bước nhỏ.”' +
    '<small>— Thầy Gia Huy</small>';

  var MENU = [
    { type: 'link', href: 'index.html', icon: 'cil-home', label: 'Trang chủ', key: 'home' },
    {
      type: 'group',
      label: 'Thư viện',
      items: [
        { href: 'plugins.html', icon: 'cil-book', label: 'Bài giảng', key: 'plugins' },
        { href: 'config.html', icon: 'cil-notes', label: 'Giáo án', key: 'config' },
        { href: 'mods.html', icon: 'cil-task', label: 'Bài tập', key: 'mods' },
        { href: 'assets.html', icon: 'cil-education', label: 'Học liệu', key: 'assets' }
      ]
    },
    {
      type: 'group',
      label: 'Tiện ích',
      items: [
        { href: 'tools.html', icon: 'cil-settings', label: 'Công cụ', key: 'tools' },
        { href: 'resources.html', icon: 'cil-folder-open', label: 'Tài nguyên', key: 'resources' },
        { href: 'guide.html', icon: 'cil-lightbulb', label: 'Hướng dẫn', key: 'guide' },
        { href: 'flashcards.html', icon: 'cil-layers', label: 'Flashcard', key: 'flashcards' },
        { href: 'quiz.html', icon: 'cil-list-numbered', label: 'Quiz', key: 'quiz' },
        { href: 'videos.html', icon: 'cil-video', label: 'Video', key: 'videos' },
        { href: 'games.html', icon: 'cil-videogame', label: 'Game Center', key: 'games' },
        { href: 'lab.html', icon: 'cil-beaker', label: 'Phòng thí nghiệm', key: 'lab' }
      ]
    },
    {
      type: 'group',
      label: 'Cá nhân & Hỗ trợ',
      items: [
        { href: 'my-library.html', icon: 'cil-heart', label: 'Kho cá nhân', key: 'library' },
        { href: 'qna.html', icon: 'cil-speech', label: 'Hỏi đáp / Hàng chờ', key: 'qna', extraClass: 'ticket-side-link', attrs: 'data-open-ticket-nav=""' },
        { href: 'settings.html', icon: 'cil-cog', label: 'Cài đặt', key: 'settings', extraClass: 'settings-side-link', attrs: 'data-open-settings=""' },
        { href: 'admin-panel.html', icon: 'cil-shield-alt', label: 'Panel Admin', key: 'admin', roles: ['admin'] },
        { href: 'teacher.html', icon: 'cil-school', label: 'Khu giáo viên', key: 'teacher', roles: ['teacher', 'manager', 'admin'] },
        { href: 'statistics.html', icon: 'cil-chart', label: 'Thống kê', key: 'statistics', roles: ['teacher', 'manager', 'admin'] }
      ]
    }
  ];

  var PAGE_KEY_MAP = {
    'index.html': 'home',
    'plugins.html': 'plugins',
    'config.html': 'config',
    'mods.html': 'mods',
    'assets.html': 'assets',
    'tools.html': 'tools',
    'resources.html': 'resources',
    'guide.html': 'guide',
    'flashcards.html': 'flashcards',
    'quiz.html': 'quiz',
    'videos.html': 'videos',
    'games.html': 'games',
    'lab.html': 'lab',
    'my-library.html': 'library',
    'qna.html': 'qna',
    'settings.html': 'settings',
    'admin-panel.html': 'admin',
    'teacher.html': 'teacher',
    'statistics.html': 'statistics',
    'notifications.html': 'notifications',
    'profile.html': 'profile'
  };

  function getRole() {
    try {
      if (window.Auth && typeof window.Auth.getSession === 'function') {
        var s = window.Auth.getSession();
        if (s && s.role) return String(s.role).toLowerCase();
      }
    } catch (e) {}
    try {
      var raw = localStorage.getItem('giahuy-session');
      if (raw) {
        var p = JSON.parse(raw);
        if (p && p.role) return String(p.role).toLowerCase();
      }
    } catch (e2) {}
    try {
      if (localStorage.getItem('giahuy-admin') === '1') return 'admin';
    } catch (e3) {}
    return 'guest';
  }

  function allowed(roles, role) {
    if (!roles || !roles.length) return true;
    return roles.indexOf(role) !== -1;
  }

  function detectActiveKey() {
    var path = (location.pathname || '').split('/').pop() || 'index.html';
    if (!path) path = 'index.html';
    var lowerPath = String(path).toLowerCase();
    if (PAGE_KEY_MAP[lowerPath]) return PAGE_KEY_MAP[lowerPath];
    var cleanPath = lowerPath.replace(/\.html$/, '');
    if (PAGE_KEY_MAP[cleanPath]) return PAGE_KEY_MAP[cleanPath];
    var bodyPage = document.body && document.body.getAttribute('data-page');
    if (bodyPage && PAGE_KEY_MAP[bodyPage + '.html']) return PAGE_KEY_MAP[bodyPage + '.html'];
    if (bodyPage) return bodyPage;
    return 'home';
  }

  function ico(name) {
    return '<i class="' + name + '" aria-hidden="true"></i>';
  }

  function renderMenuHTML(activeKey, role) {
    var seen = {};
    var html = '';

    MENU.forEach(function (block) {
      if (block.type === 'link') {
        if (seen[block.key]) return;
        if (!allowed(block.roles, role)) return;
        seen[block.key] = true;
        var act = activeKey === block.key ? ' active' : '';
        html +=
          '<a class="side-item gh-side-link' + act + '" href="' + block.href + '" data-nav-key="' + block.key + '">' +
          '<span class="side-icon">' + ico(block.icon) + '</span>' +
          '<span class="side-label">' + block.label + '</span>' +
          '<span class="chev" aria-hidden="true">›</span></a>';
        return;
      }

      if (block.type === 'group') {
        var itemsHTML = '';
        (block.items || []).forEach(function (item) {
          if (seen[item.key]) return;
          if (!allowed(item.roles, role)) return;
          seen[item.key] = true;
          var act = activeKey === item.key ? ' active' : '';
          var extra = item.extraClass ? ' ' + item.extraClass : '';
          var attrs = item.attrs ? ' ' + item.attrs : '';
          itemsHTML +=
            '<a class="side-item gh-side-link' + act + extra + '" href="' + item.href + '" data-nav-key="' + item.key + '"' + attrs + '>' +
            '<span class="side-icon">' + ico(item.icon) + '</span>' +
            '<span class="side-label">' + item.label + '</span>' +
            '<span class="chev">›</span></a>';
        });
        if (!itemsHTML) return;
        html +=
          '<div class="side-group">' +
          '<div class="side-group-label">' + block.label + '</div>' +
          itemsHTML +
          '</div>';
      }
    });

    html += '<div class="side-quote">' + QUOTE + '</div>';
    return html;
  }

  function fillSidebar(side) {
    if (!side) return false;
    var role = getRole();
    var activeKey = detectActiveKey();
    var html = renderMenuHTML(activeKey, role);
    var toggle = side.querySelector('.sidebar-toggle-control, .gh-sidebar-toggle');

    // Full wipe + rebuild (no duplicate items)
    side.innerHTML = '<div class="side-inner">' + html + '</div>';
    if (toggle) side.appendChild(toggle);

    side.setAttribute('data-gh-unified', '1');
    side.setAttribute('data-gh-role', role);
    if (document.body) document.body.setAttribute('data-gh-role', role);
    return true;
  }

  function markTopnavActive(activeKey) {
    var map = {
      home: 'index.html', plugins: 'plugins.html', config: 'config.html', mods: 'mods.html',
      assets: 'assets.html', tools: 'tools.html', resources: 'resources.html', guide: 'guide.html',
      library: 'my-library.html', flashcards: 'flashcards.html', quiz: 'quiz.html', videos: 'videos.html',
      games: 'games.html', lab: 'lab.html', settings: 'settings.html', qna: 'qna.html', admin: 'admin-panel.html',
      teacher: 'teacher.html', statistics: 'statistics.html'
    };
    var href = map[activeKey] || '';
    document.querySelectorAll('.topnav a, .gh-header-nav a').forEach(function (a) {
      a.classList.remove('active');
      var h = (a.getAttribute('href') || '').split('?')[0].split('/').pop();
      if (href && h === href) a.classList.add('active');
      if (activeKey === 'home' && (h === 'index.html' || h === '' || h === '/')) a.classList.add('active');
    });
  }

  function applyUnified() {
    if (document.body && document.body.classList.contains('locked-zone')) return;
    document.querySelectorAll('aside.sidebar, aside.gh-sidebar, .sidebar, .gh-sidebar').forEach(function (side) {
      fillSidebar(side);
    });
    markTopnavActive(detectActiveKey());
    // Re-attach collapse button after menu rewrite
    if (window.GiaHuySidebarToggle && typeof window.GiaHuySidebarToggle.setup === 'function') {
      try { window.GiaHuySidebarToggle.setup(); } catch (e) {}
    }
  }

  window.GiaHuySidebar = {
    getRole: getRole,
    detectActiveKey: detectActiveKey,
    renderLegacyHTML: function () { return renderMenuHTML(detectActiveKey(), getRole()); },
    renderPlatformHTML: function (activeKey) { return renderMenuHTML(activeKey || detectActiveKey(), getRole()); },
    apply: applyUnified,
    MENU: MENU
  };

  function boot() { applyUnified(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  document.addEventListener('gh:platform-ready', function () { setTimeout(boot, 20); });
  window.addEventListener('giahuy:login', boot);
  window.addEventListener('giahuy:logout', boot);
})();
