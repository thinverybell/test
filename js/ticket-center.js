(() => {
  'use strict';
  const KEY = 'giahuy-tickets-v1', ADMIN_KEY = 'giahuy-ticket-admin';
  // TODO: thay link mời Discord thật của bạn
  const DISCORD_URL = 'https://discord.gg/your-invite-code';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  const set = v => localStorage.setItem(KEY, JSON.stringify(v));
  const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  const statusLabel = { pending: 'Chờ xử lý', progress: 'Đang xử lý', resolved: 'Đã duyệt', rejected: 'Từ chối' };
  const priorityLabel = { high: 'Cao', medium: 'Trung bình', low: 'Thấp' };
  const cats = { support: 'Hỗ trợ website', resource: 'Yêu cầu tài nguyên', bug: 'Báo lỗi', account: 'Tài khoản', other: 'Khác' };
  const ico = (name, extra = '') => `<i class="cil-${name}${extra ? ' ' + extra : ''}" aria-hidden="true"></i>`;
  const uid = () => {
    const d = new Date();
    const stamp = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('');
    let n = Number(localStorage.getItem('giahuy-ticket-seq') || 0) + 1;
    localStorage.setItem('giahuy-ticket-seq', String(n));
    return `FUJI-${stamp}-${String(n).padStart(4, '0')}`;
  };
  const fmt = t => new Date(t).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const notify = (msg, type = 'ok') => {
    const t = $('#toast');
    if (t) {
      t.textContent = msg;
      t.dataset.type = type;
      t.classList.add('show');
      clearTimeout(window.__ticketToast);
      window.__ticketToast = setTimeout(() => t.classList.remove('show'), 2600);
    } else {
      try { alert(msg); } catch (_) {}
    }
  };
  const adminPass = () => {
    try {
      if (typeof Auth !== 'undefined' && Auth.getAdminProfile) return Auth.getAdminProfile().password || 'giahuy-admin';
    } catch (_) {}
    return 'giahuy-admin';
  };

  function ensureUI() {
    if (!$('.ticket-launcher')) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ticket-launcher';
      b.id = 'ticketOpen';
      b.innerHTML = `${ico('speech')} <span>Đặt câu hỏi</span><span class="ticket-count" id="ticketCount">0</span>`;
      document.body.appendChild(b);
    }
    if (!$('#ticketModal')) {
      const m = document.createElement('div');
      m.className = 'ticket-modal';
      m.id = 'ticketModal';
      m.setAttribute('aria-hidden', 'true');
      m.innerHTML = `
      <section class="ticket-panel" role="dialog" aria-modal="true" aria-labelledby="ticketTitle">
        <div class="ticket-panel-head">
          <div>
            <div class="ticket-kicker">GIA HUY / HỎI ĐÁP</div>
            <h2 class="ticket-title" id="ticketTitle"><span class="ticket-seal">GH</span> Trung tâm hỗ trợ</h2>
            <p class="ticket-subtitle">Tạo yêu cầu, theo dõi vị trí trong hàng chờ và xem lịch sử xử lý ngay trên website.</p>
          </div>
          <button type="button" class="ticket-close" id="ticketClose" aria-label="Đóng">${ico('x')}</button>
        </div>
        <a class="ticket-discord-banner" id="ticketDiscordBanner" href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer">
          <span class="tdb-icon">${ico('chat-bubble')}</span>
          <span class="tdb-text"><b>Tham gia nhóm Discord của lớp</b><span>Trao đổi trực tiếp, nhận thông báo ticket nhanh hơn</span></span>
          <span class="tdb-arrow">${ico('external-link')}</span>
        </a>
        <div class="ticket-tabs" role="tablist">
          <button type="button" class="ticket-tab active" data-ticket-tab="create">${ico('note-add')} Tạo ticket</button>
          <button type="button" class="ticket-tab" data-ticket-tab="queue">${ico('list')} Hàng chờ</button>
          <button type="button" class="ticket-tab" data-ticket-tab="history">${ico('history')} Lịch sử</button>
          <button type="button" class="ticket-tab" data-ticket-tab="admin">${ico('shield-alt')} Quản trị</button>
        </div>
        <div id="ticketBody"></div>
      </section>`;
      document.body.appendChild(m);
    }
    updateCount();
    bindShellOnce();
  }

  let shellBound = false;
  function bindShellOnce() {
    if (shellBound) return;
    shellBound = true;
    document.addEventListener('click', e => {
      const openBtn = e.target.closest('#ticketOpen, [data-open-ticket-nav]');
      if (openBtn) {
        e.preventDefault();
        e.stopPropagation();
        open('create');
        return;
      }
      if (e.target.closest('#ticketClose')) {
        e.preventDefault();
        close();
        return;
      }
      if (e.target.id === 'ticketModal') {
        close();
        return;
      }
      const tab = e.target.closest('.ticket-tab[data-ticket-tab]');
      if (tab && $('#ticketModal')?.classList.contains('open')) {
        e.preventDefault();
        renderTab(tab.dataset.ticketTab);
        return;
      }
      // Admin queue actions (delegation)
      const body = $('#ticketBody');
      if (!body || !body.contains(e.target)) return;

      const stBtn = e.target.closest('[data-status]');
      if (stBtn) {
        e.preventDefault();
        const a = get(), x = a.find(t => t.id === stBtn.dataset.id);
        if (!x) return;
        x.status = stBtn.dataset.status;
        x.updated = Date.now();
        set(a);
        notify(`${x.id}: ${statusLabel[x.status]}`);
        renderTab('admin');
        updateCount();
        return;
      }
      const muteBtn = e.target.closest('[data-mute-guest]');
      if (muteBtn) {
        e.preventDefault();
        const gid = muteBtn.dataset.muteGuest;
        if (!gid) return;
        if (!confirm('Mute ticket tài khoản khách này? Họ sẽ không gửi được ticket mới.')) return;
        if (window.Auth && Auth.setGuestMuted) {
          const r = Auth.setGuestMuted(gid, true);
          if (r.ok) notify('Đã mute tài khoản khách.');
          else notify(r.msg || 'Không mute được', 'error');
        } else {
          notify('Không thể mute (Auth chưa sẵn sàng).', 'error');
        }
        return;
      }
      const delBtn = e.target.closest('[data-delete]');
      if (delBtn) {
        e.preventDefault();
        if (!confirm('Xóa câu hỏi này?')) return;
        set(get().filter(x => x.id !== delBtn.dataset.delete));
        notify('Đã xóa câu hỏi.');
        renderTab('admin');
        updateCount();
        return;
      }
      const replyToggle = e.target.closest('[data-reply-toggle]');
      if (replyToggle) {
        e.preventDefault();
        const box = $('#replyBox-' + replyToggle.dataset.replyToggle);
        if (!box) return;
        box.hidden = !box.hidden;
        if (!box.hidden) box.querySelector('textarea')?.focus();
        return;
      }
      const cancelReply = e.target.closest('[data-cancel-reply]');
      if (cancelReply) {
        e.preventDefault();
        const box = $('#replyBox-' + cancelReply.dataset.cancelReply);
        if (!box) return;
        box.hidden = true;
        const ta = box.querySelector('textarea');
        if (ta) ta.value = '';
        return;
      }
      const sendReply = e.target.closest('[data-send-reply]');
      if (sendReply) {
        e.preventDefault();
        const id = sendReply.dataset.sendReply;
        const box = $('#replyBox-' + id);
        if (!box) return;
        const ta = box.querySelector('textarea');
        const text = (ta?.value || '').trim();
        if (!text) { notify('Nhập nội dung phản hồi trước khi gửi.', 'error'); return; }
        const all = get();
        const x = all.find(t => t.id === id);
        if (!x) return;
        x.replies = x.replies || [];
        x.replies.push({ text, time: Date.now() });
        x.updated = Date.now();
        set(all);
        try {
          if (window.GiahuyNotif && x.name && x.name !== 'Ẩn danh') {
            window.GiahuyNotif.push({
              title: 'Ticket được trả lời: ' + (x.title || x.id),
              body: text.slice(0, 160),
              type: 'ticket',
              to: x.name,
              from: 'Hỗ trợ'
            });
          }
        } catch (_) {}
        notify(`${id}: Đã gửi phản hồi.`);
        renderTab('admin');
        updateCount();
        return;
      }
      if (e.target.closest('#refreshQueue')) {
        e.preventDefault();
        renderTab('queue');
        return;
      }
      if (e.target.closest('#ticketFillExample')) {
        e.preventDefault();
        const f = $('#ticketForm');
        if (!f) return;
        f.title.value = 'Không tải được tài nguyên';
        f.name.value = 'Khách';
        f.category.value = 'bug';
        f.priority.value = 'medium';
        f.message.value = 'Mình không thể tải tài nguyên. Sau khi bấm nút tải, website không phản hồi hoặc báo lỗi.';
        return;
      }
      if (e.target.closest('#ticketExport')) {
        e.preventDefault();
        const blob = new Blob([JSON.stringify(get(), null, 2)], { type: 'application/json' });
        const u = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = u;
        a.download = 'giahuy-tickets.json';
        a.click();
        URL.revokeObjectURL(u);
        return;
      }
      if (e.target.closest('#ticketLogout')) {
        e.preventDefault();
        localStorage.removeItem(ADMIN_KEY);
        renderTab('admin');
      }
    });
    document.addEventListener('submit', e => {
      if (e.target && e.target.id === 'ticketForm') {
        e.preventDefault();
        createTicket(e);
      }
      if (e.target && e.target.id === 'ticketAdminLogin') {
        e.preventDefault();
        const pw = e.target.password?.value || '';
        if (pw === adminPass()) {
          localStorage.setItem(ADMIN_KEY, '1');
          renderTab('admin');
          notify('Đã mở chế độ quản trị ticket.');
        } else {
          notify('Sai mật khẩu.', 'error');
        }
      }
    });
    document.addEventListener('input', e => {
      if (e.target && e.target.id === 'ticketAdminSearch') drawAdminQueue();
    });
    document.addEventListener('change', e => {
      if (e.target && e.target.id === 'ticketAdminFilter') drawAdminQueue();
    });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  function open(tab = 'create') {
    const m = $('#ticketModal');
    if (!m) return;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderTab(tab);
  }
  function close() {
    const m = $('#ticketModal');
    if (!m) return;
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function updateCount() {
    const pending = get().filter(x => x.status === 'pending' || x.status === 'progress').length;
    const el = $('#ticketCount');
    if (el) el.textContent = pending;
    $('#ticketOpen')?.classList.toggle('is-busy', pending > 0);
  }
  function renderTab(tab) {
    $$('.ticket-tab').forEach(b => b.classList.toggle('active', b.dataset.ticketTab === tab));
    const body = $('#ticketBody');
    if (!body) return;
    if (tab === 'create') renderCreate(body);
    else if (tab === 'queue') renderQueue(body);
    else if (tab === 'history') renderHistory(body);
    else renderAdmin(body);
  }

  function renderCreate(body) {
    body.innerHTML = `<div class="ticket-layout"><div class="ticket-card"><form class="ticket-form" id="ticketForm">
      <div class="ticket-row">
        <label class="ticket-field"><span>Tiêu đề *</span><input name="title" required maxlength="90" placeholder="Ví dụ: Không tải được file plugin"></label>
        <label class="ticket-field"><span>Tên người gửi</span><input name="name" maxlength="50" placeholder="Tên hiển thị"></label>
      </div>
      <div class="ticket-row">
        <label class="ticket-field"><span>Loại yêu cầu *</span><select name="category">${Object.entries(cats).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
        <label class="ticket-field"><span>Mức ưu tiên</span><select name="priority"><option value="low">Thấp</option><option value="medium" selected>Trung bình</option><option value="high">Cao</option></select></label>
      </div>
      <label class="ticket-field"><span>Nội dung *</span><textarea name="message" required maxlength="1200" placeholder="Mô tả vấn đề, link tài nguyên hoặc điều bạn cần hỗ trợ..."></textarea></label>
      <div class="ticket-actions">
        <button class="ticket-btn primary" type="submit">${ico('send')} Gửi ticket vào hàng chờ</button>
        <button class="ticket-btn ghost" type="button" id="ticketFillExample">${ico('pencil')} Điền mẫu</button>
      </div>
      <div class="ticket-helper">Ticket sẽ nhận mã tự động. Mở mục "Hàng chờ" để theo dõi trạng thái và phản hồi từ admin.</div>
    </form></div>
    <div class="ticket-card">
      <div class="queue-head"><h3>Quy trình xử lý</h3><span class="status-pill status-progress">${ico('media-play')} 24/7</span></div>
      <div class="ticket-admin-note">1. Gửi yêu cầu → 2. Xếp hàng theo ưu tiên → 3. Admin duyệt / trả lời → 4. Đóng ticket.</div>
      <div class="ticket-stats">
        <div class="ticket-stat"><span>${ico('clock')} Đang chờ</span><b id="quickPending">0</b></div>
        <div class="ticket-stat"><span>${ico('cog')} Đang xử lý</span><b id="quickProgress">0</b></div>
        <div class="ticket-stat"><span>${ico('check-circle')} Đã duyệt</span><b id="quickResolved">0</b></div>
        <div class="ticket-stat"><span>${ico('inbox')} Tổng</span><b id="quickTotal">0</b></div>
      </div>
      <div class="queue-list" id="recentTicketList"></div>
    </div></div>`;
    renderQuickStats();
  }

  function renderQuickStats() {
    const a = get();
    const c = s => a.filter(x => x.status === s).length;
    const map = { quickPending: c('pending'), quickProgress: c('progress'), quickResolved: c('resolved'), quickTotal: a.length };
    Object.entries(map).forEach(([id, v]) => { const el = $('#' + id); if (el) el.textContent = v; });
    const box = $('#recentTicketList');
    if (!box) return;
    const arr = [...a].sort((x, y) => y.created - x.created).slice(0, 5);
    box.innerHTML = arr.length ? arr.map(x => ticketItem(x)).join('') : '<div class="queue-empty">Chưa có ticket nào.</div>';
  }

  function replyThread(x) {
    const list = x.replies || [];
    if (!list.length) return '';
    return `<div class="reply-thread">${list.map(r => `<div class="reply-msg"><div class="reply-msg-head"><span class="reply-author">${ico('user')} Admin</span><span class="reply-time">${fmt(r.time)}</span></div><p>${esc(r.text)}</p></div>`).join('')}</div>`;
  }

  function ticketItem(x, admin = false) {
    const replies = x.replies || [];
    const replyBadge = replies.length ? `<span class="reply-count-pill">${ico('comment-bubble')} ${replies.length}</span>` : '';
    const guestBadge = (x.isGuest || x.guestLabel)
      ? `<span class="status-pill" style="background:#fff3cd;color:#856404;border-color:#ffeaa7">Khách</span>`
      : '';
    const muteBtn = (admin && x.isGuest && x.guestId)
      ? `<button class="qa-btn" data-mute-guest="${esc(x.guestId)}" type="button">${ico('ban')} Mute ticket acc khách</button>`
      : '';
    return `<article class="queue-item status-${esc(x.status)}">
      <div class="queue-top">
        <div><div class="queue-id">${esc(x.id)}</div><div class="queue-meta">${esc(x.title)} • ${esc(cats[x.category] || x.category)} • ${fmt(x.created)}</div></div>
        <div class="queue-pills">${guestBadge} ${statusPill(x.status)} ${priorityPill(x.priority)} ${replyBadge}</div>
      </div>
      <p class="queue-text">${esc(x.message)}</p>
      ${replyThread(x)}
      ${admin ? `<div class="queue-meta">Người gửi: ${esc(x.name || 'Ẩn danh')}${x.isGuest ? ' · <b>Tài khoản khách</b>' : ''}</div>
      <div class="queue-actions">
        <button class="qa-btn qa-approve" data-status="resolved" data-id="${esc(x.id)}" type="button">${ico('check')} Duyệt</button>
        <button class="qa-btn qa-progress" data-status="progress" data-id="${esc(x.id)}" type="button">${ico('cog')} Nhận xử lý</button>
        <button class="qa-btn qa-reject" data-status="rejected" data-id="${esc(x.id)}" type="button">${ico('x')} Từ chối</button>
        <button class="qa-btn qa-pending" data-status="pending" data-id="${esc(x.id)}" type="button">${ico('reload')} Đặt lại chờ</button>
        <button class="qa-btn qa-reply" data-reply-toggle="${esc(x.id)}" type="button">${ico('comment-bubble')} Trả lời</button>
        ${muteBtn}
        <button class="qa-btn qa-delete" data-delete="${esc(x.id)}" type="button">${ico('trash')} Xóa</button>
      </div>
      <div class="reply-box" id="replyBox-${esc(x.id)}" hidden>
        <textarea placeholder="Nhập phản hồi gửi tới người tạo ticket..." maxlength="800"></textarea>
        <div class="reply-box-actions">
          <button class="ticket-btn primary" data-send-reply="${esc(x.id)}" type="button">${ico('send')} Gửi phản hồi</button>
          <button class="ticket-btn ghost" data-cancel-reply="${esc(x.id)}" type="button">Hủy</button>
        </div>
      </div>` : ''}
    </article>`;
  }

  function statusPill(s) { return `<span class="status-pill status-${s}">${esc(statusLabel[s] || s)}</span>`; }
  function priorityPill(p) { return `<span class="priority-pill priority-${p}">${esc(priorityLabel[p] || p)}</span>`; }

  function createTicket(e) {
    e.preventDefault();
    let session = null;
    try { session = JSON.parse(localStorage.getItem('giahuy-session') || 'null'); } catch (_) {}
    if (session && session.role === 'guest' && window.Auth && Auth.getGuestById) {
      const g = Auth.getGuestById(session.id);
      if (g && g.muted) {
        notify('Tài khoản khách đang bị mute ticket. Không thể gửi yêu cầu mới.', 'error');
        return;
      }
    }
    const f = new FormData(e.target || e.currentTarget);
    const title = String(f.get('title') || '').trim();
    const message = String(f.get('message') || '').trim();
    if (!title || !message) return;
    const now = Date.now();
    const isGuest = !!(session && (session.role === 'guest' || session.guest));
    const item = {
      id: uid(),
      title,
      name: String(f.get('name') || '').trim() || (session && session.username) || 'Ẩn danh',
      category: f.get('category') || 'other',
      priority: f.get('priority') || 'medium',
      message,
      status: 'pending',
      created: now,
      updated: now,
      replies: [],
      isGuest,
      guestId: isGuest && session ? session.id : null,
      guestLabel: isGuest ? 'Khách' : null
    };
    const all = get();
    all.push(item);
    set(all);
    (e.target || e.currentTarget).reset();
    notify(`Đã tạo ${item.id}. Ticket đã vào hàng chờ.`);
    renderTab('queue');
    updateCount();
  }

  function renderQueue(body) {
    const all = get().filter(x => x.status === 'pending' || x.status === 'progress')
      .sort((a, b) => {
        const p = { high: 0, medium: 1, low: 2 };
        return p[a.priority] - p[b.priority] || a.created - b.created;
      });
    body.innerHTML = `<div class="ticket-stats">
      <div class="ticket-stat"><span>${ico('clock')} Chờ xử lý</span><b>${all.filter(x => x.status === 'pending').length}</b></div>
      <div class="ticket-stat"><span>${ico('cog')} Đang xử lý</span><b>${all.filter(x => x.status === 'progress').length}</b></div>
      <div class="ticket-stat"><span>${ico('warning')} Ưu tiên cao</span><b>${all.filter(x => x.priority === 'high').length}</b></div>
      <div class="ticket-stat"><span>${ico('inbox')} Tổng đang mở</span><b>${all.length}</b></div>
    </div>
    <div class="ticket-card">
      <div class="queue-head"><h3>Hàng chờ hiện tại</h3><button type="button" class="ticket-btn" id="refreshQueue">${ico('reload')} Làm mới</button></div>
      <div class="ticket-helper">Thứ tự ưu tiên: Cao → Trung bình → Thấp; cùng mức xếp theo thời gian tạo.</div>
      <div class="queue-list" style="margin-top:10px">${all.length ? all.map(x => ticketItem(x)).join('') : `<div class="queue-empty">${ico('check-circle')} Không còn ticket đang chờ.</div>`}</div>
    </div>`;
  }

  function renderHistory(body) {
    const all = [...get()].sort((a, b) => b.updated - a.updated);
    body.innerHTML = `<div class="ticket-card">
      <div class="queue-head"><h3>Lịch sử ticket</h3><span class="ticket-helper">${all.length} ticket</span></div>
      <div class="queue-list">${all.length ? all.map(x => ticketItem(x)).join('') : '<div class="queue-empty">Chưa có lịch sử.</div>'}</div>
    </div>`;
  }

  function drawAdminQueue() {
    const q = ($('#ticketAdminSearch')?.value || '').toLowerCase();
    const st = $('#ticketAdminFilter')?.value || 'all';
    const arr = get().filter(x =>
      (st === 'all' || x.status === st) &&
      (!q || [x.id, x.title, x.name, x.message].join(' ').toLowerCase().includes(q))
    ).sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority] || b.updated - a.updated;
    });
    const box = $('#adminQueue');
    if (!box) return;
    box.innerHTML = arr.length ? arr.map(x => ticketItem(x, true)).join('') : '<div class="queue-empty">Không tìm thấy ticket phù hợp.</div>';
  }

  function renderAdmin(body) {
    if (localStorage.getItem(ADMIN_KEY) !== '1') {
      body.innerHTML = `<div class="ticket-card"><form class="ticket-form" id="ticketAdminLogin">
        <label class="ticket-field"><span>Mật khẩu quản trị</span><input type="password" name="password" placeholder="Nhập mật khẩu admin" required></label>
        <div class="ticket-actions"><button class="ticket-btn primary" type="submit">${ico('lock-unlocked')} Mở hàng chờ quản trị</button></div>
        <div class="ticket-helper">Dùng mật khẩu Admin của website (mặc định: <b>giahuy-admin</b>).</div>
      </form></div>`;
      return;
    }
    const a = get();
    body.innerHTML = `<div class="ticket-stats">
      <div class="ticket-stat"><span>${ico('clock')} Chờ</span><b>${a.filter(x => x.status === 'pending').length}</b></div>
      <div class="ticket-stat"><span>${ico('cog')} Đang xử lý</span><b>${a.filter(x => x.status === 'progress').length}</b></div>
      <div class="ticket-stat"><span>${ico('check-circle')} Đã duyệt</span><b>${a.filter(x => x.status === 'resolved').length}</b></div>
      <div class="ticket-stat"><span>${ico('inbox')} Tổng</span><b>${a.length}</b></div>
    </div>
    <div class="ticket-tools">
      <input id="ticketAdminSearch" placeholder="Tìm mã, tiêu đề, người gửi...">
      <select id="ticketAdminFilter"><option value="all">Tất cả trạng thái</option>${Object.entries(statusLabel).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
      <button type="button" class="ticket-btn" id="ticketExport">${ico('cloud-download')} Xuất JSON</button>
      <button type="button" class="ticket-btn" id="ticketLogout">${ico('account-logout')} Đăng xuất</button>
    </div>
    <div class="queue-list" id="adminQueue"></div>`;
    drawAdminQueue();
  }

  // Expose for external open
  window.openTicketCenter = open;

  ensureUI();
})();
