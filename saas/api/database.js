/**
 * database.js — MySQL database layer for Insijam API
 *
 * Requires: npm install mysql2 dotenv
 *
 * Setup:
 *   1. Copy .env.example to .env and fill in your MySQL credentials
 *   2. Run:  mysql -u root -p < schema.sql
 *   3. Start the server: npm start
 */

'use strict';

require('dotenv').config();

const mysql = require('mysql2/promise');

// ─────────────────────────────────────────────
// Connection pool
// ─────────────────────────────────────────────
const pool = mysql.createPool({
  host:               process.env.DB_HOST || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER || 'root',
  password:           process.env.DB_PASS || '',
  database:           process.env.DB_NAME || 'insijam',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
  charset:            'utf8mb4',
});

// ─────────────────────────────────────────────
// Query helpers
// ─────────────────────────────────────────────

/** Run SQL — returns rows[] for SELECT, ResultSetHeader for DML. */
async function q(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

/** SELECT, return first row or null. */
async function q1(sql, params = []) {
  const rows = await q(sql, params);
  return Array.isArray(rows) ? (rows[0] || null) : rows;
}

// ─────────────────────────────────────────────
// Customer queries
// ─────────────────────────────────────────────
const customers = {
  findByEmail:  (email)  => q1('SELECT * FROM customers WHERE email = ?',   [email]),
  findById:     (id)     => q1('SELECT * FROM customers WHERE id = ?',      [id]),
  findByApiKey: (apiKey) => q1('SELECT * FROM customers WHERE api_key = ?', [apiKey]),

  findAll: () => q(`
    SELECT c.*,
           (SELECT COUNT(*) FROM licenses l WHERE l.customer_id = c.id) AS license_count
    FROM customers c ORDER BY c.created_at DESC`),

  count: () => q1('SELECT COUNT(*) AS n FROM customers').then(r => r ? r.n : 0),

  create: ({ id, email, password, name, org, plan, apiKey }) =>
    q('INSERT INTO customers (id, email, password, name, org, plan, api_key) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, email, password, name, org || '', plan, apiKey]),

  update: ({ name, org, id }) =>
    q('UPDATE customers SET name=?, org=? WHERE id=?', [name, org || '', id]),

  updatePassword: ({ password, id }) =>
    q('UPDATE customers SET password=? WHERE id=?', [password, id]),

  updateStatus: ({ status, id }) =>
    q('UPDATE customers SET status=? WHERE id=?', [status, id]),

  updatePlan: ({ plan, id }) =>
    q('UPDATE customers SET plan=? WHERE id=?', [plan, id]),

  delete: (id) => q('DELETE FROM customers WHERE id=?', [id]),
};

// ─────────────────────────────────────────────
// Subscription queries
// ─────────────────────────────────────────────
const subscriptions = {
  findByCustomer: (customerId) =>
    q1('SELECT * FROM subscriptions WHERE customer_id = ?', [customerId]),

  findAll: () => q(`
    SELECT s.*, c.name AS customer_name, c.email AS customer_email, c.org AS customer_org
    FROM subscriptions s
    JOIN customers c ON s.customer_id = c.id
    ORDER BY s.created_at DESC`),

  countByStatus: () => q('SELECT status, COUNT(*) AS n FROM subscriptions GROUP BY status'),

  create: ({ customerId, plan, status, websiteLimit, expiresAt }) =>
    q('INSERT INTO subscriptions (customer_id, plan, status, website_limit, expires_at) VALUES (?, ?, ?, ?, ?)',
      [customerId, plan, status, websiteLimit, expiresAt || null]),

  updatePlan: ({ plan, websiteLimit, customerId }) =>
    q("UPDATE subscriptions SET plan=?, website_limit=?, status='active' WHERE customer_id=?",
      [plan, websiteLimit, customerId]),

  updateStatus: ({ status, customerId }) =>
    q('UPDATE subscriptions SET status=? WHERE customer_id=?', [status, customerId]),

  updateFull: ({ plan, status, websiteLimit, expiresAt, customerId }) =>
    q('UPDATE subscriptions SET plan=?, status=?, website_limit=?, expires_at=? WHERE customer_id=?',
      [plan, status, websiteLimit, expiresAt || null, customerId]),
};

// ─────────────────────────────────────────────
// License queries
// ─────────────────────────────────────────────
const licenses = {
  findByKey:      (key)        => q1('SELECT * FROM licenses WHERE `key` = ?', [key]),
  findByCustomer: (customerId) => q('SELECT * FROM licenses WHERE customer_id = ?', [customerId]),

  countByCustomer: (customerId) =>
    q1('SELECT COUNT(*) AS n FROM licenses WHERE customer_id = ?', [customerId]).then(r => r ? r.n : 0),

  count: () => q1('SELECT COUNT(*) AS n FROM licenses').then(r => r ? r.n : 0),

  findAll: () => q(`
    SELECT l.*, c.name AS customer_name, c.email AS customer_email
    FROM licenses l
    JOIN customers c ON l.customer_id = c.id
    ORDER BY l.created_at DESC`),

  create: ({ key, customerId, domain, name, status, plan }) =>
    q('INSERT INTO licenses (`key`, customer_id, domain, name, status, plan) VALUES (?, ?, ?, ?, ?, ?)',
      [key, customerId, domain, name || domain, status, plan]),

  updateStatus: ({ status, key, customerId }) =>
    q('UPDATE licenses SET status=? WHERE `key`=? AND customer_id=?', [status, key, customerId]),

  updateStatusAdmin: ({ status, key }) =>
    q('UPDATE licenses SET status=? WHERE `key`=?', [status, key]),

  updatePlanAll: ({ plan, customerId }) =>
    q('UPDATE licenses SET plan=? WHERE customer_id=?', [plan, customerId]),

  delete: ({ key, customerId }) =>
    q('DELETE FROM licenses WHERE `key`=? AND customer_id=?', [key, customerId]),

  deleteAdmin: (key) =>
    q('DELETE FROM licenses WHERE `key`=?', [key]),
};

// ─────────────────────────────────────────────
// Analytics queries
// ─────────────────────────────────────────────
const analytics = {
  insert: ({ type, key, domain, plan, feature }) =>
    q('INSERT INTO analytics (type, license_key, domain, plan, feature, ts) VALUES (?, ?, ?, ?, ?, ?)',
      [type, key || null, domain || null, plan || null, feature || null, Math.floor(Date.now() / 1000)]),

  byDomain: (customerId) => q(`
    SELECT domain, COUNT(*) AS count FROM analytics
    WHERE license_key IN (SELECT \`key\` FROM licenses WHERE customer_id = ?)
      AND type = 'activation'
    GROUP BY domain ORDER BY count DESC`, [customerId]),

  totalByCustomer: (customerId) =>
    q1(`SELECT COUNT(*) AS n FROM analytics a
        JOIN licenses l ON a.license_key = l.\`key\`
        WHERE l.customer_id = ? AND a.type = 'activation'`, [customerId]).then(r => r ? r.n : 0),

  recentByCustomer: (customerId) => q(`
    SELECT a.* FROM analytics a
    JOIN licenses l ON a.license_key = l.\`key\`
    WHERE l.customer_id = ?
    ORDER BY a.ts DESC LIMIT 50`, [customerId]),

  globalStats: () => q1(`
    SELECT
      COUNT(*) AS total,
      SUM(type = 'activation') AS activations,
      SUM(type = 'validate')   AS validations
    FROM analytics`),

  recentAll: (limit = 100) => q(`
    SELECT a.*, l.domain AS license_domain
    FROM analytics a
    LEFT JOIN licenses l ON a.license_key = l.\`key\`
    ORDER BY a.ts DESC LIMIT ?`, [limit]),

  topDomains: () => q(`
    SELECT domain, COUNT(*) AS count FROM analytics
    WHERE type = 'activation' AND domain IS NOT NULL
    GROUP BY domain ORDER BY count DESC LIMIT 20`),
};

// ─────────────────────────────────────────────
// Billing queries
// ─────────────────────────────────────────────
const billing = {
  findByCustomer: (customerId) =>
    q('SELECT * FROM billing WHERE customer_id = ? ORDER BY created_at DESC', [customerId]),

  findAll: () => q(`
    SELECT b.*, c.name AS customer_name, c.email AS customer_email
    FROM billing b
    JOIN customers c ON b.customer_id = c.id
    ORDER BY b.created_at DESC`),

  create: ({ customerId, invoiceId, plan, amountCents, status }) =>
    q('INSERT INTO billing (customer_id, invoice_id, plan, amount_cents, status) VALUES (?, ?, ?, ?, ?)',
      [customerId, invoiceId, plan, amountCents, status || 'paid']),

  totalRevenue: () =>
    q1("SELECT SUM(amount_cents) AS total FROM billing WHERE status = 'paid'").then(r => r ? (r.total || 0) : 0),
};

// ─────────────────────────────────────────────
// Widget config queries
// ─────────────────────────────────────────────
const widgetConfigs = {
  findByCustomer: (customerId) =>
    q1('SELECT * FROM widget_configs WHERE customer_id = ?', [customerId]),

  upsert: ({ customerId, primaryColor, position, buttonIcon, lang, showProfiles, showTTS, showReadingMask, features }) =>
    q(`INSERT INTO widget_configs
         (customer_id, primary_color, position, button_icon, lang, show_profiles, show_tts, show_reading_mask, features)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         primary_color=VALUES(primary_color), position=VALUES(position),
         button_icon=VALUES(button_icon), lang=VALUES(lang),
         show_profiles=VALUES(show_profiles), show_tts=VALUES(show_tts),
         show_reading_mask=VALUES(show_reading_mask), features=VALUES(features)`,
      [customerId, primaryColor, position, buttonIcon, lang,
       showProfiles ? 1 : 0, showTTS ? 1 : 0, showReadingMask ? 1 : 0,
       features ? JSON.stringify(features) : null]),
};

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────
module.exports = { pool, customers, subscriptions, licenses, analytics, billing, widgetConfigs };
