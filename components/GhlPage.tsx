'use client';
/* A client component on purpose: each route's generated client.tsx imports its markup and renders this, so the
   markup is server-rendered into the HTML once and never serialized into the React hydration payload. */
import { useEffect } from 'react';

export type PageScript = { id: string; src?: string; type?: string; crossOrigin?: string; code?: string };

/**
 * Renders one converted GoHighLevel page: the original <head> stylesheet/style sequence followed by
 * the original <body> markup (both untouched apart from URL rewriting), then every original script
 * re-emitted through next/script in the original order. `display: contents` keeps the wrapper out of
 * the layout so the markup behaves as if it were a direct child of <body>, exactly like the source.
 */
/**
 * Vue's <Teleport to="body"> hydration expects the SSR anchors (<!--teleport start anchor--> … <!--teleport anchor-->)
 * and the teleported markup to be direct children of <body>, starting at body.firstChild. React needs a host element,
 * so the page markup is rendered inside a wrapper; this script (first afterInteractive script, i.e. after React
 * hydration and before the Nuxt entry executes) moves every body-level node that preceded #__nuxt in the original
 * document back to the start of <body>, and every body-level node that followed it to the end of <body>.
 */
const TELEPORT_FIX = `(function(){var w=document.querySelector('[data-ghl-page]');var n=document.getElementById('__nuxt');if(!w||!n||n.parentNode!==w||w.getAttribute('data-ghl-fixed'))return;
var keep=function(x){return x.nodeType===1&&/^(STYLE|LINK|SCRIPT)$/.test(x.tagName)};var before=document.createDocumentFragment(),after=document.createDocumentFragment(),c=w.firstChild,past=false;
while(c){var nx=c.nextSibling;if(c===n){past=true}else if(!keep(c)){(past?after:before).appendChild(c)}c=nx}
document.body.insertBefore(before,document.body.firstChild);document.body.appendChild(after);w.setAttribute('data-ghl-fixed','1')})();`;

export type PagePreload = { href: string; media?: string };

/**
 * The page scripts (teleport fix, Nuxt payload, runtime entry, …) are appended in their original order once React
 * has hydrated (an effect runs after hydration, like next/script's afterInteractive did). next/script is not used
 * for them any more: for every external afterInteractive script it emits a <link rel="preload" as="script"> in
 * <head>, which started the 256 KB runtime entry alongside the document and the hero image on phones.
 */
function runPageScripts(scripts: PageScript[]) {
  // Appended back to back, like next/script did: classic inline scripts run synchronously in this order, classic
  // external ones keep their order (async = false), and the runtime's module entry — first in the source, but
  // deferred by the browser — executes after them, once the inline Nuxt config it needs has run.
  for (const s of [{ id: 'ghl-teleport-fix', code: TELEPORT_FIX }, ...scripts]) {
    if (document.getElementById(s.id)) continue;
    const el = document.createElement('script');
    el.id = s.id;
    if (s.type) el.type = s.type;
    if (s.crossOrigin) el.crossOrigin = s.crossOrigin;
    if (s.src) { el.src = s.src; el.async = false; } else el.text = s.code || '';
    document.body.appendChild(el);
  }
}

export function GhlPage({ headHtml, bodyHtml, scripts, preload }: { headHtml: string; bodyHtml: string; scripts: PageScript[]; preload?: PagePreload[] }) {
  useEffect(() => {
    const w = document.querySelector('[data-ghl-page]');
    if (!w || w.getAttribute('data-ghl-scripts')) return;
    w.setAttribute('data-ghl-scripts', '1');
    runPageScripts(scripts);
  }, [scripts]);
  return (
    <>
      {/* hero background = LCP element; React hoists these into <head> */}
      {(preload || []).map((p) => (
        <link key={p.href + (p.media || '')} rel="preload" as="image" href={p.href} media={p.media} fetchPriority="high" />
      ))}
      {/* __html is '' on the client (client.tsx): React keeps the server-rendered markup as long as the value does not change */}
      <div data-ghl-page="" style={{ display: 'contents' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: headHtml + bodyHtml }} />
    </>
  );
}
