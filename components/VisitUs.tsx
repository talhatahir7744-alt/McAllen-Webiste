import { LOCATION } from '@/lib/location';
import { ui, type Locale } from '@/lib/i18n';

/* "Visit Us" block on the home page, directly under the header (SEO audit, October 2026 — section 6a): the store's
   address, hours and phone as plain text, from the same source as the footer and the LocalBusiness schema
   (lib/location.ts). Server-rendered, never hidden. Styles: overrides/global.css (.snz-visit). */
const LABELS: Record<Locale, { address: string; hours: string; phone: string }> = {
  en: { address: 'Address', hours: 'Store Hours', phone: 'Phone' },
  es: { address: 'Dirección', hours: 'Horario', phone: 'Teléfono' },
};

export function VisitUs({ locale }: { locale: Locale }) {
  const L = LOCATION;
  const t = LABELS[locale] || LABELS.en;
  const hours = L.hours[locale] || L.hours.en;
  return (
    <section className="snz-visit" aria-labelledby="snz-visit-title">
      <div className="snz-visit__inner">
        <h2 id="snz-visit-title" className="snz-visit__title">{ui(locale).footer.visit}</h2>
        <p className="snz-visit__line">
          <span className="snz-visit__label">{t.address}:</span>{' '}
          <a className="snz-visit__link" href={L.mapLink} target="_blank" rel="noopener noreferrer">{L.street}, {L.city}, {L.region} {L.postalCode}</a>
        </p>
        <p className="snz-visit__line">
          <span className="snz-visit__label">{t.hours}:</span> {hours[0]}, {hours[1]}
        </p>
        <p className="snz-visit__line">
          <span className="snz-visit__label">{t.phone}:</span> <a className="snz-visit__link" href={L.phoneHref}>{L.phone}</a>
        </p>
      </div>
    </section>
  );
}
