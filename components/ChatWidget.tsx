'use client';
/**
 * The client's GoHighLevel chat widget (LeadConnector), one per page in the page's language: the English widget on every
 * page under app/(en), the Spanish one on every page under app/es. The snippet is the client's, verbatim (loader.js with
 * data-resources-url and data-widget-id); it is appended to the end of <body> once the page has loaded and the browser is
 * idle, so it adds nothing to the critical path, the main-thread work before load, or hydration (it lands after
 * #snz-app, where React never looks). Once per page view: the root layout stays mounted across client-side navigations
 * within a language, so the widget keeps running instead of loading again. Switching language is always a full page load
 * (the EN | ES links are plain <a> elements and each language has its own root layout); should a widget for the other
 * language still be present anyway, it is removed before this one is added, so a page never carries both.
 * The bubble's stacking order is set in overrides/global.css ("Chat widget").
 */
import { useEffect } from 'react';

const WIDGET_IDS = { en: '6ada7129c5fa6117307c554f', es: '6ada73894325b023027e7371' } as const;
const SCRIPT_ID = 'snz-chat-widget';

function addWidget(widgetId: string) {
  const s = document.createElement('script');
  s.id = SCRIPT_ID;
  s.src = 'https://widgets.leadconnectorhq.com/loader.js';
  s.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
  s.setAttribute('data-widget-id', widgetId);
  document.body.appendChild(s);
}

function removeWidget() {
  document.getElementById(SCRIPT_ID)?.remove();
  document.querySelectorAll('chat-widget').forEach((el) => el.remove());
}

export function ChatWidget({ locale }: { locale: 'en' | 'es' }) {
  useEffect(() => {
    const widgetId = WIDGET_IDS[locale];
    const current = document.getElementById(SCRIPT_ID);
    if (current?.getAttribute('data-widget-id') === widgetId) return;
    if (current) removeWidget();
    let idle = 0;
    let timer = 0;
    const add = () => {
      if (!document.getElementById(SCRIPT_ID)) addWidget(widgetId);
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
