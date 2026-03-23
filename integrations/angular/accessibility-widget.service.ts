/**
 * AccessibilityWidgetService — Angular Service
 *
 * Loads the widget script once and exposes the full API
 * as typed methods that any component can inject and use.
 *
 * Setup:
 *   1. Copy accessibility-widget.js to /src/assets/
 *   2. Import AccessibilityWidgetModule in your AppModule (or standalone imports)
 *   3. Inject the service wherever you need it
 */
import { Injectable, OnDestroy } from '@angular/core';

export interface WidgetConfig {
  lang?: 'en' | 'ar' | 'auto';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  buttonIcon?: string;
  storageKey?: string;
  showProfiles?: boolean;
  showTTS?: boolean;
  showReadingMask?: boolean;
  features?: Partial<{
    fontSize: boolean;
    fontFamily: boolean;
    lineHeight: boolean;
    letterSpacing: boolean;
    textAlign: boolean;
    highContrast: boolean;
    darkMode: boolean;
    lightMode: boolean;
    grayscale: boolean;
    invertColors: boolean;
    muteColors: boolean;
    highlightLinks: boolean;
    highlightHeadings: boolean;
    readingMask: boolean;
    readingGuide: boolean;
    focusMode: boolean;
    dyslexiaFont: boolean;
    pauseAnimations: boolean;
    bigCursor: boolean;
    skipContent: boolean;
    keyboardNav: boolean;
    textToSpeech: boolean;
    muteSounds: boolean;
  }>;
}

export type ProfileName =
  | 'visuallyImpaired'
  | 'lowVision'
  | 'dyslexia'
  | 'seizureSafe'
  | 'cognitive'
  | 'keyboard';

declare global {
  interface Window {
    AccessibilityWidgetConfig?: WidgetConfig;
    _accessibilityWidget?: {
      open(): void;
      close(): void;
      toggle(): void;
      resetAll(): void;
      applyProfile(name: ProfileName): void;
      toggleTTS(): void;
      toggleLang(): void;
      destroy(): void;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class AccessibilityWidgetService implements OnDestroy {
  private scriptId = 'aw-script';
  private loaded = false;

  /**
   * Call this once — typically from AppComponent.ngOnInit()
   * Adjust `src` to match where you placed accessibility-widget.js
   */
  init(config: WidgetConfig = {}, src = 'assets/accessibility-widget.js'): void {
    if (this.loaded || typeof document === 'undefined') return;

    window.AccessibilityWidgetConfig = {
      lang: 'auto',
      position: 'bottom-right',
      primaryColor: '#2563EB',
      showProfiles: true,
      showTTS: true,
      ...config,
    };

    const existing = document.getElementById(this.scriptId);
    if (existing) { this.loaded = true; return; }

    const script = document.createElement('script');
    script.id = this.scriptId;
    script.src = src;
    script.async = true;
    script.onload = () => { this.loaded = true; };
    document.body.appendChild(script);
  }

  open()                              { window._accessibilityWidget?.open(); }
  close()                             { window._accessibilityWidget?.close(); }
  toggle()                            { window._accessibilityWidget?.toggle(); }
  resetAll()                          { window._accessibilityWidget?.resetAll(); }
  applyProfile(name: ProfileName)     { window._accessibilityWidget?.applyProfile(name); }
  toggleTTS()                         { window._accessibilityWidget?.toggleTTS(); }
  toggleLang()                        { window._accessibilityWidget?.toggleLang(); }

  ngOnDestroy(): void {
    window._accessibilityWidget?.destroy?.();
    document.getElementById(this.scriptId)?.remove();
    this.loaded = false;
  }
}
