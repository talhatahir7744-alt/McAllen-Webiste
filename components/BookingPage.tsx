import Script from 'next/script';
import { SITE } from './site-config';
import { LOCATION } from '@/lib/location';
import { PageSchema } from './PageSchema';
import { Icon, type IconName } from './icons';
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
   The calendar is the client's exact embed placed directly in the page body: no wrapper, no container, no card.
   form_embed.js loads after the iframe exists and resizes the iframe to the widget's content at every step; the page
   scrolls, the iframe never does. CALENDAR_HEIGHT_GUARD below corrects the one height the widget gets wrong. */

const COPY = {
  en: {
    title: 'Take the First Step Towards',
    highlight: 'Deep Restorative Sleep!',
    sub: 'Book your personalized Dream Mapping Appointment to ',
    subStrong: 'discover your perfect mattress.',
    almost: 'Almost There…',
    /* "What happens at your Dream Mapping visit" (SEO audit build pass, D2): the fitting as the site already describes it */
    visitEyebrow: 'Your visit',
    visitTitle: 'What happens at your Dream Mapping visit',
    visitSteps: [
      'You lie down on the Dream Mapping sensor bed in the position you usually sleep in, and the sensors map where your body carries pressure.',
      'The map takes about five minutes.',
      'A Sleep Coach reads the map with you and walks you to the mattresses that match it, instead of you trying every bed in the store.',
      'It is free, and there is no obligation to buy.',
      'Couples are welcome: each of you is mapped individually, so the mattress works for both.',
    ],
    pickTime: 'Pick a Time Above',
    questions: (phone: string) => `Questions? Call ${phone}`,
  },
  es: {
    title: '¡Da el Primer Paso Hacia un',
    highlight: 'Sueño Profundo y Reparador!',
    sub: 'Agenda tu cita personalizada de Dream Mapping y ',
    subStrong: 'descubre tu colchón perfecto.',
    almost: 'Ya casi…',
    visitEyebrow: 'Tu visita',
    visitTitle: 'Qué pasa en tu visita de Dream Mapping',
    visitSteps: [
      'Te recuestas en la cama con sensores de Dream Mapping en la posición en la que normalmente duermes, y los sensores mapean dónde carga presión tu cuerpo.',
      'El mapa tarda unos cinco minutos.',
      'Un Sleep Coach lee el mapa contigo y te lleva a los colchones que coinciden con él, en lugar de que pruebes todas las camas de la tienda.',
      'Es gratis y no hay obligación de comprar.',
      'Las parejas son bienvenidas: se mapea a cada uno por separado, para que el colchón funcione para los dos.',
    ],
    pickTime: 'Elige un horario arriba',
    questions: (phone: string) => `¿Preguntas? Llama al ${phone}`,
  },
};
/* one icon per step: the sensor bed, the five minutes, the Sleep Coach, free with no obligation, couples */
const VISIT_ICONS: IconName[] = ['sensor-bed', 'clock', 'user', 'badge-check', 'people'];

/* McAllen Dream Mapping calendar (the client's embed: id = `<calendarId>_<timestamp>`) */
export const BOOKING_CALENDAR_ID = 'lrAns7Z8j3vEJW3DC0Yr';
const BOOKING_EMBED_ID = `${BOOKING_CALENDAR_ID}_1788459899479`;

/* Height guard for the calendar iframe (October 27, 2026; made deterministic October 28, 2026).
   The widget reports its height two ways: iframe-resizer messages ("[iFrameSizer]<id>:<height>:<width>:<trigger>"), which
   form_embed.js applies (the reported height + 5px), and its own "highlevel.setHeight" message (sent at load only, the
   widget body + 50px), which form_embed.js ignores. In the widget's wide layout (iframe 1024px and wider) the time slots
   and the details form scroll inside the widget and its body stays about 780px, but after the slots render the resizer
   sometimes reports the slot list's full length (1,400–2,700px); applied, that left a tall white band under the calendar.
   The first version put the good height back with a zero-delay timer, but form_embed.js applies every resize after the
   first inside a requestAnimationFrame, which normally runs after that timer, so in a real browser the bad height stuck.
   Now the listener (registered at parse time, so before form_embed.js's) stops such a report before form_embed.js sees it
   (stopImmediatePropagation): the bad height is never applied, nothing to race. Resizer reports above 1,200px in the
   wide layout are stopped, except the very first "init" before any good report: form_embed.js needs that one (its first
   resize reveals the iframe), so it is let through and corrected once form_embed.js has applied it. Every other
   report, and every report in the narrow and medium layouts (phones, tablets: stacked slots and forms are legitimately
   1,200–2,400px), passes untouched, so form_embed.js stays what sizes the calendar. The site's offline shim (lib/ghl-shim.ts)
   leaves this frame alone (data-snz-resizer="form_embed"): its own handshake asked the widget for "lowestElement" heights,
   the source of those over-reports, and it applied every report a second time. form_embed.js also switches the
   iframe to scrolling="yes"; the guard puts back the embed's scrolling="no", so the frame never shows a scrollbar of
   its own (it is always as tall as the widget; the wide layout's slot list scrolls inside the widget, by design).
   Fallbacks: if no height has been set 1.5 s after the widget's own message, the last good resizer height is applied,
   else the widget's own figure in the same terms (−45px). If form_embed.js never loads (blocked, offline), the guard
   makes the resizer handshake itself ("offset" heights, as form_embed.js asks) and applies the reports. */
