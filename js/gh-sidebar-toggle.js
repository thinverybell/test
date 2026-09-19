/**
 * Sidebar collapse — works on homepage, legacy pages, and platform pages (Quiz/Game/Video…).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'giahuy-sidebar-collapsed-v1';
  var DESKTOP = window.matchMedia('(min-width: 821px)');

  function isUnlocked() {
    return document.body && (
      document.body.classList.contains('gh-unlocked') ||
      document.body.classList.contains('gh-platform')
    );
  }

  function getSidebar() {
    return document.querySelector('aside.gh-sidebar, aside.sidebar, .gh-sidebar, .sidebar');
  }

  function isCollapsed() {
    return document.body.classList.contains('gh-sidebar-collapsed');
  }

  function ensureToggle(side) {
    if (!side) return null;
    var btn = side.querySelector('.gh-sidebar-toggle, .sidebar-toggle-control');
    if (btn) return btn;

    var isGh = side.classList.contains('gh-sidebar');
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = isGh ? 'gh-sidebar-toggle' : 'sidebar-toggle-control';
    btn.setAttribute('aria-label', 'Thu gọn thanh chức năng');
    btn.setAttribute('title', 'Thu gọn thanh chức năng (Ctrl B)');
    btn.innerHTML =
      '<span class="gh-toggle-icon"><i class="cil-chevron-left" aria-hidden="true"></i></span>' +
      '<span class="gh-toggle-text">Thu gọn</span>' +
      '<kbd class="gh-toggle-shortcut">Ctrl B</kbd>' +
      '<span class="gh-toggle-sr">Thu gọn</span>';
    side.appendChild(btn);
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });
    return btn;
  }

  function updateButton() {
    var side = getSidebar();
    var btn = side && side.querySelector('.gh-sidebar-toggle, .sidebar-toggle-control');
    if (!btn) return;
    var collapsed = isCollapsed();
    var icon = btn.querySelector('i');
    var text = btn.querySelector('.gh-toggle-text');
    if (icon) icon.className = collapsed ? 'cil-chevron-right' : 'cil-chevron-left';
    if (text) text.textContent = collapsed ? 'Mở rộng' : 'Thu gọn';
    btn.setAttribute('aria-expanded', String(!collapsed));
    btn.setAttribute('aria-label', collapsed ? 'Mở rộng thanh chức năng' : 'Thu gọn thanh chức năng');
    btn.title = collapsed ? 'Mở rộng (Ctrl B)' : 'Thu gọn (Ctrl B)';
  }

  function apply(collapsed, persist) {
    var on = Boolean(collapsed && DESKTOP.matches);
    document.body.classList.toggle('gh-sidebar-collapsed', on);
    if (persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, on ? '1' : '0'); } catch (e) {}
    }
    updateButton();
    try {
      window.dispatchEvent(new CustomEvent('giahuy:sidebar-change', { detail: { collapsed: on } }));
    } catch (e2) {}
  }

  function toggle() {
    apply(!isCollapsed(), true);
  }

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { return false; }
  }

  function setup() {
    if (!isUnlocked()) return;
    var side = getSidebar();
    if (!side) return false;
    ensureToggle(side);
    apply(readStored(), false);
    return true;
  }

  function boot() {
    if (!setup()) {
      // Sidebar may appear later (platform shell)
      var tries = 0;
      var timer = setInterval(function () {
        tries += 1;
        if (setup() || tries > 40) clearInterval(timer);
      }, 50);
    }
  }

  document.addEventListener('keydown', function (e) {
    if (!DESKTOP.matches || !isUnlocked()) return;
    if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'b') {
      e.preventDefault();
      toggle();
    }
  });

  if (typeof DESKTOP.addEventListener === 'function') {
    DESKTOP.addEventListener('change', function () {
      if (!DESKTOP.matches) apply(false, false);
      else apply(readStored(), false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // After platform rebuilds DOM / unified sidebar rewrites innerHTML
  document.addEventListener('gh:platform-ready', function () {
    setTimeout(boot, 30);
  });
  window.addEventListener('giahuy:sidebar-change', function () {
    /* no-op listener keeps API stable */
  });

  // Re-attach if unified sidebar wiped the button
  var obs;
  try {
    obs = new MutationObserver(function () {
      var side = getSidebar();
      if (side && !side.querySelector('.gh-sidebar-toggle, .sidebar-toggle-control')) {
        ensureToggle(side);
        updateButton();
      }
    });
    if (document.body) {
      obs.observe(document.body, { childList: true, subtree: true });
    }
  } catch (e3) {}

  window.GiaHuySidebarToggle = { apply: apply, toggle: toggle, setup: setup };
})();
