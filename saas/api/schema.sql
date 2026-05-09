-- ============================================================
-- Insijam — MySQL Schema
-- ============================================================
-- Run once to set up the database:
--   mysql -u root -p < schema.sql
--
-- Or from MySQL Workbench / phpMyAdmin: paste & execute.
-- ============================================================

CREATE DATABASE IF NOT EXISTS insijam
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE insijam;

-- ── customers ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id          VARCHAR(50)  PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  org         VARCHAR(255) DEFAULT '',
  plan        ENUM('starter','professional','enterprise') DEFAULT 'starter',
  status      ENUM('active','suspended') DEFAULT 'active',
  api_key     VARCHAR(255) UNIQUE NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── subscriptions ──────────────────────────────────────────
-- One subscription per customer — UNIQUE(customer_id) prevents the
-- duplicate rows we'd otherwise see if seed.js (or a stripe webhook,
-- or any retry loop) inserts twice.
CREATE TABLE IF NOT EXISTS subscriptions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  customer_id     VARCHAR(50) NOT NULL,
  plan            ENUM('starter','professional','enterprise') NOT NULL DEFAULT 'starter',
  status          ENUM('trial','active','expired','suspended') NOT NULL DEFAULT 'trial',
  website_limit   INT DEFAULT 3,
  expires_at      DATETIME,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_subscriptions_customer UNIQUE (customer_id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── licenses ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS licenses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  `key`       VARCHAR(100) UNIQUE NOT NULL,
  customer_id VARCHAR(50)  NOT NULL,
  domain      VARCHAR(255) NOT NULL,
  name        VARCHAR(255) DEFAULT '',
  status      ENUM('active','suspended','expired') DEFAULT 'active',
  plan        ENUM('starter','professional','enterprise') DEFAULT 'starter',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── analytics ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type        VARCHAR(50)  NOT NULL,
  license_key VARCHAR(100),
  domain      VARCHAR(255),
  plan        VARCHAR(50),
  feature     VARCHAR(100),
  ts          BIGINT NOT NULL,
  INDEX idx_analytics_key (license_key),
  INDEX idx_analytics_ts  (ts)
) ENGINE=InnoDB;

-- ── billing ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS billing (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  customer_id   VARCHAR(50)  NOT NULL,
  invoice_id    VARCHAR(100) UNIQUE NOT NULL,
  plan          VARCHAR(50)  NOT NULL,
  amount_cents  INT          NOT NULL,
  currency      VARCHAR(10)  DEFAULT 'USD',
  status        ENUM('paid','pending','failed') DEFAULT 'paid',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB;

-- ── widget_configs ─────────────────────────────────────────
-- Stores each customer's branding/widget preferences.
-- The widget reads these back via the /validate response.
CREATE TABLE IF NOT EXISTS widget_configs (
  customer_id     VARCHAR(50) PRIMARY KEY,
  primary_color   VARCHAR(20)  DEFAULT '#2563EB',
  position        VARCHAR(20)  DEFAULT 'bottom-right',
  button_icon     VARCHAR(20)  DEFAULT '♿',
  lang            VARCHAR(10)  DEFAULT 'auto',
  show_profiles   TINYINT      DEFAULT 1,
  show_tts        TINYINT      DEFAULT 1,
  show_reading_mask TINYINT    DEFAULT 1,
  features        TEXT         DEFAULT NULL,  -- JSON feature overrides
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Seed data
-- ⚠️  Passwords are bcrypt-hashed — do NOT insert plain text.
--     Run `node seed.js` to populate development data instead.
-- ============================================================
