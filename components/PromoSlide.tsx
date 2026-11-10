import type { CSSProperties } from 'react';
import type { ActiveSlide } from '@/lib/banners';
import styles from './PromoBanner.module.css';

/* One promo slide: the phone art below 768px, the desktop art from 768px, each with its natural size from the feed (any
   ratio), inside a link when the slide has one (its accessible name is the image's alt). The first slide is the page's
   likely LCP image, so it loads eagerly at high priority; the rest load lazily. A slide that is not showing is inert
   (not focusable, not read out). data-banner carries the banner id for the click event (public/snz-events.js). Shared
   by the static single banner (components/PromoBanner.tsx) and the carousel (components/PromoCarousel.tsx). */
export function PromoSlide({ slide, index, active }: { slide: ActiveSlide; index: number; active: boolean }) {
  const picture = (
    <picture>
      <source media="(max-width: 767px)" srcSet={slide.mobile} width={slide.mobileW} height={slide.mobileH} />
      {/* eslint-disable-next-line @next/next/no-img-element -- the feed's art is already WebP at its final size */}
      <img
        src={slide.desktop}
        width={slide.desktopW}
        height={slide.desktopH}
        alt={slide.alt}
        loading={index === 0 ? 'eager' : 'lazy'}
        fetchPriority={index === 0 ? 'high' : undefined}
        decoding={index === 0 ? undefined : 'async'}
      />
    </picture>
  );
  const className = `${styles.slide}${active ? ` ${styles.active}` : ''}`;
  return slide.href ? (
    <a href={slide.href} className={className} data-banner={slide.bannerId} inert={!active || undefined}>{picture}</a>
  ) : (
    <div className={className} data-banner={slide.bannerId} inert={!active || undefined}>{picture}</div>
  );
}

/* The frame takes the FIRST slide's shape and size: its aspect ratio (desktop art from 768px, phone art below) and, as
   the widest it may get, its natural width, so the art is never upscaled; the container caps it at 100%. Set as CSS
   custom properties in the server HTML, so the box is right before any image or script loads (no layout shift). */
export function frameStyle(first: ActiveSlide): CSSProperties {
  return {
    '--pb-ar-d': `${first.desktopW} / ${first.desktopH}`,
    '--pb-w-d': `${first.desktopW}px`,
    '--pb-ar-m': `${first.mobileW} / ${first.mobileH}`,
    '--pb-w-m': `${first.mobileW}px`,
  } as CSSProperties;
}
