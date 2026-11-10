import { activeSlides, fetchBanners } from '@/lib/banners';
import { LOCATION } from '@/lib/location';
import type { Locale } from '@/lib/i18n';
import { PromoSlide } from './PromoSlide';
import { PromoCarousel } from './PromoCarousel';
import styles from './PromoBanner.module.css';

/* The promo banner slot (home page, / and /es; November 2026). Reads the shared banner feed (lib/banners.ts) for this
   store's slug and today's date in its time zone. No eligible slide → nothing at all (no empty band). One slide → a
   static picture, no JavaScript. Two or more → the small carousel (components/PromoCarousel.tsx), with every slide in
   the server HTML so crawlers and no-JS visitors get them (the first one shows). This site is a static export, so this
   runs when the site builds (see lib/banners.ts). */
const LABEL: Record<Locale, string> = { en: 'Promotions', es: 'Promociones' };

export async function PromoBanner({ locale }: { locale: Locale }) {
  const { slides, interval } = activeSlides(await fetchBanners(), LOCATION.slug, LOCATION.timeZone);
  if (!slides.length) return null;
  if (slides.length === 1) {
    return (
      <section className={styles.promo} aria-label={LABEL[locale] || LABEL.en} data-promo-banner="static">
        <div className={styles.frame}>
          <PromoSlide slide={slides[0]} index={0} active />
        </div>
      </section>
    );
  }
  return <PromoCarousel slides={slides} interval={interval} locale={locale} label={LABEL[locale] || LABEL.en} />;
}
