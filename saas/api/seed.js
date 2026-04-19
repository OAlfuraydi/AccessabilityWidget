/**
 * seed.js — Inserts demo data with bcrypt-hashed passwords.
 *
 * Usage (development only):
 *   node seed.js
 *
 * ⚠️  Never run this in production against live customer data.
 */

'use strict';

require('dotenv').config();

const bcrypt = require('bcrypt');
const { pool, customers, subscriptions, licenses, billing } = require('./database');

const BCRYPT_ROUNDS = 12;

async function seed() {
  console.log('Seeding development database…');

  const hashedPassword = await bcrypt.hash('Demo1234!', BCRYPT_ROUNDS);
  console.log('  Password hashed ✓');

  // Customer
  await pool.execute(
    `INSERT IGNORE INTO customers (id, email, password, name, org, plan, status, api_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cust_001', 'demo@insijam.io', hashedPassword,
     'John Demo', 'Demo Corp Ltd.', 'professional', 'active',
     'aw_live_sk_a1b2c3d4e5f6g7h8i9j0demo']
  );
  console.log('  Customer inserted ✓');

  // Subscription
  await pool.execute(
    `INSERT IGNORE INTO subscriptions (customer_id, plan, status, website_limit, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    ['cust_001', 'professional', 'active', 10, '2027-12-31 00:00:00']
  );
  console.log('  Subscription inserted ✓');

  // Licenses
  const lics = [
    ['AW-PRO1-X2Y3-Z4A5-B6C7', 'cust_001', 'mycompany.com',         'Main Website',    'active',    'professional'],
    ['AW-PRO2-D8E9-F0G1-H2I3', 'cust_001', 'portal.mycompany.com',  'Employee Portal', 'active',    'professional'],
    ['AW-PRO3-J4K5-L6M7-N8O9', 'cust_001', 'shop.mycompany.com',    'Online Shop',     'active',    'professional'],
    ['AW-PRO4-P0Q1-R2S3-T4U5', 'cust_001', 'support.mycompany.com', 'Support Center',  'suspended', 'professional'],
    ['AW-EXP1-TEST-EXPI-REDK', 'cust_001', 'expired-test.com',      'Expired Test',    'expired',   'starter'],
  ];
  for (const l of lics) {
    await pool.execute(
      'INSERT IGNORE INTO licenses (`key`, customer_id, domain, name, status, plan) VALUES (?,?,?,?,?,?)', l
    );
  }
  console.log('  Licenses inserted ✓');

  // Billing
  const invoices = [
    ['cust_001', 'INV-2026-003', 'professional', 7900, 'paid'],
    ['cust_001', 'INV-2026-002', 'professional', 7900, 'paid'],
    ['cust_001', 'INV-2026-001', 'professional', 7900, 'paid'],
    ['cust_001', 'INV-2025-012', 'starter',      2900, 'paid'],
  ];
  for (const inv of invoices) {
    await pool.execute(
      'INSERT IGNORE INTO billing (customer_id, invoice_id, plan, amount_cents, status) VALUES (?,?,?,?,?)', inv
    );
  }
  console.log('  Billing records inserted ✓');

  console.log('\nDone! Demo credentials:');
  console.log('  Email   : demo@insijam.io');
  console.log('  Password: Demo1234!');
  console.log('  API key : aw_live_sk_a1b2c3d4e5f6g7h8i9j0demo');

  await pool.end();
}

seed().catch(err => {
  console.error('[SEED ERROR]', err.message);
  process.exit(1);
});
