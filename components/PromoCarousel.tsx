'use client';
import { useEffect, useRef, useState } from 'react';
import type { ActiveSlide } from '@/lib/banners';
import type { Locale } from '@/lib/i18n';
import { PromoSlide } from './PromoSlide';
import styles from './PromoBanner.module.css';

/* The promo carousel (2–8 slides; components/PromoBanner.tsx decides). No library. Every slide is in the server HTML
   (the first one shows without JavaScript); they cross-fade in one fixed-ratio frame, so nothing moves.
   - advances every `interval` seconds and loops; stops while the pointer is over it, while anything in it has focus,
     while the tab is hidden, and entirely for people who prefer reduced motion (they still have dots, arrows, keys);
   - dots under the art (orange = showing), prev/next arrows on desktop, ←/→ keys while focus is inside;
   - the polite live region reads "Banner N of M: <alt>" when someone changes the slide (not on the automatic advance,
     which would talk over the page every few seconds);
   - dataLayer: promo_banner_view { banner_id } the first time each slide is shown on a page view; the click event
     (promo_banner_click) comes from the delegated handler in public/snz-events.js via data-banner. */
type DL = Array<Record<string, unknown>>;
const T: Record<Locale, { of: (n: number, m: number) => string; prev: string; next: string }> = {
  en: { of: (n, m) => `Banner ${n} of ${m}`, prev: 'Previous banner', next: 'Next banner' },
  es: { of: (n, m) => `Banner ${n} de ${m}`, prev: 'Banner anterior', next: 'Banner siguiente' },
};

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}

export function PromoCarousel({ slides, interval, locale, label }: { slides: ActiveSlide[]; interval: number; locale: Locale; label: string }) {
  const t = T[locale] || T.en;
  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(true); // no auto-advance until the preference is known
  const [announce, setAnnounce] = useState('');
  const seen = useRef<Set<number>>(new Set());

  const go = (to: number) => {
    const k = (to + n) % n;
    setIndex(k);
    setAnnounce(`${t.of(k + 1, n)}: ${slides[k].alt}`);
  };

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(m.matches);
    const vis = () => setHidden(document.hidden);
    sync(); vis();
    m.addEventListener('change', sync);
    document.addEventListener('visibilitychange', vis);
    return () => { m.removeEventListener('change', sync); document.removeEventListener('visibilitychange', vis); };
  }, []);

  // the next step is scheduled from the slide that is showing, so a manual change restarts the full interval
  useEffect(() => {
    if (reduced || hover || focus || hidden) return;
    const id = window.setTimeout(() => setIndex((k) => (k + 1) % n), interval * 1000);
    return () => window.clearTimeout(id);
  }, [index, reduced, hover, focus, hidden, interval, n]);

  useEffect(() => {
    if (seen.current.has(index)) return;
    seen.current.add(index);
    const w = window as unknown as { dataLayer?: DL };
    (w.dataLayer = w.dataLayer || []).push({ event: 'promo_banner_view', banner_id: slides[index].bannerId, page_path: location.pathname.replace(/\/+$/, '') || '/' });
  }, [index, slides]);

  return (
    <section
      className={styles.promo}
      aria-roledescription="carousel"
      aria-label={label}
      data-promo-banner="carousel"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocus(false); }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
      }}
    >
      <div className={styles.frame}>
        {slides.map((s, i) => <PromoSlide key={i} slide={s} index={i} active={i === index} />)}
        <button type="button" className={`${styles.arrow} ${styles.prev}`} aria-label={t.prev} onClick={() => go(index - 1)}><Chevron dir="left" /></button>
        <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label={t.next} onClick={() => go(index + 1)}><Chevron dir="right" /></button>
      </div>
      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button key={i} type="button" className={styles.dot} aria-label={t.of(i + 1, n)} aria-current={i === index ? 'true' : undefined} onClick={() => go(i)} />
        ))}
      </div>
      <p className={styles.live} aria-live="polite" aria-atomic="true">{announce}</p>
    </section>
  );
}
