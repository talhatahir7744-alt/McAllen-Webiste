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
   Client-only: the script is added on mount (once per page; skipped when window.BannerEmbed already exists), then
   BannerEmbed.mount() renders into the host div; destroy() runs on unmount, and a load that finishes after unmount is
   ignored (`cancelled`). The API base is passed explicitly: the script would otherwise take it from the <script> tag
   it was loaded by. Mounted on the home pages only (/ and /es), full-bleed directly under the announcement ticker. */
const EMBED_ORIGIN = 'https://snooze-banner-self.vercel.app';
const EMBED_SRC = `${EMBED_ORIGIN}/embed.js`;

type BannerHandle = { ready: Promise<void>; destroy(): void };
declare global {
  interface Window {
    BannerEmbed?: { mount(el: Element, opts: { site: string; api?: string }): BannerHandle; version: string };
  }
}

let loading: Promise<void> | undefined; // one script tag per page, however many instances mount
function loadEmbed(): Promise<void> {
  if (window.BannerEmbed) return Promise.resolve();
  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SRC}"]`);
      const script = existing ?? document.createElement('script');
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => { loading = undefined; reject(new Error('banner embed failed to load')); }, { once: true });
      if (!existing) { script.src = EMBED_SRC; script.defer = true; document.head.appendChild(script); }
    });
  }
  return loading;
}

export function PromoBanner({ site = 'mcallen' }: { site?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let handle: BannerHandle | undefined;
    loadEmbed()
      .then(() => {
        if (cancelled || !ref.current || !window.BannerEmbed) return;
        handle = window.BannerEmbed.mount(ref.current, { site, api: EMBED_ORIGIN });
        handle.ready.catch(() => {});
      })
      .catch(() => { /* the script did not load: the slot stays empty, nothing else on the page is affected */ });
    return () => { cancelled = true; handle?.destroy(); };
  }, [site]);

  return (
    <div className={styles.promo} data-promo-banner={site}>
      <div ref={ref} />
    </div>
  );
}
