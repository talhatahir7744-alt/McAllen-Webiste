import Script from 'next/script';

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

export function GhlPage({ headHtml, bodyHtml, scripts }: { headHtml: string; bodyHtml: string; scripts: PageScript[] }) {
  return (
    <>
      <div data-ghl-page="" style={{ display: 'contents' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: headHtml + bodyHtml }} />
      <Script id="ghl-teleport-fix" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: TELEPORT_FIX }} />
      {scripts.map((s) =>
        s.src ? (
          <Script key={s.id} id={s.id} src={s.src} strategy="afterInteractive" {...(s.type ? { type: s.type } : {})} {...(s.crossOrigin ? { crossOrigin: s.crossOrigin as 'anonymous' | 'use-credentials' } : {})} />
        ) : (
          <Script key={s.id} id={s.id} strategy="afterInteractive" {...(s.type ? { type: s.type } : {})} dangerouslySetInnerHTML={{ __html: s.code || '' }} />
        ),
      )}
    </>
  );
}
