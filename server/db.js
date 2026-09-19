'use strict';

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'giahuy_hub',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params || []);
  return rows;
}

async function ping() {
  const rows = await query('SELECT 1 AS ok');
  return rows && rows[0] && rows[0].ok === 1;
}

module.exports = { pool, query, ping };
