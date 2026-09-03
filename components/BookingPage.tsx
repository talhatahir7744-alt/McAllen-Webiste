import Script from 'next/script';
import { SITE } from './site-config';
import type { Locale } from '@/lib/i18n';
import styles from './BookingPage.module.css';

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
  },
  es: {
    title: '¡Da el Primer Paso Hacia un',
    highlight: 'Sueño Profundo y Reparador!',
    sub: 'Agenda tu cita personalizada de Dream Mapping y ',
    subStrong: 'descubre tu colchón perfecto.',
    almost: 'Ya casi…',
  },
};

export const BOOKING_CALENDAR_ID = '7oZZd8zPpnUYzsMS4VZM';

export function BookingPage({ locale = 'en' }: { locale?: Locale }) {
  const t = COPY[locale] || COPY.en;
  return (
    <>
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
        src={`https://link.snoozesleep.com/widget/booking/${BOOKING_CALENDAR_ID}`}
        allow="payment"
        style={{ width: '100%', border: 'none', overflow: 'hidden' }}
        scrolling="no"
        id={`${BOOKING_CALENDAR_ID}_1788451079887`}
      />
      <br />
      <Script src="https://link.snoozesleep.com/js/form_embed.js" strategy="afterInteractive" />
    </>
  );
}
