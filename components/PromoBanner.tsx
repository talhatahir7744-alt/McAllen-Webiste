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
   base is passed explicitly: the script would otherwise take it from the <script> tag it was loaded by. Mounted on
   the home pages only (/ and /es), full-bleed directly under the announcement ticker. */
const EMBED_ORIGIN = 'https://snooze-banner-self.vercel.app';
const EMBED_SRC = `${EMBED_ORIGIN}/embed.js`;
const IMAGE_ORIGIN = 'https://gfpw6bkqb3wzayp0.public.blob.vercel-storage.com'; // the banner app's image store (Vercel Blob)

type BannerHandle = { ready: Promise<void>; destroy(): void };
type Host = HTMLDivElement & { __snzBanner?: BannerHandle };
declare global {
  interface Window {
    BannerEmbed?: { mount(el: Element, opts: { site: string; api?: string }): BannerHandle; version: string };
  }
}

/* runs while the HTML parses (before React): mounts the embed at DOMContentLoaded, by which time the deferred embed
   script has run; the handle lives on the host so the component below can adopt it. It also remembers (localStorage,
   per visitor, best effort) whether the last visit showed a banner: if so, the box is reserved at the embed's ratio
   before first paint with a <style> added to <head> (removed once the embed has rendered), so the page does not jump
   when the banner arrives on return visits; a first-ever visit cannot know and shifts once. */
const EARLY_MOUNT = (site: string) =>
  `(function(){var h=document.querySelector('[data-promo-banner="${site}"]>div');if(!h)return;var K="snzPromoBanner",st=null;` +
  `try{if(localStorage.getItem(K)==="1"){st=document.createElement("style");st.textContent='[data-promo-banner="${site}"]>div{aspect-ratio:1920/500}@media(max-width:767px){[data-promo-banner="${site}"]>div{aspect-ratio:800/600}}';document.head.appendChild(st)}}catch(e){}` +
  `function done(){var has=!!(h.shadowRoot&&h.shadowRoot.querySelector(".bm"));try{localStorage.setItem(K,has?"1":"0")}catch(e){}if(st){st.remove();st=null}}` +
  `function go(){var E=window.BannerEmbed;if(E&&!h.__snzBanner){h.__snzBanner=E.mount(h,{site:"${site}",api:"${EMBED_ORIGIN}"});h.__snzBanner.ready.then(done,done)}else if(!E&&st){st.remove();st=null}}` +
  `if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go,{once:true});else go()})();`;

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
          if (handle) { host.__snzBanner = handle; handle.ready.catch(() => {}); }
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
