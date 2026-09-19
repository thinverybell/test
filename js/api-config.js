/**
 * Cấu hình API MySQL backend.
 *
 * Khi GIAHUY_API có giá trị (URL gốc, không có / cuối), toàn bộ data tài khoản
 * sẽ lưu 1 chiều vào MySQL qua server/ — không export file.
 *
 * Ví dụ:
 *   window.GIAHUY_API = 'http://localhost:3001';
 *   window.GIAHUY_API = 'https://api.ten-mien-cua-ban.com';
 *
 * Để trống / null → fallback localStorage (chế độ demo offline).
 */
(function (global) {
  // === Bật MySQL: gán URL API (vd. 'http://localhost:3001') ===
  // Để trống '' → dùng localStorage (không gọi server)
  if (typeof global.GIAHUY_API === 'undefined') {
    global.GIAHUY_API = '';
  }

  const TOKEN_KEY = 'giahuy-api-token';

  function base() {
    const b = global.GIAHUY_API;
    if (!b || typeof b !== 'string') return null;
    return b.replace(/\/+$/, '');
  }

  function enabled() {
    return !!base();
  }

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; }
  }

  function setToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (_) {}
  }

  async function request(path, opts) {
    const root = base();
    if (!root) throw new Error('GIAHUY_API chưa cấu hình');
    opts = opts || {};
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(root + path, {
      method: opts.method || 'GET',
      headers,
      body: opts.body != null ? JSON.stringify(opts.body) : undefined
    });
    let data = null;
    try { data = await res.json(); } catch (_) { data = { ok: false, msg: 'Phản hồi không phải JSON' }; }
    if (!res.ok && data && !data.msg) data.msg = 'HTTP ' + res.status;
    return data;
  }

  global.GiahuyAPI = {
    enabled,
    base,
    getToken,
    setToken,
    request,
    TOKEN_KEY
  };
})(typeof window !== 'undefined' ? window : this);
