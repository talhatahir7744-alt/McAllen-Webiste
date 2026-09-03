import Image from 'next/image';
import { SITE } from './site-config';
import { LOCATION } from '@/lib/location';
import { LocalBusinessJsonLd } from './LocalBusinessJsonLd';
import { localizeHref, ui, PRODUCT_KEYS, type Locale } from '@/lib/i18n';
import styles from './SiteFooter.module.css';

/* The one site footer, rendered by the root layout of each locale on every route (the GoHighLevel footer
   sections are removed by the converter). Content is the site's own: links, phone, address, hours, map. */

const PRODUCT_HREFS: Record<(typeof PRODUCT_KEYS)[number], string> = {
  mattresses: '/mattresses',
  bases: '/adjustable-mattress-bases',
  chairs: '/massage-chairs',
  pillows: '/pillows',
  protectors: '/mattress-protectors',
  sheets: '/premium-sheets',
  recliner: '/sleep-recliner',
  kit: '/at-home-sleep-test-kit-by-sleepcorner',
};
const MAP_EMBED = LOCATION.mapEmbed;
const MAP_LINK = LOCATION.mapLink;

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" />
    <circle cx="12" cy="11" r="2.3" />
  </svg>
);
const NavIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 3 3 10.5l8.5 2 2 8.5L21 3Z" />
  </svg>
);
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c1.9 0 3.5 1 4.4 2.4l.8 1.2.8-1.2C13.7 6 15.3 5 17.2 5c3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21Z" />
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);
const ExtIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

export function SiteFooter({ locale = 'en' }: { locale?: Locale }) {
  const t = ui(locale);
  const f = t.footer;
  const L = (href: string) => localizeHref(href, locale);
  return (
    <footer className={styles.footer} data-site-footer="">
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand} data-animate="fade-up">
            <a href={L('/')} className={styles.logo} aria-label={t.menu.homeAria}>
              <Image src={SITE.logo} alt={SITE.logoAlt} width={190} height={53} />
            </a>
            <p className={styles.about}>{f.about}</p>
            <div className={styles.social}>
              <a href={LOCATION.social.facebook} target="_blank" rel="noopener noreferrer" aria-label={f.facebook}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z" /></svg>
              </a>
              <a href={LOCATION.social.instagram} target="_blank" rel="noopener noreferrer" aria-label={f.instagram}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href={LOCATION.social.youtube} target="_blank" rel="noopener noreferrer" aria-label={f.youtube}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden="true"><path d="M21.6 7.2a2.4 2.4 0 0 0-1.7-1.7C18.4 5 12 5 12 5s-6.4 0-7.9.5A2.4 2.4 0 0 0 2.4 7.2C2 8.7 2 12 2 12s0 3.3.4 4.8a2.4 2.4 0 0 0 1.7 1.7c1.5.5 7.9.5 7.9.5s6.4 0 7.9-.5a2.4 2.4 0 0 0 1.7-1.7c.4-1.5.4-4.8.4-4.8s0-3.3-.4-4.8Z" /><path d="m10 9.2 4.8 2.8-4.8 2.8V9.2Z" fill="currentColor" stroke="none" /></svg>
              </a>
            </div>
            <div className={styles.ctas}>
              <a href={L('/booking')} className={styles.btn}>{f.book}</a>
              <a href={L('/optin-page')} className={`${styles.btn} ${styles.btnOutline}`}>{f.contact}</a>
            </div>
          </div>

          <div data-animate="fade-up" data-delay="100">
            <h2 className={styles.heading}>{f.products}</h2>
            <ul className={styles.list}>
              {PRODUCT_KEYS.map((key) => (
                <li key={key}><a href={L(PRODUCT_HREFS[key])}>{t.products[key].label}</a></li>
              ))}
            </ul>
          </div>

          <div data-animate="fade-up" data-delay="200">
            <h2 className={styles.heading}>{f.company}</h2>
            <ul className={styles.list}>
              {f.companyLinks.map(([label, href]) => (
                <li key={href}><a href={L(href)}>{label}</a></li>
              ))}
            </ul>
          </div>

          <div className={styles.visit} data-animate="fade-up" data-delay="300">
            <h2 className={styles.heading}>{f.visit}</h2>
            <a href={SITE.phoneHref} className={styles.phone}>
              <span className={styles.phoneIcon}><PhoneIcon /></span>
              {SITE.phone}
            </a>
            <a href={`mailto:${LOCATION.email}`} className={`${styles.phone} ${styles.email}`}>
              <span className={styles.phoneIcon}><MailIcon /></span>
              {LOCATION.email}
            </a>
            <p className={styles.hours}>
              <span>{f.hours1}</span>
              <span>{f.hours2}</span>
            </p>
            <div className={styles.mapCard}>
              <iframe className={styles.map} src={locale === 'es' ? `${MAP_EMBED}&hl=es` : MAP_EMBED} title={f.mapTitle} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              <div className={styles.locCard}>
                <span className={styles.pin}><PinIcon /></span>
                <div className={styles.locText}>
                  <span className={styles.locEyebrow}>{f.location}</span>
                  <span className={styles.locAddr}>{LOCATION.street}<br />{LOCATION.city}, {LOCATION.region} {LOCATION.postalCode}</span>
                  <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className={styles.locDir}>{f.directions} <ExtIcon /></a>
                </div>
                <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className={styles.openMaps}><NavIcon /> {f.openMaps}</a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottom} data-animate="fade" data-delay="200">
          <span className={styles.copy}>
            <span>© {new Date().getFullYear()} <span aria-hidden="true">💙💤</span> {f.rights}</span>
            <span className={styles.madeWith}>{f.madeWith} <HeartIcon /> {locale === 'es' ? 'amor' : 'love'}</span>
          </span>
          <span className={styles.legal}>
            <a href={L('/terms-conditions-page')}>{f.terms}</a>
            <a href={L('/privacy-policy-page')}>{f.privacy}</a>
          </span>
        </div>
      </div>
      <LocalBusinessJsonLd locale={locale} />
    </footer>
  );
}
