'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../db');

const router = express.Router();
const SESSION_TTL = Number(process.env.SESSION_TTL_MS || 7 * 24 * 60 * 60 * 1000);

function newId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function newToken() {
  return crypto.randomBytes(24).toString('hex');
}

async function createSession(role, userId, username, permissions) {
  const token = newToken();
  const now = Date.now();
  const exp = now + SESSION_TTL;
  await query(
    `INSERT INTO sessions (token, role, user_id, username, permissions, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [token, role, userId || null, username, permissions ? JSON.stringify(permissions) : null, now, exp]
  );
  return {
    token,
    role,
    id: userId || null,
    username,
    permissions: permissions || undefined,
    guest: role === 'guest' || undefined,
    at: now,
    expiresAt: exp
  };
}

async function getSessionByToken(token) {
  if (!token) return null;
  const rows = await query(
    'SELECT * FROM sessions WHERE token = ? AND expires_at > ? LIMIT 1',
    [token, Date.now()]
  );
  if (!rows.length) return null;
  const s = rows[0];
  let permissions = null;
  try { permissions = s.permissions ? JSON.parse(s.permissions) : null; } catch (_) {}
  return {
    token: s.token,
    role: s.role,
    id: s.user_id,
    username: s.username,
    permissions: permissions || undefined,
    guest: s.role === 'guest' || undefined,
    at: Number(s.created_at),
    expiresAt: Number(s.expires_at)
  };
}

function authHeader(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  return req.headers['x-session-token'] || req.body?.token || req.query?.token || null;
}

/** Middleware: gắn req.session nếu có token hợp lệ */
async function requireSession(req, res, next) {
  try {
    const token = authHeader(req);
    const s = await getSessionByToken(token);
    if (!s) return res.status(401).json({ ok: false, msg: 'Chưa đăng nhập hoặc phiên hết hạn.' });
    req.session = s;
    next();
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
}

// ---------- Public: health ----------
router.get('/health', async (_req, res) => {
  try {
    res.json({ ok: true, service: 'giahuy-auth', ts: Date.now() });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Session hiện tại ----------
router.get('/session', async (req, res) => {
  try {
    const s = await getSessionByToken(authHeader(req));
    if (!s) return res.json({ ok: true, session: null });
    res.json({ ok: true, session: s });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Đăng xuất ----------
router.post('/logout', async (req, res) => {
  try {
    const token = authHeader(req);
    if (token) await query('DELETE FROM sessions WHERE token = ?', [token]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Đăng ký khách ----------
router.post('/register-guest', async (req, res) => {
  try {
    const u = String(req.body.username || '').trim();
    const pw = String(req.body.password || '').trim();
    if (!u || u.length < 2) return res.json({ ok: false, msg: 'Tên đăng nhập quá ngắn.' });
    if (pw.length < 4) return res.json({ ok: false, msg: 'Mật khẩu tối thiểu 4 ký tự.' });

    const taken = await query(
      `SELECT username FROM guests WHERE LOWER(username)=LOWER(?)
       UNION SELECT username FROM students WHERE LOWER(username)=LOWER(?)
       UNION SELECT username FROM teachers WHERE LOWER(username)=LOWER(?)
       UNION SELECT username FROM managers WHERE LOWER(username)=LOWER(?)
       LIMIT 1`,
      [u, u, u, u]
    );
    if (taken.length) return res.json({ ok: false, msg: 'Tên đăng nhập đã tồn tại.' });

    const id = newId('gs_');
    const hash = await bcrypt.hash(pw, 10);
    const now = Date.now();
    await query(
      `INSERT INTO guests (id, username, password_hash, avatar, muted, created_at, updated_at)
       VALUES (?, ?, ?, NULL, 0, ?, ?)`,
      [id, u, hash, now, now]
    );
    const session = await createSession('guest', id, u, null);
    res.json({ ok: true, account: { id, username: u, avatar: null, muted: false, created: now }, session });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Đăng nhập khách ----------
router.post('/login-guest', async (req, res) => {
  try {
    const u = String(req.body.username || '').trim();
    const pw = String(req.body.password || '').trim();
    if (!u || !pw) return res.json({ ok: false, msg: 'Nhập đủ tên đăng nhập và mật khẩu.' });

    const rows = await query('SELECT * FROM guests WHERE username = ? LIMIT 1', [u]);
    if (!rows.length) return res.json({ ok: false, msg: 'Sai tên đăng nhập hoặc mật khẩu khách.' });
    const g = rows[0];
    if (Number(g.muted)) return res.json({ ok: false, msg: 'Tài khoản khách đang bị hạn chế. Liên hệ hỗ trợ.' });

    const match = await bcrypt.compare(pw, g.password_hash);
    if (!match) return res.json({ ok: false, msg: 'Sai tên đăng nhập hoặc mật khẩu khách.' });

    const session = await createSession('guest', g.id, g.username, null);
    res.json({
      ok: true,
      account: { id: g.id, username: g.username, avatar: g.avatar, muted: !!g.muted, created: Number(g.created_at) },
      session
    });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Đăng nhập học sinh ----------
router.post('/login-student', async (req, res) => {
  try {
    const u = String(req.body.username || '').trim();
    const inv = String(req.body.invite || '').trim();
    if (!u || !inv) return res.json({ ok: false, msg: 'Nhập đủ tên đăng nhập và mã mời.' });
    const rows = await query(
      'SELECT * FROM students WHERE LOWER(username)=LOWER(?) AND invite_code = ? LIMIT 1',
      [u, inv]
    );
    if (!rows.length) return res.json({ ok: false, msg: 'Sai tên đăng nhập hoặc mã mời học sinh.' });
    const s = rows[0];
    const session = await createSession('student', s.id, s.username, null);
    session.ownerId = s.owner_id;
    res.json({ ok: true, session });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Đăng nhập giáo viên ----------
router.post('/login-teacher', async (req, res) => {
  try {
    const u = String(req.body.username || '').trim();
    const inv = String(req.body.invite || '').trim();
    if (!u || !inv) return res.json({ ok: false, msg: 'Nhập đủ tên đăng nhập và mã mời giáo viên.' });
    const rows = await query(
      'SELECT * FROM teachers WHERE LOWER(username)=LOWER(?) AND invite_code = ? LIMIT 1',
      [u, inv]
    );
    if (!rows.length) return res.json({ ok: false, msg: 'Sai tên đăng nhập hoặc mã mời giáo viên.' });
    const t = rows[0];
    let perms = [];
    try { perms = t.permissions ? JSON.parse(t.permissions) : []; } catch (_) {}
    const session = await createSession('teacher', t.id, t.username, perms);
    res.json({ ok: true, session });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Đăng nhập quản lý ----------
router.post('/login-manager', async (req, res) => {
  try {
    const u = String(req.body.username || '').trim();
    const inv = String(req.body.invite || '').trim();
    if (!u || !inv) return res.json({ ok: false, msg: 'Nhập đủ tên đăng nhập và mã mời quản lí.' });
    const rows = await query(
      'SELECT * FROM managers WHERE LOWER(username)=LOWER(?) AND invite_code = ? LIMIT 1',
      [u, inv]
    );
    if (!rows.length) return res.json({ ok: false, msg: 'Sai tên đăng nhập hoặc mã mời quản lí.' });
    const m = rows[0];
    let perms = [];
    try { perms = m.permissions ? JSON.parse(m.permissions) : []; } catch (_) {}
    const session = await createSession('manager', m.id, m.username, perms);
    res.json({ ok: true, session });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Đăng nhập admin ----------
router.post('/login-admin', async (req, res) => {
  try {
    const pw = String(req.body.password || '');
    const rows = await query('SELECT * FROM admin_profile WHERE id = 1 LIMIT 1');
    if (!rows.length) return res.json({ ok: false, msg: 'Chưa cấu hình admin.' });
    const profile = rows[0];
    if (!profile.password_hash) {
      return res.json({ ok: false, msg: 'Admin chưa được seed mật khẩu. Khởi động lại server.' });
    }
    const match = await bcrypt.compare(pw, profile.password_hash);
    if (!match) return res.json({ ok: false, msg: 'Mật khẩu quản trị viên không đúng.' });
    const session = await createSession('admin', null, profile.username, null);
    res.json({ ok: true, session });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

module.exports = { router, requireSession, getSessionByToken, authHeader, createSession, newId };
