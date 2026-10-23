'use client';
/**
 * The client's GoHighLevel chat widget (LeadConnector), one per page in the page's language: the English widget on every
 * page under app/(en), the Spanish one on every page under app/es. The snippet is the client's, verbatim (loader.js with
 * data-resources-url and data-widget-id); it is appended to the end of <body> once the page has loaded and the browser is
 * idle, so it adds nothing to the critical path, the main-thread work before load, or hydration (it lands after
 * #snz-app, where React never looks). Once per page view: the root layout stays mounted across client-side navigations
 * within a language, so the widget keeps running instead of loading again. Switching language is a full page load (the
 * EN | ES links in the top bar and the mobile menu are plain <a> elements, and each language has its own root layout),
 * so every page starts with only its own language's widget. The site does not style the widget: its position, look,
 * copy and hours are managed in the client's CRM.
 */
import { useEffect } from 'react';

const WIDGET_IDS = { en: '6ada7129c5fa6117307c554f', es: '6ada73894325b023027e7371' } as const;
const SCRIPT_ID = 'snz-chat-widget';

export function ChatWidget({ locale }: { locale: 'en' | 'es' }) {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;
    let idle = 0;
    let timer = 0;
    const add = () => {
      if (document.getElementById(SCRIPT_ID)) return;
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = 'https://widgets.leadconnectorhq.com/loader.js';
      s.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
      s.setAttribute('data-widget-id', WIDGET_IDS[locale]);
      document.body.appendChild(s);
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(add, { timeout: 4000 });
      else timer = window.setTimeout(add, 1500);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      window.removeEventListener('load', schedule);
      if (idle) window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, [locale]);
  return null;
}
