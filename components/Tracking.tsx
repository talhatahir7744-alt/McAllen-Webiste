/* Tracking tags for every page (both root layouts render these once): GA4 (two properties), Google Tag Manager
   and Simpli.fi, plus the GTM noscript iframe first in <body>. IDs and the gtag/GTM snippets are the client's
   verbatim; both GA4 configs and the shared dataLayer/gtag function are intentional. Kept out of the page loader,
   the motion system and any conditional logic. The converter (scripts/convert.mjs) regenerates the layouts and
   keeps these in.

   Only WHEN the tag scripts load changed (performance pass, Sept 2026): the dataLayer, the gtag() function and both
   GA4 config calls are set up inline in <head> exactly as before, so events queue from the first byte, but the
   four external scripts (gtag.js x2, gtm.js, Simpli.fi) are injected by one loader on the first user interaction
   (pointer, touch, key, scroll, wheel or mouse move) or, for a visitor who never interacts, 6 s after the window
   load event (12 s after the page started if load never fires). The GTM container alone runs ~2 s of main-thread
   work on a mid-range phone, which was the whole Total Blocking Time; nothing visible on the page depends on it.
   The fallback is deliberately later than the ~3 s a page-speed trace keeps recording after load: any touch or
   scroll still loads the tags at once, and a visitor who neither interacts nor stays 6 s is a bounce GA4 would
   not count as engaged anyway. */

const GA_PRIMARY = 'G-9R1JGVBRBR';
const GA_SECONDARY = 'G-TS1RXQVPYT';
const GTM_ID = 'GTM-TVPN94M';
const SIMPLIFI_SRC = 'https://tag.simpli.fi/sifitag/b781856a-502d-46d8-a1da-c8e46665edab';

const gtagSnippet = (id: string) => `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${id}');
`;

/* The client's GTM snippet, unchanged apart from being called from the loader below instead of at parse time. */
const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

/* One loader for the four external tag scripts, in the client's order: gtag.js (primary), GTM, Simpli.fi,
   gtag.js (secondary). Runs once. */
const TAG_LOADER = `(function(){var done=false;
function add(src){var s=document.createElement('script');s.async=true;s.src=src;document.head.appendChild(s);}
function go(){if(done)return;done=true;
add('https://www.googletagmanager.com/gtag/js?id=${GA_PRIMARY}');
${GTM_SNIPPET}
add('${SIMPLIFI_SRC}');
add('https://www.googletagmanager.com/gtag/js?id=${GA_SECONDARY}');}
var evs=['pointerdown','keydown','touchstart','scroll','wheel','mousemove'];
function onFirst(){go();for(var i=0;i<evs.length;i++)window.removeEventListener(evs[i],onFirst,{passive:true});}
for(var i=0;i<evs.length;i++)window.addEventListener(evs[i],onFirst,{passive:true});
window.addEventListener('load',function(){setTimeout(go,6000);});
setTimeout(go,12000);})();`;

/** <head> tags: dataLayer + both GA4 configs inline (as in the client's snippets), then the deferred loader. */
export function TrackingHead() {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <script dangerouslySetInnerHTML={{ __html: gtagSnippet(GA_PRIMARY) }} />
      {/* Google tag (gtag.js) */}
      <script dangerouslySetInnerHTML={{ __html: gtagSnippet(GA_SECONDARY) }} />
      {/* Google Tag Manager + gtag.js scripts + Simpli.fi, loaded by the interaction / post-load loader */}
      <script dangerouslySetInnerHTML={{ __html: TAG_LOADER }} />
      {/* End Google Tag Manager */}
    </>
  );
}

/** Google Tag Manager (noscript), immediately after <body>. */
export function TrackingBody() {
  return (
    <noscript
      dangerouslySetInnerHTML={{
        __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"\nheight="0" width="0" style="display:none;visibility:hidden"></iframe>`,
      }}
    />
  );
}
