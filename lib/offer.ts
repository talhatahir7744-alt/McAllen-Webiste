/* The site's current promotion: ONE place to edit (copy + dates), read by scripts/ribbon-band.mjs (the crossing-ribbons
   band under the home page hero, EN + ES), and by the sales page's metadata (title / description name the sale while it is on). It replaced the builder's expired
   "Memorial Day Savings Event / Save up to 75% … until June 6th" block (SEO audit, October 2026), which was removed
   from the page markup and the page payload (overrides.json -> removeElements: section-g0BQMsgMwp).

   The site is a static export: `isOfferActive` is evaluated when the site is BUILT, not per visit, so the band is
   simply not in the HTML outside the offer window — deploy (or schedule a redeploy) on the day an offer starts and
   the day after it ends. As a safety net for the days between the end date and the next deploy, the rendered band
   also carries its end date and a tiny inline script hides it once the visitor's clock is past that date. */
export type OfferCopy = { en: string; es: string };
export type OfferConfig = {
  enabled: boolean;
  startDate: string; // 'YYYY-MM-DD' in store time (America/Chicago); '' = no start limit (the band announces the sale ahead of it)
  endDate: string; // 'YYYY-MM-DD'; the band shows through the end of this day; '' = no end limit
  eyebrow: OfferCopy;
  headline: OfferCopy;
  details: OfferCopy; // the offer itself, as approved by the client
  finePrint: OfferCopy; // terms / exclusions, as approved by the client
  cta: { href: string; label: OfferCopy };
};

export const CURRENT_OFFER: OfferConfig = {
  /* Client-approved (October 21, 2026): Black Friday Sale, November 3 – December 1, 2026, details in store. */
  enabled: true,
  startDate: '', // announced from now; the dates are in the copy
  endDate: '2026-12-01',
  eyebrow: { en: 'Current offer', es: 'Oferta actual' },
  headline: { en: 'Black Friday Sale', es: 'Venta de Black Friday' },
  details: { en: 'November 3 – December 1 · See in store for details', es: '3 de noviembre – 1 de diciembre · Pregunta en tienda por los detalles' },
  finePrint: { en: '', es: '' },
  cta: { href: '/mattress-sales', label: { en: 'See the sale', es: 'Ver las ofertas' } },
};

const STORE_TZ = 'America/Chicago';
/** today's date (YYYY-MM-DD) in the store's time zone */
export const storeToday = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: STORE_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

export function isOfferActive(now = new Date()): boolean {
  if (!CURRENT_OFFER.enabled) return false;
  const today = storeToday(now);
  if (CURRENT_OFFER.startDate && today < CURRENT_OFFER.startDate) return false;
  if (CURRENT_OFFER.endDate && today > CURRENT_OFFER.endDate) return false;
  return true;
}

/** one short line for places that only have room for text (the promotions ticker, the sales-page title) */
export function offerLine(locale: 'en' | 'es'): string {
  return locale === 'es' ? 'Venta de Black Friday · 3 de noviembre – 1 de diciembre' : 'Black Friday Sale · November 3 – December 1';
}
