import { CURRENT_OFFER, isOfferActive } from '@/lib/offer';
import { localizeHref, type Locale } from '@/lib/i18n';

/* The dated "current offer" band (copy + dates in lib/offer.ts), rendered by the home page under the site header in
   both languages. Server-rendered into the static HTML, so it is visible with or without JavaScript; when the offer
   is off or out of date at build time nothing is rendered at all (no hidden markup). The band carries its end date:
   the inline script below removes it from the page if the visitor's clock is already past that date (the days
   between the end of a sale and the next deploy). Styles: overrides/global.css (.snz-offer). */
const EXPIRY_SCRIPT = (endDate: string) => `(function(){var e=document.currentScript&&document.currentScript.parentNode;if(!e)return;var t=new Date('${endDate}T23:59:59-06:00');if(!isNaN(t)&&Date.now()>t.getTime())e.parentNode.removeChild(e)})();`;

export function CurrentOffer({ locale }: { locale: Locale }) {
  if (!isOfferActive()) return null;
  const o = CURRENT_OFFER;
  return (
    <section className="snz-offer" aria-labelledby="snz-offer-title" data-offer-ends={o.endDate || undefined}>
      <div className="snz-offer__inner">
        <p className="snz-offer__eyebrow">{o.eyebrow[locale]}</p>
        <h2 id="snz-offer-title" className="snz-offer__title">{o.headline[locale]}</h2>
        {o.details[locale] ? <p className="snz-offer__text">{o.details[locale]}</p> : null}
        {o.finePrint[locale] ? <p className="snz-offer__fine">{o.finePrint[locale]}</p> : null}
        <a className="snz-offer__cta" href={localizeHref(o.cta.href, locale)}>{o.cta.label[locale]}</a>
      </div>
      {o.endDate ? <script dangerouslySetInnerHTML={{ __html: EXPIRY_SCRIPT(o.endDate) }} /> : null}
    </section>
  );
}
