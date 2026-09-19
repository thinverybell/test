/*! Thầy Gia Huy — Lucide icon library + CoreUI fallback */
(function () {
  'use strict';

  const CIL_TO_LUCIDE = {
    'cil-home': 'home',
    'cil-book': 'book-open',
    'cil-notes': 'notebook-pen',
    'cil-task': 'clipboard-list',
    'cil-education': 'graduation-cap',
    'cil-settings': 'settings',
    'cil-folder-open': 'folder-open',
    'cil-folder': 'folder',
    'cil-lightbulb': 'lightbulb',
    'cil-heart': 'heart',
    'cil-speech': 'messages-square',
    'cil-chat-bubble': 'message-circle',
    'cil-search': 'search',
    'cil-moon': 'moon',
    'cil-sun': 'sun',
    'cil-cog': 'settings-2',
    'cil-media-play': 'play',
    'cil-media-pause': 'pause',
    'cil-chart': 'bar-chart-3',
    'cil-star': 'star',
    'cil-bell': 'bell',
    'cil-user': 'user',
    'cil-people': 'users',
    'cil-file': 'file-text',
    'cil-description': 'file-text',
    'cil-library': 'library',
    'cil-cloud-upload': 'cloud-upload',
    'cil-cloud-download': 'cloud-download',
    'cil-cloud': 'cloud',
    'cil-reload': 'refresh-cw',
    'cil-x': 'x',
    'cil-arrow-top': 'arrow-up',
    'cil-chevron-left': 'chevron-left',
    'cil-chevron-right': 'chevron-right',
    'cil-calendar': 'calendar',
    'cil-history': 'history',
    'cil-info': 'info',
    'cil-devices': 'monitor-smartphone',
    'cil-camera': 'camera',
    'cil-bolt': 'zap',
    'cil-speedometer': 'gauge',
    'cil-music-note': 'music',
    'cil-image': 'image',
    'cil-laptop': 'laptop',
    'cil-lock-locked': 'lock',
    'cil-shield-alt': 'shield',
    'cil-account-logout': 'log-out',
    'cil-check-alt': 'check',
    'cil-plus': 'plus',
    'cil-trash': 'trash-2',
    'cil-pencil': 'pencil',
    'cil-save': 'save',
    'cil-drop': 'droplet',
    'cil-calculator': 'calculator',
    'cil-language': 'languages',
    'cil-flask': 'flask-conical',
    'cil-leaf': 'leaf',
    'cil-bank': 'landmark',
    'cil-globe-alt': 'globe'
  };

  function cilName(el) {
    if (!el || !el.classList) return null;
    for (let i = 0; i < el.classList.length; i++) {
      const c = el.classList[i];
      if (c.indexOf('cil-') === 0) return c;
    }
    return null;
  }

  function prepareElement(el) {
    if (!el || el.dataset.ghIcon === '1') return false;
    if (el.getAttribute('data-lucide')) {
      el.dataset.ghIcon = '1';
      el.classList.add('gh-icon');
      return true;
    }
    const cil = cilName(el);
    if (!cil) return false;
    const lucideName = CIL_TO_LUCIDE[cil];
    if (!lucideName) return false;
    el.setAttribute('data-lucide', lucideName);
    el.classList.add('gh-icon');
    el.dataset.ghIcon = '1';
    // Clear font-icon text/content; Lucide will inject SVG
    el.textContent = '';
    return true;
  }

  function scan(root) {
    const scope = root || document;
    let n = 0;
    scope.querySelectorAll('i[class*="cil-"], [data-lucide]').forEach(function (el) {
      if (prepareElement(el)) n++;
    });
    return n;
  }

  function paint() {
    if (typeof lucide === 'undefined' || !lucide.createIcons) return;
    try {
      lucide.createIcons({
        attrs: {
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          class: 'gh-icon'
        }
      });
    } catch (e) {}
  }

  function upgrade(root) {
    scan(root);
    paint();
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (typeof lucide !== 'undefined') return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function boot() {
    const sources = [
      'https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js',
      'https://cdn.jsdelivr.net/npm/lucide@0.469.0/dist/umd/lucide.min.js'
    ];
    (function tryLoad(i) {
      if (i >= sources.length) {
        console.warn('[GHIcons] Lucide unavailable — CoreUI font icons kept');
        return;
      }
      loadScript(sources[i]).then(function () {
        upgrade(document);
        if (window.MutationObserver && document.body) {
          let t = null;
          const mo = new MutationObserver(function () {
            clearTimeout(t);
            t = setTimeout(function () { upgrade(document); }, 80);
          });
          mo.observe(document.body, { childList: true, subtree: true });
        }
      }).catch(function () { tryLoad(i + 1); });
    })(0);
  }

  window.GHIcons = {
    map: CIL_TO_LUCIDE,
    upgrade: upgrade,
    /** Create a Lucide icon element: GHIcons.el('book-open', { className: 'x' }) */
    el: function (name, opts) {
      opts = opts || {};
      const i = document.createElement('i');
      i.setAttribute('data-lucide', name);
      if (opts.className) i.className = opts.className;
      i.classList.add('gh-icon');
      return i;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
