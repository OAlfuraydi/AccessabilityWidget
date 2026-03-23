/**
 * useAccessibilityWidget — React hook
 * Loads the Accessibility Widget on mount and exposes the instance API.
 *
 * Usage:
 *   const { open, close, applyProfile, resetAll } = useAccessibilityWidget({
 *     lang: 'auto',
 *     primaryColor: '#2563EB',
 *   });
 */
import { useEffect, useRef } from 'react';

export default function useAccessibilityWidget(config = {}) {
  const instanceRef = useRef(null);

  useEffect(() => {
    // Set config before the script loads
    window.AccessibilityWidgetConfig = {
      lang: 'auto',
      position: 'bottom-right',
      primaryColor: '#2563EB',
      ...config,
    };

    // Avoid duplicate loads
    if (document.getElementById('aw-script')) {
      instanceRef.current = window._accessibilityWidget || null;
      return;
    }

    const script = document.createElement('script');
    script.id = 'aw-script';
    // Adjust src to match your hosting path / CDN
    script.src = '/accessibility-widget.js';
    script.async = true;

    script.onload = () => {
      instanceRef.current = window._accessibilityWidget || null;
    };

    document.body.appendChild(script);

    return () => {
      // Destroy on unmount (optional — usually you keep the widget for the session)
      if (instanceRef.current && typeof instanceRef.current.destroy === 'function') {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
      const el = document.getElementById('aw-script');
      if (el) el.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose the public API — safe to call before the script has fully loaded
  const api = {
    open:         (...args) => instanceRef.current?.open(...args),
    close:        (...args) => instanceRef.current?.close(...args),
    toggle:       (...args) => instanceRef.current?.toggle(...args),
    resetAll:     (...args) => instanceRef.current?.resetAll(...args),
    applyProfile: (name)    => instanceRef.current?.applyProfile(name),
    toggleTTS:    (...args) => instanceRef.current?.toggleTTS(...args),
    toggleLang:   (...args) => instanceRef.current?.toggleLang(...args),
  };

  return api;
}
