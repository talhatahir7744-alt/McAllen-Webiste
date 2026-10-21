import { CURRENT_OFFER, isOfferActive } from '@/lib/offer';
import { localizeHref, type Locale } from '@/lib/i18n';

/* Top of the sales page (EN + ES), above the builder's offer blocks: the dated current-offer header (lib/offer.ts,
   rendered only while the offer window is open at build time) and a short, undated "How mattress sales work at
   Snooze" intro that only restates what the site already says (free Dream Mapping fitting, the brands in the showroom,
   financing partners, delivery on orders over $999). The seven existing offers follow unchanged. Styles: global.css. */
const COPY = {
  en: {
    howTitle: 'How mattress sales work at Snooze',
    how: [
      'Every sale at Snooze Mattress + Wellness starts the same way: a free Dream Mapping fitting. In about five minutes the pressure-mapping bed shows which mattresses fit your body, so the offer you leave with is one that actually suits how you sleep.',
      'Sale pricing applies to the brands on the showroom floor in McAllen, including Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, King Koil, Englander, Spring Air, Helix, Puffy and Snooze-O-Pedic. Financing is available through Synchrony, Wells Fargo and Snap, and delivery is free on orders over $999.',
      'Details, dates and any exclusions for a specific offer are confirmed in store at 7913 N 10th St, Suite 130, McAllen, TX 78504, or by phone at (956) 586-5646.',
    ],
  },
  es: {
    howTitle: 'Cómo funcionan las ofertas de colchones en Snooze',
    how: [
      'Toda oferta en Snooze Mattress + Wellness empieza igual: con una sesión gratis de Dream Mapping. En unos cinco minutos, la cama de mapeo de presión muestra qué colchones se ajustan a tu cuerpo, así que la oferta con la que te vas es una que de verdad va con tu forma de dormir.',
      'Los precios de oferta aplican a las marcas de la sala de exhibición en McAllen, entre ellas Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, King Koil, Englander, Spring Air, Helix, Puffy y Snooze-O-Pedic. Hay financiamiento con Synchrony, Wells Fargo y Snap, y la entrega es gratis en compras mayores de $999.',
      'Los detalles, fechas y exclusiones de cada oferta se confirman en la tienda, en 7913 N 10th St, Suite 130, McAllen, TX 78504, o por teléfono al (956) 586-5646.',
    ],
  },
};
const EXPIRY_SCRIPT = (endDate: string) => `(function(){var e=document.currentScript&&document.currentScript.parentNode;if(!e)return;var t=new Date('${endDate}T23:59:59-06:00');if(!isNaN(t)&&Date.now()>t.getTime())e.parentNode.removeChild(e)})();`;

export function SalesIntro({ locale }: { locale: Locale }) {
  const t = COPY[locale] || COPY.en;
  const o = CURRENT_OFFER;
  const active = isOfferActive();
  return (
    <section className="snz-sales-intro" aria-label={t.howTitle}>
      {active ? (
        <div className="snz-offer snz-offer--sales" data-offer-ends={o.endDate || undefined}>
          <div className="snz-offer__inner">
            <p className="snz-offer__eyebrow">{o.eyebrow[locale]}</p>
            <h2 className="snz-offer__title">{o.headline[locale]}</h2>
            {o.details[locale] ? <p className="snz-offer__text">{o.details[locale]}</p> : null}
            <a className="snz-offer__cta" href={localizeHref('/booking', locale)}>{locale === 'es' ? 'Reserva tu Dream Mapping gratis' : 'Book your free Dream Mapping'}</a>
          </div>
          {o.endDate ? <script dangerouslySetInnerHTML={{ __html: EXPIRY_SCRIPT(o.endDate) }} /> : null}
        </div>
      ) : null}
      <div className="snz-sales-intro__inner">
        <h2 className="snz-sales-intro__title">{t.howTitle}</h2>
        {t.how.map((p, i) => <p key={i} className="snz-sales-intro__text">{p}</p>)}
      </div>
    </section>
  );
}
