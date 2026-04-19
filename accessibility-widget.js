/*!
 * Accessibility Widget v1.0.0
 * Bilingual (Arabic / English) - Works on any website
 * (c) 2026 - MIT License
 */
(function (global) {
  'use strict';

  // ─────────────────────────────────────────────
  // i18n Translations
  // ─────────────────────────────────────────────
  const TRANSLATIONS = {
    en: {
      title: 'Accessibility Settings',
      close: 'Close',
      reset: 'Reset All',
      profiles: 'Accessibility Profiles',
      visual: 'Visual Accessibility',
      reading: 'Reading & Cognitive',
      navigation: 'Navigation & Interaction',
      audio: 'Audio & Assistance',
      fontSize: 'Font Size',
      fontFamily: 'Font Family',
      lineHeight: 'Line Height',
      letterSpacing: 'Letter Spacing',
      textAlign: 'Text Alignment',
      highContrast: 'High Contrast',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      grayscale: 'Grayscale',
      invertColors: 'Invert Colors',
      muteColors: 'Mute Colors',
      highlightLinks: 'Highlight Links',
      highlightHeadings: 'Highlight Headings',
      readingMask: 'Reading Mask',
      readingGuide: 'Reading Guide',
      focusMode: 'Focus Mode',
      dyslexiaFont: 'Dyslexia Font',
      pauseAnimations: 'Pause Animations',
      bigCursor: 'Big Cursor',
      skipContent: 'Skip to Content',
      keyboardNav: 'Keyboard Navigation',
      textToSpeech: 'Text-to-Speech',
      ttsStop: 'Stop Reading',
      ttsStart: 'Read Page',
      muteSounds: 'Mute Sounds',
      profileVisuallyImpaired: 'Visually Impaired',
      profileLowVision: 'Low Vision',
      profileDyslexia: 'Dyslexia Support',
      profileSeizureSafe: 'Seizure Safe',
      profileCognitive: 'Cognitive Support',
      profileKeyboard: 'Keyboard Navigation',
      fontDefault: 'Default',
      fontReadable: 'Readable',
      fontDyslexia: 'Dyslexia',
      fontMono: 'Monospace',
      alignLeft: 'Left',
      alignCenter: 'Center',
      alignRight: 'Right',
      alignJustify: 'Justify',
      decrease: 'Decrease',
      increase: 'Increase',
      on: 'On',
      off: 'Off',
      lang: 'العربية',
      openWidget: 'Accessibility',
      savedMsg: 'Settings saved',
      resetMsg: 'All settings reset',
      ttsReading: 'Reading',
      ttsOf: 'of',
    },
    ar: {
      title: 'إعدادات إمكانية الوصول',
      close: 'إغلاق',
      reset: 'إعادة تعيين الكل',
      profiles: 'ملفات إمكانية الوصول',
      visual: 'إمكانية الوصول البصري',
      reading: 'القراءة والإدراك',
      navigation: 'التنقل والتفاعل',
      audio: 'الصوت والمساعدة',
      fontSize: 'حجم الخط',
      fontFamily: 'نوع الخط',
      lineHeight: 'ارتفاع السطر',
      letterSpacing: 'تباعد الحروف',
      textAlign: 'محاذاة النص',
      highContrast: 'تباين عالٍ',
      darkMode: 'الوضع الداكن',
      lightMode: 'الوضع الفاتح',
      grayscale: 'التدرج الرمادي',
      invertColors: 'عكس الألوان',
      muteColors: 'تخفيف الألوان',
      highlightLinks: 'إبراز الروابط',
      highlightHeadings: 'إبراز العناوين',
      readingMask: 'قناع القراءة',
      readingGuide: 'دليل القراءة',
      focusMode: 'وضع التركيز',
      dyslexiaFont: 'خط عسر القراءة',
      pauseAnimations: 'إيقاف الحركات',
      bigCursor: 'مؤشر كبير',
      skipContent: 'انتقل للمحتوى',
      keyboardNav: 'تنقل لوحة المفاتيح',
      textToSpeech: 'تحويل النص إلى كلام',
      ttsStop: 'إيقاف القراءة',
      ttsStart: 'قراءة الصفحة',
      muteSounds: 'كتم الأصوات',
      profileVisuallyImpaired: 'ضعاف البصر',
      profileLowVision: 'رؤية منخفضة',
      profileDyslexia: 'دعم عسر القراءة',
      profileSeizureSafe: 'آمن للنوبات',
      profileCognitive: 'دعم إدراكي',
      profileKeyboard: 'تنقل لوحة المفاتيح',
      fontDefault: 'افتراضي',
      fontReadable: 'قابل للقراءة',
      fontDyslexia: 'عسر القراءة',
      fontMono: 'أحادي المسافة',
      alignLeft: 'يسار',
      alignCenter: 'وسط',
      alignRight: 'يمين',
      alignJustify: 'ضبط',
      decrease: 'تقليل',
      increase: 'زيادة',
      on: 'تشغيل',
      off: 'إيقاف',
      lang: 'English',
      openWidget: 'إمكانية الوصول',
      savedMsg: 'تم حفظ الإعدادات',
      resetMsg: 'تم إعادة تعيين جميع الإعدادات',
      ttsReading: 'جارٍ القراءة',
      ttsOf: 'من',
    },
  };

  // ─────────────────────────────────────────────
  // Default Config (can be overridden via window.AccessibilityWidgetConfig)
  // ─────────────────────────────────────────────
  const DEFAULT_CONFIG = {
    lang: 'en',                // 'en' | 'ar' | 'auto'
    position: 'bottom-right',  // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    primaryColor: '#2563EB',
    buttonIcon: '♿',
    storageKey: 'aw_settings',
    showProfiles: true,
    showTTS: true,
    showReadingMask: true,
    // SaaS license options
    licenseKey: null,           // 'AW-XXXX-XXXX-XXXX-XXXX'  — required unless devMode:true
    apiEndpoint: '/api/v1/validate', // relative by default; override with full URL for cross-origin
    licenseCheckInterval: 12,   // re-validate every N hours (0 = once only)
    devMode: false,             // true = skip license check (local dev only, never use in production)
    features: {
      fontSize: true,
      fontFamily: true,
      lineHeight: true,
      letterSpacing: true,
      textAlign: true,
      highContrast: true,
      darkMode: true,
      lightMode: true,
      grayscale: true,
      invertColors: true,
      muteColors: true,
      highlightLinks: true,
      highlightHeadings: true,
      readingMask: true,
      readingGuide: true,
      focusMode: true,
      dyslexiaFont: true,
      pauseAnimations: true,
      bigCursor: true,
      skipContent: true,
      keyboardNav: true,
      textToSpeech: true,
      muteSounds: true,
    },
  };

  // ─────────────────────────────────────────────
  // Profiles
  // ─────────────────────────────────────────────
  const PROFILES = {
    visuallyImpaired: {
      fontSize: 2,
      highContrast: true,
      highlightLinks: true,
      bigCursor: true,
      keyboardNav: true,
    },
    lowVision: {
      fontSize: 3,
      fontFamily: 'readable',
      lineHeight: 2,
      highContrast: true,
      highlightLinks: true,
      highlightHeadings: true,
    },
    dyslexia: {
      fontFamily: 'dyslexia',
      lineHeight: 2,
      letterSpacing: 2,
      textAlign: 'left',
      highlightLinks: true,
    },
    seizureSafe: {
      pauseAnimations: true,
      muteColors: true,
      lightMode: true,
    },
    cognitive: {
      fontFamily: 'readable',
      lineHeight: 1,
      focusMode: true,
      readingGuide: true,
      pauseAnimations: true,
      textAlign: 'left',
    },
    keyboard: {
      keyboardNav: true,
      skipContent: true,
      highlightLinks: true,
    },
  };

  // ─────────────────────────────────────────────
  // Embedded CSS
  // ─────────────────────────────────────────────
  const WIDGET_CSS = `
    /* ── Accessibility Widget Styles ── */
    #aw-root * { box-sizing: border-box; }

    #aw-trigger {
      position: fixed;
      z-index: 2147483647;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      transition: transform 0.2s, box-shadow 0.2s;
      outline: none;
      background: var(--aw-primary, #2563EB);
      color: #fff;
    }
    #aw-trigger:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(0,0,0,0.32); }
    #aw-trigger:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }

    #aw-trigger.bottom-right { bottom: 24px; right: 24px; }
    #aw-trigger.bottom-left  { bottom: 24px; left: 24px; }
    #aw-trigger.top-right    { top: 24px; right: 24px; }
    #aw-trigger.top-left     { top: 24px; left: 24px; }

    /* Panel */
    #aw-panel {
      position: fixed;
      z-index: 2147483646;
      width: 360px;
      max-height: 88vh;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 48px rgba(0,0,0,0.22);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: #1e293b;
      transition: opacity 0.2s, transform 0.2s;
      opacity: 0;
      pointer-events: none;
      transform: scale(0.95);
    }
    #aw-panel.open {
      opacity: 1;
      pointer-events: all;
      transform: scale(1);
    }
    #aw-panel.bottom-right { bottom: 92px; right: 24px; }
    #aw-panel.bottom-left  { bottom: 92px; left: 24px; }
    #aw-panel.top-right    { top: 92px; right: 24px; }
    #aw-panel.top-left     { top: 92px; left: 24px; }

    #aw-panel.rtl { direction: rtl; text-align: right; }
    #aw-panel.ltr { direction: ltr; text-align: left; }

    /* Header */
    .aw-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: var(--aw-primary, #2563EB);
      color: #fff;
      flex-shrink: 0;
    }
    .aw-header-title { font-size: 16px; font-weight: 700; }
    .aw-header-actions { display: flex; gap: 8px; }
    .aw-header-btn {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      color: #fff;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      padding: 5px 10px;
      transition: background 0.15s;
    }
    .aw-header-btn:hover { background: rgba(255,255,255,0.35); }
    .aw-header-btn.close { padding: 5px 9px; font-size: 16px; }

    /* Body */
    .aw-body {
      overflow-y: auto;
      padding: 16px 20px;
      flex: 1;
    }
    .aw-body::-webkit-scrollbar { width: 5px; }
    .aw-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

    /* Section */
    .aw-section { margin-bottom: 20px; }
    .aw-section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
    }

    /* Profiles grid */
    .aw-profiles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .aw-profile-btn {
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      background: #f8fafc;
      cursor: pointer;
      padding: 10px 8px;
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      transition: all 0.15s;
      line-height: 1.3;
    }
    .aw-profile-btn:hover { border-color: var(--aw-primary, #2563EB); color: var(--aw-primary, #2563EB); background: #eff6ff; }
    .aw-profile-btn.active { border-color: var(--aw-primary, #2563EB); background: var(--aw-primary, #2563EB); color: #fff; }
    .aw-profile-icon { font-size: 20px; display: block; margin-bottom: 4px; }

    /* Toggle row */
    .aw-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .aw-row:last-child { border-bottom: none; }
    .aw-row-label { font-size: 13px; font-weight: 500; color: #374151; flex: 1; }

    /* Toggle switch */
    .aw-toggle {
      position: relative;
      width: 40px;
      height: 22px;
      flex-shrink: 0;
    }
    .aw-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
    .aw-toggle-slider {
      position: absolute;
      inset: 0;
      background: #cbd5e1;
      border-radius: 22px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .aw-toggle-slider::before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      top: 3px;
      left: 3px;
      transition: transform 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .aw-toggle input:checked + .aw-toggle-slider { background: var(--aw-primary, #2563EB); }
    .aw-toggle input:checked + .aw-toggle-slider::before { transform: translateX(18px); }
    .aw-toggle input:focus-visible + .aw-toggle-slider { outline: 2px solid var(--aw-primary, #2563EB); outline-offset: 2px; }

    /* Stepper */
    .aw-stepper { display: flex; align-items: center; gap: 6px; }
    .aw-stepper-btn {
      width: 28px; height: 28px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      cursor: pointer;
      font-size: 16px;
      font-weight: 700;
      color: #475569;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .aw-stepper-btn:hover { background: var(--aw-primary, #2563EB); color: #fff; border-color: var(--aw-primary, #2563EB); }
    .aw-stepper-value { min-width: 24px; text-align: center; font-weight: 600; color: #1e293b; font-size: 13px; }

    /* Select */
    .aw-select {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 5px 8px;
      font-size: 12px;
      color: #374151;
      background: #f8fafc;
      cursor: pointer;
      max-width: 130px;
    }
    .aw-select:focus { outline: 2px solid var(--aw-primary, #2563EB); }

    /* Segmented control */
    .aw-seg { display: flex; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .aw-seg-btn {
      flex: 1;
      border: none;
      background: #f8fafc;
      cursor: pointer;
      padding: 5px 4px;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      transition: all 0.15s;
    }
    .aw-seg-btn + .aw-seg-btn { border-left: 1px solid #e2e8f0; }
    .aw-seg-btn.active { background: var(--aw-primary, #2563EB); color: #fff; }
    .aw-seg-btn:hover:not(.active) { background: #eff6ff; color: var(--aw-primary, #2563EB); }

    /* TTS button */
    .aw-tts-btn {
      width: 100%;
      padding: 9px;
      border-radius: 10px;
      border: none;
      background: var(--aw-primary, #2563EB);
      color: #fff;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      margin-top: 4px;
      transition: opacity 0.2s;
    }
    .aw-tts-btn:hover { opacity: 0.9; }
    .aw-tts-btn.stop { background: #dc2626; }

    /* TTS Progress bar (top of page) */
    #aw-tts-progress {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 2147483645;
      background: rgba(15, 23, 42, 0.93);
      padding: 10px 20px 8px;
      display: none;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 2px 20px rgba(0,0,0,0.35);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #aw-tts-progress-bar {
      height: 4px;
      background: rgba(255,255,255,0.15);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 7px;
    }
    #aw-tts-progress-fill {
      height: 100%;
      background: var(--aw-primary, #2563EB);
      border-radius: 2px;
      transition: width 0.4s ease;
      width: 0%;
    }
    #aw-tts-progress-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    #aw-tts-progress-label {
      color: #94a3b8;
      font-size: 11px;
      font-weight: 600;
      flex-shrink: 0;
    }
    #aw-tts-progress-text {
      color: #e2e8f0;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      text-align: center;
    }
    #aw-tts-stop-inline {
      background: #dc2626;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      flex-shrink: 0;
    }

    /* TTS current paragraph highlight */
    .aw-tts-highlight {
      background: rgba(251, 191, 36, 0.18) !important;
      outline: 2px dashed #f59e0b !important;
      outline-offset: 4px !important;
      border-radius: 4px !important;
    }

    /* TTS word highlight overlay (floating, non-destructive) */
    #aw-tts-word-overlay {
      position: fixed;
      pointer-events: none;
      z-index: 2147483638;
      background: rgba(253, 224, 71, 0.55);
      border-bottom: 2px solid #ca8a04;
      border-radius: 3px;
      display: none;
    }

    /* Toast */
    #aw-toast {
      position: fixed;
      bottom: 90px;
      right: 24px;
      background: #1e293b;
      color: #fff;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      z-index: 2147483647;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    #aw-toast.show { opacity: 1; }

    /* Reading Mask */
    #aw-reading-mask {
      position: fixed;
      left: 0; right: 0;
      height: 60px;
      pointer-events: none;
      z-index: 2147483640;
      display: none;
      box-shadow: 0 0 0 9999px rgba(0,0,0,0.55);
      border-radius: 4px;
    }

    /* Reading Guide */
    #aw-reading-guide {
      position: fixed;
      left: 0; right: 0;
      height: 2px;
      background: var(--aw-primary, #2563EB);
      pointer-events: none;
      z-index: 2147483641;
      display: none;
      opacity: 0.8;
    }

    /* Skip to content */
    #aw-skip-btn {
      position: fixed;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--aw-primary, #2563EB);
      color: #fff;
      padding: 12px 24px;
      border-radius: 0 0 12px 12px;
      font-size: 14px;
      font-weight: 700;
      z-index: 2147483647;
      text-decoration: none;
      transition: top 0.2s;
      border: none;
      cursor: pointer;
    }
    #aw-skip-btn:focus { top: 0; }

    /* ── Applied accessibility styles on <body> / <html> ── */

    /* Font sizes */
    body.aw-fs-1 { font-size: 110% !important; }
    body.aw-fs-2 { font-size: 120% !important; }
    body.aw-fs-3 { font-size: 135% !important; }
    body.aw-fs-4 { font-size: 150% !important; }
    body.aw-fs-5 { font-size: 170% !important; }
    body.aw-fs-1 *, body.aw-fs-2 *, body.aw-fs-3 *, body.aw-fs-4 *, body.aw-fs-5 * {
      font-size: inherit !important;
    }

    /* Font families */
    body.aw-ff-readable, body.aw-ff-readable * {
      font-family: Georgia, 'Times New Roman', serif !important;
    }
    body.aw-ff-dyslexia, body.aw-ff-dyslexia * {
      font-family: 'OpenDyslexic', 'Comic Sans MS', 'Chalkboard SE', 'Arial', sans-serif !important;
      letter-spacing: 0.05em !important;
    }
    body.aw-ff-mono, body.aw-ff-mono * {
      font-family: 'Courier New', Courier, monospace !important;
    }

    /* Line height */
    body.aw-lh-1 * { line-height: 1.6 !important; }
    body.aw-lh-2 * { line-height: 2 !important; }
    body.aw-lh-3 * { line-height: 2.5 !important; }

    /* Letter spacing */
    body.aw-ls-1 * { letter-spacing: 0.08em !important; }
    body.aw-ls-2 * { letter-spacing: 0.15em !important; }
    body.aw-ls-3 * { letter-spacing: 0.22em !important; }

    /* Text alignment */
    body.aw-ta-left   p, body.aw-ta-left   li { text-align: left !important; }
    body.aw-ta-center p, body.aw-ta-center li { text-align: center !important; }
    body.aw-ta-right  p, body.aw-ta-right  li { text-align: right !important; }
    body.aw-ta-justify p, body.aw-ta-justify li { text-align: justify !important; }

    /* High contrast */
    body.aw-high-contrast, body.aw-high-contrast * {
      background: #000 !important;
      color: #ffff00 !important;
      border-color: #ffff00 !important;
    }
    body.aw-high-contrast a, body.aw-high-contrast a * { color: #00ffff !important; }
    body.aw-high-contrast img { filter: contrast(1.5) brightness(0.9); }
    body.aw-high-contrast #aw-panel, body.aw-high-contrast #aw-panel * { background: unset !important; color: unset !important; }

    /* Dark mode */
    body.aw-dark-mode { background: #0f172a !important; color: #e2e8f0 !important; }
    body.aw-dark-mode * { background-color: inherit; color: inherit; }
    body.aw-dark-mode img { filter: brightness(0.85); }
    body.aw-dark-mode #aw-panel { background: #1e293b !important; color: #e2e8f0 !important; }
    body.aw-dark-mode .aw-section-title { color: #94a3b8 !important; border-color: #334155 !important; }
    body.aw-dark-mode .aw-row { border-color: #1e293b !important; }
    body.aw-dark-mode .aw-row-label { color: #e2e8f0 !important; }
    body.aw-dark-mode .aw-stepper-btn { background: #334155 !important; border-color: #475569 !important; color: #e2e8f0 !important; }
    body.aw-dark-mode .aw-select { background: #334155 !important; color: #e2e8f0 !important; border-color: #475569 !important; }
    body.aw-dark-mode .aw-seg-btn { background: #334155 !important; color: #94a3b8 !important; }
    body.aw-dark-mode .aw-profile-btn { background: #1e293b !important; border-color: #334155 !important; color: #e2e8f0 !important; }

    /* Light mode (force) */
    body.aw-light-mode { background: #ffffff !important; color: #1e293b !important; }
    body.aw-light-mode *:not(#aw-root):not(#aw-root *) { background-color: #ffffff !important; color: #1e293b !important; }

    /* Grayscale */
    body.aw-grayscale { filter: grayscale(100%); }
    body.aw-grayscale #aw-panel { filter: none; }
    body.aw-grayscale #aw-trigger { filter: none; }

    /* Invert colors */
    body.aw-invert { filter: invert(100%) hue-rotate(180deg); }
    body.aw-invert img { filter: invert(100%) hue-rotate(180deg); }
    body.aw-invert #aw-panel { filter: invert(100%) hue-rotate(180deg); }

    /* Mute colors */
    body.aw-mute-colors { filter: saturate(20%); }
    body.aw-mute-colors #aw-panel { filter: none; }
    body.aw-mute-colors #aw-trigger { filter: none; }

    /* Highlight links */
    body.aw-hl-links a {
      background: #fef08a !important;
      color: #1e293b !important;
      border-bottom: 2px solid #ca8a04 !important;
      padding: 0 2px !important;
      border-radius: 2px !important;
    }

    /* Highlight headings */
    body.aw-hl-headings h1, body.aw-hl-headings h2, body.aw-hl-headings h3,
    body.aw-hl-headings h4, body.aw-hl-headings h5, body.aw-hl-headings h6 {
      background: #dbeafe !important;
      border-left: 4px solid var(--aw-primary, #2563EB) !important;
      padding-left: 10px !important;
      border-radius: 4px !important;
      color: #1e3a8a !important;
    }

    /* Focus mode */
    body.aw-focus-mode * { opacity: 0.3 !important; transition: opacity 0.15s !important; }
    body.aw-focus-mode *:hover { opacity: 1 !important; }
    body.aw-focus-mode #aw-panel, body.aw-focus-mode #aw-panel *,
    body.aw-focus-mode #aw-trigger { opacity: 1 !important; }

    /* Pause animations */
    body.aw-pause-anim *, body.aw-pause-anim *::before, body.aw-pause-anim *::after {
      animation-play-state: paused !important;
      transition: none !important;
    }

    /* Big cursor */
    body.aw-big-cursor, body.aw-big-cursor * {
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M8 2 L8 32 L17 23 L24 38 L28 36 L21 21 L33 21 Z' fill='%23000' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") 8 2, auto !important;
    }

    /* Keyboard navigation focus */
    body.aw-keyboard-nav *:focus {
      outline: 3px solid var(--aw-primary, #2563EB) !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 6px rgba(37,99,235,0.2) !important;
    }

    /* Mobile responsive */
    @media (max-width: 420px) {
      #aw-panel { width: calc(100vw - 32px); right: 16px !important; left: 16px !important; }
    }

    /* ── License notification banner ── */
    #aw-license-notice {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 2147483646;
      background: #1e293b;
      color: #e2e8f0;
      padding: 14px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.3);
    }
    #aw-license-notice .aw-ln-icon { font-size: 20px; flex-shrink: 0; }
    #aw-license-notice .aw-ln-text { flex: 1; line-height: 1.5; }
    #aw-license-notice .aw-ln-title { font-weight: 700; font-size: 14px; margin-bottom: 2px; }
    #aw-license-notice .aw-ln-msg   { color: #94a3b8; font-size: 12px; }
    #aw-license-notice .aw-ln-close {
      background: none; border: none; color: #64748b;
      cursor: pointer; font-size: 20px; line-height: 1; padding: 2px; flex-shrink: 0;
    }
    #aw-license-notice .aw-ln-close:hover { color: #e2e8f0; }
    #aw-license-notice.expired  { background: #7f1d1d; }
    #aw-license-notice.suspended { background: #451a03; }
    #aw-license-notice.invalid  { background: #1e1b4b; }
  `;

  // ─────────────────────────────────────────────
  // Widget Class
  // ─────────────────────────────────────────────
  class AccessibilityWidget {
    constructor(config) {
      this.cfg = this._mergeDeep({}, DEFAULT_CONFIG, config || {});
      this.lang = this._detectLang();
      this.t = TRANSLATIONS[this.lang];
      this.state = this._loadState();
      this.isOpen = false;
      this.ttsActive = false;
      this.activeProfile = null;
      this._mouseMoveHandler = null;
      this._init();
    }

    // ── Helpers ──────────────────────────────────
    _mergeDeep(target, ...sources) {
      for (const src of sources) {
        if (!src) continue;
        for (const key of Object.keys(src)) {
          if (src[key] && typeof src[key] === 'object' && !Array.isArray(src[key])) {
            target[key] = this._mergeDeep(target[key] || {}, src[key]);
          } else {
            target[key] = src[key];
          }
        }
      }
      return target;
    }

    _detectLang() {
      const cfg = this.cfg.lang;
      if (cfg === 'auto') {
        const hl = document.documentElement.lang || navigator.language || 'en';
        return hl.startsWith('ar') ? 'ar' : 'en';
      }
      return cfg === 'ar' ? 'ar' : 'en';
    }

    _loadState() {
      try {
        const s = localStorage.getItem(this.cfg.storageKey);
        return s ? JSON.parse(s) : this._defaultState();
      } catch (_) { return this._defaultState(); }
    }

    _saveState() {
      try { localStorage.setItem(this.cfg.storageKey, JSON.stringify(this.state)); } catch (_) {}
    }

    _defaultState() {
      return {
        fontSize: 0,
        fontFamily: 'default',
        lineHeight: 0,
        letterSpacing: 0,
        textAlign: '',
        highContrast: false,
        darkMode: false,
        lightMode: false,
        grayscale: false,
        invertColors: false,
        muteColors: false,
        highlightLinks: false,
        highlightHeadings: false,
        readingMask: false,
        readingGuide: false,
        focusMode: false,
        dyslexiaFont: false,
        pauseAnimations: false,
        bigCursor: false,
        keyboardNav: false,
        muteSounds: false,
      };
    }

    // ── Initialization ───────────────────────────
    _init() {
      this._injectCSS();

      // devMode is honored ONLY when the page is served from a trusted
      // local origin (localhost, 127.0.0.1, or file://). On any real
      // domain the flag is silently ignored — a license key is mandatory.
      const host = (window.location.hostname || '').toLowerCase();
      const protocol = window.location.protocol;
      const isLocalOrigin =
        protocol === 'file:' ||
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '[::1]' ||
        host === '';

      if (this.cfg.devMode === true && isLocalOrigin) {
        console.warn('[Insijam] devMode active on local origin — license validation skipped. This will NOT work on a production domain.');
        this._initWidget();
        return;
      }

      if (this.cfg.devMode === true && !isLocalOrigin) {
        console.error('[Insijam] devMode is ignored on production domains. Add a valid licenseKey.');
      }

      if (this.cfg.licenseKey) {
        // SaaS mode — validate key + domain on every session before loading.
        this._validateLicense();
      } else {
        // No key, no local origin → refuse to load.
        this._showLicenseNotice('no_license', 'A valid license key is required. Please add your license key to AccessibilityWidgetConfig.');
        console.error('[Insijam] No licenseKey provided. Widget will not load.');
      }
    }

    // ── License Validation ───────────────────────
    _validateLicense() {
      const key    = this.cfg.licenseKey;
      const domain = window.location.hostname || 'localhost';

      // Check cached result first (avoid hammering the API on every page load)
      const cacheKey = 'aw_lic_' + key;
      try {
        const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
        if (cached && Date.now() < cached.expiresCache) {
          if (cached.valid) {
            this._applyLicenseFeatures(cached);
            this._initWidget();
          } else {
            this._showLicenseNotice(cached.reason, cached.message);
          }
          return;
        }
      } catch (_) {}

      fetch(this.cfg.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
        .then(r => r.json())
        .then(data => {
          // Cache result in sessionStorage for this session
          const cacheTTL = this.cfg.licenseCheckInterval > 0
            ? this.cfg.licenseCheckInterval * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ ...data, expiresCache: Date.now() + cacheTTL }));
          } catch (_) {}

          if (data.valid) {
            this._applyLicenseFeatures(data);
            // Apply customer's saved branding/preferences from the server
            if (data.widgetConfig) this._applyWidgetConfig(data.widgetConfig);
            this._initWidget();
          } else {
            this._showLicenseNotice(data.reason || 'invalid', data.message);
          }
        })
        .catch((err) => {
          // Network error — fail closed to enforce license validation
          console.error('[Insijam] License validation failed — widget will not load.', err.message);
          this._showLicenseNotice('network_error', 'Accessibility service temporarily unavailable. Please try again later.');
        });
    }

    _applyLicenseFeatures(licenseData) {
      // Override config features with what the license permits
      if (licenseData.features) {
        this.cfg.features = this._mergeDeep({}, this.cfg.features, licenseData.features);
      }
    }

    _applyWidgetConfig(wc) {
      // Apply customer's saved branding/preferences returned from /validate
      if (wc.primaryColor)    this.cfg.primaryColor  = wc.primaryColor;
      if (wc.position)        this.cfg.position      = wc.position;
      if (wc.buttonIcon)      this.cfg.buttonIcon    = wc.buttonIcon;
      if (wc.lang && wc.lang !== 'auto') this.cfg.lang = wc.lang;
      if (wc.showProfiles    !== undefined) this.cfg.showProfiles    = wc.showProfiles;
      if (wc.showTTS         !== undefined) this.cfg.showTTS         = wc.showTTS;
      if (wc.showReadingMask !== undefined) this.cfg.showReadingMask = wc.showReadingMask;
    }

    _showLicenseNotice(reason, message) {
      const typeMap = {
        expired: 'expired', subscription_expired: 'expired',
        suspended: 'suspended', subscription_suspended: 'suspended',
      };
      const type = typeMap[reason] || 'invalid';

      const titles = {
        expired:   this.lang === 'ar' ? 'الاشتراك منتهي' : 'Subscription Expired',
        suspended: this.lang === 'ar' ? 'الخدمة موقوفة' : 'Service Suspended',
        invalid:   this.lang === 'ar' ? 'مفتاح ترخيص غير صالح' : 'License Key Invalid',
      };

      const defaultMsg = {
        expired:   this.lang === 'ar'
          ? 'خدمات إمكانية الوصول غير متاحة مؤقتاً بسبب انتهاء صلاحية الاشتراك.'
          : 'Accessibility services are temporarily unavailable due to an expired subscription.',
        suspended: this.lang === 'ar'
          ? 'تم إيقاف خدمات إمكانية الوصول مؤقتاً. يُرجى التواصل مع الدعم.'
          : 'Accessibility services have been suspended. Please contact support.',
        invalid:   this.lang === 'ar'
          ? 'مفتاح الترخيص غير صالح أو غير مرتبط بهذا النطاق.'
          : 'This license key is invalid or not authorized for this domain.',
      };

      const notice = document.createElement('div');
      notice.id = 'aw-license-notice';
      notice.className = type;
      notice.innerHTML = `
        <div class="aw-ln-icon">${type === 'expired' ? '⏰' : type === 'suspended' ? '⛔' : '🔑'}</div>
        <div class="aw-ln-text">
          <div class="aw-ln-title">${titles[type]}</div>
          <div class="aw-ln-msg">${message || defaultMsg[type]}</div>
        </div>
        <button class="aw-ln-close" aria-label="Dismiss" onclick="this.parentElement.remove()">✕</button>`;

      document.body.appendChild(notice);
    }

    _initWidget() {
      this._buildDOM();
      this._applyAll();
      this._bindEvents();
    }

    _injectCSS() {
      if (document.getElementById('aw-styles')) return;
      const style = document.createElement('style');
      style.id = 'aw-styles';
      style.textContent = WIDGET_CSS.replace(/var\(--aw-primary, #2563EB\)/g,
        `var(--aw-primary, ${this.cfg.primaryColor})`);
      document.head.appendChild(style);

      // Set primary color CSS variable
      document.documentElement.style.setProperty('--aw-primary', this.cfg.primaryColor);
    }

    _buildDOM() {
      // Root wrapper
      const root = document.createElement('div');
      root.id = 'aw-root';
      root.setAttribute('aria-hidden', 'true');

      // Skip to content
      const skip = document.createElement('button');
      skip.id = 'aw-skip-btn';
      skip.textContent = this.t.skipContent;
      skip.addEventListener('click', () => {
        const main = document.querySelector('main, [role="main"], #main, #content, .content');
        if (main) { main.setAttribute('tabindex', '-1'); main.focus(); }
      });

      // Reading mask
      const mask = document.createElement('div');
      mask.id = 'aw-reading-mask';

      // Reading guide
      const guide = document.createElement('div');
      guide.id = 'aw-reading-guide';

      // Trigger button
      const trigger = document.createElement('button');
      trigger.id = 'aw-trigger';
      trigger.className = this.cfg.position;
      trigger.setAttribute('aria-label', this.t.openWidget);
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', 'aw-panel');
      trigger.innerHTML = `<span aria-hidden="true">${this.cfg.buttonIcon}</span>`;

      // Panel
      const panel = document.createElement('div');
      panel.id = 'aw-panel';
      panel.className = this.cfg.position + (this.lang === 'ar' ? ' rtl' : ' ltr');
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', this.t.title);
      panel.setAttribute('aria-modal', 'true');
      panel.innerHTML = this._buildPanelHTML();

      // Toast
      const toast = document.createElement('div');
      toast.id = 'aw-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');

      root.append(skip, mask, guide, trigger, panel, toast);
      document.body.appendChild(root);
      this.els = { root, trigger, panel, mask, guide, skip, toast };
    }

    _buildPanelHTML() {
      const t = this.t;
      const feat = this.cfg.features;

      const profilesHTML = this.cfg.showProfiles ? `
        <div class="aw-section">
          <div class="aw-section-title">${t.profiles}</div>
          <div class="aw-profiles">
            <button class="aw-profile-btn" data-profile="visuallyImpaired">
              <span class="aw-profile-icon">👁️</span>${t.profileVisuallyImpaired}
            </button>
            <button class="aw-profile-btn" data-profile="lowVision">
              <span class="aw-profile-icon">🔍</span>${t.profileLowVision}
            </button>
            <button class="aw-profile-btn" data-profile="dyslexia">
              <span class="aw-profile-icon">📖</span>${t.profileDyslexia}
            </button>
            <button class="aw-profile-btn" data-profile="seizureSafe">
              <span class="aw-profile-icon">🛡️</span>${t.profileSeizureSafe}
            </button>
            <button class="aw-profile-btn" data-profile="cognitive">
              <span class="aw-profile-icon">🧠</span>${t.profileCognitive}
            </button>
            <button class="aw-profile-btn" data-profile="keyboard">
              <span class="aw-profile-icon">⌨️</span>${t.profileKeyboard}
            </button>
          </div>
        </div>` : '';

      return `
        <div class="aw-header">
          <span class="aw-header-title">${t.title}</span>
          <div class="aw-header-actions">
            <button class="aw-header-btn" id="aw-lang-btn">${t.lang}</button>
            <button class="aw-header-btn" id="aw-reset-btn">${t.reset}</button>
            <button class="aw-header-btn close" id="aw-close-btn" aria-label="${t.close}">✕</button>
          </div>
        </div>
        <div class="aw-body">
          ${profilesHTML}

          <div class="aw-section">
            <div class="aw-section-title">${t.visual}</div>
            ${feat.fontSize ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.fontSize}</span>
              <div class="aw-stepper">
                <button class="aw-stepper-btn" data-action="fontSize" data-dir="-1" aria-label="${t.decrease}">−</button>
                <span class="aw-stepper-value" id="aw-fs-val">${this.state.fontSize}</span>
                <button class="aw-stepper-btn" data-action="fontSize" data-dir="1" aria-label="${t.increase}">+</button>
              </div>
            </div>` : ''}
            ${feat.fontFamily ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.fontFamily}</span>
              <select class="aw-select" id="aw-ff-sel">
                <option value="default">${t.fontDefault}</option>
                <option value="readable">${t.fontReadable}</option>
                <option value="dyslexia">${t.fontDyslexia}</option>
                <option value="mono">${t.fontMono}</option>
              </select>
            </div>` : ''}
            ${feat.lineHeight ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.lineHeight}</span>
              <div class="aw-stepper">
                <button class="aw-stepper-btn" data-action="lineHeight" data-dir="-1" aria-label="${t.decrease}">−</button>
                <span class="aw-stepper-value" id="aw-lh-val">${this.state.lineHeight}</span>
                <button class="aw-stepper-btn" data-action="lineHeight" data-dir="1" aria-label="${t.increase}">+</button>
              </div>
            </div>` : ''}
            ${feat.letterSpacing ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.letterSpacing}</span>
              <div class="aw-stepper">
                <button class="aw-stepper-btn" data-action="letterSpacing" data-dir="-1" aria-label="${t.decrease}">−</button>
                <span class="aw-stepper-value" id="aw-ls-val">${this.state.letterSpacing}</span>
                <button class="aw-stepper-btn" data-action="letterSpacing" data-dir="1" aria-label="${t.increase}">+</button>
              </div>
            </div>` : ''}
            ${feat.textAlign ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.textAlign}</span>
              <div class="aw-seg" id="aw-ta-seg">
                <button class="aw-seg-btn" data-align="left">${t.alignLeft}</button>
                <button class="aw-seg-btn" data-align="center">${t.alignCenter}</button>
                <button class="aw-seg-btn" data-align="right">${t.alignRight}</button>
                <button class="aw-seg-btn" data-align="justify">${t.alignJustify}</button>
              </div>
            </div>` : ''}
            ${feat.highContrast ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.highContrast}</span>
              ${this._toggleHTML('highContrast')}
            </div>` : ''}
            ${feat.darkMode ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.darkMode}</span>
              ${this._toggleHTML('darkMode')}
            </div>` : ''}
            ${feat.lightMode ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.lightMode}</span>
              ${this._toggleHTML('lightMode')}
            </div>` : ''}
            ${feat.grayscale ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.grayscale}</span>
              ${this._toggleHTML('grayscale')}
            </div>` : ''}
            ${feat.invertColors ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.invertColors}</span>
              ${this._toggleHTML('invertColors')}
            </div>` : ''}
            ${feat.muteColors ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.muteColors}</span>
              ${this._toggleHTML('muteColors')}
            </div>` : ''}
            ${feat.highlightLinks ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.highlightLinks}</span>
              ${this._toggleHTML('highlightLinks')}
            </div>` : ''}
            ${feat.highlightHeadings ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.highlightHeadings}</span>
              ${this._toggleHTML('highlightHeadings')}
            </div>` : ''}
          </div>

          <div class="aw-section">
            <div class="aw-section-title">${t.reading}</div>
            ${feat.readingMask ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.readingMask}</span>
              ${this._toggleHTML('readingMask')}
            </div>` : ''}
            ${feat.readingGuide ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.readingGuide}</span>
              ${this._toggleHTML('readingGuide')}
            </div>` : ''}
            ${feat.focusMode ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.focusMode}</span>
              ${this._toggleHTML('focusMode')}
            </div>` : ''}
            ${feat.dyslexiaFont ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.dyslexiaFont}</span>
              ${this._toggleHTML('dyslexiaFont')}
            </div>` : ''}
            ${feat.pauseAnimations ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.pauseAnimations}</span>
              ${this._toggleHTML('pauseAnimations')}
            </div>` : ''}
          </div>

          <div class="aw-section">
            <div class="aw-section-title">${t.navigation}</div>
            ${feat.bigCursor ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.bigCursor}</span>
              ${this._toggleHTML('bigCursor')}
            </div>` : ''}
            ${feat.keyboardNav ? `
            <div class="aw-row">
              <span class="aw-row-label">${t.keyboardNav}</span>
              ${this._toggleHTML('keyboardNav')}
            </div>` : ''}
          </div>

          ${(feat.textToSpeech || feat.muteSounds) ? `
          <div class="aw-section">
            <div class="aw-section-title">${t.audio}</div>
            ${feat.textToSpeech ? `
            <button class="aw-tts-btn" id="aw-tts-btn">🔊 ${t.ttsStart}</button>` : ''}
            ${feat.muteSounds ? `
            <div class="aw-row" style="margin-top:10px">
              <span class="aw-row-label">${t.muteSounds}</span>
              ${this._toggleHTML('muteSounds')}
            </div>` : ''}
          </div>` : ''}
        </div>
      `;
    }

    _toggleHTML(key) {
      return `
        <label class="aw-toggle" aria-label="${key}">
          <input type="checkbox" data-toggle="${key}" ${this.state[key] ? 'checked' : ''}>
          <span class="aw-toggle-slider"></span>
        </label>`;
    }

    // ── Event Binding ────────────────────────────
    _bindEvents() {
      const { trigger, panel } = this.els;

      // Open / close
      trigger.addEventListener('click', () => this.toggle());

      panel.addEventListener('click', (e) => {
        const t = e.target;

        // Close
        if (t.id === 'aw-close-btn') { this.close(); return; }

        // Reset
        if (t.id === 'aw-reset-btn') { this.resetAll(); return; }

        // Language toggle
        if (t.id === 'aw-lang-btn') { this.toggleLang(); return; }

        // Profile
        const profileBtn = t.closest('[data-profile]');
        if (profileBtn) { this.applyProfile(profileBtn.dataset.profile); return; }

        // Steppers
        const stepBtn = t.closest('[data-action]');
        if (stepBtn) {
          const action = stepBtn.dataset.action;
          const dir = parseInt(stepBtn.dataset.dir);
          this._stepValue(action, dir);
          return;
        }

        // Text alignment
        const alignBtn = t.closest('[data-align]');
        if (alignBtn) { this._setTextAlign(alignBtn.dataset.align); return; }

        // TTS
        if (t.id === 'aw-tts-btn') { this.toggleTTS(); return; }
      });

      // Toggles
      panel.addEventListener('change', (e) => {
        const input = e.target;
        if (input.dataset.toggle) {
          this.state[input.dataset.toggle] = input.checked;
          this._applyFeature(input.dataset.toggle);
          this._saveState();
        }
      });

      // Font family select
      panel.addEventListener('change', (e) => {
        if (e.target.id === 'aw-ff-sel') {
          this.state.fontFamily = e.target.value;
          this._applyFontFamily();
          this._saveState();
        }
      });

      // Close on backdrop click
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.els.root.contains(e.target)) this.close();
      });

      // Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });

      // Reading mask & guide mouse tracking
      this._mouseMoveHandler = (e) => {
        if (this.state.readingMask) {
          this.els.mask.style.top = (e.clientY - 30) + 'px';
        }
        if (this.state.readingGuide) {
          this.els.guide.style.top = e.clientY + 'px';
        }
      };
      document.addEventListener('mousemove', this._mouseMoveHandler);
    }

    // ── Panel open/close ─────────────────────────
    toggle() { this.isOpen ? this.close() : this.open(); }

    open() {
      this.isOpen = true;
      this.els.panel.classList.add('open');
      this.els.trigger.setAttribute('aria-expanded', 'true');
      this._syncUI();
      // Focus first focusable element
      const first = this.els.panel.querySelector('button, input, select');
      if (first) first.focus();
    }

    close() {
      this.isOpen = false;
      this.els.panel.classList.remove('open');
      this.els.trigger.setAttribute('aria-expanded', 'false');
      this.els.trigger.focus();
    }

    // ── UI sync ──────────────────────────────────
    _syncUI() {
      const p = this.els.panel;

      // Stepper values
      const fsVal = p.querySelector('#aw-fs-val');
      const lhVal = p.querySelector('#aw-lh-val');
      const lsVal = p.querySelector('#aw-ls-val');
      if (fsVal) fsVal.textContent = this.state.fontSize;
      if (lhVal) lhVal.textContent = this.state.lineHeight;
      if (lsVal) lsVal.textContent = this.state.letterSpacing;

      // Checkboxes
      p.querySelectorAll('[data-toggle]').forEach(input => {
        input.checked = !!this.state[input.dataset.toggle];
      });

      // Font family select
      const ffSel = p.querySelector('#aw-ff-sel');
      if (ffSel) ffSel.value = this.state.fontFamily;

      // Text align
      p.querySelectorAll('[data-align]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.align === this.state.textAlign);
      });

      // Profiles
      p.querySelectorAll('[data-profile]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.profile === this.activeProfile);
      });

      // TTS button
      const ttsBtn = p.querySelector('#aw-tts-btn');
      if (ttsBtn) {
        ttsBtn.textContent = this.ttsActive ? `⏹ ${this.t.ttsStop}` : `🔊 ${this.t.ttsStart}`;
        ttsBtn.className = 'aw-tts-btn' + (this.ttsActive ? ' stop' : '');
      }
    }

    // ── Apply all states ─────────────────────────
    _applyAll() {
      this._applyFontSize();
      this._applyFontFamily();
      this._applyLineHeight();
      this._applyLetterSpacing();
      this._applyTextAlign();
      const boolFeatures = [
        'highContrast','darkMode','lightMode','grayscale','invertColors','muteColors',
        'highlightLinks','highlightHeadings','readingMask','readingGuide','focusMode',
        'dyslexiaFont','pauseAnimations','bigCursor','keyboardNav','muteSounds'
      ];
      boolFeatures.forEach(f => this._applyFeature(f));
    }

    _applyFeature(key) {
      const body = document.body;
      const val = this.state[key];

      const classMap = {
        highContrast: 'aw-high-contrast',
        darkMode: 'aw-dark-mode',
        lightMode: 'aw-light-mode',
        grayscale: 'aw-grayscale',
        invertColors: 'aw-invert',
        muteColors: 'aw-mute-colors',
        highlightLinks: 'aw-hl-links',
        highlightHeadings: 'aw-hl-headings',
        focusMode: 'aw-focus-mode',
        dyslexiaFont: 'aw-ff-dyslexia',
        pauseAnimations: 'aw-pause-anim',
        bigCursor: 'aw-big-cursor',
        keyboardNav: 'aw-keyboard-nav',
      };

      if (classMap[key]) {
        body.classList.toggle(classMap[key], !!val);
      }

      // Mutually exclusive modes
      if (key === 'highContrast' && val) {
        body.classList.remove('aw-dark-mode', 'aw-light-mode', 'aw-grayscale', 'aw-invert');
        this.state.darkMode = false; this.state.lightMode = false;
        this.state.grayscale = false; this.state.invertColors = false;
      }
      if (key === 'darkMode' && val) {
        body.classList.remove('aw-high-contrast', 'aw-light-mode', 'aw-grayscale', 'aw-invert');
        this.state.highContrast = false; this.state.lightMode = false;
        this.state.grayscale = false; this.state.invertColors = false;
      }
      if (key === 'lightMode' && val) {
        body.classList.remove('aw-high-contrast', 'aw-dark-mode', 'aw-grayscale', 'aw-invert');
        this.state.highContrast = false; this.state.darkMode = false;
        this.state.grayscale = false; this.state.invertColors = false;
      }
      if (key === 'grayscale' && val) {
        body.classList.remove('aw-invert', 'aw-mute-colors');
        this.state.invertColors = false; this.state.muteColors = false;
      }
      if (key === 'invertColors' && val) {
        body.classList.remove('aw-grayscale', 'aw-mute-colors');
        this.state.grayscale = false; this.state.muteColors = false;
      }
      if (key === 'muteColors' && val) {
        body.classList.remove('aw-grayscale', 'aw-invert');
        this.state.grayscale = false; this.state.invertColors = false;
      }

      // Reading mask
      if (key === 'readingMask') {
        this.els.mask.style.display = val ? 'block' : 'none';
      }

      // Reading guide
      if (key === 'readingGuide') {
        this.els.guide.style.display = val ? 'block' : 'none';
      }

      // Mute sounds
      if (key === 'muteSounds') {
        document.querySelectorAll('audio, video').forEach(el => { el.muted = !!val; });
      }
    }

    _applyFontSize() {
      const body = document.body;
      for (let i = 1; i <= 5; i++) body.classList.remove('aw-fs-' + i);
      if (this.state.fontSize > 0) body.classList.add('aw-fs-' + this.state.fontSize);
    }

    _applyFontFamily() {
      const body = document.body;
      ['readable','dyslexia','mono'].forEach(f => body.classList.remove('aw-ff-' + f));
      if (this.state.fontFamily && this.state.fontFamily !== 'default') {
        body.classList.add('aw-ff-' + this.state.fontFamily);
      }
    }

    _applyLineHeight() {
      const body = document.body;
      for (let i = 1; i <= 3; i++) body.classList.remove('aw-lh-' + i);
      if (this.state.lineHeight > 0) body.classList.add('aw-lh-' + this.state.lineHeight);
    }

    _applyLetterSpacing() {
      const body = document.body;
      for (let i = 1; i <= 3; i++) body.classList.remove('aw-ls-' + i);
      if (this.state.letterSpacing > 0) body.classList.add('aw-ls-' + this.state.letterSpacing);
    }

    _applyTextAlign() {
      const body = document.body;
      ['left','center','right','justify'].forEach(a => body.classList.remove('aw-ta-' + a));
      if (this.state.textAlign) body.classList.add('aw-ta-' + this.state.textAlign);
    }

    // ── Steppers ─────────────────────────────────
    _stepValue(key, dir) {
      const limits = { fontSize: [0, 5], lineHeight: [0, 3], letterSpacing: [0, 3] };
      const [min, max] = limits[key];
      this.state[key] = Math.min(max, Math.max(min, this.state[key] + dir));

      const elMap = { fontSize: '#aw-fs-val', lineHeight: '#aw-lh-val', letterSpacing: '#aw-ls-val' };
      const el = this.els.panel.querySelector(elMap[key]);
      if (el) el.textContent = this.state[key];

      if (key === 'fontSize') this._applyFontSize();
      if (key === 'lineHeight') this._applyLineHeight();
      if (key === 'letterSpacing') this._applyLetterSpacing();
      this._saveState();
    }

    // ── Text Align ───────────────────────────────
    _setTextAlign(align) {
      this.state.textAlign = this.state.textAlign === align ? '' : align;
      this._applyTextAlign();
      this._saveState();
      this.els.panel.querySelectorAll('[data-align]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.align === this.state.textAlign);
      });
    }

    // ── Reset ────────────────────────────────────
    resetAll() {
      // Remove all body classes
      const cls = document.body.className.split(' ').filter(c => !c.startsWith('aw-'));
      document.body.className = cls.join(' ');

      this.state = this._defaultState();
      this.activeProfile = null;
      this._saveState();
      this._syncUI();
      this._showToast(this.t.resetMsg);

      // Stop TTS if active
      if (this.ttsActive) this._stopTTS();
    }

    // ── Profiles ─────────────────────────────────
    applyProfile(name) {
      if (this.activeProfile === name) {
        this.resetAll();
        return;
      }
      this.resetAll();
      this.activeProfile = name;
      const profile = PROFILES[name];
      if (!profile) return;

      Object.assign(this.state, profile);
      this._applyAll();
      this._saveState();
      this._syncUI();

      // Highlight active profile
      this.els.panel.querySelectorAll('[data-profile]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.profile === name);
      });
    }

    // ── Language Toggle ──────────────────────────
    toggleLang() {
      this.lang = this.lang === 'en' ? 'ar' : 'en';
      this.t = TRANSLATIONS[this.lang];

      // Rebuild panel content
      this.els.panel.innerHTML = this._buildPanelHTML();
      this.els.panel.className = this.cfg.position + (this.lang === 'ar' ? ' rtl open' : ' ltr open');
      this.els.skip.textContent = this.t.skipContent;

      // Re-sync
      this._syncUI();
    }

    // ── Text-to-Speech ───────────────────────────
    toggleTTS() {
      if (this.ttsActive) {
        this._stopTTS();
      } else {
        this._startTTS();
      }
    }

    _startTTS() {
      if (!('speechSynthesis' in window)) {
        alert('Text-to-speech is not supported in this browser.');
        return;
      }

      // Collect readable elements, excluding the widget itself
      const selector = 'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, figcaption, dt, dd';
      this._ttsQueue = [...document.querySelectorAll(selector)].filter(el => {
        if (el.closest('#aw-root')) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        return el.textContent.trim().length > 4;
      });

      if (this._ttsQueue.length === 0) {
        // Fallback: plain text read of body
        const utt = new SpeechSynthesisUtterance(document.body.innerText.replace(/\s+/g, ' ').trim());
        utt.lang = this.lang === 'ar' ? 'ar-SA' : 'en-US';
        utt.rate = 0.9;
        utt.onend = () => this._stopTTS();
        utt.onerror = () => this._stopTTS();
        window.speechSynthesis.speak(utt);
        this.ttsActive = true;
        this._syncUI();
        return;
      }

      this._ttsIndex = 0;
      this.ttsActive = true;
      this._buildTTSProgress();
      this._syncUI();
      this._readTTSElement();
    }

    _buildTTSProgress() {
      // Build progress bar DOM
      let bar = document.getElementById('aw-tts-progress');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'aw-tts-progress';
        document.body.appendChild(bar);
      }
      bar.innerHTML = `
        <div id="aw-tts-progress-bar"><div id="aw-tts-progress-fill"></div></div>
        <div id="aw-tts-progress-info">
          <span id="aw-tts-progress-label"></span>
          <span id="aw-tts-progress-text"></span>
          <button id="aw-tts-stop-inline">⏹ ${this.t.ttsStop}</button>
        </div>`;
      bar.style.display = 'block';
      document.getElementById('aw-tts-stop-inline').addEventListener('click', () => this._stopTTS());

      // Word overlay
      let overlay = document.getElementById('aw-tts-word-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'aw-tts-word-overlay';
        document.body.appendChild(overlay);
      }
      this._updateTTSProgress();
    }

    _updateTTSProgress() {
      const fill  = document.getElementById('aw-tts-progress-fill');
      const label = document.getElementById('aw-tts-progress-label');
      const text  = document.getElementById('aw-tts-progress-text');
      if (!fill || !this._ttsQueue) return;
      const pct = this._ttsQueue.length ? Math.round((this._ttsIndex / this._ttsQueue.length) * 100) : 0;
      fill.style.width = pct + '%';
      if (label) label.textContent = `${this.t.ttsReading} ${this._ttsIndex + 1} ${this.t.ttsOf} ${this._ttsQueue.length}`;
      if (text) {
        const el = this._ttsQueue[this._ttsIndex];
        if (el) text.textContent = el.textContent.trim().slice(0, 80) + (el.textContent.trim().length > 80 ? '…' : '');
      }
    }

    _readTTSElement() {
      // Clear previous highlights
      document.querySelectorAll('.aw-tts-highlight').forEach(e => e.classList.remove('aw-tts-highlight'));
      const wordOverlay = document.getElementById('aw-tts-word-overlay');
      if (wordOverlay) wordOverlay.style.display = 'none';

      if (!this.ttsActive || this._ttsIndex >= this._ttsQueue.length) {
        this._stopTTS();
        return;
      }

      const el = this._ttsQueue[this._ttsIndex];
      el.classList.add('aw-tts-highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this._updateTTSProgress();

      const utterance = new SpeechSynthesisUtterance(el.textContent.trim());
      utterance.lang = this.lang === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate = 0.9;

      // Word-level tracking via boundary events
      utterance.onboundary = (e) => {
        if (e.name === 'word' && e.charIndex !== undefined) {
          this._highlightTTSWord(el, e.charIndex, e.charLength || 5);
        }
      };

      utterance.onend = () => {
        el.classList.remove('aw-tts-highlight');
        if (wordOverlay) wordOverlay.style.display = 'none';
        this._ttsIndex++;
        if (this.ttsActive) setTimeout(() => this._readTTSElement(), 150);
      };

      utterance.onerror = (e) => {
        if (e.error === 'interrupted') return; // intentional stop
        el.classList.remove('aw-tts-highlight');
        this._ttsIndex++;
        if (this.ttsActive) this._readTTSElement();
      };

      this._currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    }

    _highlightTTSWord(el, charIndex, charLength) {
      try {
        const range = document.createRange();
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        let offset = 0, node;
        while ((node = walker.nextNode())) {
          const len = node.textContent.length;
          if (offset + len > charIndex) {
            const localStart = charIndex - offset;
            const localEnd = Math.min(localStart + Math.max(charLength, 1), len);
            range.setStart(node, localStart);
            range.setEnd(node, localEnd);
            const rect = range.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              const ov = document.getElementById('aw-tts-word-overlay');
              if (ov) {
                ov.style.cssText = `
                  position: fixed !important;
                  pointer-events: none !important;
                  z-index: 2147483638 !important;
                  background: rgba(253,224,71,0.55) !important;
                  border-bottom: 2px solid #ca8a04 !important;
                  border-radius: 3px !important;
                  top: ${rect.top}px !important;
                  left: ${rect.left}px !important;
                  width: ${rect.width}px !important;
                  height: ${rect.height}px !important;
                  display: block !important;
                `;
              }
            }
            break;
          }
          offset += len;
        }
      } catch (_) { /* Range API may fail on some elements */ }
    }

    _stopTTS() {
      window.speechSynthesis.cancel();
      this.ttsActive = false;
      this._ttsQueue = [];
      this._ttsIndex = 0;
      this._currentUtterance = null;

      document.querySelectorAll('.aw-tts-highlight').forEach(e => e.classList.remove('aw-tts-highlight'));
      const wordOverlay = document.getElementById('aw-tts-word-overlay');
      if (wordOverlay) wordOverlay.remove();
      const progressBar = document.getElementById('aw-tts-progress');
      if (progressBar) progressBar.style.display = 'none';

      this._syncUI();
    }

    // ── Toast Notification ───────────────────────
    _showToast(msg) {
      const toast = this.els.toast;
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ── Public API ───────────────────────────────
    destroy() {
      this.resetAll();
      if (this._mouseMoveHandler) document.removeEventListener('mousemove', this._mouseMoveHandler);
      this.els.root.remove();
      const style = document.getElementById('aw-styles');
      if (style) style.remove();
    }
  }

  // ─────────────────────────────────────────────
  // Auto-initialize
  // ─────────────────────────────────────────────
  function autoInit() {
    const userConfig = global.AccessibilityWidgetConfig || {};
    global._accessibilityWidget = new AccessibilityWidget(userConfig);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  // Expose class for manual use
  global.AccessibilityWidget = AccessibilityWidget;

})(window);
