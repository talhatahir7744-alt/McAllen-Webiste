/* Tracking tags for every page (both root layouts render these once): GA4 (two properties), Google Tag Manager
   and Simpli.fi in <head>, the GTM noscript iframe first in <body>. Snippets are the client's verbatim; both GA4
   configs and the shared dataLayer/gtag function are intentional. Kept out of the page loader, the motion system
   and any conditional logic. The converter (scripts/convert.mjs) regenerates the layouts and keeps these in. */

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

const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

const SIMPLIFI_LOADER = `(function(){var done=false;function go(){if(done)return;done=true;var s=document.createElement('script');s.async=true;s.src='${SIMPLIFI_SRC}';document.head.appendChild(s);}
var evs=['pointerdown','keydown','touchstart','scroll'];function onFirst(){go();for(var i=0;i<evs.length;i++)window.removeEventListener(evs[i],onFirst,{passive:true});}
for(var i=0;i<evs.length;i++)window.addEventListener(evs[i],onFirst,{passive:true});
var idle=window.requestIdleCallback||function(cb){setTimeout(cb,4000)};window.addEventListener('load',function(){idle(go,{timeout:4000});});})();`;

/** <head> tags, in the client's order: gtag.js (primary), GTM, Simpli.fi, gtag.js (secondary). */
export function TrackingHead() {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_PRIMARY}`} />
      <script dangerouslySetInnerHTML={{ __html: gtagSnippet(GA_PRIMARY) }} />
      {/* Google Tag Manager */}
      <script dangerouslySetInnerHTML={{ __html: GTM_SNIPPET }} />
      {/* End Google Tag Manager */}
      {/* Simpli.fi (marketing pixel, nothing on the page depends on it): the same async tag, injected after the page
          is interactive: on the first user interaction or in the browser's first idle period (4 s at the latest) */}
      <script dangerouslySetInnerHTML={{ __html: SIMPLIFI_LOADER }} />
      {/* Google tag (gtag.js) */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_SECONDARY}`} />
      <script dangerouslySetInnerHTML={{ __html: gtagSnippet(GA_SECONDARY) }} />
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
