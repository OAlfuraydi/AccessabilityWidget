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
// Security headers — applied to ALL responses including static HTML.
// CSP allows inline scripts/styles because the dashboard ships its
// JS/CSS inline; everything else (frame, MIME, HSTS, etc.) is enforced.
// ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src':     ["'self'"],
      'script-src':      ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
      // Allow inline event handlers (onclick="...", onchange="..., etc.) — the
      // dashboard uses them throughout. Without this, Helmet's default
      // `script-src-attr 'none'` silently disables every button on the page.
      'script-src-attr': ["'unsafe-inline'"],
      'style-src':       ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'style-src-attr':  ["'unsafe-inline'"],
      'font-src':        ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'img-src':         ["'self'", 'data:', 'https:'],
      'connect-src':     ["'self'"],
      'frame-ancestors': ["'self'"],
      'object-src':      ["'none'"],
      'base-uri':        ["'self'"],
    },
  },
  // Allow PDFs and images to be opened cross-origin from customer sites
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  // The widget gate at /accessibility-widget.js verifies the Referer host
  // matches the registered license domain. Helmet's default `no-referrer`
  // would strip that header entirely and break every page that embeds the
  // widget. `strict-origin-when-cross-origin` sends the full URL on
  // same-origin requests and only the origin on cross-origin — enough for
  // the gate, no path/query leak.
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: IS_PROD ? { maxAge: 15552000, includeSubDomains: true, preload: false } : false,
}));
app.use(express.json({ limit: '100kb' })); // bound JSON body size to mitigate DoS

