/**
 * React Integration — Full Example
 * Shows three ways to use the widget in a React / Next.js project.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Option A — Component (simplest, recommended)
// Place once in your root App.jsx or _app.tsx and forget about it.
// ─────────────────────────────────────────────────────────────────────────────
import AccessibilityWidget from './AccessibilityWidget';

function App() {
  return (
    <>
      {/* All your normal routes / layout here */}
      <main>
        <h1>My Website</h1>
      </main>

      {/* Drop the widget anywhere in the tree — it renders nothing */}
      <AccessibilityWidget
        lang="auto"
        position="bottom-right"
        primaryColor="#2563EB"
        showProfiles={true}
        showTTS={true}
        onLoad={(widget) => {
          console.log('Accessibility widget ready', widget);
        }}
      />
    </>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Option B — Hook (when you need to control the widget programmatically)
// ─────────────────────────────────────────────────────────────────────────────
import useAccessibilityWidget from './useAccessibilityWidget';

function AppWithHook() {
  const widget = useAccessibilityWidget({
    lang: 'auto',
    primaryColor: '#7c3aed',
  });

  return (
    <div>
      {/* Open widget from your own button */}
      <button onClick={() => widget.open()}>
        Open Accessibility Settings
      </button>

      {/* Apply a profile programmatically */}
      <button onClick={() => widget.applyProfile('dyslexia')}>
        Enable Dyslexia Mode
      </button>

      <button onClick={() => widget.resetAll()}>
        Reset Accessibility
      </button>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Option C — Next.js _app.tsx (TypeScript)
// ─────────────────────────────────────────────────────────────────────────────
/*
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    window.AccessibilityWidgetConfig = {
      lang: 'auto',
      position: 'bottom-right',
      primaryColor: '#2563EB',
    };
    const script = document.createElement('script');
    script.src = '/accessibility-widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.getElementById('aw-script')?.remove(); };
  }, []);

  return <Component {...pageProps} />;
}
*/

export { App, AppWithHook };
