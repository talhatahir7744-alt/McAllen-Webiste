'use client';
import { useEffect, useRef } from 'react';
import styles from './PromoBanner.module.css';

/* Promo banners from the banner manager (November 11, 2026): a separate dashboard decides which banners each store
   shows; its embed script renders them (responsive slider, dots, swipe, autoplay, lazy images, inside a Shadow DOM so
   the site's CSS cannot reach it) into the element given to it, and renders NOTHING when the store has no banner, so
   this slot reserves no height of its own. When a banner shows, the embed's box has a fixed aspect ratio (1920/500
   from 768px, 800/600 below) and takes its full size before the image loads, so the page does not jump while the
   image arrives; the image fills it with object-fit: cover at the same ratio, so nothing is stretched or cropped.
   The feed is read on every page view, so dashboard changes show up without a deploy.

   Fast start (the site is a static export, so the banner cannot be in the HTML): the embed does not wait for React.
   The page carries preconnects to the script host and the image host, the embed script as a real deferred <script>
   (the browser fetches it while the HTML is still parsing), and a parse-time inline script that mounts it at
   DOMContentLoaded and keeps the handle on the host element. This component then ADOPTS that handle (mounting a
   second time would clear the slot and refetch) and only loads + mounts the embed itself when the deferred script
   never arrived; destroy() runs on unmount either way, and a load that finishes after unmount is ignored. The API
   base is passed explicitly: the script would otherwise take it from the <script> tag it was loaded by.

   Spacing (home pages: header → this slot → announcement ticker → hero): while a banner shows, the slot gets 16px
   above and the ticker 16px below it; with no banner the slot is 0px tall with no margins, so the ticker sits
   directly under the header. Those margins, and the box reserved at the embed's ratio, come from one <style> the
   inline script adds to <head>: before first paint on return visits (it remembers per visitor, localStorage, best
   effort, whether a banner showed last time), otherwise once the embed has rendered; removed when there is no banner.
   A first-ever visit cannot know and shifts once. Mounted on the home pages only (/ and /es), full-bleed. */
const EMBED_ORIGIN = 'https://snooze-banner-self.vercel.app';
const EMBED_SRC = `${EMBED_ORIGIN}/embed.js`;
const IMAGE_ORIGIN = 'https://gfpw6bkqb3wzayp0.public.blob.vercel-storage.com'; // the banner app's image store (Vercel Blob)

type BannerHandle = { ready: Promise<void>; destroy(): void };
type Host = HTMLDivElement & { __snzBanner?: BannerHandle; __snzBannerDone?: () => void };
declare global {
  interface Window {
    BannerEmbed?: { mount(el: Element, opts: { site: string; api?: string }): BannerHandle; version: string };
  }
}

/* runs while the HTML parses (before React): see the note above. `show` adds the shown-state style (margins + the
   reserved box), `hide` removes it; `done` runs once the embed has rendered (also reachable from the component's
   fallback path as host.__snzBannerDone) */
const EARLY_MOUNT = (site: string) => {
  const S = `[data-promo-banner="${site}"]`;
  const css = `${S}{margin:16px auto 0}${S}+.snooze-ticker-wrap{margin-top:16px}${S}>div{aspect-ratio:1920/500}@media(max-width:767px){${S}>div{aspect-ratio:800/600}}`;
  return `(function(){var h=document.querySelector('${S}>div');if(!h)return;var K="snzPromoBanner",st=null;` +
    `function show(){if(st)return;st=document.createElement("style");st.textContent='${css}';document.head.appendChild(st)}` +
    `function hide(){if(st){st.remove();st=null}}` +
    `try{if(localStorage.getItem(K)==="1")show()}catch(e){}` +
    `function done(){var has=!!(h.shadowRoot&&h.shadowRoot.querySelector(".bm"));try{localStorage.setItem(K,has?"1":"0")}catch(e){}if(has)show();else hide()}h.__snzBannerDone=done;` +
    `function go(){var E=window.BannerEmbed;if(E&&!h.__snzBanner){h.__snzBanner=E.mount(h,{site:"${site}",api:"${EMBED_ORIGIN}"});h.__snzBanner.ready.then(done,done)}else if(!E)hide()}` +
    `if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go,{once:true});else go()})();`;
};

/* the embed script is normally already on the page (the deferred tag); this only waits for it, and starts a fresh
   load when that tag failed (DOMContentLoaded has passed and window.BannerEmbed is still missing) */
let loading: Promise<void> | undefined;
function loadEmbed(): Promise<void> {
  if (window.BannerEmbed) return Promise.resolve();
  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const fail = () => { loading = undefined; reject(new Error('banner embed failed to load')); };
      const fresh = () => { const s = document.createElement('script'); s.src = EMBED_SRC; s.defer = true; s.addEventListener('load', () => resolve(), { once: true }); s.addEventListener('error', fail, { once: true }); document.head.appendChild(s); };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => (window.BannerEmbed ? resolve() : fresh()), { once: true });
      else fresh();
    });
  }
  return loading;
}

export function PromoBanner({ site = 'mcallen' }: { site?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current as Host | null; if (!host) return;
    let cancelled = false;
    let handle: BannerHandle | undefined = host.__snzBanner; // mounted by the parse-time script: adopt it
    if (!handle) {
      loadEmbed()
        .then(() => {
          if (cancelled) return;
          handle = host.__snzBanner || (window.BannerEmbed ? window.BannerEmbed.mount(host, { site, api: EMBED_ORIGIN }) : undefined);
          if (handle) { host.__snzBanner = handle; const done = () => { if (!cancelled) host.__snzBannerDone?.(); }; handle.ready.then(done, done); }
        })
        .catch(() => { /* the script did not load: the slot stays empty, nothing else on the page is affected */ });
    }
    return () => { cancelled = true; handle?.destroy(); delete host.__snzBanner; };
  }, [site]);

  return (
    <div className={styles.promo} data-promo-banner={site}>
      <link rel="preconnect" href={EMBED_ORIGIN} />
      <link rel="preconnect" href={IMAGE_ORIGIN} />
      <link rel="preload" as="script" href={EMBED_SRC} />
      <script src={EMBED_SRC} defer />
      <div ref={ref} />
      <script dangerouslySetInnerHTML={{ __html: EARLY_MOUNT(site) }} />
    </div>
  );
}
