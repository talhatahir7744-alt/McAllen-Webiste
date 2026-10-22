import type { Locale } from '@/lib/i18n';

/* The announcement ticker items (components/AnnouncementTicker.tsx, the orange marquee strip directly under the
   sticky header on every page). One array per locale, in display order; the component repeats the set twice for
   the seamless loop. Keep the two locales parallel. The dated current offer is NOT a ticker item: it lives in
   lib/offer.ts and shows in the crossing-ribbons band on the home page and in the sales-page header. */
export const TICKER_ITEMS: Record<Locale, readonly string[]> = {
  en: [
    'Shop the Best Mattress Deals Today',
    'King for a Queen Specials or 0% Financing!',
    'Visit Your Local Snooze Today!',
    'Free Delivery on Orders Over $999',
  ],
  es: [
    'Aprovecha Hoy las Mejores Ofertas en Colchones',
    '¡Especiales King al Precio de Queen o Financiamiento al 0%!',
    '¡Visita Hoy tu Snooze más Cercano!',
    'Entrega Gratis en Compras Mayores a $999',
  ],
};
