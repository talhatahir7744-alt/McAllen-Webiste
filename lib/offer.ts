/* The site's current promotion: ONE place to edit (copy + dates), rendered by components/CurrentOffer.tsx on the
   home page (EN + ES) directly under the header. It replaced the builder's expired "Memorial Day Savings Event /
   Save up to 75% … until June 6th" block (SEO audit, October 2026), which was removed from the page markup and the
   page payload (overrides.json → removeElements: section-g0BQMsgMwp).

   The site is a static export: `isOfferActive` is evaluated when the site is BUILT, not per visit. Deploy (or
   schedule a redeploy) on the day an offer starts and the day after it ends. Nothing is hidden with CSS or JS:
   when the offer is off, the band is simply not in the HTML. */
export type OfferCopy = { en: string; es: string };
export type OfferConfig = {
  enabled: boolean;
  startDate: string; // 'YYYY-MM-DD' in store time (America/Chicago); '' = no start limit
  endDate: string; // 'YYYY-MM-DD'; the band shows through the end of this day; '' = no end limit
  eyebrow: OfferCopy;
  headline: OfferCopy;
  details: OfferCopy; // the offer itself, one or two sentences, as approved by the client
  finePrint: OfferCopy; // terms / exclusions, as approved by the client
  cta: { href: string }; // the label is the footer's booking CTA (lib/i18n.ts), one wording site-wide
};

export const CURRENT_OFFER: OfferConfig = {
  /* NEEDS CLIENT INPUT — flip to true only with the client's approved offer copy, terms and dates. */
  enabled: false,
  startDate: '',
  endDate: '',
  eyebrow: { en: 'Current offer', es: 'Oferta actual' },
  headline: { en: 'Current offer — pending client approval', es: 'Oferta actual — pendiente de aprobación del cliente' },
  details: { en: '', es: '' },
  finePrint: { en: '', es: '' },
  cta: { href: '/booking' },
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

/** "Valid May 1, 2026 – June 6, 2026" / "Válido del 1 de mayo de 2026 al 6 de junio de 2026" (empty when no dates are set) */
export function offerDates(locale: 'en' | 'es'): string {
  const { startDate, endDate } = CURRENT_OFFER;
  if (!startDate && !endDate) return '';
  const fmt = (d: string) => new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${d}T00:00:00Z`));
  if (locale === 'es') return startDate && endDate ? `Válido del ${fmt(startDate)} al ${fmt(endDate)}` : startDate ? `Válido a partir del ${fmt(startDate)}` : `Válido hasta el ${fmt(endDate)}`;
  return startDate && endDate ? `Valid ${fmt(startDate)} – ${fmt(endDate)}` : startDate ? `Valid from ${fmt(startDate)}` : `Valid through ${fmt(endDate)}`;
}
