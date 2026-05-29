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
    primaryColor: '#5B4FE8',
    buttonIcon: '♿',
    storageKey: 'aw_settings',
    showProfiles: true,
    showTTS: true,
    showReadingMask: true,
    // SaaS license options
    licenseKey: null,           // 'AW-XXXX-XXXX-XXXX-XXXX'  — required unless devMode:true
    // Default: derived from this script's own URL so a customer who pastes
    // <script src="https://insijam.ipioneersco.com/accessibility-widget.js"> on
    // customer-site.com automatically points back at insijam.ipioneersco.com
    // for validation. Override with a full URL if you self-host the script.
    apiEndpoint: null,
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
    /* ── Accessibility Widget Styles (Insijam look) ── */
    #aw-root * { box-sizing: border-box; }
    #aw-root {
      --aw-paper:    #FFFFFF;
      --aw-paper-2:  #F5F5F8;
      --aw-paper-3:  #E4E4EA;
      --aw-ink:      #0E0E14;
      --aw-ink-2:    #2A2A33;
      --aw-ink-3:    #5A5A66;
      --aw-good:     #1F7A4A;
      --aw-serif:    "Fraunces", "Times New Roman", serif;
      --aw-sans:     "Inter Tight", system-ui, -apple-system, sans-serif;
      --aw-mono:     "JetBrains Mono", ui-monospace, monospace;
      --aw-arabic:   "IBM Plex Sans Arabic", "Noto Naskh Arabic", "Tahoma", sans-serif;
    }

    #aw-trigger {
      position: fixed;
      z-index: 2147483647;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 0;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      box-shadow: 0 12px 32px -8px color-mix(in srgb, var(--aw-primary, #5B4FE8) 50%, transparent);
      transition: transform 0.2s, box-shadow 0.2s;
      outline: none;
      background: var(--aw-primary, #5B4FE8);
      color: #fff;
    }
    #aw-trigger:hover { transform: scale(1.06); }
    #aw-trigger:focus-visible { outline: 3px solid var(--aw-primary, #5B4FE8); outline-offset: 3px; }

    #aw-trigger.bottom-right { bottom: 28px; right: 28px; }
    #aw-trigger.bottom-left  { bottom: 28px; left: 28px; }
    #aw-trigger.top-right    { top: 28px; right: 28px; }
    #aw-trigger.top-left     { top: 28px; left: 28px; }

    /* Backdrop (visible on mobile/tablet only — see media queries) */
    #aw-backdrop {
      position: fixed;
      inset: 0;
      z-index: 2147483645;
      background: rgba(14, 14, 20, 0);
      pointer-events: none;
      transition: background 0.25s ease;
      display: none;
    }
    #aw-backdrop.open { background: rgba(14, 14, 20, 0.45); pointer-events: auto; }

    /* Panel */
    #aw-panel {
      position: fixed;
      z-index: 2147483646;
      width: 360px;
      max-height: min(72vh, 640px);
      max-height: min(72dvh, 640px);
      background: var(--aw-paper);
      color: var(--aw-ink);
      border: 1px solid var(--aw-paper-3);
      border-radius: 10px;
      box-shadow: 0 24px 64px -20px rgba(20,17,13,.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: var(--aw-sans);
      font-size: 14px;
      transition: opacity 0.2s, transform 0.2s;
      opacity: 0;
      pointer-events: none;
      transform: scale(0.97);
    }
    #aw-panel.open {
      opacity: 1;
      pointer-events: all;
      transform: scale(1);
    }
    #aw-panel.bottom-right { bottom: 96px; right: 28px; }
    #aw-panel.bottom-left  { bottom: 96px; left: 28px; }
    #aw-panel.top-right    { top: 96px; right: 28px; }
    #aw-panel.top-left     { top: 96px; left: 28px; }

    #aw-panel.rtl { direction: rtl; text-align: right; font-family: var(--aw-arabic); }
    #aw-panel.ltr { direction: ltr; text-align: left; }

    /* Header */
    .aw-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 18px 20px 16px;
      background: var(--aw-paper);
      color: var(--aw-ink);
      border-bottom: 1px solid var(--aw-paper-3);
      flex-shrink: 0;
    }
    .aw-header-titles { display: flex; flex-direction: column; gap: 4px; }
    .aw-header-eyebrow {
      font: 500 10px var(--aw-mono);
      text-transform: uppercase;
      letter-spacing: .12em;
      color: var(--aw-ink-3);
    }
    #aw-panel.rtl .aw-header-eyebrow { font-family: var(--aw-mono); }
    .aw-header-title {
      font-family: var(--aw-serif);
      font-size: 22px;
      font-weight: 500;
      letter-spacing: -0.02em;
      color: var(--aw-ink);
      line-height: 1.05;
    }
    #aw-panel.rtl .aw-header-title { font-family: var(--aw-arabic); letter-spacing: 0; line-height: 1.25; }
    .aw-header-actions { display: flex; gap: 6px; flex-shrink: 0; }
    .aw-header-btn {
      background: transparent;
      border: 1px solid var(--aw-paper-3);
      border-radius: 999px;
      color: var(--aw-ink-2);
      cursor: pointer;
      font: 500 11px var(--aw-mono);
      text-transform: uppercase;
      letter-spacing: .08em;
      padding: 6px 12px;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .aw-header-btn:hover { background: var(--aw-ink); color: var(--aw-paper); border-color: var(--aw-ink); }
    .aw-header-btn.close {
      width: 32px; height: 32px;
      padding: 0; font-size: 14px;
      display: inline-flex; align-items: center; justify-content: center;
    }

    /* Body */
    .aw-body {
      overflow-y: auto;
      padding: 18px 20px 20px;
      flex: 1;
      scrollbar-width: thin;
      scrollbar-color: var(--aw-paper-3) transparent;
    }
    .aw-body::-webkit-scrollbar { width: 6px; }
    .aw-body::-webkit-scrollbar-thumb { background: var(--aw-paper-3); border-radius: 3px; }

    /* Section */
    .aw-section { margin-bottom: 18px; }
    .aw-section:last-child { margin-bottom: 0; }
    .aw-section-title {
      font: 500 10px var(--aw-mono);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--aw-ink-3);
      margin: 0 0 8px;
    }

    /* Profiles grid (Insijam toggle pattern) */
    .aw-profiles { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .aw-profile-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px;
      border: 1px solid var(--aw-paper-3);
      background: var(--aw-paper-2);
      border-radius: 4px;
      text-align: start;
      cursor: pointer;
      color: var(--aw-ink);
      font: 500 13px var(--aw-sans);
      transition: background .15s, border-color .15s, color .15s;
    }
    #aw-panel.rtl .aw-profile-btn { font-family: var(--aw-arabic); }
    .aw-profile-btn:hover { border-color: var(--aw-ink-3); }
    .aw-profile-btn.active {
      background: var(--aw-ink);
      color: var(--aw-paper);
      border-color: var(--aw-ink);
    }
    .aw-profile-icon { font-size: 18px; flex-shrink: 0; }
    .aw-profile-pip {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--aw-paper-3);
      flex-shrink: 0;
      margin-inline-start: auto;
      transition: background .15s, box-shadow .15s;
    }
    .aw-profile-btn.active .aw-profile-pip {
      background: var(--aw-primary, #5B4FE8);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--aw-primary, #5B4FE8) 30%, transparent);
    }

    /* Stepper card (Insijam wg-stepper) */
    .aw-stepper-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .aw-stepper-card {
      background: var(--aw-paper-2);
      border: 1px solid var(--aw-paper-3);
      border-radius: 4px;
      padding: 10px 12px;
    }
    .aw-stepper-label {
      font: 500 10px var(--aw-mono);
      text-transform: uppercase;
      letter-spacing: .08em;
      color: var(--aw-ink-3);
    }
    .aw-stepper-controls {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 6px;
    }
    .aw-stepper-btn {
      width: 26px; height: 26px;
      border-radius: 50%;
      border: 1px solid var(--aw-paper-3);
      background: var(--aw-paper);
      color: var(--aw-ink);
      cursor: pointer;
      font-size: 14px;
      display: inline-flex; align-items: center; justify-content: center;
      transition: background .15s, color .15s, border-color .15s;
    }
    .aw-stepper-btn:hover { background: var(--aw-ink); color: var(--aw-paper); border-color: var(--aw-ink); }
    .aw-stepper-value {
      font: 600 14px var(--aw-mono);
      color: var(--aw-ink);
      min-width: 48px;
      text-align: center;
    }

    /* Toggle button (Insijam wg-toggle) */
    .aw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .aw-tog {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px;
      border: 1px solid var(--aw-paper-3);
      background: var(--aw-paper-2);
      border-radius: 4px;
      text-align: start;
      cursor: pointer;
      color: var(--aw-ink);
      font: 500 13px var(--aw-sans);
      transition: background .15s, border-color .15s;
      width: 100%;
    }
    #aw-panel.rtl .aw-tog { font-family: var(--aw-arabic); }
    .aw-tog:hover { border-color: var(--aw-ink-3); }
    .aw-tog.is-on {
      background: var(--aw-ink);
      color: var(--aw-paper);
      border-color: var(--aw-ink);
    }
    .aw-tog-label { flex: 1; font-weight: 600; font-size: 13px; }
    .aw-tog-pip {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--aw-paper-3);
      flex-shrink: 0;
      transition: background .15s, box-shadow .15s;
    }
    .aw-tog.is-on .aw-tog-pip {
      background: var(--aw-primary, #5B4FE8);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--aw-primary, #5B4FE8) 30%, transparent);
    }

    /* Select */
    .aw-select-row { margin-bottom: 8px; }
    .aw-select {
      width: 100%;
      border: 1px solid var(--aw-paper-3);
      border-radius: 4px;
      padding: 8px 10px;
      font: 500 13px var(--aw-sans);
      color: var(--aw-ink);
      background: var(--aw-paper-2);
      cursor: pointer;
    }
    #aw-panel.rtl .aw-select { font-family: var(--aw-arabic); }
    .aw-select:focus { outline: 2px solid var(--aw-primary, #5B4FE8); outline-offset: 2px; }

    /* Segmented control (text alignment) */
    .aw-seg {
      display: flex;
      border: 1px solid var(--aw-paper-3);
      border-radius: 4px;
      overflow: hidden;
      background: var(--aw-paper-2);
    }
    .aw-seg-btn {
      flex: 1;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 8px 4px;
      font: 500 11px var(--aw-mono);
      text-transform: uppercase;
      letter-spacing: .08em;
      color: var(--aw-ink-3);
      transition: background .15s, color .15s;
    }
    .aw-seg-btn + .aw-seg-btn { border-left: 1px solid var(--aw-paper-3); }
    #aw-panel.rtl .aw-seg-btn + .aw-seg-btn { border-left: 0; border-right: 1px solid var(--aw-paper-3); }
    .aw-seg-btn.active { background: var(--aw-ink); color: var(--aw-paper); }
    .aw-seg-btn:hover:not(.active) { color: var(--aw-ink); }

    /* TTS button */
    .aw-tts-btn {
      width: 100%;
      padding: 12px 16px;
      border-radius: 999px;
      border: 0;
      background: var(--aw-ink);
      color: var(--aw-paper);
      font: 500 13px var(--aw-sans);
      cursor: pointer;
      margin-top: 4px;
      transition: background .15s;
    }
    #aw-panel.rtl .aw-tts-btn { font-family: var(--aw-arabic); }
    .aw-tts-btn:hover { background: var(--aw-primary, #5B4FE8); }
    .aw-tts-btn.stop { background: #B91C1C; }
    .aw-tts-btn.stop:hover { background: #991B1B; }

    /* Footer of panel */
    .aw-foot {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 20px;
      border-top: 1px solid var(--aw-paper-3);
      background: var(--aw-paper);
    }
    .aw-foot-meta {
      font: 500 10px var(--aw-mono);
      color: var(--aw-ink-3);
      text-transform: uppercase;
      letter-spacing: .08em;
    }

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
      bottom: 96px;
      right: 28px;
      background: var(--aw-ink);
      color: var(--aw-paper);
      padding: 10px 16px;
      border-radius: 999px;
      font: 500 12px var(--aw-mono);
      text-transform: uppercase;
      letter-spacing: .08em;
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
      background: var(--aw-ink);
      color: var(--aw-paper);
      padding: 12px 22px;
      border-radius: 0 0 4px 4px;
      font: 600 13px var(--aw-sans);
      z-index: 2147483647;
      text-decoration: none;
      transition: top 0.15s;
      border: 0;
      cursor: pointer;
    }
    #aw-skip-btn:focus { top: 0; }

    /* ── Applied accessibility styles on <body> / <html> ── */

    /* Defensive: never let icons drift to the bottom of a flex/inline-flex line-box.
       Without this, big-line-height (aw-lh-*) made SVG icons inside buttons or
       hero-meta items appear pushed down because their line-box grew. */
    body[class*="aw-lh-"] svg, body[class*="aw-fs-"] svg, body[class*="aw-ls-"] svg {
      vertical-align: middle !important;
      flex-shrink: 0 !important;
    }
    /* Icons in flex containers: pin to vertical center regardless of text wrapping */
    body[class*="aw-lh-"] :is(button, a, .feature, .feature-icon, .hero-meta, .hero-meta-item, .compliance-tick, .install-num, .tryit-aside-list li) svg {
      align-self: center !important;
    }

    /* Font sizes — apply only to TEXT elements so buttons/icons/layout don't reflow */
    body.aw-fs-1 { font-size: 110% !important; }
    body.aw-fs-2 { font-size: 120% !important; }
    body.aw-fs-3 { font-size: 135% !important; }
    body.aw-fs-4 { font-size: 150% !important; }
    body.aw-fs-5 { font-size: 170% !important; }
    body[class*="aw-fs-"] :is(p, li, dt, dd, td, th, blockquote, h1, h2, h3, h4, h5, h6, label, .hero-lede, .section-sub, .feature-desc, .compliance-body, .install-step-d, .tryit-sample, .bilingual-card p):not(#aw-root):not(#aw-root *) {
      font-size: inherit !important;
    }

    /* Font families — restrict to readable text, leave UI chrome (buttons, badges, code blocks) alone */
    body.aw-ff-readable :is(p, li, dt, dd, td, th, blockquote, h1, h2, h3, h4, h5, h6, .hero-lede, .section-sub, .feature-desc):not(#aw-root):not(#aw-root *) {
      font-family: Georgia, 'Times New Roman', serif !important;
    }
    body.aw-ff-dyslexia :is(p, li, dt, dd, td, th, blockquote, h1, h2, h3, h4, h5, h6, a, span, .hero-lede, .section-sub, .feature-desc):not(#aw-root):not(#aw-root *) {
      font-family: 'OpenDyslexic', 'Comic Sans MS', 'Chalkboard SE', 'Arial', sans-serif !important;
      letter-spacing: 0.05em !important;
    }
    body.aw-ff-mono :is(p, li, dt, dd, td, th, blockquote, h1, h2, h3, h4, h5, h6):not(#aw-root):not(#aw-root *) {
      font-family: 'Courier New', Courier, monospace !important;
    }

    /* Line height — text only, NOT buttons/icons/layout (was the cause of icons drifting down) */
    body.aw-lh-1 :is(p, li, dt, dd, td, th, blockquote, h1, h2, h3, h4, h5, h6):not(#aw-root):not(#aw-root *) { line-height: 1.6 !important; }
    body.aw-lh-2 :is(p, li, dt, dd, td, th, blockquote, h1, h2, h3, h4, h5, h6):not(#aw-root):not(#aw-root *) { line-height: 2 !important; }
    body.aw-lh-3 :is(p, li, dt, dd, td, th, blockquote, h1, h2, h3, h4, h5, h6):not(#aw-root):not(#aw-root *) { line-height: 2.5 !important; }

    /* Letter spacing — text only */
    body.aw-ls-1 :is(p, li, dt, dd, td, th, blockquote, h1, h2, h3, h4, h5, h6, span, a):not(#aw-root):not(#aw-root *) { letter-spacing: 0.08em !important; }
    body.aw-ls-2 :is(p, li, dt, dd, td, th, blockquote, h1, h2, h3, h4, h5, h6, span, a):not(#aw-root):not(#aw-root *) { letter-spacing: 0.15em !important; }
    body.aw-ls-3 :is(p, li, dt, dd, td, th, blockquote, h1, h2, h3, h4, h5, h6, span, a):not(#aw-root):not(#aw-root *) { letter-spacing: 0.22em !important; }

    /* Text alignment */
    body.aw-ta-left   p, body.aw-ta-left   li { text-align: left !important; }
    body.aw-ta-center p, body.aw-ta-center li { text-align: center !important; }
    body.aw-ta-right  p, body.aw-ta-right  li { text-align: right !important; }
    body.aw-ta-justify p, body.aw-ta-justify li { text-align: justify !important; }

    /* ── Color/filter modes apply ONLY to the page; the widget always keeps
       its native Insijam look so it is never visually distorted or unusable. */

    /* Universal widget isolation — applied regardless of which mode is on */
    body[class*="aw-"] #aw-root,
    body[class*="aw-"] #aw-root * {
      filter: none !important;
    }

    /* High contrast — page only */
    body.aw-high-contrast :not(#aw-root):not(#aw-root *) {
      background: #000 !important;
      color: #ffff00 !important;
      border-color: #ffff00 !important;
    }
    body.aw-high-contrast {
      background: #000 !important;
      color: #ffff00 !important;
      border-color: #ffff00 !important;
    }
    body.aw-high-contrast a:not(#aw-root a):not(#aw-root a *),
    body.aw-high-contrast a:not(#aw-root a) *:not(#aw-root *) { color: #00ffff !important; }
    body.aw-high-contrast img:not(#aw-root img) { filter: contrast(1.5) brightness(0.9); }
    /* Add a subtle outline around the panel so it stays visible against the black page */
    body.aw-high-contrast #aw-panel { box-shadow: 0 0 0 2px #ffff00, 0 24px 64px -20px rgba(0,0,0,.6) !important; }

    /* Dark mode — page only */
    body.aw-dark-mode { background: #0B0B11 !important; color: #F5F5F8 !important; }
    body.aw-dark-mode :not(#aw-root):not(#aw-root *) { background-color: inherit; color: inherit; }
    body.aw-dark-mode img:not(#aw-root img) { filter: brightness(0.85); }

    /* Light mode (force) — page only */
    body.aw-light-mode { background: #FFFFFF !important; color: #0E0E14 !important; }
    body.aw-light-mode :not(#aw-root):not(#aw-root *) { background-color: #FFFFFF !important; color: #0E0E14 !important; }

    /* Grayscale — only the page; widget already isolated above via filter:none */
    body.aw-grayscale > :not(#aw-root) { filter: grayscale(100%) !important; }

    /* Invert colors — only the page */
    body.aw-invert > :not(#aw-root) { filter: invert(100%) hue-rotate(180deg) !important; }
    body.aw-invert > :not(#aw-root) img,
    body.aw-invert > :not(#aw-root) video { filter: invert(100%) hue-rotate(180deg) !important; }

    /* Mute colors — only the page */
    body.aw-mute-colors > :not(#aw-root) { filter: saturate(20%) !important; }

    /* Trigger button stays branded regardless of mode */
    body[class*="aw-"] #aw-trigger { background: var(--aw-primary, #5B4FE8) !important; color: #FFFFFF !important; }

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
    /* Focus mode: dim everything, restore the section the user is interacting with.
       Originally used :hover, but touch devices never fire :hover — that left every
       element at 0.3 opacity on phones, making the page unreadable (which is the
       cognitive-profile bug Insijam users hit on mobile). Now triggered by:
       - desktop: hover (unchanged)
       - mobile/keyboard: focus-within on any focusable ancestor
       - the element actually being tapped (:active) and its parents
       Plus a "tap to highlight" handler in JS adds .aw-focus-target to the
       most-recently-touched section so it stays bright after the tap ends.   */
    body.aw-focus-mode *:not(.aw-focus-target) { opacity: 0.45 !important; transition: opacity 0.15s !important; }
    body.aw-focus-mode *:hover, body.aw-focus-mode *:focus-within,
    body.aw-focus-mode *:active, body.aw-focus-mode .aw-focus-target,
    body.aw-focus-mode .aw-focus-target * { opacity: 1 !important; }
    body.aw-focus-mode #aw-panel, body.aw-focus-mode #aw-panel *,
    body.aw-focus-mode #aw-backdrop, body.aw-focus-mode #aw-trigger,
    body.aw-focus-mode #aw-license-notice, body.aw-focus-mode #aw-license-notice * { opacity: 1 !important; }

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

    /* ── Responsive: BOTTOM-SHEET pattern on mobile + iPad ── */

    /* Tablet + phone (≤ 1024px): switch panel to a centered bottom-sheet with backdrop. */
    @media (max-width: 1024px) {
      #aw-backdrop { display: block; }

      #aw-panel,
      #aw-panel.bottom-right,
      #aw-panel.bottom-left,
      #aw-panel.top-right,
      #aw-panel.top-left {
        /* Pin to bottom of viewport, full width up to a sane cap */
        left: 50% !important;
        right: auto !important;
        top: auto !important;
        bottom: 0 !important;
        transform: translate(-50%, 100%) !important;
        width: min(560px, 100vw) !important;
        max-width: 100vw !important;
        max-height: 70vh !important;
        max-height: 70dvh !important;
        border-radius: 18px 18px 0 0 !important;
        box-shadow: 0 -16px 48px -16px rgba(20,17,13,.28);
      }
      #aw-panel.open { transform: translate(-50%, 0) !important; }

      /* Grab handle (visual affordance that this is a sheet) */
      #aw-panel::before {
        content: "";
        position: absolute;
        top: 8px; left: 50%;
        transform: translateX(-50%);
        width: 44px; height: 4px;
        border-radius: 999px;
        background: var(--aw-paper-3);
        pointer-events: none;
      }
      .aw-header { padding-top: 22px; }

      /* Trigger stays visible in the corner; nudged up slightly when sheet is open */
      #aw-trigger.bottom-right { bottom: 20px; right: 20px; }
      #aw-trigger.bottom-left  { bottom: 20px; left: 20px; }
      #aw-trigger.top-right    { top: 20px; right: 20px; }
      #aw-trigger.top-left     { top: 20px; left: 20px; }
    }

    /* Phones (≤ 560px) — slightly tighter padding inside the sheet */
    @media (max-width: 560px) {
      #aw-panel { max-height: 75vh !important; max-height: 75dvh !important; }
      #aw-trigger { width: 52px; height: 52px; font-size: 24px; }
      #aw-trigger.bottom-right { bottom: 14px; right: 14px; }
      #aw-trigger.bottom-left  { bottom: 14px; left: 14px; }
      #aw-trigger.top-right    { top: 14px; right: 14px; }
      #aw-trigger.top-left     { top: 14px; left: 14px; }
      .aw-header { padding: 22px 16px 10px; }
      .aw-header-eyebrow { font-size: 9px; }
      .aw-header-title { font-size: 18px; }
      .aw-header-btn { padding: 5px 10px; font-size: 10px; }
      .aw-header-btn.close { width: 28px; height: 28px; }
      .aw-body { padding: 14px 16px 16px; }
      .aw-foot { padding: 10px 16px; padding-bottom: max(10px, env(safe-area-inset-bottom)); }
      .aw-section { margin-bottom: 14px; }
      .aw-tog, .aw-profile-btn { padding: 9px 11px; gap: 9px; }
      .aw-tog-label { font-size: 12.5px; }
      .aw-profile-icon { font-size: 17px; }
      .aw-stepper-card { padding: 9px 11px; }
      .aw-stepper-btn { width: 26px; height: 26px; font-size: 14px; }
      .aw-tts-btn { padding: 11px 14px; font-size: 13px; }
      /* Move toast to top of viewport so it's visible above the bottom-sheet */
      #aw-toast { top: 16px; bottom: auto; right: 14px; left: 14px; text-align: center; max-width: calc(100vw - 28px); }
    }

    /* Very narrow phones (≤ 380px) — stack the 2-col toggle/profile grids */
    @media (max-width: 380px) {
      .aw-profiles, .aw-grid { grid-template-columns: 1fr !important; }
      .aw-stepper-row { grid-template-columns: 1fr !important; }
    }

    /* Short / landscape phones — leave a bit of page header visible above the sheet */
    @media (max-height: 520px) and (max-width: 1024px) {
      #aw-panel { max-height: 88vh !important; max-height: 88dvh !important; }
    }

    /* License notice — stack on phones so the close button doesn't crowd the message */
    @media (max-width: 480px) {
      #aw-license-notice { padding: 12px 14px; gap: 10px; font-size: 12px; }
      #aw-license-notice .aw-ln-title { font-size: 13px; }
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
      // Derive defaults from the script's own URL so the customer's install
      // snippet can be a single line:
      //   <script src=".../accessibility-widget.js?key=AW-XXX-…"></script>
      const scriptCtx = this._readScriptContext();
      if (!this.cfg.apiEndpoint && scriptCtx.apiEndpoint) {
        this.cfg.apiEndpoint = scriptCtx.apiEndpoint;
      }
      if (!this.cfg.licenseKey && scriptCtx.licenseKey) {
        this.cfg.licenseKey = scriptCtx.licenseKey;
      }
      this.lang = this._detectLang();
      this.t = TRANSLATIONS[this.lang];
      this.state = this._loadState();
      this.isOpen = false;
      this.ttsActive = false;
      this.activeProfile = null;
      this._mouseMoveHandler = null;
      this._init();
    }

    // Walk the DOM for our own <script src> tag and pull both the API base URL
    // and the licenseKey query param off it. document.currentScript is null
    // inside our IIFE so we have to find the tag by URL pattern.
    _readScriptContext() {
      try {
        const scripts = document.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
          const src = scripts[i].src || '';
          if (/accessibility-widget(?:\.min)?\.js(?:\?|$|#)/.test(src)) {
            const u = new URL(src);
            return {
              apiEndpoint: new URL('/api/v1/validate', u).toString(),
              licenseKey:  u.searchParams.get('key') || null,
            };
          }
        }
      } catch (_) {}
      return { apiEndpoint: '/api/v1/validate', licenseKey: null };
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
        expired:   this.lang === 'ar' ? 'انتهى ترخيص أداة إمكانية الوصول' : 'Accessibility tool subscription expired',
        suspended: this.lang === 'ar' ? 'تم إيقاف ترخيص أداة إمكانية الوصول' : 'Accessibility tool license suspended',
        invalid:   this.lang === 'ar' ? 'ترخيص أداة إمكانية الوصول غير صالح' : 'Accessibility tool license invalid',
      };

      const defaultMsg = {
        expired:   this.lang === 'ar'
          ? 'ترخيص إنسجام غير نشط. الرجاء تجديد الاشتراك لاستعادة خدمات إمكانية الوصول على هذا الموقع.'
          : 'Your Insijam license is not active. Please renew it to restore accessibility on this site.',
        suspended: this.lang === 'ar'
          ? 'تم إيقاف ترخيص إنسجام. يُرجى التواصل مع الدعم لإعادة التفعيل.'
          : 'Your Insijam license has been suspended. Please contact support to reactivate it.',
        invalid:   this.lang === 'ar'
          ? 'مفتاح الترخيص غير صالح أو غير مرتبط بهذا النطاق. الرجاء التحقق من لوحة الإدارة.'
          : 'This license key is invalid or not authorized for this domain. Please verify it in your dashboard.',
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
      // Telemetry: enqueue a pageview as soon as the widget is live, then flush
      // periodically (every 8s) and on page unload via sendBeacon.
      this._trackQueue = [];
      this._trackEndpoint = this._resolveTrackEndpoint();
      this._track('pageview');
      this._scheduleFlush();
      this._installUnloadFlush();
    }

    _resolveTrackEndpoint() {
      // Derive from apiEndpoint URL — it ends in /api/v1/validate, swap to /track.
      try { return new URL('./track', this.cfg.apiEndpoint).toString(); }
      catch (_) { return null; }
    }

    /** Add an event to the local batch. Cheap, never blocks. */
    _track(type, feature) {
      if (!this.cfg.licenseKey || !this._trackEndpoint) return;
      if (!this._trackQueue) this._trackQueue = [];
      const event = { type };
      if (feature) event.feature = String(feature).slice(0, 40);
      this._trackQueue.push(event);
      // Cap memory in case the page sits open forever
      if (this._trackQueue.length > 200) this._trackQueue.splice(0, this._trackQueue.length - 200);
    }

    _scheduleFlush() {
      if (this._flushTimer) clearInterval(this._flushTimer);
      this._flushTimer = setInterval(() => this._flushTrack(false), 8000);
    }

    _flushTrack(useBeacon) {
      if (!this._trackQueue || !this._trackQueue.length || !this._trackEndpoint) return;
      const events = this._trackQueue.splice(0, 50); // server caps at 50/batch
      const body = JSON.stringify({ key: this.cfg.licenseKey, events });
      try {
        if (useBeacon && navigator.sendBeacon) {
          navigator.sendBeacon(this._trackEndpoint, new Blob([body], { type: 'application/json' }));
        } else {
          fetch(this._trackEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true, // allows in-flight when tab closes
          }).catch(() => {}); // best-effort, never throw to user code
        }
      } catch (_) { /* best-effort telemetry, never break the host page */ }
    }

    _installUnloadFlush() {
      const flush = () => this._flushTrack(true);
      window.addEventListener('pagehide', flush);
      window.addEventListener('beforeunload', flush);
      // visibilitychange→hidden is the most reliable on mobile (browsers don't always fire pagehide)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flush();
      });
    }

    _injectCSS() {
      if (document.getElementById('aw-styles')) return;
      const style = document.createElement('style');
      style.id = 'aw-styles';
      style.textContent = WIDGET_CSS.replace(/var\(--aw-primary, #(?:2563EB|5B4FE8)\)/g,
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

      // Backdrop (only visible on mobile/tablet — see CSS)
      const backdrop = document.createElement('div');
      backdrop.id = 'aw-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');

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

      root.append(skip, mask, guide, trigger, backdrop, panel, toast);
      document.body.appendChild(root);
      this.els = { root, trigger, panel, mask, guide, skip, toast, backdrop };
    }

    _buildPanelHTML() {
      const t = this.t;
      const feat = this.cfg.features;

      const profilesHTML = this.cfg.showProfiles ? `
        <div class="aw-section">
          <div class="aw-section-title">${t.profiles}</div>
          <div class="aw-profiles">
            <button class="aw-profile-btn" data-profile="visuallyImpaired" aria-pressed="false">
              <span class="aw-profile-icon" aria-hidden="true">👁️</span>
              <span>${t.profileVisuallyImpaired}</span>
              <span class="aw-profile-pip" aria-hidden="true"></span>
            </button>
            <button class="aw-profile-btn" data-profile="lowVision" aria-pressed="false">
              <span class="aw-profile-icon" aria-hidden="true">🔍</span>
              <span>${t.profileLowVision}</span>
              <span class="aw-profile-pip" aria-hidden="true"></span>
            </button>
            <button class="aw-profile-btn" data-profile="dyslexia" aria-pressed="false">
              <span class="aw-profile-icon" aria-hidden="true">📖</span>
              <span>${t.profileDyslexia}</span>
              <span class="aw-profile-pip" aria-hidden="true"></span>
            </button>
            <button class="aw-profile-btn" data-profile="seizureSafe" aria-pressed="false">
              <span class="aw-profile-icon" aria-hidden="true">🛡️</span>
              <span>${t.profileSeizureSafe}</span>
              <span class="aw-profile-pip" aria-hidden="true"></span>
            </button>
            <button class="aw-profile-btn" data-profile="cognitive" aria-pressed="false">
              <span class="aw-profile-icon" aria-hidden="true">🧠</span>
              <span>${t.profileCognitive}</span>
              <span class="aw-profile-pip" aria-hidden="true"></span>
            </button>
            <button class="aw-profile-btn" data-profile="keyboard" aria-pressed="false">
              <span class="aw-profile-icon" aria-hidden="true">⌨️</span>
              <span>${t.profileKeyboard}</span>
              <span class="aw-profile-pip" aria-hidden="true"></span>
            </button>
          </div>
        </div>` : '';

      const stepperCard = (key, valId, label) => `
        <div class="aw-stepper-card" role="group" aria-label="${label}">
          <div class="aw-stepper-label">${label}</div>
          <div class="aw-stepper-controls">
            <button type="button" class="aw-stepper-btn" data-action="${key}" data-dir="-1" aria-label="${t.decrease}">−</button>
            <span class="aw-stepper-value" id="${valId}">${this.state[key]}</span>
            <button type="button" class="aw-stepper-btn" data-action="${key}" data-dir="1" aria-label="${t.increase}">+</button>
          </div>
        </div>`;

      // Build top stepper row dynamically based on enabled features
      const stepperCells = [];
      if (feat.fontSize)      stepperCells.push(stepperCard('fontSize',      'aw-fs-val', t.fontSize));
      if (feat.lineHeight)    stepperCells.push(stepperCard('lineHeight',    'aw-lh-val', t.lineHeight));
      if (feat.letterSpacing) stepperCells.push(stepperCard('letterSpacing', 'aw-ls-val', t.letterSpacing));
      const stepperHTML = stepperCells.length
        ? `<div class="aw-stepper-row" style="grid-template-columns:repeat(${Math.min(stepperCells.length, 2)},1fr)">${stepperCells.slice(0, 2).join('')}</div>${stepperCells.slice(2).map(c => `<div class="aw-stepper-row" style="grid-template-columns:1fr">${c}</div>`).join('')}`
        : '';

      // Section helper that only renders if it has any content
      const togglesIn = (keys) => keys
        .filter(k => feat[k])
        .map(k => this._toggleHTML(k, t[k]))
        .join('');

      const visualToggles  = togglesIn(['highContrast', 'darkMode', 'lightMode', 'grayscale', 'invertColors', 'muteColors', 'highlightLinks', 'highlightHeadings']);
      const readingToggles = togglesIn(['readingMask', 'readingGuide', 'focusMode', 'dyslexiaFont', 'pauseAnimations']);
      const navToggles     = togglesIn(['bigCursor', 'keyboardNav']);

      const fontFamilyHTML = feat.fontFamily ? `
        <div class="aw-select-row">
          <div class="aw-section-title">${t.fontFamily}</div>
          <select class="aw-select" id="aw-ff-sel" aria-label="${t.fontFamily}">
            <option value="default">${t.fontDefault}</option>
            <option value="readable">${t.fontReadable}</option>
            <option value="dyslexia">${t.fontDyslexia}</option>
            <option value="mono">${t.fontMono}</option>
          </select>
        </div>` : '';

      const textAlignHTML = feat.textAlign ? `
        <div class="aw-select-row">
          <div class="aw-section-title">${t.textAlign}</div>
          <div class="aw-seg" id="aw-ta-seg" role="radiogroup" aria-label="${t.textAlign}">
            <button class="aw-seg-btn" data-align="left">${t.alignLeft}</button>
            <button class="aw-seg-btn" data-align="center">${t.alignCenter}</button>
            <button class="aw-seg-btn" data-align="right">${t.alignRight}</button>
            <button class="aw-seg-btn" data-align="justify">${t.alignJustify}</button>
          </div>
        </div>` : '';

      const audioHTML = (feat.textToSpeech || feat.muteSounds) ? `
        <div class="aw-section">
          <div class="aw-section-title">${t.audio}</div>
          ${feat.textToSpeech ? `<button class="aw-tts-btn" id="aw-tts-btn" type="button">🔊 ${t.ttsStart}</button>` : ''}
          ${feat.muteSounds ? `<div class="aw-grid" style="margin-top:8px">${this._toggleHTML('muteSounds', t.muteSounds)}</div>` : ''}
        </div>` : '';

      return `
        <div class="aw-header">
          <div class="aw-header-titles">
            <span class="aw-header-eyebrow">${t.openWidget}</span>
            <span class="aw-header-title">${t.title}</span>
          </div>
          <div class="aw-header-actions">
            <button class="aw-header-btn" id="aw-lang-btn" type="button">${t.lang}</button>
            <button class="aw-header-btn close" id="aw-close-btn" type="button" aria-label="${t.close}">✕</button>
          </div>
        </div>
        <div class="aw-body">
          ${profilesHTML}

          ${stepperHTML ? `<div class="aw-section">${stepperHTML}</div>` : ''}

          ${fontFamilyHTML || textAlignHTML ? `
          <div class="aw-section">
            ${fontFamilyHTML}
            ${textAlignHTML}
          </div>` : ''}

          ${visualToggles ? `
          <div class="aw-section">
            <div class="aw-section-title">${t.visual}</div>
            <div class="aw-grid">${visualToggles}</div>
          </div>` : ''}

          ${readingToggles ? `
          <div class="aw-section">
            <div class="aw-section-title">${t.reading}</div>
            <div class="aw-grid">${readingToggles}</div>
          </div>` : ''}

          ${navToggles ? `
          <div class="aw-section">
            <div class="aw-section-title">${t.navigation}</div>
            <div class="aw-grid">${navToggles}</div>
          </div>` : ''}

          ${audioHTML}
        </div>
        <div class="aw-foot">
          <button class="aw-header-btn" id="aw-reset-btn" type="button">${t.reset}</button>
          <span class="aw-foot-meta">WCAG 2.2 AA</span>
        </div>
      `;
    }

    _toggleHTML(key, label) {
      const on = this._isToggleOn(key);
      return `
        <button type="button" role="switch" aria-checked="${on}"
                class="aw-tog ${on ? 'is-on' : ''}"
                data-toggle="${key}">
          <span class="aw-tog-label">${label}</span>
          <span class="aw-tog-pip" aria-hidden="true"></span>
        </button>`;
    }

    _isToggleOn(key) {
      return !!this.state[key];
    }

    // ── Event Binding ────────────────────────────
    _bindEvents() {
      const { trigger, panel } = this.els;

      // Open / close
      trigger.addEventListener('click', () => this.toggle());

      panel.addEventListener('click', (e) => {
        const t = e.target;

        // Close
        if (t.closest('#aw-close-btn')) { this.close(); return; }

        // Reset
        if (t.closest('#aw-reset-btn')) { this.resetAll(); return; }

        // Language toggle
        if (t.closest('#aw-lang-btn')) { this.toggleLang(); return; }

        // Toggle button (Insijam-style)
        const togBtn = t.closest('[data-toggle]');
        if (togBtn) {
          const key = togBtn.dataset.toggle;
          const newVal = !this.state[key];
          this.state[key] = newVal;

          // Mutually-exclusive color/filter modes: turning one on disables
          // the others, otherwise stacking filters produces unreadable results.
          const COLOR_MODES = ['highContrast', 'darkMode', 'lightMode', 'grayscale', 'invertColors', 'muteColors'];
          if (newVal && COLOR_MODES.includes(key)) {
            COLOR_MODES.forEach(other => {
              if (other !== key && this.state[other]) {
                this.state[other] = false;
                this._applyFeature(other);
              }
            });
          }

          this._applyFeature(key);
          this._saveState();
          this._syncUI();   // refresh all toggle visuals (others may have flipped off)
          if (newVal) this._track('feature_used', key); // only count "turn on" — avoids double-counting
          return;
        }

        // Profile
        const profileBtn = t.closest('[data-profile]');
        if (profileBtn) {
          this.applyProfile(profileBtn.dataset.profile);
          this._track('profile_used', profileBtn.dataset.profile);
          return;
        }

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
        if (t.closest('#aw-tts-btn')) {
          this.toggleTTS();
          this._track('tts_used');
          return;
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

      // Click on backdrop closes (mobile/tablet)
      this.els.backdrop.addEventListener('click', () => this.close());

      // Click outside the panel/trigger also closes (desktop fallback)
      document.addEventListener('click', (e) => {
        if (!this.isOpen) return;
        if (this.els.panel.contains(e.target)) return;
        if (this.els.trigger.contains(e.target)) return;
        if (this.els.backdrop.contains(e.target)) return;
        this.close();
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
      this.els.backdrop.classList.add('open');
      this.els.trigger.setAttribute('aria-expanded', 'true');
      this._track('widget_open');
      // Lock body scroll only when the panel is acting as a bottom-sheet (mobile/tablet)
      if (window.matchMedia('(max-width: 1024px)').matches) {
        this._prevBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
      this._syncUI();
      // Focus first focusable element
      const first = this.els.panel.querySelector('button, input, select');
      if (first) first.focus();
    }

    close() {
      this.isOpen = false;
      this.els.panel.classList.remove('open');
      this.els.backdrop.classList.remove('open');
      this.els.trigger.setAttribute('aria-expanded', 'false');
      if (this._prevBodyOverflow !== undefined) {
        document.body.style.overflow = this._prevBodyOverflow;
        this._prevBodyOverflow = undefined;
      }
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

      // Toggle buttons
      p.querySelectorAll('[data-toggle]').forEach(btn => {
        const on = !!this.state[btn.dataset.toggle];
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-checked', String(on));
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
        const on = btn.dataset.profile === this.activeProfile;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', String(on));
      });

      // TTS button
      const ttsBtn = p.querySelector('#aw-tts-btn');
      if (ttsBtn) {
        ttsBtn.textContent = this.ttsActive ? `⏹ ${this.t.ttsStop}` : `🔊 ${this.t.ttsStart}`;
        ttsBtn.className = 'aw-tts-btn' + (this.ttsActive ? ' stop' : '');
      }
    }

    // ── Focus-mode tap handler ───────────────────
    // On touch devices :hover never fires, so a CSS-only focus mode dims the
    // whole page and never restores anything. This handler walks up from the
    // tap target to find the nearest readable block (p, li, h*, blockquote)
    // and marks it as .aw-focus-target so the CSS rule keeps it bright.
    _installFocusModeTapHandler() {
      if (this._focusTapHandler) return;
      const BLOCKS = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, article, section, td, th, dt, dd, figcaption, .feature, .compliance-card, .tryit-sample, .bilingual-card';
      this._focusTapHandler = (e) => {
        const t = e.target;
        if (!t || t.closest('#aw-root')) return; // ignore widget UI itself
        const block = t.closest(BLOCKS);
        if (!block) return;
        // Clear previous target, mark new
        document.querySelectorAll('.aw-focus-target').forEach(el => el.classList.remove('aw-focus-target'));
        block.classList.add('aw-focus-target');
      };
      document.addEventListener('click', this._focusTapHandler, true);
      document.addEventListener('touchstart', this._focusTapHandler, { capture: true, passive: true });
    }

    _removeFocusModeTapHandler() {
      if (!this._focusTapHandler) return;
      document.removeEventListener('click', this._focusTapHandler, true);
      document.removeEventListener('touchstart', this._focusTapHandler, { capture: true });
      this._focusTapHandler = null;
      document.querySelectorAll('.aw-focus-target').forEach(el => el.classList.remove('aw-focus-target'));
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

      // Focus mode on touch devices — :hover never fires, so the CSS rule alone
      // leaves the whole page dimmed. Install a tap handler that marks the
      // tapped paragraph/heading/list-item as .aw-focus-target so it stays bright.
      if (key === 'focusMode') {
        if (val) this._installFocusModeTapHandler();
        else     this._removeFocusModeTapHandler();
      }

      // All 6 color modes are mutually exclusive — enabling one disables the rest.
      const COLOR_MODES = {
        highContrast: 'aw-high-contrast',
        darkMode:     'aw-dark-mode',
        lightMode:    'aw-light-mode',
        grayscale:    'aw-grayscale',
        invertColors: 'aw-invert',
        muteColors:   'aw-mute-colors',
      };
      if (val && COLOR_MODES[key]) {
        Object.keys(COLOR_MODES).forEach(mode => {
          if (mode !== key) {
            body.classList.remove(COLOR_MODES[mode]);
            this.state[mode] = false;
          }
        });
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
