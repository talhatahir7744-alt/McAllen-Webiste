import Script from 'next/script';
import { SITE } from './site-config';
import { LOCATION } from '@/lib/location';
import { PageSchema } from './PageSchema';
import type { Locale } from '@/lib/i18n';
import styles from './BookingPage.module.css';

/* Service schema for the Dream Mapping fitting (SEO audit, October 2026 — section 5d): free, about 5 minutes,
   in the McAllen store — the three facts the audit supplied. Provider = the store's LocalBusiness record
   (components/LocalBusinessJsonLd.tsx, @id …/#store), rendered by the footer on this page too. */
const SITE_URL = 'https://mcallen.snoozemattresscompany.com';
const serviceSchema = (locale: Locale) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}/booking#service`,
  name: 'Dream Mapping',
  serviceType: locale === 'es' ? 'Ajuste de colchón por mapeo de presión' : 'Mattress fitting by pressure mapping',
  description: locale === 'es'
    ? 'Sesión gratuita de Dream Mapping en la tienda de McAllen: en unos 5 minutos, el mapeo de presión identifica el colchón que se ajusta a tu forma de dormir.'
    : 'Free in-store Dream Mapping fitting at the McAllen store: in about 5 minutes, pressure mapping identifies the mattress that fits the way you sleep.',
  url: `${SITE_URL}${locale === 'es' ? '/es' : ''}/booking`,
  provider: { '@type': 'LocalBusiness', '@id': `${SITE_URL}/#store`, name: LOCATION.name },
  areaServed: LOCATION.areaServed.map((city) => ({ '@type': 'City', name: city })),
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStoreOnly', url: `${SITE_URL}${locale === 'es' ? '/es' : ''}/booking` },
  hoursAvailable: LOCATION.openingHours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map((d) => `https://schema.org/${d}`), opens: h.opens, closes: h.closes })),
});

/* The Dream Mapping booking page, hand-written (not generated from the GoHighLevel export).
   The calendar is the client's exact embed placed directly in the page body: no wrapper, no container,
   no card, no height or overflow rule anywhere around it. form_embed.js loads after the iframe exists and
   resizes the iframe to the widget's content at every step; the page scrolls, the iframe never does. */

const COPY = {
  en: {
    title: 'Take the First Step Towards',
    highlight: 'Deep Restorative Sleep!',
    sub: 'Book your personalized Dream Mapping Appointment to ',
    subStrong: 'discover your perfect mattress.',
    almost: 'Almost There…',
    /* "What happens at your Dream Mapping visit" (SEO audit build pass, D2): the fitting as the site already describes it */
    visitTitle: 'What happens at your Dream Mapping visit',
    visitSteps: [
      'You lie down on the Dream Mapping sensor bed in the position you usually sleep in, and the sensors map where your body carries pressure.',
      'The map takes about five minutes.',
      'A Sleep Coach reads the map with you and walks you to the mattresses that match it, instead of you trying every bed in the store.',
      'It is free, and there is no obligation to buy.',
      'Couples are welcome: each of you is mapped individually, so the mattress works for both.',
    ],
  },
  es: {
    title: '¡Da el Primer Paso Hacia un',
    highlight: 'Sueño Profundo y Reparador!',
    sub: 'Agenda tu cita personalizada de Dream Mapping y ',
    subStrong: 'descubre tu colchón perfecto.',
    almost: 'Ya casi…',
    visitTitle: 'Qué pasa en tu visita de Dream Mapping',
    visitSteps: [
      'Te recuestas en la cama con sensores de Dream Mapping en la posición en la que normalmente duermes, y los sensores mapean dónde carga presión tu cuerpo.',
      'El mapa tarda unos cinco minutos.',
      'Un Sleep Coach lee el mapa contigo y te lleva a los colchones que coinciden con él, en lugar de que pruebes todas las camas de la tienda.',
      'Es gratis y no hay obligación de comprar.',
      'Las parejas son bienvenidas: se mapea a cada uno por separado, para que el colchón funcione para los dos.',
    ],
  },
};

/* McAllen Dream Mapping calendar (the client's embed: id = `<calendarId>_<timestamp>`) */
export const BOOKING_CALENDAR_ID = 'lrAns7Z8j3vEJW3DC0Yr';
const BOOKING_EMBED_ID = `${BOOKING_CALENDAR_ID}_1788459899479`;

export function BookingPage({ locale = 'en' }: { locale?: Locale }) {
  const t = COPY[locale] || COPY.en;
  return (
    <>
      <PageSchema items={[serviceSchema(locale)]} />
      <header className={styles.hero}>
        <img className={styles.logo} src={SITE.logo} alt={SITE.logoAlt} width={190} height={53} />
        <h1 className={styles.title}>
          {t.title} <span className={styles.highlight}>{t.highlight}</span>
        </h1>
        <p className={styles.sub}>
          {t.sub}
          <strong>{t.subStrong}</strong>
        </p>
        <div className={styles.progress} aria-label={t.almost}>
          <span className={styles.progressFill}>{t.almost}</span>
        </div>
      </header>

      <iframe
        className={styles.calendar}
        src={`https://link.snoozesleep.com/widget/booking/${BOOKING_CALENDAR_ID}`}
        allow="payment"
        style={{ width: '100%', border: 'none', overflow: 'hidden' }}
        scrolling="no"
        id={BOOKING_EMBED_ID}
      />
      <br />
      <section className={styles.visit} aria-labelledby="visit-title">
        <h2 id="visit-title" className={styles.visitTitle}>{t.visitTitle}</h2>
        <ol className={styles.visitSteps}>
          {t.visitSteps.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </section>
      <Script src="https://link.snoozesleep.com/js/form_embed.js" strategy="afterInteractive" />
    </>
  );
}
