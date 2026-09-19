/*! Thầy Gia Huy — unlocked-surface integration helpers.
 *  Loaded only on editable pages. Never load on locked auth/panel pages.
 */
(function (global) {
  'use strict';
  if (document.body && document.body.classList.contains('locked-zone')) return;

  const safeJSON = (key, fallback) => {
    try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v == null ? fallback : v; }
    catch (_) { return fallback; }
  };

  function fixThemeButton() {
    const btn = document.getElementById('themeToggle');
    if (!btn || btn.dataset.ghSurfaceTheme === '1') return;
    btn.dataset.ghSurfaceTheme = '1';
    const paint = () => {
      const light = document.body.classList.contains('light-theme');
      btn.innerHTML = `<i class="${light ? 'cil-sun' : 'cil-moon'}" aria-hidden="true"></i>`;
      btn.setAttribute('aria-pressed', String(!light));
      btn.setAttribute('aria-label', light ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng');
      btn.title = btn.getAttribute('aria-label');
    };
    paint();
    btn.addEventListener('click', () => setTimeout(paint, 0));
    global.addEventListener('storage', (e) => {
      if (e.key === 'giahuy-theme') setTimeout(paint, 0);
    });
  }

  function fixTicketPlaceholder() {
    const banner = document.getElementById('ticketDiscordBanner');
    if (!banner || banner.dataset.ghSurfaceTicket === '1') return;
    const href = banner.getAttribute('href') || '';
    if (!href.includes('your-invite-code')) return;
    banner.dataset.ghSurfaceTicket = '1';
    banner.href = 'qna.html';
    banner.removeAttribute('target');
    banner.removeAttribute('rel');
    const text = banner.querySelector('.tdb-text');
    if (text) text.innerHTML = '<b>Mở khu Hỏi đáp của website</b><span>Trao đổi, đặt câu hỏi và theo dõi phản hồi ngay trên Thầy Gia Huy</span>';
    banner.setAttribute('aria-label', 'Mở khu Hỏi đáp của website');
  }

  function restoreSavedProfilePreview() {
    // Only updates unlocked/profile surfaces. Never edits auth/panel DOM.
    const profile = safeJSON('giahuy-profile', null);
    if (!profile) return;
    document.querySelectorAll('.ghx-profile-name,[data-gh-profile-name]').forEach(el => {
      if (profile.name) el.textContent = profile.name;
    });
  }

  function boot() {
    fixThemeButton();
    fixTicketPlaceholder();
    restoreSavedProfilePreview();
    const mo = new MutationObserver(() => {
      fixThemeButton();
      fixTicketPlaceholder();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      try { mo.disconnect(); } catch (_) {}
    }, 5000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(window);
