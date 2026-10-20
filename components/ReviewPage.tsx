import { SITE } from './site-config';
import { LOCATION } from '@/lib/location';
import { localizeHref, type Locale } from '@/lib/i18n';
import styles from './ReviewPage.module.css';

/* "Leave Us a Review" page (/review, /es/review — SEO audit, October 2026, section 6c): one button to the store's
   Google review form. The link itself is lib/location.ts → reviewUrl (NEEDS CLIENT INPUT); while it is empty the
   page says so instead of rendering a dead button. noindex,follow (app/(en)/review/page.tsx), not in the sitemap,
   crawlable. */
const COPY = {
  en: {
    title: 'Leave Us a Review',
    intro: 'Thank you for choosing Snooze Mattress + Wellness in McAllen. A Google review takes about a minute.',
    button: 'Write a Google review',
    pending: 'Google review link: pending client setup.',
    back: 'Back to the home page',
  },
  es: {
    title: 'Déjanos una Reseña',
    intro: 'Gracias por elegir Snooze Mattress + Wellness en McAllen. Una reseña en Google toma alrededor de un minuto.',
    button: 'Escribir una reseña en Google',
    pending: 'Enlace de reseñas de Google: pendiente de configuración por el cliente.',
    back: 'Volver a la página de inicio',
  },
};

export function ReviewPage({ locale = 'en' }: { locale?: Locale }) {
  const t = COPY[locale] || COPY.en;
  const url = LOCATION.reviewUrl;
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <img className={styles.logo} src={SITE.logo} alt={SITE.logoAlt} width={190} height={53} />
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.intro}>{t.intro}</p>
        {url ? (
          <a className={styles.button} href={url} target="_blank" rel="noopener noreferrer">{t.button}</a>
        ) : (
          <p className={styles.pending}>{t.pending}</p>
        )}
        <p className={styles.meta}>{LOCATION.street}, {LOCATION.city}, {LOCATION.region} {LOCATION.postalCode} · <a href={LOCATION.phoneHref}>{LOCATION.phone}</a></p>
        <a className={styles.back} href={localizeHref('/', locale)}>{t.back}</a>
      </div>
    </main>
  );
}
