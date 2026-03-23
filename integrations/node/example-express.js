/**
 * Node.js / Express — Full Integration Example
 *
 * This file shows three ways to embed the widget in an Express application:
 *   A) Auto-injection via middleware (recommended for multi-page apps)
 *   B) Manual injection in a specific route
 *   C) EJS / Handlebars template snippet
 *
 * Run:
 *   npm install express
 *   node example-express.js
 *   Open http://localhost:3000
 */

'use strict';

const express = require('express');
const path    = require('path');
const { accessibilityWidget } = require('./middleware');

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// Option A — Middleware auto-injection (recommended)
// Works on EVERY route — zero per-route changes needed.
// ─────────────────────────────────────────────────────────────────────────────

// 1. Serve the widget JS file as a static asset
app.use(express.static(path.join(__dirname, '../../')));   // serves accessibility-widget.js

// 2. Add the middleware BEFORE your routes
app.use(accessibilityWidget({
  lang: 'auto',             // auto-detect from <html lang>
  position: 'bottom-right',
  primaryColor: '#2563EB',
  showProfiles: true,
  showTTS: true,
  scriptSrc: '/accessibility-widget.js',
}));

// 3. Your normal routes — no changes needed
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>My Site</title></head>
<body>
  <h1>Welcome</h1>
  <p>This page has the accessibility widget auto-injected by Express middleware.</p>
</body>
</html>`);
});


// ─────────────────────────────────────────────────────────────────────────────
// Option B — Manual injection in a specific route (no middleware)
// ─────────────────────────────────────────────────────────────────────────────
const { buildSnippet } = require('./middleware');

const widgetSnippet = buildSnippet(
  { lang: 'auto', primaryColor: '#7c3aed', position: 'bottom-left' },
  '/accessibility-widget.js'
);

app.get('/special-page', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><title>صفحة خاصة</title></head>
<body>
  <h1>مرحباً</h1>
  <p>هذه صفحة باللغة العربية. الأداة تكتشف اللغة تلقائياً.</p>
  ${widgetSnippet}
</body>
</html>`);
});


// ─────────────────────────────────────────────────────────────────────────────
// Option C — EJS template snippet
// In your views/layout.ejs (or partials/_footer.ejs):
// ─────────────────────────────────────────────────────────────────────────────
/*
  <%# views/layout.ejs %>
  <!DOCTYPE html>
  <html lang="<%= locals.lang || 'en' %>">
  <head>...</head>
  <body>
    <%- body %>

    <%# Accessibility Widget %>
    <script>
      window.AccessibilityWidgetConfig = {
        lang: '<%= locals.lang || "auto" %>',
        position: 'bottom-right',
        primaryColor: '<%= locals.brandColor || "#2563EB" %>'
      };
    </script>
    <script src="/accessibility-widget.js" defer></script>
  </body>
  </html>
*/


// ─────────────────────────────────────────────────────────────────────────────
// Option D — Handlebars (hbs) partial
// In views/partials/a11y-widget.hbs:
// ─────────────────────────────────────────────────────────────────────────────
/*
  <script>
    window.AccessibilityWidgetConfig = {
      lang: '{{lang}}',
      position: 'bottom-right',
      primaryColor: '{{brandColor}}'
    };
  </script>
  <script src="/accessibility-widget.js" defer></script>

  Then in your main layout.hbs:
  {{> a11y-widget lang="auto" brandColor="#2563EB"}}
*/


app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
  console.log('The accessibility widget is auto-injected on all HTML pages.');
});