const CALENDAR_HEIGHT_GUARD = `(function(){var ID=${JSON.stringify(BOOKING_EMBED_ID)},WIDE=1024,MAX_WIDE=1200,good=0,own=0,sized=0,asks=0;
function frame(){return document.getElementById(ID)}
function apply(h){var f=frame();if(!f||!(h>0))return;h=Math.round(h);if(f.style.height!==h+'px')f.style.height=h+'px'}
function fallback(){return good||(own>100?own-45:0)}
function vendor(){return typeof window.iFrameResize==='function'}
function ask(){var f=frame();if(!f||sized||vendor()||asks>=4)return;asks++;try{f.contentWindow.postMessage('[iFrameSizer]'+ID+':8:false:false:32:true:true:0:offset:null:null:0:false:parent:scroll:false','*')}catch(x){}setTimeout(ask,1500)}
window.addEventListener('message',function(e){if(!/^https:\\/\\/[a-z0-9.-]+\\.snoozesleep\\.com$/.test(e.origin||''))return;
var f=frame();if(!f)return;if(f.getAttribute('scrolling')!=='no')f.setAttribute('scrolling','no');var d=e.data,wide=f.getBoundingClientRect().width>=WIDE;
if(typeof d==='string'){var m=d.match(/^\\[iFrameSizer\\]([^:]+):([\\d.]+):[\\d.]+:(\\w+)/);if(!m||m[1]!==ID)return;var h=parseFloat(m[2]);sized=1;
if(wide&&h>MAX_WIDE){if(m[3]!=='init'||good){e.stopImmediatePropagation();apply(fallback());return}setTimeout(function(){apply(fallback()||785)},100);setTimeout(function(){apply(fallback()||785)},400);return}
good=h+5;if(!vendor())apply(good);return}
if(d&&d[0]==='highlevel.setHeight'&&d[1]&&d[1].height>0){own=+d[1].height;setTimeout(function(){var g=frame();if(g&&!g.style.height)apply(fallback())},1500);setTimeout(ask,4000)}})})();`;

export function BookingPage({ locale = 'en' }: { locale?: Locale }) {
  const t = COPY[locale] || COPY.en;
  return (
    <>
      <PageSchema items={[serviceSchema(locale)]} />
      {/* one main landmark; the hero is a div so the site header stays the page's only banner */}
      <main className={styles.main}>
      <div className={styles.hero}>
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
      </div>

      <iframe
        className={styles.calendar}
        src={`https://link.snoozesleep.com/widget/booking/${BOOKING_CALENDAR_ID}`}
        title={locale === 'es' ? 'Calendario de citas de Dream Mapping' : 'Dream Mapping booking calendar'}
        allow="payment"
        style={{ width: '100%', border: 'none', overflow: 'hidden' }}
        scrolling="no"
        id={BOOKING_EMBED_ID}
        data-snz-resizer="form_embed"
      />
      <script dangerouslySetInnerHTML={{ __html: CALENDAR_HEIGHT_GUARD }} />

      <section className={styles.visit} aria-labelledby="visit-title">
        <div className={styles.visitInner}>
          <p className={styles.visitEyebrow}>{t.visitEyebrow}</p>
          <h2 id="visit-title" className={styles.visitTitle}>{t.visitTitle}</h2>
          <span className={styles.flourish} aria-hidden="true" />
          <ol className={styles.steps}>
            {t.visitSteps.map((step, i) => (
              <li key={i} className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.stepIcon}><Icon name={VISIT_ICONS[i]} /></span>
                <p className={styles.stepText}>{step}</p>
              </li>
            ))}
          </ol>
          <div className={styles.visitCtas}>
            <a className={styles.visitBtn} href={`#${BOOKING_EMBED_ID}`}>{t.pickTime}</a>
            <a className={styles.visitCall} href={SITE.phoneHref}><Icon name="phone" /> {t.questions(SITE.phone)}</a>
          </div>
        </div>
      </section>
      </main>
      <Script src="https://link.snoozesleep.com/js/form_embed.js" strategy="afterInteractive" />
    </>
  );
}
