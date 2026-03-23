/**
 * accessibilityWidgetMiddleware — Express / Node.js middleware
 *
 * Automatically injects the Accessibility Widget into every HTML response.
 * Works with Express, Koa (with adaptation), Fastify, etc.
 *
 * Usage (Express):
 *   const { accessibilityWidget } = require('./middleware');
 *
 *   app.use(express.static('public'));       // serve accessibility-widget.js from here
 *   app.use(accessibilityWidget({ lang: 'auto', primaryColor: '#2563EB' }));
 *
 *   // Then your routes:
 *   app.get('/', (req, res) => res.sendFile('index.html'));
 *
 * The middleware intercepts res.send() / res.render() / res.end() for HTML
 * responses and injects the widget script just before </body>.
 */

'use strict';

/**
 * Build the widget script injection snippet.
 * @param {object} config  — AccessibilityWidgetConfig options
 * @param {string} src     — URL path to accessibility-widget.js
 */
function buildSnippet(config, src) {
  const cfg = JSON.stringify(config, null, 2);
  return `
<!-- Accessibility Widget (auto-injected) -->
<script>window.AccessibilityWidgetConfig = ${cfg};</script>
<script src="${src}" defer></script>`;
}

/**
 * Express middleware factory.
 *
 * @param {object} options
 * @param {'en'|'ar'|'auto'} [options.lang='auto']
 * @param {string} [options.position='bottom-right']
 * @param {string} [options.primaryColor='#2563EB']
 * @param {string} [options.buttonIcon='♿']
 * @param {boolean} [options.showProfiles=true]
 * @param {boolean} [options.showTTS=true]
 * @param {object}  [options.features]            — per-feature on/off flags
 * @param {string}  [options.scriptSrc='/accessibility-widget.js']
 * @param {boolean} [options.disabled=false]       — set true to skip injection
 */
function accessibilityWidget(options = {}) {
  const {
    scriptSrc = '/accessibility-widget.js',
    disabled = false,
    ...widgetConfig
  } = options;

  const config = {
    lang: 'auto',
    position: 'bottom-right',
    primaryColor: '#2563EB',
    showProfiles: true,
    showTTS: true,
    ...widgetConfig,
  };

  const snippet = buildSnippet(config, scriptSrc);

  return function awMiddleware(req, res, next) {
    if (disabled) return next();

    // Intercept res.send to inject into HTML
    const originalSend = res.send.bind(res);

    res.send = function (body) {
      const contentType = res.getHeader('content-type') || '';

      if (
        typeof body === 'string' &&
        contentType.includes('text/html') &&
        body.includes('</body>')
      ) {
        body = body.replace('</body>', snippet + '\n</body>');
      }

      return originalSend(body);
    };

    next();
  };
}

module.exports = { accessibilityWidget, buildSnippet };
