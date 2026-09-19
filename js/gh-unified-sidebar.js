/**
 * Thầy Gia Huy — Unified Sidebar
 * One menu structure for homepage + legacy pages + platform pages.
 * Role-aware: Panel Admin / teacher items only for staff accounts.
 */
(function () {
  'use strict';

  if (typeof window === 'undefined') return;
  if (window.__ghUnifiedSidebarReady) return;
  window.__ghUnifiedSidebarReady = true;

  var QUOTE_HTML =
    '“Không có<br/>thành công nào<br/>mà không bắt đầu<br/>từ những bước nhỏ.”' +
    '<small>— Thầy Gia Huy</small>';

  /** Canonical nav matching the design screenshot */
  var MENU = [
    {
      type: 'link',
      href: 'index.html',
      icon: 'cil-home',
      label: 'Trang chủ',
      key: 'home',
      roles: null
    },
    {
      type: 'group',
      label: 'Thư viện',
      roles: null,
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
      roles: null,
      items: [
        { href: 'tools.html', icon: 'cil-settings', label: 'Công cụ', key: 'tools' },
        { href: 'resources.html', icon: 'cil-folder-open', label: 'Tài nguyên', key: 'resources' },
        { href: 'guide.html', icon: 'cil-lightbulb', label: 'Hướng dẫn', key: 'guide' },
        { href: 'flashcards.html', icon: 'cil-layers', label: 'Flashcard', key: 'flashcards' },
        { href: 'quiz.html', icon: 'cil-list-numbered', label: 'Quiz', key: 'quiz' },
        { href: 'videos.html', icon: 'cil-video', label: 'Video', key: 'videos' },
        { href: 'games.html', icon: 'cil-videogame', label: 'Game Center', key: 'games' }
      ]
    },
    {
      type: 'group',
      label: 'Cá nhân & Hỗ trợ',
      roles: null,
      items: [
        { href: 'my-library.html', icon: 'cil-heart', label: 'Kho cá nhân', key: 'library', roles: ['student', 'teacher', 'manager', 'admin', 'guest'] },
        { href: 'qna.html', icon: 'cil-speech', label: 'Hỏi đáp / Hàng chờ', key: 'qna', roles: null, extraClass: 'ticket-side-link', attrs: 'data-open-ticket-nav=""' },
        { href: 'settings.html', icon: 'cil-cog', label: 'Cài đặt', key: 'settings', roles: null, extraClass: 'settings-side-link', attrs: 'data-open-settings=""' },
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
        var parsed = JSON.parse(raw);
        if (parsed && parsed.role) return String(parsed.role).toLowerCase();
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
    if (!path || path === '') path = 'index.html';
    if (PAGE_KEY_MAP[path]) return PAGE_KEY_MAP[path];
    var bodyPage = document.body && document.body.getAttribute('data-page');
    if (bodyPage && PAGE_KEY_MAP[bodyPage + '.html']) return PAGE_KEY_MAP[bodyPage + '.html'];
    if (bodyPage) return bodyPage;
    return 'home';
  }

  function iconHTML(name) {
    return '<i class="' + name + '" aria-hidden="true"></i>';
  }

  /** Legacy structure: .side-item + .side-icon (homepage / plugins style) */
  function renderLegacyHTML(activeKey, role) {
    var html = '';
    MENU.forEach(function (block) {
      if (block.type === 'link') {
        if (!allowed(block.roles, role)) return;
        var act = activeKey === block.key ? ' active' : '';
        html +=
          '<a class="side-item' +
          act +
          '" href="' +
          block.href +
          '" data-nav-key="' +
          block.key +
          '">' +
          '<span class="side-icon">' +
          iconHTML(block.icon) +
          '</span>' +
          '<span>' +
          block.label +
          '</span>' +
          '</a>';
        return;
      }
      if (block.type === 'group') {
        if (!allowed(block.roles, role)) return;
        var itemsHTML = '';
        (block.items || []).forEach(function (item) {
          if (!allowed(item.roles, role)) return;
          var act = activeKey === item.key ? ' active' : '';
          var extra = item.extraClass ? ' ' + item.extraClass : '';
          var attrs = item.attrs ? ' ' + item.attrs : '';
          itemsHTML +=
            '<a class="side-item' +
            act +
            extra +
            '" href="' +
            item.href +
            '" data-nav-key="' +
            item.key +
            '"' +
            attrs +
            '>' +
            '<span class="side-icon">' +
            iconHTML(item.icon) +
            '</span>' +
            '<span>' +
            item.label +
            '</span>' +
            '<span class="chev">›</span>' +
            '</a>';
        });
        if (!itemsHTML) return;
        html +=
          '<div class="side-group">' +
          '<div class="side-group-label">' +
          block.label +
          '</div>' +
          itemsHTML +
          '</div>';
      }
    });
    html += '<div class="side-quote">' + QUOTE_HTML + '</div>';
    return html;
  }

  /** Platform structure: .gh-side-link (still grouped like legacy for visual parity) */
  function renderPlatformHTML(activeKey, role) {
    var html = '';
    MENU.forEach(function (block) {
      if (block.type === 'link') {
        if (!allowed(block.roles, role)) return;
        var act = activeKey === block.key ? ' active' : '';
        html +=
          '<a class="gh-side-link side-item' +
          act +
          '" href="' +
          block.href +
          '" data-nav-key="' +
          block.key +
          '">' +
          '<span class="side-icon">' +
          iconHTML(block.icon) +
          '</span>' +
          '<span>' +
          block.label +
          '</span>' +
          '</a>';
        return;
      }
      if (block.type === 'group') {
        if (!allowed(block.roles, role)) return;
        var itemsHTML = '';
        (block.items || []).forEach(function (item) {
          if (!allowed(item.roles, role)) return;
          var act = activeKey === item.key ? ' active' : '';
          var extra = item.extraClass ? ' ' + item.extraClass : '';
          itemsHTML +=
            '<a class="gh-side-link side-item' +
            act +
            extra +
            '" href="' +
            item.href +
            '" data-nav-key="' +
            item.key +
            '">' +
            '<span class="side-icon">' +
            iconHTML(item.icon) +
            '</span>' +
            '<span>' +
            item.label +
            '</span>' +
            '<span class="chev end">›</span>' +
            '</a>';
        });
        if (!itemsHTML) return;
        html +=
          '<div class="side-group gh-side-group">' +
          '<div class="side-group-label gh-side-label">' +
          block.label +
          '</div>' +
          itemsHTML +
          '</div>';
      }
    });
    html += '<div class="side-quote gh-quote">' + QUOTE_HTML + '</div>';
    return html;
  }

  function fillSidebar(side, mode) {
    if (!side) return false;
    var role = getRole();
    var activeKey = detectActiveKey();
    var inner = side.querySelector('.side-inner') || side;
    var html =
      mode === 'platform'
        ? renderPlatformHTML(activeKey, role)
        : renderLegacyHTML(activeKey, role);

    if (inner.classList && inner.classList.contains('side-inner')) {
      // Keep toggle button if present outside side-inner
      inner.innerHTML = html;
    } else {
      // Preserve toggle control if already attached as child of aside
      var toggle = side.querySelector('.sidebar-toggle-control, .gh-sidebar-toggle');
      side.innerHTML = '<div class="side-inner">' + html + '</div>';
      if (toggle) side.appendChild(toggle);
    }
    side.setAttribute('data-gh-unified', '1');
    side.setAttribute('data-gh-role', role);
    if (document.body) document.body.setAttribute('data-gh-role', role);
    return true;
  }

  function applyUnified() {
    // Skip locked auth pages
    if (document.body && document.body.classList.contains('locked-zone')) return;

    var legacy = document.querySelector('aside.sidebar, .sidebar:not(.gh-sidebar)');
    var platform = document.querySelector('aside.gh-sidebar, .gh-sidebar');

    if (legacy) fillSidebar(legacy, 'legacy');
    if (platform) fillSidebar(platform, 'platform');
  }

  // Public API for platform shell to reuse the same menu
  window.GiaHuySidebar = {
    getRole: getRole,
    detectActiveKey: detectActiveKey,
    renderLegacyHTML: function () {
      return renderLegacyHTML(detectActiveKey(), getRole());
    },
    renderPlatformHTML: function (activeKey) {
      return renderPlatformHTML(activeKey || detectActiveKey(), getRole());
    },
    apply: applyUnified,
    MENU: MENU
  };

  function boot() {
    applyUnified();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Re-apply after platform shell replaces body HTML
  document.addEventListener('gh:platform-ready', boot);
  window.addEventListener('giahuy:login', boot);
  window.addEventListener('giahuy:logout', boot);
})();
