'use client';
import { usePathname } from 'next/navigation';
import { LOCATION } from '@/lib/location';
import { alternateHref, ui, type Locale } from '@/lib/i18n';
import styles from './TopBar.module.css';

/* Slim top bar above the main navigation on every page (both root layouts render it; the converter writes it into
   the layout template): the store's address (→ its Google Maps listing), hours and phone (tel: link) from the shared
   location config (lib/location.ts — the same source as the footer, the location cards and the LocalBusiness schema;
   this bar is the audit's item 6a), and the EN | ES language toggle, moved here from the navigation row. Brand navy
   from the page's own colour variable, white text, orange icons from the site's SVG set, Poppins, no heading tags.
   It scrolls away; the main header below stays sticky. Under 768px it collapses to one line: phone left, EN | ES right. */
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" />
    <circle cx="12" cy="11" r="2.3" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);

const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);

export function TopBar({ locale = 'en' }: { locale?: Locale }) {
  const rawPath = normalize(usePathname() || '/');
  const t = ui(locale);
  const L = LOCATION;
  const hours = L.hours[locale] || L.hours.en;
  const address = `${L.street}, ${L.city}, ${L.region} ${L.postalCode}`;
  return (
    <div className={styles.bar} data-site-topbar="" data-locale={locale}>
      <div className={styles.inner}>
        <div className={styles.nap}>
          <a className={`${styles.item} ${styles.address}`} href={L.mapLink} target="_blank" rel="noopener noreferrer" title={t.footer.openMaps}>
            <PinIcon />
            <span className={styles.text}>{address}</span>
          </a>
          <span className={styles.dot} aria-hidden="true">·</span>
          <span className={`${styles.item} ${styles.hours}`}>
            <ClockIcon />
            <span className={styles.text}>{hours[0]}, {hours[1]}</span>
          </span>
          <span className={styles.dot} aria-hidden="true">·</span>
          <a className={`${styles.item} ${styles.phone}`} href={L.phoneHref} aria-label={t.menu.call(L.phone)}>
            <PhoneIcon />
            <span className={styles.text}>{L.phone}</span>
          </a>
        </div>
        <div className={styles.lang} role="group" aria-label={t.menu.switchTo}>
          {(['en', 'es'] as const).map((l) => (
            <a
              key={l}
              href={alternateHref(rawPath, l)}
              hrefLang={l}
              lang={l}
              className={`${styles.langLink} ${l === locale ? styles.langOn : ''}`}
              aria-current={l === locale ? 'true' : undefined}
              aria-label={l === 'en' ? 'English' : 'Español'}
            >
              {l.toUpperCase()}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
