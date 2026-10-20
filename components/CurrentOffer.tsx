import { CURRENT_OFFER, isOfferActive, offerDates } from '@/lib/offer';
import { localizeHref, ui, type Locale } from '@/lib/i18n';

/* The dated "current offer" band (copy + dates in lib/offer.ts), rendered by the home page under the site header in
   both languages. Server-rendered into the static HTML, so it is visible with or without JavaScript; when the offer
   is off or out of date nothing is rendered at all (no hidden markup). Styles: overrides/global.css (.snz-offer). */
export function CurrentOffer({ locale }: { locale: Locale }) {
  if (!isOfferActive()) return null;
  const o = CURRENT_OFFER;
  const dates = offerDates(locale);
  return (
    <section className="snz-offer" aria-labelledby="snz-offer-title">
      <div className="snz-offer__inner">
        <p className="snz-offer__eyebrow">{o.eyebrow[locale]}</p>
        <h2 id="snz-offer-title" className="snz-offer__title">{o.headline[locale]}</h2>
        {o.details[locale] ? <p className="snz-offer__text">{o.details[locale]}</p> : null}
        {dates ? <p className="snz-offer__dates">{dates}</p> : null}
        {o.finePrint[locale] ? <p className="snz-offer__fine">{o.finePrint[locale]}</p> : null}
        <a className="snz-offer__cta" href={localizeHref(o.cta.href, locale)}>{ui(locale).footer.book}</a>
      </div>
    </section>
  );
}
