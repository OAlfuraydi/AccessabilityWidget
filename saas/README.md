# Insijam SaaS Platform

A complete SaaS accessibility solution. Website owners embed a single `<script>` tag and get a fully featured, bilingual (Arabic + English) accessibility toolbar on their site — validated by license key, customizable per customer, and managed through a web-based admin panel.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [Running the Server](#running-the-server)
7. [Admin Panel](#admin-panel)
8. [Customer Dashboard](#customer-dashboard)
9. [Embedding the Widget](#embedding-the-widget)
10. [API Reference](#api-reference)
11. [Security](#security)
12. [File Structure](#file-structure)

---

## Architecture

```
Browser
  ├── /admin        → Admin panel (platform operator)
  ├── /dashboard    → Customer self-service portal
  ├── /docs         → Bilingual documentation
  └── /api/v1/...   → REST API (Express + MySQL)

Widget (accessibility-widget.js)
  └── Calls POST /api/v1/validate on every page load
```

**Stack:** Node.js · Express · MySQL 8 · bcrypt · Helmet · CORS

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js     | 18 or later |
| MySQL       | 8.0 or later (MariaDB 10.6+ also works) |
| npm         | 8 or later |

---

## Installation

```bash
# 1. Navigate to the API directory
cd saas/api

# 2. Install all dependencies (includes bcrypt, express, mysql2, helmet…)
npm install
```

---

## Configuration

All configuration lives in `saas/api/.env`. Copy the example and fill in your values:

```bash
cp .env.example .env   # if .env does not exist yet
```

### Required variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL server hostname | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `insijam_user` |
| `DB_PASS` | MySQL password | `StrongPassword123!` |
| `DB_NAME` | Database name | `insijam` |
| `ADMIN_SECRET` | Admin panel secret key — **must be 32+ random characters** | *(generate below)* |

### Optional variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP port the server listens on | `3001` |
| `NODE_ENV` | `development` or `production` | `development` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | localhost origins |

### Generating a strong ADMIN_SECRET

Run this once and paste the output into your `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output:
```
a3f9c2e1b8d4f7a0e5c3b2d1f8a4e7b0c9d3f2a1e6b5c8d4f1a7e3b0c2d9f5a8
```

> **The server will refuse to start if `ADMIN_SECRET` is missing or is set to a known weak value like `admin`, `secret`, or `password`.**

### Full `.env` example

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=YourMySQLPassword
DB_NAME=insijam

PORT=3001
NODE_ENV=development

ADMIN_SECRET=a3f9c2e1b8d4f7a0e5c3b2d1f8a4e7b0c9d3f2a1e6b5c8d4f1a7e3b0c2d9f5a8

# Uncomment and set in production:
# ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

---

## Database Setup

### Step 1 — Create tables (run once)

```bash
mysql -u root -p < saas/api/schema.sql
```

This creates the `insijam` database with all 6 tables:

| Table | Purpose |
|-------|---------|
| `customers` | Customer accounts (bcrypt-hashed passwords) |
| `subscriptions` | One subscription per customer (plan, status, expiry) |
| `licenses` | License keys tied to customer + domain |
| `analytics` | Widget activation and validation events |
| `billing` | Invoice / payment records |
| `widget_configs` | Per-customer branding preferences |

### Step 2 — Seed development data (optional)

```bash
cd saas/api
node seed.js
```

This creates a demo account with a properly bcrypt-hashed password:

| Field | Value |
|-------|-------|
| Email | `demo@insijam.io` |
| Password | `Demo1234!` |
| Plan | Professional |
| API key | `aw_live_sk_a1b2c3d4e5f6g7h8i9j0demo` |

> **Never run `seed.js` against a production database containing real customer data.**

---

## Running the Server

```bash
cd saas/api

# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

### Successful startup output

```
========================================
  Insijam API Server  v2.0
========================================
  URL      : http://localhost:3001
  DB       : MySQL → insijam@localhost
  Env      : development

  Dashboard  : http://localhost:3001/dashboard
  Admin UI   : http://localhost:3001/admin
  Docs       : http://localhost:3001/docs

  Customer endpoints:
    POST /api/v1/auth/login
    POST /api/v1/auth/register
    POST /api/v1/validate
    ...
========================================
```

### Health check

```bash
curl http://localhost:3001/api/v1/health
# → {"status":"ok","version":"2.0.0","db":"mysql"}
```

---

## Admin Panel

### Access

Open **http://localhost:3001/admin** in your browser.

### Login

1. **Server URL** — `http://localhost:3001` (or your production domain)
2. **Admin Secret Key** — the value of `ADMIN_SECRET` from your `.env`
3. Click **Login**

The panel calls `GET /api/v1/admin/stats` to verify the key. On success you see the admin dashboard.

> The admin key is stored in `sessionStorage` only — it is cleared when you close the browser tab.

### Tabs

#### Dashboard
Live stats: total customers, active licenses, total revenue, subscription status breakdown, top domains by widget activations.

#### Organizations
Manage all customer accounts.

| Action | How |
|--------|-----|
| View all | Open the tab — shows name, email, org, plan, license count |
| Add customer | Click **+ Add Customer** — fills in name, email, password, plan |
| Edit name/org | Click ✏️ on any row |
| Suspend account | Click ⏸ — customer cannot log in, widget stops working |
| Reactivate | Click ▶ on a suspended account |
| Delete | Click 🗑 — **permanent**, removes all licenses and data |

#### Subscriptions
One subscription row per customer. Edit plan, status, website limit, and expiry date.

| Status | Customer can log in | Widget works |
|--------|--------------------|-----------|
| `trial` | ✅ | ✅ |
| `active` | ✅ | ✅ |
| `expired` | ✅ | ❌ |
| `suspended` | ❌ | ❌ |

#### Licenses
All license keys across all customers.

| Action | Effect |
|--------|--------|
| **Activate** | Widget on that domain resumes working immediately |
| **Suspend** | Widget on that domain stops immediately |
| **Delete** | Widget shows "invalid key" error on next page load |
| **➕ Add License** | Create a key for any customer + domain |

#### Analytics
Platform-wide widget usage: total events, activations vs. validations, top 20 domains, last 200 events.

#### Billing
All invoice records across all customers (invoice ID, plan, amount, status).

---

## Customer Dashboard

### Access

Open **http://localhost:3001/dashboard/login.html**

### Register a new account

1. Click **"Don't have an account? Register"**
2. Fill in: full name, email, password, organisation (optional)
3. Password rules: **minimum 8 characters, at least one letter and one number**
4. Click **Register** — account is created on the **Starter plan** (3 sites, 14-day trial)

### Login

Enter email + password → click **Sign In**.
Your session token is saved in `localStorage` and persists across page refreshes.
Click **Logout** in the sidebar to clear it.

### Dashboard sections

| Section | Purpose |
|---------|---------|
| 📊 Overview | Active sites, current plan, total activations, last activity |
| 🌐 My Sites | Create and manage license keys |
| ⚙️ Widget Settings | Customise widget appearance and behaviour |
| 💰 Billing | View payment history and invoices |
| 👤 Account | Update name, organisation, change password |

### Adding a website (license key)

1. Go to **My Sites**
2. Click **Add Site**
3. Enter domain (e.g. `mystore.com`) and an optional display name
4. A key in the format `AW-STA1-XXXX-XXXX-XXXX` is generated instantly
5. Copy the key and paste it into your site's HTML (see below)

> Each license key is **domain-specific**. A key for `mystore.com` will not work on `otherdomain.com`.

### Suspending / deleting a site

- **Toggle** next to any site — suspends or reactivates it instantly
- **Delete (🗑)** — permanently removes the key; widget shows an error on that site

### Customising branding

Go to **Widget Settings** and adjust:

| Setting | Options |
|---------|---------|
| Primary colour | Any hex colour (`#2563EB`) |
| Button icon | Any emoji or short text (`♿` `👁` `A`) |
| Position | `bottom-right` · `bottom-left` · `top-right` · `top-left` |
| Language | `auto` (detects browser) · `en` · `ar` |
| Show Profiles | on / off |
| Show Text-to-Speech | on / off |
| Show Reading Mask | on / off |

Click **Save** — changes apply to all your websites on the next page load.

---

## Embedding the Widget

Add this snippet to **every page** of your website, just before `</body>`:

```html
<script>
  window.AccessibilityWidgetConfig = {
    licenseKey: 'AW-STA1-XXXX-XXXX-XXXX',  // ← your key from the dashboard
    lang:       'auto',                      // 'en', 'ar', or 'auto'
    position:   'bottom-right',
  };
</script>
<script src="http://localhost:3001/widget/accessibility-widget.js"></script>
```

Replace `http://localhost:3001` with your production server URL when deploying.

### What happens on page load

```
1. Widget reads licenseKey from config
2. Calls POST /api/v1/validate  { key, domain: window.location.hostname }
3. Server checks:
     ✓ Key exists in the database?
     ✓ Domain matches the key's registered domain?
     ✓ License status is "active"?
     ✓ Customer's subscription is active?
4a. All checks pass → widget loads, server branding applied, analytics event recorded
4b. Any check fails → small error notice shown, widget does not load
```

Validation result is cached in `sessionStorage` — one API call per browser tab, not per page.

### Full configuration options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `licenseKey` | string | — | **Required.** Your license key. |
| `lang` | `'en'` \| `'ar'` \| `'auto'` | `'auto'` | Interface language. |
| `position` | string | `'bottom-right'` | Corner for the widget button. |
| `primaryColor` | hex string | `'#2563EB'` | Overridden by server branding if saved. |
| `buttonIcon` | string | `'♿'` | Icon on the floating button. |
| `showProfiles` | boolean | `true` | Show/hide disability preset profiles. |
| `showTTS` | boolean | `true` | Show/hide text-to-speech. |
| `showReadingMask` | boolean | `true` | Show/hide reading mask. |
| `devMode` | boolean | `false` | Skip license validation. **Only honored when `window.location.hostname` is `localhost`, `127.0.0.1`, or `file://`** — silently ignored on any real domain, so the flag cannot be abused to bypass licensing. |

### Development / local testing

When building locally (e.g. `http://localhost:8080`), the domain won't match any real license. Use `devMode`:

```html
<script>
  window.AccessibilityWidgetConfig = {
    devMode: true,   // skips all license checks
    lang: 'auto',
  };
</script>
<script src="accessibility-widget.js"></script>
```

> 🔒 **`devMode` is hostname-locked.** The widget ignores this flag on any domain other than `localhost`/`127.0.0.1`/`file://`. Leaving `devMode: true` in deployed code is harmless — it will have no effect — but you should still remove it for clarity.

---

## API Reference

### Authentication

| Endpoint type | Header required |
|--------------|-----------------|
| Public | None |
| Customer | `Authorization: Bearer <api_key>` |
| Admin | `Authorization: AdminKey <ADMIN_SECRET>` |

### Public endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/v1/health` | Server health check |
| `POST` | `/api/v1/auth/register` | Create a customer account |
| `POST` | `/api/v1/auth/login` | Login, receive API key |
| `POST` | `/api/v1/validate` | Validate a license key (called by widget) |

### Customer endpoints (Bearer token)

| Method | Path | Description |
|--------|------|-------------|
| `GET`    | `/api/v1/account` | Get profile + subscription |
| `PUT`    | `/api/v1/account` | Update name and org |
| `PUT`    | `/api/v1/account/password` | Change password |
| `GET`    | `/api/v1/licenses` | List all licenses |
| `POST`   | `/api/v1/licenses` | Create a license key |
| `PUT`    | `/api/v1/licenses/:key/status` | Activate or suspend |
| `DELETE` | `/api/v1/licenses/:key` | Delete a license |
| `GET`    | `/api/v1/analytics` | Usage analytics |
| `GET`    | `/api/v1/billing` | Invoice history |
| `GET`    | `/api/v1/widget-config` | Get branding settings |
| `PUT`    | `/api/v1/widget-config` | Save branding settings |

### Admin endpoints (AdminKey header)

| Method | Path | Description |
|--------|------|-------------|
| `GET`    | `/api/v1/admin/stats` | Platform dashboard stats |
| `GET`    | `/api/v1/admin/customers` | List all customers |
| `POST`   | `/api/v1/admin/customers` | Create a customer |
| `PUT`    | `/api/v1/admin/customers/:id` | Edit name / org / status |
| `DELETE` | `/api/v1/admin/customers/:id` | Delete customer (cascade) |
| `GET`    | `/api/v1/admin/subscriptions` | List all subscriptions |
| `PUT`    | `/api/v1/admin/subscriptions/:customerId` | Edit subscription |
| `GET`    | `/api/v1/admin/licenses` | List all licenses |
| `POST`   | `/api/v1/admin/licenses` | Create a license for any customer |
| `PUT`    | `/api/v1/admin/licenses/:key/status` | Change license status |
| `DELETE` | `/api/v1/admin/licenses/:key` | Delete a license |
| `GET`    | `/api/v1/admin/analytics` | Platform-wide analytics |
| `GET`    | `/api/v1/admin/billing` | All billing records |

---

## Security

### Implemented protections

| Protection | Implementation |
|-----------|---------------|
| Password hashing | bcrypt with 12 rounds — passwords never stored in plain text |
| Admin key comparison | `crypto.timingSafeEqual()` — prevents timing attacks |
| License key generation | `crypto.randomBytes()` — cryptographically unpredictable |
| API key generation | `crypto.randomBytes(24)` — 48-character hex string |
| Brute-force protection | Auth endpoints: 10 attempts per 15 minutes per IP |
| Input validation | Email format, password strength, domain length, hex colour, enum values |
| Error concealment | Internal error details hidden in `NODE_ENV=production` |
| HTTP security headers | Helmet.js (XSS, clickjacking, MIME sniffing) |
| CORS | Explicit origin whitelist; null-origin blocked in production |
| Startup validation | Server exits immediately if secrets are missing or weak |

### Planned / recommended for production

| Item | Notes |
|------|-------|
| HTTPS / TLS | Use a reverse proxy (nginx, Caddy) or a hosting platform that handles TLS |
| Dedicated DB user | Create a MySQL user with only SELECT/INSERT/UPDATE/DELETE on `insijam`, not root |
| Database backups | Automated daily backups with off-site storage |
| Error monitoring | Sentry or similar for production error tracking |
| API key expiry | Add `api_key_expires_at` column and rotate keys periodically |
| Audit logging | Log all admin actions to a separate table or log file |

### Security checklist before going live

- [ ] `ADMIN_SECRET` is 32+ random characters
- [ ] `NODE_ENV=production` in `.env`
- [ ] `ALLOWED_ORIGINS` set to your actual domain(s)
- [ ] MySQL running with a dedicated low-privilege user (not root)
- [ ] Server is behind HTTPS (nginx / Caddy / cloud load balancer)
- [ ] `seed.js` has NOT been run against the production database
- [ ] `.env` is in `.gitignore` and never committed to version control

---

## File Structure

```
saas/
├── api/
│   ├── server.js        — Express API server (all routes)
│   ├── database.js      — MySQL query helpers
│   ├── schema.sql        — Database schema (run once to create tables)
│   ├── seed.js          — Development seed data with hashed passwords
│   ├── package.json     — Node dependencies
│   └── .env             — Environment variables (never commit this)
│
├── admin/
│   └── index.html       — Admin panel SPA (served at /admin)
│
├── dashboard/
│   ├── index.html       — Customer dashboard (served at /dashboard)
│   └── login.html       — Customer login / register
│
└── docs/
    └── index.html       — Bilingual documentation (served at /docs)

accessibility-widget.js  — Embeddable widget script
demo.html                — Live widget demo (devMode: true)
embed-guide.html         — Integration guide for developers
```

---

## Plans

| Plan | Website Licenses | Monthly Price (example) |
|------|-----------------|------------------------|
| Starter | 3 sites | $29 |
| Professional | 10 sites | $79 |
| Enterprise | Unlimited | Custom |

Plans are enforced server-side. Customers cannot create more license keys than their plan allows.
