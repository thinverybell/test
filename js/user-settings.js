/**
 * UserSettings — thư mục logic lưu toàn bộ data setting người dùng
 * Thực tế data nằm trong localStorage (prefix giahuy-).
 * Module này gom key, export/import JSON, và cung cấp API thống nhất.
 *
 * Tài liệu: data/user-settings/README.md
 * Schema:   data/user-settings/schema.json
 */
(function (global) {
  'use strict';

  const PREFIX = 'giahuy-';
  const APP = 'giahuy-hub';
  const VERSION = 1;

  /** Key cố định (không gồm pattern động) */
  const FIXED_KEYS = [
    'giahuy-session',
    'giahuy-guests',
    'giahuy-students',
    'giahuy-teachers',
    'giahuy-managers',
    'giahuy-admin-profile',
    'giahuy-admin',
    'giahuy-classes',
    'giahuy-schedule',
    'giahuy-theme',
    'giahuy-avatar',
    'giahuy-announcement',
    'giahuy-notifications-v1',
    'giahuy-tickets-v1',
    'giahuy-ticket-seq',
    'giahuy-ticket-admin',
    'giahuy-history',
    'giahuy-last-track',
    'giahuy-fab-dock-pos',
    'giahuy-open-admin-tab',
    'giahuy-total-views'
  ];

  /** Pattern động */
  const PATTERNS = [
    /^giahuy-avatar-guest-/,
    /^giahuy-avatar-/,          // teacher / generic avatar by id
    /^giahuy-fav-/,
    /^giahuy-like-/,
    /^giahuy-dl-/
  ];

  function isUserKey(key) {
    if (!key || typeof key !== 'string') return false;
    if (!key.startsWith(PREFIX)) return false;
    // IndexedDB name không phải localStorage key cần export theo value
    if (key === 'giahuy-hub') return false;
    return true;
  }

  function listKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (isUserKey(k)) keys.push(k);
    }
    return keys.sort();
  }

  function collectAll() {
    const map = {};
    listKeys().forEach(k => {
      try {
        map[k] = localStorage.getItem(k);
      } catch (_) {}
    });
    return map;
  }

  function buildExportPayload() {
    return {
      meta: {
        app: APP,
        version: VERSION,
        exportedAt: new Date().toISOString(),
        source: 'UserSettings.exportAll',
        keyCount: 0,
        folder: 'data/user-settings'
      },
      localStorage: collectAll()
    };
  }

  function downloadJson(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || ('giahuy-user-settings-' + Date.now() + '.json');
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 800);
  }

  function exportAll(filename) {
    const payload = buildExportPayload();
    payload.meta.keyCount = Object.keys(payload.localStorage).length;
    downloadJson(payload, filename);
    return payload;
  }

  /**
   * @param {object} data - payload { meta?, localStorage: { key: value } }
   * @param {{ merge?: boolean }} opts - merge=true: ghi đè từng key; false: xóa hết key giahuy- rồi ghi mới
   */
  function importAll(data, opts) {
    opts = opts || {};
    const merge = opts.merge !== false;
    if (!data || typeof data !== 'object') {
      return { ok: false, msg: 'Dữ liệu không hợp lệ.' };
    }
    const map = data.localStorage || data;
    if (!map || typeof map !== 'object' || Array.isArray(map)) {
      return { ok: false, msg: 'Thiếu object localStorage trong file.' };
    }

    if (!merge) {
      listKeys().forEach(k => {
        try { localStorage.removeItem(k); } catch (_) {}
      });
    }

    let written = 0;
    Object.keys(map).forEach(k => {
      if (!isUserKey(k)) return;
      try {
        const v = map[k];
        if (v == null) localStorage.removeItem(k);
        else localStorage.setItem(k, String(v));
        written++;
      } catch (_) {}
    });

    return { ok: true, written, merge };
  }

  function importFromFile(file, opts) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve({ ok: false, msg: 'Chưa chọn file.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result || '{}'));
          const r = importAll(data, opts);
          resolve(r);
        } catch (e) {
          resolve({ ok: false, msg: 'File JSON không đọc được: ' + (e && e.message) });
        }
      };
      reader.onerror = () => resolve({ ok: false, msg: 'Không đọc được file.' });
      reader.readAsText(file, 'utf-8');
    });
  }

  function clearUserData(opts) {
    opts = opts || {};
    const keepSession = !!opts.keepSession;
    const keys = listKeys().filter(k => {
      if (keepSession && k === 'giahuy-session') return false;
      return true;
    });
    keys.forEach(k => {
      try { localStorage.removeItem(k); } catch (_) {}
    });
    return { ok: true, removed: keys.length };
  }

  function summary() {
    const keys = listKeys();
    const groups = {
      auth: 0,
      accounts: 0,
      school: 0,
      ui: 0,
      tickets: 0,
      activity: 0,
      other: 0
    };
    keys.forEach(k => {
      if (k === 'giahuy-session' || k === 'giahuy-admin') groups.auth++;
      else if (/guests|students|teachers|managers|admin-profile/.test(k)) groups.accounts++;
      else if (/classes|schedule/.test(k)) groups.school++;
      else if (/theme|avatar|announcement|notifications|fab|last-track|open-admin/.test(k)) groups.ui++;
      else if (/ticket/.test(k)) groups.tickets++;
      else if (/fav-|like-|dl-|history|total-views/.test(k)) groups.activity++;
      else groups.other++;
    });
    return {
      totalKeys: keys.length,
      groups,
      keys,
      folder: 'data/user-settings',
      fixedKeys: FIXED_KEYS.slice()
    };
  }

  /** Gắn UI nhỏ: input file ẩn + helper mở dialog */
  function pickFileAndImport(opts) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.addEventListener('change', async () => {
        const f = input.files && input.files[0];
        input.remove();
        if (!f) {
          resolve({ ok: false, msg: 'Đã hủy.' });
          return;
        }
        const r = await importFromFile(f, opts);
        resolve(r);
      });
      input.click();
    });
  }

  const api = {
    PREFIX,
    FIXED_KEYS,
    listKeys,
    collectAll,
    exportAll,
    importAll,
    importFromFile,
    pickFileAndImport,
    clearUserData,
    summary,
    isUserKey,
    /** Đường dẫn thư mục tài liệu trong project */
    FOLDER: 'data/user-settings'
  };

  global.UserSettings = api;
})(typeof window !== 'undefined' ? window : this);
