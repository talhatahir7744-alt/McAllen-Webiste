/* Tracking tags for every page (both root layouts render these once): GA4 (two properties), Google Tag Manager
   and Simpli.fi in <head>, plus the GTM noscript iframe first in <body>. IDs and snippets are the client's,
   verbatim, in the client's order; the two gtag.js tags are async scripts, the GTM snippet is the standard
   inline loader (it injects an async gtm.js), Simpli.fi is async. Nothing waits for an interaction, the page
   loader, consent or the window load event; GTM and Simpli.fi start at DOMContentLoaded, see DEFERRED_TAGS
   (SEO audit, October 2026 — section 7a: the previous performance
   pass had deferred the four external scripts until the first interaction or 6 s after load, so a visitor who
   bounced before that was never recorded by GA4). The converter (scripts/convert.mjs) regenerates the layouts
   and keeps these in. Site events are pushed to the same dataLayer by public/snz-events.js (section 7b). */

const GA_PRIMARY = 'G-9R1JGVBRBR';
const GA_SECONDARY = 'G-TS1RXQVPYT';
const GTM_ID = 'GTM-TVPN94M';
const SIMPLIFI_SRC = 'https://tag.simpli.fi/sifitag/b781856a-502d-46d8-a1da-c8e46665edab';

const gtagConfig = (id: string) => `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${id}');
`;

/* The client's GTM snippet, unchanged. */
const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

/* GTM and Simpli.fi start once the document has finished parsing (DOMContentLoaded), not during the parse: the tags
   they load (CallRail number swapping, Simpli.fi pixels) insert elements into <body>, and on a slow connection the
   1.5 MB body is still streaming when that happens, so the element lands between the page wrapper and its React
   siblings and React, hydrating later, sees a tree that no longer matches and regenerates it with the page markup
   gone (React error #418). After the parse the insertions land at the end of <body>, which React tolerates. This
   is still a plain page load with no interaction or consent wait; GA4's gtag.js keeps loading in <head> as before. */
const DEFERRED_TAGS = `(function(){function go(){${GTM_SNIPPET}
var s=document.createElement('script');s.async=true;s.src='${SIMPLIFI_SRC}';document.head.appendChild(s);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go,{once:true});else go();})();`;

/** <head> tags, in the client's order: gtag.js (primary) + config, GTM, Simpli.fi, gtag.js (secondary) + config. */
export function TrackingHead() {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_PRIMARY}`} />
      <script dangerouslySetInnerHTML={{ __html: gtagConfig(GA_PRIMARY) }} />
      {/* Google Tag Manager + Simpli.fi, started at DOMContentLoaded (see DEFERRED_TAGS) */}
      <script dangerouslySetInnerHTML={{ __html: DEFERRED_TAGS }} />
      {/* End Google Tag Manager */}
      {/* Google tag (gtag.js) */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_SECONDARY}`} />
      <script dangerouslySetInnerHTML={{ __html: gtagConfig(GA_SECONDARY) }} />
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
