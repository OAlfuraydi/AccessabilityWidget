/**
 * AccessibilityWidget — React component (drop-in)
 *
 * Drop this component anywhere in your component tree (e.g. in App.jsx).
 * It renders nothing in the DOM — the widget injects its own floating button.
 *
 * Props (all optional):
 *   lang          — 'en' | 'ar' | 'auto'  (default: 'auto')
 *   position      — 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
 *   primaryColor  — hex color string  (default: '#2563EB')
 *   buttonIcon    — string emoji/text for the trigger button
 *   showProfiles  — boolean
 *   showTTS       — boolean
 *   features      — object to enable/disable individual features
 *   onLoad        — callback(widgetInstance) called when the widget is ready
 *
 * Example:
 *   <AccessibilityWidget lang="auto" primaryColor="#7c3aed" onLoad={(w) => console.log(w)} />
 */
import { useEffect } from 'react';

export default function AccessibilityWidget({
  lang = 'auto',
  position = 'bottom-right',
  primaryColor = '#2563EB',
  buttonIcon = '♿',
  showProfiles = true,
  showTTS = true,
  features,
  onLoad,
}) {
  useEffect(() => {
    // Build the config object
    const cfg = { lang, position, primaryColor, buttonIcon, showProfiles, showTTS };
    if (features) cfg.features = features;
    window.AccessibilityWidgetConfig = cfg;

    if (document.getElementById('aw-script')) {
      if (onLoad && window._accessibilityWidget) onLoad(window._accessibilityWidget);
      return;
    }

    const script = document.createElement('script');
    script.id = 'aw-script';
    script.src = '/accessibility-widget.js';   // ← adjust to your path
    script.async = true;
    script.onload = () => {
      if (onLoad && window._accessibilityWidget) onLoad(window._accessibilityWidget);
    };
    document.body.appendChild(script);

    return () => {
      window._accessibilityWidget?.destroy?.();
      document.getElementById('aw-script')?.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This component renders nothing — the widget manages its own DOM
  return null;
}
