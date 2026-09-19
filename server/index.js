'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { ping, query } = require('./db');
const { router: authRouter } = require('./routes/auth');
const accountsRouter = require('./routes/accounts');
const settingsRouter = require('./routes/settings');

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '8mb' }));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    name: 'Gia Huy Hub API',
    storage: 'MySQL',
    docs: {
      health: 'GET /api/auth/health',
      registerGuest: 'POST /api/auth/register-guest',
      loginGuest: 'POST /api/auth/login-guest',
      session: 'GET /api/auth/session'
    }
  });
});

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/settings', settingsRouter);

/** Seed admin password nếu chưa có */
async function seedAdmin() {
  const rows = await query('SELECT password_hash FROM admin_profile WHERE id = 1 LIMIT 1');
  if (!rows.length) return;
  if (rows[0].password_hash && String(rows[0].password_hash).length > 0) return;
  const pw = process.env.ADMIN_DEFAULT_PASSWORD || 'giahuy-admin';
  const hash = await bcrypt.hash(pw, 10);
  await query('UPDATE admin_profile SET password_hash = ?, updated_at = ? WHERE id = 1', [hash, Date.now()]);
  console.log('[seed] Admin password đã được hash (mặc định: ' + pw + ')');
}

async function start() {
  try {
    const ok = await ping();
    if (!ok) throw new Error('MySQL ping failed');
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`[giahuy-api] MySQL OK — lắng nghe http://localhost:${PORT}`);
      console.log('[giahuy-api] Data tài khoản lưu 1 chiều vào MySQL (data/sql/schema.sql)');
    });
  } catch (e) {
    console.error('[giahuy-api] Không kết nối được MySQL:', e.message);
    console.error('Kiểm tra file server/.env và đã import data/sql/schema.sql chưa.');
    process.exit(1);
  }
}

start();
