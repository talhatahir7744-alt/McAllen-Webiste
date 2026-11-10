import type { ActiveSlide } from '@/lib/banners';
import styles from './PromoBanner.module.css';

/* One promo slide: the phone art (800×600) below 768px, the desktop art (1920×500) from 768px, inside a link when the
   slide has one (its accessible name is the image's alt). The first slide is the page's likely LCP image, so it loads
   eagerly at high priority; the rest load lazily. A slide that is not showing is inert (not focusable, not read out).
   data-banner carries the banner id for the click event (public/snz-events.js). Shared by the static single banner
   (components/PromoBanner.tsx) and the carousel (components/PromoCarousel.tsx). */
export function PromoSlide({ slide, index, active }: { slide: ActiveSlide; index: number; active: boolean }) {
  const picture = (
    <picture>
      <source media="(max-width: 767px)" srcSet={slide.mobile} width={800} height={600} />
      {/* eslint-disable-next-line @next/next/no-img-element -- the feed's art is already WebP at its final size */}
      <img
        src={slide.desktop}
        width={1920}
        height={500}
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
