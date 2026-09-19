'use strict';

const express = require('express');
const { query } = require('../db');
const { requireSession } = require('./auth');

const router = express.Router();

/** Lấy 1 setting */
router.get('/:key', async (req, res) => {
  try {
    const rows = await query(
      'SELECT setting_key, setting_value, updated_at FROM site_settings WHERE setting_key = ? LIMIT 1',
      [req.params.key]
    );
    if (!rows.length) return res.json({ ok: true, value: null });
    res.json({ ok: true, key: rows[0].setting_key, value: rows[0].setting_value, updatedAt: Number(rows[0].updated_at) });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

/** Lấy nhiều setting (query ?keys=a,b,c) */
router.get('/', async (req, res) => {
  try {
    const keys = String(req.query.keys || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    if (!keys.length) {
      const all = await query('SELECT setting_key, setting_value, updated_at FROM site_settings');
      const map = {};
      all.forEach(r => { map[r.setting_key] = r.setting_value; });
      return res.json({ ok: true, settings: map });
    }
    const placeholders = keys.map(() => '?').join(',');
    const rows = await query(
      `SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN (${placeholders})`,
      keys
    );
    const map = {};
    rows.forEach(r => { map[r.setting_key] = r.setting_value; });
    res.json({ ok: true, settings: map });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

/** Ghi setting (admin / staff) — lưu 1 chiều vào MySQL */
router.put('/:key', requireSession, async (req, res) => {
  try {
    if (!['admin', 'teacher', 'manager'].includes(req.session.role)) {
      return res.status(403).json({ ok: false, msg: 'Không có quyền.' });
    }
    const key = req.params.key;
    const value = req.body.value != null ? String(req.body.value) : null;
    const now = Date.now();
    await query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = VALUES(updated_at)`,
      [key, value, now]
    );
    res.json({ ok: true, key, value });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

module.exports = router;