// ─────────────────────────────────────────────
// Static pages — served after helmet so security headers are present
// ─────────────────────────────────────────────
app.use('/dashboard', express.static(path.join(__dirname, '../dashboard')));
app.get('/dashboard',             (req, res) => res.sendFile(path.join(__dirname, '../dashboard/index.html')));
app.get('/dashboard/login.html',  (req, res) => res.sendFile(path.join(__dirname, '../dashboard/login.html')));
app.get('/dashboard/index.html',  (req, res) => res.sendFile(path.join(__dirname, '../dashboard/index.html')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.get('/admin',            (req, res) => res.sendFile(path.join(__dirname, '../admin/index.html')));
app.get('/admin/index.html', (req, res) => res.sendFile(path.join(__dirname, '../admin/index.html')));
app.use('/docs', express.static(path.join(__dirname, '../docs')));
app.get('/docs',             (req, res) => res.sendFile(path.join(__dirname, '../docs/index.html')));
app.get('/docs/index.html',  (req, res) => res.sendFile(path.join(__dirname, '../docs/index.html')));

// Demo page + features docs + its PDFs (root-level files).
// NOTE: /accessibility-widget.js is intentionally NOT a static file route — it's
// served by a gated handler later in this file that requires a valid licenseKey
// and matching domain, and returns minified JS so the source isn't trivially
// readable.
app.get('/demo', (req, res) => res.sendFile(path.join(__dirname, '../../demo.html')));
app.get('/features-docs.html', (req, res) => res.sendFile(path.join(__dirname, '../../features-docs.html')));
app.get('/Insijam-Features-EN.pdf', (req, res) => res.sendFile(path.join(__dirname, '../../Insijam-Features-EN.pdf')));
app.get('/Insijam-Features-AR.pdf', (req, res) => res.sendFile(path.join(__dirname, '../../Insijam-Features-AR.pdf')));

// ─────────────────────────────────────────────
// Widget JS — gated download
// ─────────────────────────────────────────────
//
// The widget JavaScript is a paid asset. We protect it with two layers:
//
//   1. **Download gate**: the request must include either a valid `?key=` query
//      (or `licenseKey` body for sendBeacon-style POSTs we don't actually use).
//      The key must exist in the licenses table, be `active`, and the request's
//      Referer/Origin must match the registered domain. Otherwise → 403.
//
//   2. **Minification**: the source file is minified once at startup with terser.
//      Identifiers are mangled and comments stripped, so a casual viewer in
//      DevTools won't see any of the original variable names or in-source
//      explanatory comments.
//
// True secrecy is impossible for code that runs in a browser — anyone with
// DevTools can step through the script. These layers raise the bar significantly:
// the file can't be downloaded by a curl/scraper without an active license + the
// right domain, and once delivered, the minified output is meaningfully harder
// to read than the original. Combined with the runtime /api/v1/validate check,
// even leaked source can't activate features without a working subscription.
const fs     = require('fs');
const terser = require('terser');
const WIDGET_SRC_PATH = path.join(__dirname, '../../accessibility-widget.js');
let WIDGET_JS_MIN = null;       // populated at startup
let WIDGET_JS_MIN_TIME = 0;
let WIDGET_JS_ETAG = null;

async function loadAndMinifyWidget() {
  const src = fs.readFileSync(WIDGET_SRC_PATH, 'utf8');
  try {
    const result = await terser.minify(src, {
      compress: {
        passes: 2,
        drop_console: false,    // keep console.warn / console.error for license errors
        pure_funcs: [],
      },
      mangle: {
        properties: false,      // don't rename DOM props or our public window globals
      },
      format: {
        comments: false,        // strip ALL comments incl. legal banner; we own this
        beautify: false,
      },
      sourceMap: false,
    });
    if (!result || !result.code) throw new Error('terser returned empty output');
    WIDGET_JS_MIN = result.code;
    WIDGET_JS_MIN_TIME = Date.now();
    WIDGET_JS_ETAG = '"' + crypto.createHash('sha256').update(WIDGET_JS_MIN).digest('hex').slice(0, 32) + '"';
    console.log(`[widget] minified ${src.length} → ${WIDGET_JS_MIN.length} bytes (${Math.round(WIDGET_JS_MIN.length * 100 / src.length)}%)`);
  } catch (e) {
    console.error('[widget] minification failed; serving original source:', e.message);
    WIDGET_JS_MIN = src;
    WIDGET_JS_MIN_TIME = Date.now();
    WIDGET_JS_ETAG = '"' + crypto.createHash('sha256').update(src).digest('hex').slice(0, 32) + '"';
  }
}

// Watch the source file in development so edits hot-reload without restart.
fs.watchFile(WIDGET_SRC_PATH, { interval: 2000 }, () => {
  console.log('[widget] source changed — re-minifying');
  loadAndMinifyWidget().catch(err => console.error('[widget] reload failed:', err.message));
});

// Helper: extract the requesting site's hostname (Origin or Referer).
function requestDomain(req) {
  const o = req.headers['origin'];
  const r = req.headers['referer'];
  if (o && o !== 'null') return normalizeDomain(o);
  if (r) return normalizeDomain(r);
  return null;
}

// JS payload that any failed gate response returns INSTEAD of plain text,
// so the browser actually executes it and the visitor sees a banner explaining
// why the widget didn't load. No widget code is leaked — only the inline
// banner. We send 200 (browsers ignore script bodies on non-2xx responses).
// Use JSON.stringify to safely embed user-supplied strings into the JS payload —
// it handles all JS string escapes (quotes, newlines, unicode) correctly. The
// previous version used a regex literal that contained real Unicode line
// separators (U+2028) and broke parsing.
function widgetErrorBootstrap(opts) {
  const title  = JSON.stringify(opts.title  || "Accessibility tool unavailable");
  const msg    = JSON.stringify(opts.message || "License is not active. Please renew your Insijam subscription to restore accessibility on this site.");
  const reason = JSON.stringify(opts.reason  || "inactive");
  // Build the bootstrap as a single line of valid JS. All strings are double-quoted
  // and all user input is interpolated via JSON.stringify, so it survives any payload.
  return [
    '/* Insijam license gate */(function(){try{',
    'if(window.__insijam_notice_shown)return;window.__insijam_notice_shown=1;',
    'console.warn("[Insijam] Accessibility widget did not load — "+' + reason + '+". "+' + msg + ');',
    'var attach=function(){',
    '  if(document.getElementById("aw-license-notice"))return;',
    '  var d=document.createElement("div");d.id="aw-license-notice";d.setAttribute("role","status");',
    '  d.style.cssText="position:fixed;left:0;right:0;bottom:0;z-index:2147483646;background:#1e293b;color:#e2e8f0;padding:14px 20px;font:13px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Tahoma,sans-serif;display:flex;align-items:center;gap:12px;box-shadow:0 -4px 24px rgba(0,0,0,.3)";',
    '  var ic=document.createElement("div");ic.textContent="\u26a0";ic.style.cssText="font-size:20px;flex-shrink:0";',
    '  var tx=document.createElement("div");tx.style.cssText="flex:1;line-height:1.5";',
    '  var t=document.createElement("div");t.style.cssText="font-weight:700;font-size:14px;margin-bottom:2px";t.textContent=' + title + ';',
    '  var m=document.createElement("div");m.style.cssText="color:#94a3b8;font-size:12px";m.textContent=' + msg + ';',
    '  tx.appendChild(t);tx.appendChild(m);',
    '  var x=document.createElement("button");x.setAttribute("aria-label","Dismiss");x.textContent="\u00d7";',
    '  x.style.cssText="background:none;border:0;color:#94a3b8;cursor:pointer;font-size:22px;line-height:1;padding:2px 6px;flex-shrink:0";',
    '  x.onclick=function(){d.parentNode&&d.parentNode.removeChild(d)};',
    '  d.appendChild(ic);d.appendChild(tx);d.appendChild(x);',
    '  (document.body||document.documentElement).appendChild(d);',
    '};',
    'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attach);else attach();',
    '}catch(e){}})();',
  ].join("\n");
}
function sendErrorBanner(res, opts) {
  res.status(200);
  res.set({
    'Content-Type':           'application/javascript; charset=utf-8',
    'Cache-Control':          'no-store, max-age=0', // recheck immediately so a renewed license restores service
    'X-Content-Type-Options': 'nosniff',
    'X-Insijam-License':       opts.reason || 'inactive', // visible in DevTools for debugging
  });
  res.send(widgetErrorBootstrap(opts));
}

// The actual gated route. Must come before any catch-all and AFTER `normalizeDomain`
// is defined. We allow CORS from any origin since this is loaded cross-site.
app.get('/accessibility-widget.js', cors({ origin: true, methods: ['GET'] }), async (req, res) => {
  if (!WIDGET_JS_MIN) {
    return sendErrorBanner(res, {
      reason: 'warmup',
      title: 'Accessibility tool unavailable',
      message: 'Service is starting up. Please retry in a moment.',
    });
  }

  const key = (req.query.key || '').toString().trim();
  if (!key) {
    return sendErrorBanner(res, {
      reason: 'no_key',
      title: 'Accessibility tool not configured',
      message: 'No license key was supplied in the embed code. Please update your installation snippet.',
    });
  }
  if (key.length > 100 || !/^[A-Z0-9-]+$/i.test(key)) {
    return sendErrorBanner(res, {
      reason: 'bad_key_format',
      title: 'Accessibility tool license invalid',
      message: 'The license key format is not recognised. Please copy it again from your Insijam dashboard.',
    });
  }

  // Look up license, verify status + domain
  let license;
  try {
    license = await licenses.findByKey(key);
  } catch (_) {
    return sendErrorBanner(res, {
      reason: 'service_error',
      title: 'Accessibility tool temporarily unavailable',
      message: 'License verification service did not respond. Please retry shortly.',
    });
  }
  if (!license) {
    return sendErrorBanner(res, {
      reason: 'unknown_key',
      title: 'Accessibility tool license invalid',
      message: 'This license key is not recognised. Please verify it in your Insijam dashboard.',
    });
  }
  if (license.status !== 'active') {
    return sendErrorBanner(res, {
      reason: license.status, // 'suspended' or 'expired'
      title: license.status === 'expired' ? 'Accessibility tool subscription expired' : 'Accessibility tool license suspended',
      message: license.status === 'expired'
        ? 'Your Insijam license is not active. Please renew it to restore accessibility on this site.'
        : 'Your Insijam license has been suspended. Please contact support to reactivate it.',
    });
  }

  // Domain binding — Referer/Origin host must match registered domain.
  // We allow scripts loaded directly (no Referer) ONLY in non-prod for testing.
  const reqDom = requestDomain(req);
  const licDom = normalizeDomain(license.domain);
  const domainOk =
    (!reqDom && !IS_PROD) ||
    (reqDom && (reqDom === licDom || reqDom.endsWith('.' + licDom)));
  if (!domainOk) {
    return sendErrorBanner(res, {
      reason: 'domain_mismatch',
      title: 'Accessibility tool license invalid',
      message: `This license is registered for ${licDom}, not ${reqDom || 'this domain'}. Please contact your account admin.`,
    });
  }

  // ETag / 304 short-circuit so browsers don't re-download on every page nav.
  if (req.headers['if-none-match'] === WIDGET_JS_ETAG) {
    return res.status(304).end();
  }

  // Short browser cache so revoked licenses stop working within minutes —
  // the in-page runtime /validate call still catches revocations on the
  // next page load regardless.
  res.set({
    'Content-Type':           'application/javascript; charset=utf-8',
    'Cache-Control':          'private, max-age=300, must-revalidate',
    'ETag':                    WIDGET_JS_ETAG,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy':        'strict-origin-when-cross-origin',
  });
  res.send(WIDGET_JS_MIN);
});

// Allowed origins for the dashboard / admin / auth API. The /validate endpoint
// has its own open CORS (for embedded widgets on customer sites).
//
// In production, set ALLOWED_ORIGINS env var to a comma-separated list:
//   ALLOWED_ORIGINS=https://insijam.ipioneersco.com,https://app.insijam.io
//
// Regexes anchor on the full origin (scheme+host) — the trailing $ ensures
// `https://attacker.com/insijam.io` cannot match.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : IS_PROD
    ? [/^https:\/\/(?:[a-z0-9-]+\.)*insijam\.ipioneersco\.com$/, /^https:\/\/(?:[a-z0-9-]+\.)*insijam\.io$/]
    : [
        'http://localhost:3000', 'http://localhost:3001',
        'http://127.0.0.1:3000', 'http://127.0.0.1:3001',
        'http://127.0.0.1:5500', 'http://localhost:5500',
        /^https:\/\/(?:[a-z0-9-]+\.)*insijam\.ipioneersco\.com$/,
        /^https:\/\/(?:[a-z0-9-]+\.)*insijam\.io$/,
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
// IMPORTANT: a missing Origin header is NOT a cross-origin request — browsers
// don't send Origin for top-level GET navigations. Letting these through is
// safe because they're same-origin page loads; CORS only matters for XHR.
// Refusing them would trigger the global error handler and return 500 to a
// user who simply opened /dashboard/login.html in their address bar.
const restrictedCors = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // top-level navigation, fine
    const ok = allowedOrigins.some(o => o instanceof RegExp ? o.test(origin) : o === origin);
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
});

// Route dispatcher: validate + track use open CORS (called by widgets on
// customer sites), everything else restricted. Static HTML / JS / PDF
// served above this dispatcher are NEVER subject to CORS.
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1/validate')) return openCors(req, res, next);
  if (req.path.startsWith('/api/v1/track'))    return openCors(req, res, next);
  if (req.method === 'GET' && !req.path.startsWith('/api/')) return next();
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

app.use('/api/v1/validate', rateLimit({ windowMs: 60_000, max: 60,  standardHeaders: true, legacyHeaders: false }));
// /track receives small batches from end-user browsers — generous limit per IP since
// many users behind one NAT may share an IP. Per-license bucket below also caps abuse.
app.use('/api/v1/track',    rateLimit({ windowMs: 60_000, max: 600, standardHeaders: true, legacyHeaders: false }));
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
  if (pw.length < 10)                return 'Password must be at least 10 characters';
  if (pw.length > 128)               return 'Password is too long (max 128 characters)';
  if (!/[a-z]/.test(pw))             return 'Password must contain a lowercase letter';
  if (!/[A-Z]/.test(pw))             return 'Password must contain an uppercase letter';
  if (!/[0-9]/.test(pw))             return 'Password must contain a number';
  if (!/[^A-Za-z0-9]/.test(pw))      return 'Password must contain a symbol';
  return null;
}

