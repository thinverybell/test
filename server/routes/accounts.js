'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { requireSession, newId } = require('./auth');

const router = express.Router();

function genInvite(prefix) {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  return prefix + '-' + part;
}

function parsePerms(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

// ---------- Guest: lấy theo id ----------
router.get('/guests/:id', async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, username, avatar, muted, created_at AS created FROM guests WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    if (!rows.length) return res.json({ ok: false, msg: 'Không tìm thấy.' });
    const g = rows[0];
    res.json({
      ok: true,
      account: {
        id: g.id,
        username: g.username,
        avatar: g.avatar,
        muted: !!g.muted,
        created: Number(g.created)
      }
    });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Guest: cập nhật hồ sơ (avatar / username / password) ----------
router.put('/guests/:id', requireSession, async (req, res) => {
  try {
    const s = req.session;
    const id = req.params.id;
    if (s.role !== 'admin' && !(s.role === 'guest' && s.id === id)) {
      return res.status(403).json({ ok: false, msg: 'Không có quyền.' });
    }

    const rows = await query('SELECT * FROM guests WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return res.json({ ok: false, msg: 'Không tìm thấy tài khoản.' });
    const row = rows[0];
    const opts = req.body || {};

    let username = row.username;
    let passwordHash = row.password_hash;
    let avatar = row.avatar;

    if (opts.username != null) {
      const u = String(opts.username).trim();
      if (u.length < 2) return res.json({ ok: false, msg: 'Tên đăng nhập quá ngắn.' });
      const taken = await query(
        `SELECT id FROM guests WHERE LOWER(username)=LOWER(?) AND id <> ?
         UNION SELECT id FROM students WHERE LOWER(username)=LOWER(?)
         UNION SELECT id FROM teachers WHERE LOWER(username)=LOWER(?)
         UNION SELECT id FROM managers WHERE LOWER(username)=LOWER(?)
         LIMIT 1`,
        [u, id, u, u, u]
      );
      if (taken.length) return res.json({ ok: false, msg: 'Tên đăng nhập đã tồn tại.' });
      username = u;
    }

    if (opts.password != null && String(opts.password).trim()) {
      const pw = String(opts.password).trim();
      if (pw.length < 4) return res.json({ ok: false, msg: 'Mật khẩu tối thiểu 4 ký tự.' });
      passwordHash = await bcrypt.hash(pw, 10);
    }

    if (opts.avatar !== undefined) {
      avatar = opts.avatar || null;
    }

    const now = Date.now();
    await query(
      `UPDATE guests SET username = ?, password_hash = ?, avatar = ?, updated_at = ? WHERE id = ?`,
      [username, passwordHash, avatar, now, id]
    );

    res.json({
      ok: true,
      account: { id, username, avatar, muted: !!row.muted, created: Number(row.created_at) }
    });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Danh sách guests (admin/staff) ----------
router.get('/guests', requireSession, async (req, res) => {
  try {
    if (!['admin', 'teacher', 'manager'].includes(req.session.role)) {
      return res.status(403).json({ ok: false, msg: 'Không có quyền.' });
    }
    const rows = await query(
      'SELECT id, username, avatar, muted, created_at AS created FROM guests ORDER BY created_at DESC'
    );
    res.json({
      ok: true,
      list: rows.map(g => ({
        id: g.id,
        username: g.username,
        avatar: g.avatar,
        muted: !!g.muted,
        created: Number(g.created)
      }))
    });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Mute guest ----------
router.post('/guests/:id/mute', requireSession, async (req, res) => {
  try {
    if (!['admin', 'teacher', 'manager'].includes(req.session.role)) {
      return res.status(403).json({ ok: false, msg: 'Không có quyền.' });
    }
    const muted = req.body.muted ? 1 : 0;
    await query('UPDATE guests SET muted = ?, updated_at = ? WHERE id = ?', [muted, Date.now(), req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Students ----------
router.get('/students', requireSession, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM students ORDER BY created_at DESC');
    res.json({
      ok: true,
      list: rows.map(s => ({
        id: s.id,
        username: s.username,
        inviteCode: s.invite_code,
        ownerId: s.owner_id,
        classId: s.class_id,
        created: Number(s.created_at)
      }))
    });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

router.post('/students', requireSession, async (req, res) => {
  try {
    if (!['admin', 'teacher', 'manager'].includes(req.session.role)) {
      return res.status(403).json({ ok: false, msg: 'Không có quyền.' });
    }
    const u = String(req.body.username || '').trim();
    if (u.length < 2) return res.json({ ok: false, msg: 'Tên đăng nhập quá ngắn.' });
    const id = newId('st_');
    const invite = genInvite('HS');
    const now = Date.now();
    await query(
      `INSERT INTO students (id, username, invite_code, owner_id, class_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, u, invite, req.body.ownerId || req.session.id || 'admin', req.body.classId || null, now]
    );
    res.json({
      ok: true,
      account: { id, username: u, inviteCode: invite, ownerId: req.body.ownerId || 'admin', classId: req.body.classId || null, created: now }
    });
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') return res.json({ ok: false, msg: 'Tên đăng nhập đã tồn tại.' });
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Teachers ----------
router.get('/teachers', requireSession, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM teachers ORDER BY created_at DESC');
    res.json({
      ok: true,
      list: rows.map(t => ({
        id: t.id,
        username: t.username,
        inviteCode: t.invite_code,
        avatar: t.avatar,
        permissions: parsePerms(t.permissions),
        created: Number(t.created_at)
      }))
    });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

router.post('/teachers', requireSession, async (req, res) => {
  try {
    if (req.session.role !== 'admin' && req.session.role !== 'manager') {
      return res.status(403).json({ ok: false, msg: 'Không có quyền.' });
    }
    const u = String(req.body.username || '').trim();
    if (u.length < 2) return res.json({ ok: false, msg: 'Tên đăng nhập quá ngắn.' });
    const id = newId('tc_');
    const invite = genInvite('GV');
    const perms = Array.isArray(req.body.permissions) ? req.body.permissions : [];
    const now = Date.now();
    await query(
      `INSERT INTO teachers (id, username, invite_code, avatar, permissions, created_at)
       VALUES (?, ?, ?, NULL, ?, ?)`,
      [id, u, invite, JSON.stringify(perms), now]
    );
    res.json({
      ok: true,
      account: { id, username: u, inviteCode: invite, avatar: null, permissions: perms, created: now }
    });
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') return res.json({ ok: false, msg: 'Tên đăng nhập đã tồn tại.' });
    res.status(500).json({ ok: false, msg: e.message });
  }
});

router.get('/teachers/:id/avatar', async (req, res) => {
  try {
    const rows = await query('SELECT avatar FROM teachers WHERE id = ? LIMIT 1', [req.params.id]);
    res.json({ ok: true, avatar: rows.length ? rows[0].avatar : null });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

router.put('/teachers/:id/avatar', requireSession, async (req, res) => {
  try {
    const id = req.params.id;
    if (req.session.role !== 'admin' && !(req.session.role === 'teacher' && req.session.id === id)) {
      return res.status(403).json({ ok: false, msg: 'Không có quyền.' });
    }
    await query('UPDATE teachers SET avatar = ? WHERE id = ?', [req.body.avatar || null, id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Managers ----------
router.get('/managers', requireSession, async (req, res) => {
  try {
    if (req.session.role !== 'admin') {
      return res.status(403).json({ ok: false, msg: 'Không có quyền.' });
    }
    const rows = await query('SELECT * FROM managers ORDER BY created_at DESC');
    res.json({
      ok: true,
      list: rows.map(m => ({
        id: m.id,
        username: m.username,
        inviteCode: m.invite_code,
        permissions: parsePerms(m.permissions),
        created: Number(m.created_at)
      }))
    });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// ---------- Admin profile ----------
router.get('/admin-profile', requireSession, async (req, res) => {
  try {
    if (req.session.role !== 'admin') {
      return res.status(403).json({ ok: false, msg: 'Không có quyền.' });
    }
    const rows = await query('SELECT username, updated_at FROM admin_profile WHERE id = 1 LIMIT 1');
    res.json({ ok: true, profile: rows[0] || null });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

module.exports = router;
