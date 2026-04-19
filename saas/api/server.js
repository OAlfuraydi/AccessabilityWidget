/**
 * Insijam API Server — MySQL edition
 *
 * Setup:
 *   cp .env.example .env        # fill in DB credentials
 *   mysql -u root -p < schema.sql
 *   npm install
 *   npm start
 */

'use strict';

require('dotenv').config();

// ─────────────────────────────────────────────
// Startup environment validation
// ─────────────────────────────────────────────
const REQUIRED_ENV = ['DB_HOST', 'DB_USER', 'DB_PASS', 'ADMIN_SECRET'];
const missingEnv = REQUIRED_ENV.filter(k => !process.env[k]);
if (missingEnv.length) {
  console.error(`[FATAL] Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('[FATAL] Copy .env.example to .env and fill in all values.');
  process.exit(1);
}
const WEAK_SECRETS = ['admin', 'admin_secret_change_me', 'secret', 'password', '123456'];
if (WEAK_SECRETS.includes(process.env.ADMIN_SECRET)) {
  console.error('[FATAL] ADMIN_SECRET is too weak. Set a strong random value (32+ chars) in .env');
  process.exit(1);
}

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt    = require('bcrypt');
const crypto    = require('crypto');
const { v4: uuidv4 } = require('uuid');
const path      = require('path');

const { customers, subscriptions, licenses, analytics, billing, widgetConfigs } = require('./database');

const app          = express();
const PORT         = parseInt(process.env.PORT || '3001', 10);
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const IS_PROD      = process.env.NODE_ENV === 'production';
const BCRYPT_ROUNDS = 12;

// ─────────────────────────────────────────────
// Dashboard & Admin — served BEFORE helmet so
// inline scripts are not blocked by CSP
// ─────────────────────────────────────────────
app.use('/dashboard', express.static(path.join(__dirname, '../dashboard')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../dashboard/index.html')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../admin/index.html')));
app.use('/docs', express.static(path.join(__dirname, '../docs')));
app.get('/docs', (req, res) => res.sendFile(path.join(__dirname, '../docs/index.html')));

// Demo page + widget script (root-level files)
app.get('/demo', (req, res) => res.sendFile(path.join(__dirname, '../../demo.html')));
app.get('/accessibility-widget.js', (req, res) => res.sendFile(path.join(__dirname, '../../accessibility-widget.js')));

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(helmet());
app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : [
      'http://localhost:3000', 'http://localhost:3001',
      'http://127.0.0.1:3000', 'http://127.0.0.1:3001',
      'http://127.0.0.1:5500', 'http://localhost:5500',
      /\.insijam\.io$/,
    ];

// Open CORS for /api/v1/validate: it is called by the widget embedded on
// customer websites, so any origin must reach it. Authorization is
// handled by the license-key + domain check inside the handler itself.
const openCors = cors({
  origin: true,
  methods: ['POST','OPTIONS'],
  allowedHeaders: ['Content-Type'],
});

// Restricted CORS for every other route (dashboard, admin, auth).
const restrictedCors = cors({
  origin: (origin, cb) => {
    if (!origin) {
      return IS_PROD
        ? cb(new Error('Not allowed by CORS'), false)
        : cb(null, true);
    }
    const ok = allowedOrigins.some(o => o instanceof RegExp ? o.test(origin) : o === origin);
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
});

// Route dispatcher: validate uses open CORS, everything else restricted.
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1/validate')) return openCors(req, res, next);
  return restrictedCors(req, res, next);
});

// ─────────────────────────────────────────────
// Rate limiters
// ─────────────────────────────────────────────
// Strict: auth endpoints — 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again in 15 minutes.' },
});

app.use('/api/v1/validate', rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false }));
app.use('/api/',            rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false }));

// Wrap async route handlers — catches thrown errors and passes to error middleware
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ─────────────────────────────────────────────
// Plan definitions
// ─────────────────────────────────────────────
const PLAN_FEATURES = {
  starter: {
    fontSize: true, fontFamily: true, lineHeight: true, letterSpacing: true,
    highContrast: true, darkMode: true, highlightLinks: true,
    pauseAnimations: true, keyboardNav: true,
    textToSpeech: false, readingMask: false, readingGuide: false, focusMode: false,
    dyslexiaFont: false, bigCursor: false, textAlign: false, lightMode: false,
    grayscale: false, invertColors: false, muteColors: false, highlightHeadings: false, muteSounds: false,
  },
  professional: {
    fontSize: true, fontFamily: true, lineHeight: true, letterSpacing: true,
    textAlign: true, highContrast: true, darkMode: true, lightMode: true,
    grayscale: true, invertColors: true, muteColors: true,
    highlightLinks: true, highlightHeadings: true,
    readingMask: true, readingGuide: true, focusMode: true,
    dyslexiaFont: true, pauseAnimations: true, bigCursor: true, skipContent: true,
    keyboardNav: true, textToSpeech: true, muteSounds: true,
  },
  enterprise: {
    fontSize: true, fontFamily: true, lineHeight: true, letterSpacing: true,
    textAlign: true, highContrast: true, darkMode: true, lightMode: true,
    grayscale: true, invertColors: true, muteColors: true,
    highlightLinks: true, highlightHeadings: true,
    readingMask: true, readingGuide: true, focusMode: true,
    dyslexiaFont: true, pauseAnimations: true, bigCursor: true, skipContent: true,
    keyboardNav: true, textToSpeech: true, muteSounds: true,
  },
};

const PLAN_LIMITS = { starter: 3, professional: 10, enterprise: 9999 };

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function normalizeDomain(raw = '') {
  try {
    if (!raw.startsWith('http')) raw = 'https://' + raw;
    return new URL(raw).hostname.replace(/^www\./, '').toLowerCase();
  } catch (_) {
    return raw.toLowerCase().replace(/^www\./, '');
  }
}

// Uses crypto.randomBytes — cryptographically secure
function generateKey(plan, index) {
  const prefix = plan.substr(0, 3).toUpperCase();
  const rand = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `AW-${prefix}${index}-${rand()}-${rand()}-${rand()}`;
}

function safeCustomer(c) {
  if (!c) return null;
  const { password, ...safe } = c;
  return safe;
}

// ─────────────────────────────────────────────
// Input validators
// ─────────────────────────────────────────────
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function validatePassword(pw) {
  if (!pw || typeof pw !== 'string') return 'Password is required';
  if (pw.length < 8)                 return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(pw))          return 'Password must contain at least one letter';
  if (!/[0-9]/.test(pw))             return 'Password must contain at least one number';
  return null;
}

function isValidDomain(d) {
  return typeof d === 'string' && d.length > 0 && d.length <= 253;
}

function isValidHexColor(c) {
  return typeof c === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(c);
}

// ─────────────────────────────────────────────
// Auth middleware
// ─────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const auth = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!auth) return res.status(401).json({ error: 'Authentication required' });
  customers.findByApiKey(auth).then(customer => {
    if (!customer) return res.status(401).json({ error: 'Invalid API key' });
    if (customer.status === 'suspended') return res.status(403).json({ error: 'Account suspended. Please contact support.' });
    req.customer = customer;
    next();
  }).catch(next);
}

// Admin middleware — timing-safe comparison prevents timing attacks
function adminMiddleware(req, res, next) {
  const auth = (req.headers.authorization || '').replace('AdminKey ', '').trim();
  if (!auth || auth.length !== ADMIN_SECRET.length) {
    return res.status(401).json({ error: 'Admin access required' });
  }
  try {
    const match = crypto.timingSafeEqual(Buffer.from(auth), Buffer.from(ADMIN_SECRET));
    if (!match) return res.status(401).json({ error: 'Admin access required' });
  } catch (_) {
    return res.status(401).json({ error: 'Admin access required' });
  }
  next();
}

// ─────────────────────────────────────────────
// Routes — Health
// ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', db: 'mysql', time: new Date().toISOString() });
});

// ─────────────────────────────────────────────
// Routes — Auth
// ─────────────────────────────────────────────
app.post('/api/v1/auth/login', authLimiter, wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const customer = await customers.findByEmail(email.toLowerCase().trim());
  // Always run bcrypt.compare to prevent timing-based user enumeration
  const hash = customer ? customer.password : '$2b$12$invalidhashpadding00000000000000000000000000000000000';
  const valid = await bcrypt.compare(password, hash);
  if (!customer || !valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (customer.status === 'suspended') {
    return res.status(403).json({ error: 'Account suspended. Please contact support.' });
  }

  const sub = await subscriptions.findByCustomer(customer.id);
  res.json({ token: customer.api_key, customer: safeCustomer(customer), subscription: sub });
}));

app.post('/api/v1/auth/register', authLimiter, wrap(async (req, res) => {
  const { email, password, name, org, plan = 'starter' } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name are required' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  const pwError = validatePassword(password);
  if (pwError) return res.status(400).json({ error: pwError });
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 255) {
    return res.status(400).json({ error: 'Name must be between 2 and 255 characters' });
  }
  if (!['starter','professional','enterprise'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const existing = await customers.findByEmail(email.toLowerCase().trim());
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const id         = 'cust_' + uuidv4().replace(/-/g,'').substr(0, 10);
  const apiKey     = 'aw_live_sk_' + crypto.randomBytes(24).toString('hex');
  const hashedPw   = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const expiry     = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

  await customers.create({ id, email: email.toLowerCase().trim(), password: hashedPw, name: name.trim(), org: org ? String(org).slice(0, 255) : '', plan, apiKey });
  await subscriptions.create({ customerId: id, plan, status: 'trial', websiteLimit: PLAN_LIMITS[plan], expiresAt: expiry });

  const customer = await customers.findById(id);
  const sub      = await subscriptions.findByCustomer(id);
  res.status(201).json({ token: apiKey, customer: safeCustomer(customer), subscription: sub });
}));

// ─────────────────────────────────────────────
// Routes — License Validation (public)
// ─────────────────────────────────────────────
app.post('/api/v1/validate', wrap(async (req, res) => {
  const { key } = req.body || {};

  // ── Determine the real origin from HTTP headers (cannot be faked by JS) ──
  // Priority: Origin header → Referer header. In non-production we allow a
  // body.domain fallback for local curl/Postman testing; in production the
  // body field is ignored because any HTTP client can forge it.
  let actualDomain = null;
  const originHeader  = req.headers['origin'];
  const refererHeader = req.headers['referer'];
  if (originHeader && originHeader !== 'null') {
    actualDomain = normalizeDomain(originHeader);
  } else if (refererHeader) {
    actualDomain = normalizeDomain(refererHeader);
  } else if (!IS_PROD && req.body?.domain) {
    actualDomain = normalizeDomain(req.body.domain);
  }

  await analytics.insert({ type: 'validate', key: key || null, domain: actualDomain || null, plan: null, feature: null });

  if (!key) {
    return res.status(400).json({ valid: false, reason: 'missing_params', message: 'License key is required.' });
  }
  if (!actualDomain) {
    return res.status(400).json({ valid: false, reason: 'missing_domain', message: 'Could not determine request origin.' });
  }

  const license = await licenses.findByKey(key);
  if (!license) {
    return res.json({ valid: false, reason: 'invalid_key', message: 'This license key does not exist.' });
  }

  const licDomain = normalizeDomain(license.domain);
  if (actualDomain !== licDomain && !actualDomain.endsWith('.' + licDomain)) {
    return res.json({ valid: false, reason: 'domain_mismatch', message: `This key is not authorized for domain: ${actualDomain}` });
  }

  if (license.status === 'suspended') {
    return res.json({ valid: false, reason: 'suspended', message: 'This license key has been suspended. Please contact support.' });
  }
  if (license.status === 'expired') {
    return res.json({ valid: false, reason: 'expired', message: 'Accessibility services unavailable — subscription expired.' });
  }

  const sub = await subscriptions.findByCustomer(license.customer_id);
  if (!sub) {
    return res.json({ valid: false, reason: 'no_subscription', message: 'No active subscription found.' });
  }
  if (sub.status === 'expired') {
    return res.json({ valid: false, reason: 'subscription_expired', message: 'Subscription expired. Please renew to restore access.' });
  }
  if (sub.status === 'suspended') {
    return res.json({ valid: false, reason: 'subscription_suspended', message: 'Account suspended. Please contact support.' });
  }

  await analytics.insert({ type: 'activation', key, domain: actualDomain, plan: license.plan, feature: null });

  // Load customer's widget config (branding/preferences) to return to the widget
  const wCfg = await widgetConfigs.findByCustomer(license.customer_id);
  let widgetConfig = null;
  if (wCfg) {
    widgetConfig = {
      primaryColor:    wCfg.primary_color,
      position:        wCfg.position,
      buttonIcon:      wCfg.button_icon,
      lang:            wCfg.lang,
      showProfiles:    !!wCfg.show_profiles,
      showTTS:         !!wCfg.show_tts,
      showReadingMask: !!wCfg.show_reading_mask,
    };
  }

  res.json({
    valid: true,
    plan: license.plan,
    domain: license.domain,
    features: PLAN_FEATURES[license.plan] || PLAN_FEATURES.starter,
    expiresAt: sub.expires_at,
    widgetConfig,
  });
}));

// ─────────────────────────────────────────────
// Routes — Licenses (protected)
// ─────────────────────────────────────────────
app.get('/api/v1/licenses', authMiddleware, wrap(async (req, res) => {
  const rows = await licenses.findByCustomer(req.customer.id);
  res.json({ licenses: rows });
}));

app.post('/api/v1/licenses', authMiddleware, wrap(async (req, res) => {
  const { domain, name } = req.body || {};
  if (!domain) return res.status(400).json({ error: 'domain is required' });
  if (!isValidDomain(domain)) return res.status(400).json({ error: 'Invalid domain format' });
  if (name && String(name).length > 255) return res.status(400).json({ error: 'Name too long (max 255 chars)' });

  const sub = await subscriptions.findByCustomer(req.customer.id);
  if (!sub || sub.status === 'expired' || sub.status === 'suspended') {
    return res.status(403).json({ error: 'Active subscription required' });
  }

  const count = await licenses.countByCustomer(req.customer.id);
  if (count >= sub.website_limit) {
    return res.status(403).json({ error: `Website limit reached (${sub.website_limit}). Upgrade your plan to add more.` });
  }

  const key = generateKey(req.customer.plan, count + 1);
  await licenses.create({ key, customerId: req.customer.id, domain: normalizeDomain(domain), name: name || domain, status: 'active', plan: req.customer.plan });

  const license = await licenses.findByKey(key);
  res.status(201).json({ license });
}));

app.put('/api/v1/licenses/:key/status', authMiddleware, wrap(async (req, res) => {
  const { status } = req.body || {};
  if (!['active','suspended'].includes(status)) return res.status(400).json({ error: 'status must be active or suspended' });

  const result = await licenses.updateStatus({ status, key: req.params.key, customerId: req.customer.id });
  if (result.affectedRows === 0) return res.status(404).json({ error: 'License not found' });

  const license = await licenses.findByKey(req.params.key);
  res.json({ license });
}));

app.delete('/api/v1/licenses/:key', authMiddleware, wrap(async (req, res) => {
  const result = await licenses.delete({ key: req.params.key, customerId: req.customer.id });
  if (result.affectedRows === 0) return res.status(404).json({ error: 'License not found' });
  res.json({ success: true });
}));

// ─────────────────────────────────────────────
// Routes — Analytics (protected)
// ─────────────────────────────────────────────
app.get('/api/v1/analytics', authMiddleware, wrap(async (req, res) => {
  const [total, byDom, recent] = await Promise.all([
    analytics.totalByCustomer(req.customer.id),
    analytics.byDomain(req.customer.id),
    analytics.recentByCustomer(req.customer.id),
  ]);
  res.json({ totalActivations: total, byDomain: byDom, recentEvents: recent });
}));

// ─────────────────────────────────────────────
// Routes — Subscription (protected)
// ─────────────────────────────────────────────
app.get('/api/v1/subscription', authMiddleware, wrap(async (req, res) => {
  const sub = await subscriptions.findByCustomer(req.customer.id);
  if (!sub) return res.status(404).json({ error: 'No subscription found' });
  res.json({ subscription: sub, features: PLAN_FEATURES[sub.plan] });
}));

app.put('/api/v1/subscription/plan', authMiddleware, wrap(async (req, res) => {
  const { plan } = req.body || {};
  if (!['starter','professional','enterprise'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }
  await subscriptions.updatePlan({ plan, websiteLimit: PLAN_LIMITS[plan], customerId: req.customer.id });
  await licenses.updatePlanAll({ plan, customerId: req.customer.id });
  await customers.updatePlan({ plan, id: req.customer.id });

  const sub = await subscriptions.findByCustomer(req.customer.id);
  res.json({ subscription: sub, message: `Plan updated to ${plan}` });
}));

// ─────────────────────────────────────────────
// Routes — Billing (protected)
// ─────────────────────────────────────────────
app.get('/api/v1/billing', authMiddleware, wrap(async (req, res) => {
  const invoices = await billing.findByCustomer(req.customer.id);
  res.json({ invoices });
}));

// ─────────────────────────────────────────────
// Routes — Widget Config (protected)
// ─────────────────────────────────────────────
app.get('/api/v1/widget-config', authMiddleware, wrap(async (req, res) => {
  let cfg = await widgetConfigs.findByCustomer(req.customer.id);
  if (!cfg) cfg = { primary_color:'#2563EB', position:'bottom-right', button_icon:'♿', lang:'auto', show_profiles:1, show_tts:1, show_reading_mask:1, features:null };
  if (cfg.features && typeof cfg.features === 'string') {
    try { cfg.features = JSON.parse(cfg.features); } catch(_) { cfg.features = null; }
  }
  res.json({ config: cfg });
}));

app.put('/api/v1/widget-config', authMiddleware, wrap(async (req, res) => {
  const { primaryColor, position, buttonIcon, lang, showProfiles, showTTS, showReadingMask, features } = req.body || {};

  const VALID_POSITIONS = ['bottom-right','bottom-left','top-right','top-left'];
  const VALID_LANGS     = ['auto','en','ar'];
  const safeColor    = isValidHexColor(primaryColor) ? primaryColor : '#2563EB';
  const safePosition = VALID_POSITIONS.includes(position) ? position : 'bottom-right';
  const safeLang     = VALID_LANGS.includes(lang) ? lang : 'auto';
  const safeIcon     = (typeof buttonIcon === 'string' && buttonIcon.length <= 8) ? buttonIcon : '♿';

  await widgetConfigs.upsert({
    customerId:      req.customer.id,
    primaryColor:    safeColor,
    position:        safePosition,
    buttonIcon:      safeIcon,
    lang:            safeLang,
    showProfiles:    showProfiles    !== false,
    showTTS:         showTTS         !== false,
    showReadingMask: showReadingMask !== false,
    features:        features        || null,
  });
  let cfg = await widgetConfigs.findByCustomer(req.customer.id);
  if (cfg.features && typeof cfg.features === 'string') {
    try { cfg.features = JSON.parse(cfg.features); } catch(_) { cfg.features = null; }
  }
  res.json({ config: cfg });
}));

// ─────────────────────────────────────────────
// Routes — Account (protected)
// ─────────────────────────────────────────────
app.get('/api/v1/account', authMiddleware, wrap(async (req, res) => {
  const customer = await customers.findById(req.customer.id);
  const sub      = await subscriptions.findByCustomer(req.customer.id);
  res.json({ customer: safeCustomer(customer), subscription: sub });
}));

app.put('/api/v1/account', authMiddleware, wrap(async (req, res) => {
  const { name, org } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  await customers.update({ name, org: org || '', id: req.customer.id });
  const customer = await customers.findById(req.customer.id);
  res.json({ customer: safeCustomer(customer) });
}));

app.put('/api/v1/account/password', authMiddleware, authLimiter, wrap(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }
  const valid = await bcrypt.compare(currentPassword, req.customer.password);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  const pwError = validatePassword(newPassword);
  if (pwError) return res.status(400).json({ error: pwError });

  const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await customers.updatePassword({ password: hashed, id: req.customer.id });
  res.json({ success: true });
}));

// ═════════════════════════════════════════════
// Admin Routes — require AdminKey header
// ═════════════════════════════════════════════

// ── Dashboard stats ───────────────────────────
app.get('/api/v1/admin/stats', adminMiddleware, wrap(async (req, res) => {
  const [custCount, licCount, revenue, subStats, globalAn, topDom] = await Promise.all([
    customers.count(),
    licenses.count(),
    billing.totalRevenue(),
    subscriptions.countByStatus(),
    analytics.globalStats(),
    analytics.topDomains(),
  ]);

  const subMap = {};
  for (const row of subStats) subMap[row.status] = row.n;

  res.json({
    customers:    custCount,
    licenses:     licCount,
    revenue_cents: revenue,
    subscriptions: subMap,
    analytics:    globalAn,
    topDomains:   topDom,
  });
}));

// ── Organizations / Customers ─────────────────
app.get('/api/v1/admin/customers', adminMiddleware, wrap(async (req, res) => {
  const rows = await customers.findAll();
  res.json({ customers: rows.map(safeCustomer) });
}));

app.get('/api/v1/admin/customers/:id', adminMiddleware, wrap(async (req, res) => {
  const [customer, sub, lics, invoices] = await Promise.all([
    customers.findById(req.params.id),
    subscriptions.findByCustomer(req.params.id),
    licenses.findByCustomer(req.params.id),
    billing.findByCustomer(req.params.id),
  ]);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json({ customer: safeCustomer(customer), subscription: sub, licenses: lics, billing: invoices });
}));

app.put('/api/v1/admin/customers/:id', adminMiddleware, wrap(async (req, res) => {
  const { name, org, status } = req.body || {};
  const customer = await customers.findById(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  if (name || org !== undefined) {
    await customers.update({ name: name || customer.name, org: org !== undefined ? org : customer.org, id: req.params.id });
  }
  if (status && ['active','suspended'].includes(status)) {
    await customers.updateStatus({ status, id: req.params.id });
  }

  const updated = await customers.findById(req.params.id);
  res.json({ customer: safeCustomer(updated) });
}));

app.delete('/api/v1/admin/customers/:id', adminMiddleware, wrap(async (req, res) => {
  const customer = await customers.findById(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  await customers.delete(req.params.id);
  res.json({ success: true });
}));

// ── Subscriptions ─────────────────────────────
app.get('/api/v1/admin/subscriptions', adminMiddleware, wrap(async (req, res) => {
  const rows = await subscriptions.findAll();
  res.json({ subscriptions: rows });
}));

app.put('/api/v1/admin/subscriptions/:customerId', adminMiddleware, wrap(async (req, res) => {
  const { plan, status, websiteLimit, expiresAt } = req.body || {};
  const cid = req.params.customerId;

  const sub = await subscriptions.findByCustomer(cid);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });

  const newPlan    = plan        || sub.plan;
  const newStatus  = status      || sub.status;
  const newLimit   = websiteLimit !== undefined ? parseInt(websiteLimit) : sub.website_limit;
  const newExpiry  = expiresAt   || sub.expires_at;

  await subscriptions.updateFull({ plan: newPlan, status: newStatus, websiteLimit: newLimit, expiresAt: newExpiry, customerId: cid });

  // Sync plan on customers + licenses if changed
  if (plan && plan !== sub.plan) {
    await customers.updatePlan({ plan, id: cid });
    await licenses.updatePlanAll({ plan, customerId: cid });
  }

  const updated = await subscriptions.findByCustomer(cid);
  res.json({ subscription: updated });
}));

// ── Licenses ──────────────────────────────────
app.get('/api/v1/admin/licenses', adminMiddleware, wrap(async (req, res) => {
  const rows = await licenses.findAll();
  res.json({ licenses: rows });
}));

app.post('/api/v1/admin/licenses', adminMiddleware, wrap(async (req, res) => {
  const { customerId, domain, name } = req.body || {};
  if (!customerId || !domain) return res.status(400).json({ error: 'customerId and domain are required' });

  const customer = await customers.findById(customerId);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const sub = await subscriptions.findByCustomer(customerId);
  const limit = sub ? sub.website_limit : PLAN_LIMITS[customer.plan];
  const count = await licenses.countByCustomer(customerId);
  if (count >= limit) return res.status(403).json({ error: `Website limit reached (${limit}) for this plan` });

  const key = generateKey(customer.plan, count + 1);
  await licenses.create({ key, customerId, domain: normalizeDomain(domain), name: name || domain, status: 'active', plan: customer.plan });
  const license = await licenses.findByKey(key);
  res.status(201).json({ license });
}));

app.put('/api/v1/admin/licenses/:key/status', adminMiddleware, wrap(async (req, res) => {
  const { status } = req.body || {};
  if (!['active','suspended','expired'].includes(status)) {
    return res.status(400).json({ error: 'status must be active, suspended, or expired' });
  }
  const result = await licenses.updateStatusAdmin({ status, key: req.params.key });
  if (result.affectedRows === 0) return res.status(404).json({ error: 'License not found' });

  const license = await licenses.findByKey(req.params.key);
  res.json({ license });
}));

app.delete('/api/v1/admin/licenses/:key', adminMiddleware, wrap(async (req, res) => {
  const result = await licenses.deleteAdmin(req.params.key);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'License not found' });
  res.json({ success: true });
}));

// ── Analytics ─────────────────────────────────
app.get('/api/v1/admin/analytics', adminMiddleware, wrap(async (req, res) => {
  const [stats, recent, topDom] = await Promise.all([
    analytics.globalStats(),
    analytics.recentAll(200),
    analytics.topDomains(),
  ]);
  res.json({ stats, recentEvents: recent, topDomains: topDom });
}));

// ── Billing ───────────────────────────────────
app.get('/api/v1/admin/billing', adminMiddleware, wrap(async (req, res) => {
  const [invoices, revenue] = await Promise.all([
    billing.findAll(),
    billing.totalRevenue(),
  ]);
  res.json({ invoices, totalRevenue: revenue });
}));

// ─────────────────────────────────────────────
// Error handler
// ─────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message, IS_PROD ? '' : err.stack);
  res.status(500).json({
    error: 'Internal server error',
    ...(IS_PROD ? {} : { detail: err.message }),
  });
});

// ─────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('  Insijam API Server  v2.0');
  console.log('========================================');
  console.log(`  URL     : http://localhost:${PORT}`);
  console.log(`  DB      : MySQL → ${process.env.DB_NAME || 'insijam'}@${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Env     : ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log(`  Dashboard  : http://localhost:${PORT}/dashboard`);
  console.log(`  Admin UI   : http://localhost:${PORT}/admin`);
  console.log(`  Docs       : http://localhost:${PORT}/docs`);
  console.log('  Admin key  : (set ADMIN_SECRET in .env)');
  console.log('');
  console.log('  Customer endpoints:');
  console.log('    POST /api/v1/auth/login');
  console.log('    POST /api/v1/auth/register');
  console.log('    POST /api/v1/validate');
  console.log('    GET  /api/v1/licenses');
  console.log('    GET  /api/v1/analytics');
  console.log('    GET  /api/v1/subscription');
  console.log('    GET  /api/v1/billing');
  console.log('');
  console.log('  Admin endpoints (AdminKey header required):');
  console.log('    GET  /api/v1/admin/stats');
  console.log('    GET  /api/v1/admin/customers');
  console.log('    GET  /api/v1/admin/subscriptions');
  console.log('    GET  /api/v1/admin/licenses');
  console.log('    GET  /api/v1/admin/analytics');
  console.log('    GET  /api/v1/admin/billing');
  console.log('========================================\n');
});

module.exports = app;