function isValidDomain(d) {
  if (typeof d !== 'string') return false;
  if (d.length === 0 || d.length > 253) return false;
  // hostname per RFC1035: labels of letters/digits/hyphens, dot-separated, TLD ≥ 2 chars
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(
    d.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
  );
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
  // Avoid exposing version + DB type to unauthenticated clients in production
  // — those help fingerprint vulnerabilities. Internal monitoring should use
  // the AdminKey header to get full info.
  const isAdmin = (req.headers.authorization || '').replace('AdminKey ', '').trim() === ADMIN_SECRET;
  if (isAdmin) return res.json({ status: 'ok', version: '2.0.0', db: 'mysql', time: new Date().toISOString() });
  res.json({ status: 'ok' });
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
  // Reject HTML control chars in user-shown fields to neutralize stored-XSS attempts.
  if (/[<>\\\x00-\x1f\x7f]/.test(name) || (org && /[<>\\\x00-\x1f\x7f]/.test(String(org)))) {
    return res.status(400).json({ error: 'Name or organization contains invalid characters' });
  }
  if (!['starter','professional','enterprise'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const existing = await customers.findByEmail(email.toLowerCase().trim());
  if (existing) {
    // Avoid user-enumeration: return the same generic 400 the client would see for
    // any other validation failure. The client tells users to log in if registration
    // appears to "fail" with their existing email — never confirm or deny existence.
    return res.status(400).json({ error: 'Unable to complete registration. If you already have an account, please log in.' });
  }

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
// Routes — Telemetry ingest (public, called by widget on customer sites)
// ─────────────────────────────────────────────
const ALLOWED_EVENT_TYPES = new Set([
  'pageview',     // widget loaded on a page
  'widget_open',  // user opened the panel
  'feature_used', // user toggled a feature (feature = key, e.g. "highContrast")
  'profile_used', // user activated a profile (feature = profile name)
  'tts_used',     // user invoked text-to-speech
]);
const FEATURE_NAME_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,40}$/; // safe, short

app.post('/api/v1/track', wrap(async (req, res) => {
  const { key, events } = req.body || {};
  if (!key || typeof key !== 'string' || key.length > 100) {
    return res.status(400).json({ error: 'missing or invalid key' });
  }
  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'events array required' });
  }
  if (events.length > 50) {
    return res.status(400).json({ error: 'too many events in batch (max 50)' });
  }

  // Verify license + domain match (same logic as /validate, no DB write yet).
  const license = await licenses.findByKey(key);
  if (!license || license.status !== 'active') {
    return res.status(403).json({ error: 'license invalid or inactive' });
  }
  let actualDomain = null;
  const originHeader  = req.headers['origin'];
  const refererHeader = req.headers['referer'];
  if (originHeader && originHeader !== 'null') actualDomain = normalizeDomain(originHeader);
  else if (refererHeader)                       actualDomain = normalizeDomain(refererHeader);
  const licDomain = normalizeDomain(license.domain);
  if (!actualDomain || (actualDomain !== licDomain && !actualDomain.endsWith('.' + licDomain))) {
    return res.status(403).json({ error: 'domain mismatch' });
  }

  // Validate every event before bulk-inserting
  const now = Math.floor(Date.now() / 1000);
  const rows = [];
  for (const e of events) {
    if (!e || typeof e !== 'object') continue;
    if (!ALLOWED_EVENT_TYPES.has(e.type)) continue;
    let feature = null;
    if (e.feature != null) {
      const f = String(e.feature);
      if (!FEATURE_NAME_RE.test(f)) continue; // reject anything weird
      feature = f;
    }
    rows.push({
      type: e.type,
      licenseKey: key,
      domain: actualDomain,
      plan: license.plan,
      feature,
      ts: now,
    });
  }

  if (rows.length) await analytics.insertBatch(rows);
  res.json({ ok: true, accepted: rows.length });
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
  // Reject names that contain HTML control characters; keep allowable text broad
  // enough for real labels in any language but block the chars used in XSS payloads.
  if (name) {
    const n = String(name);
    if (n.length > 255) return res.status(400).json({ error: 'Name too long (max 255 chars)' });
    if (/[<>\\\x00-\x1f\x7f]/.test(n)) return res.status(400).json({ error: 'Name contains invalid characters' });
  }

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
  const cid = req.customer.id;
  const [total, byDom, recent, topFeatures, topProfiles, pageviews, uniqueUsers, timeline, perLicense, eventCounts] = await Promise.all([
    analytics.totalByCustomer(cid),
    analytics.byDomain(cid),
    analytics.recentByCustomer(cid),
    analytics.topFeaturesByCustomer(cid),
    analytics.topProfilesByCustomer(cid),
    analytics.pageviewsByCustomer(cid),
    analytics.uniqueUsersByCustomer(cid),
    analytics.dailyTimelineByCustomer(cid, 14),
    analytics.perLicenseByCustomer(cid),
    analytics.eventCountsByCustomer(cid),
  ]);

  // Pivot the type/count rows into a flat object, casting strings → numbers.
  const counts = {};
  for (const r of eventCounts) counts[r.type] = Number(r.n) || 0;
  const widgetOpens  = counts.widget_open  || 0;
  const featureUsed  = counts.feature_used || 0;
  const profileUsed  = counts.profile_used || 0;
  const ttsUsed      = counts.tts_used     || 0;
  const interactions = featureUsed + profileUsed + ttsUsed;

  // Avg widget opens per pageview — natural number (a visitor can open the
  // panel multiple times in one pageview so this can be > 1.0). Honest about
  // what it means; not a "rate" capped at 100%.
  const opensPerPageview = pageviews > 0 ? +(widgetOpens / pageviews).toFixed(2) : 0;
  // Avg interactions per opened panel session.
  const adjustmentsPerOpen = widgetOpens > 0 ? +(interactions / widgetOpens).toFixed(1) : 0;

  res.json({
    totalActivations: total,
    pageviews,
    uniqueUsers,
    widgetOpens,
    interactions,
    opensPerPageview,
    adjustmentsPerOpen,
    eventCounts: { widget_open: widgetOpens, feature_used: featureUsed, profile_used: profileUsed, tts_used: ttsUsed },
    byDomain: byDom,
    recentEvents: recent,
    topFeatures,
    topProfiles,
    timeline,
    perLicense,
  });
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
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 255) {
    return res.status(400).json({ error: 'Name must be between 2 and 255 characters' });
  }
  if (org && (typeof org !== 'string' || String(org).length > 255)) {
    return res.status(400).json({ error: 'Organization too long (max 255 characters)' });
  }
  if (/[<>\\\x00-\x1f\x7f]/.test(name) || (org && /[<>\\\x00-\x1f\x7f]/.test(String(org)))) {
    return res.status(400).json({ error: 'Name or organization contains invalid characters' });
  }
  await customers.update({ name: name.trim(), org: org ? String(org).trim() : '', id: req.customer.id });
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
// Pre-warm the widget cache, then start listening
loadAndMinifyWidget().catch(err => console.error('[widget] initial minify failed:', err.message));

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
