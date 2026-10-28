import { LOCATION } from '@/lib/location';
import { ui, type Locale } from '@/lib/i18n';
import { ArrowRightIcon, Icon } from './icons';

/* The store's details on the contact page (/contact-us, /es/contact-us; October 29, 2026), below the builder's form
   section: the exact address, phone and hours from lib/location.ts — the same source the top bar and the footer use,
   with the footer's labels — a tel: link and the store's Google Maps listing. Server-rendered, outside the GoHighLevel
   markup (like components/GuideLinks.tsx), so it never touches the page payload. Styles: overrides/global.css
   (.snz-areas, .snz-card). */
const COPY = {
  en: { label: 'Store contact details', call: 'Call Us', hours: 'Store Hours' },
  es: { label: 'Datos de contacto de la tienda', call: 'Llámanos', hours: 'Horario de la Tienda' },
};

export function ContactDetails({ locale }: { locale: Locale }) {
  const c = COPY[locale]; const f = ui(locale).footer; const L = LOCATION;
  return (
    <section className="snz-areas snz-contact" aria-label={c.label}>
      <div className="snz-areas__inner">
        <p className="snz-areas__eyebrow">{L.name} · {L.city}, {L.region}</p>
        <ul className="snz-cards snz-areas__cards snz-contact__cards">
          <li>
            <div className="snz-card">
              <span className="snz-badge"><Icon name="map-pin" /></span>
              <h2 className="snz-card__title">{f.location}</h2>
              <p className="snz-card__text">{L.street}<br />{L.city}, {L.region} {L.postalCode}</p>
              <a className="snz-card__more" href={L.mapLink} target="_blank" rel="noopener noreferrer">{f.directions} <ArrowRightIcon /></a>
            </div>
          </li>
          <li>
            <div className="snz-card">
              <span className="snz-badge"><Icon name="phone" /></span>
              <h2 className="snz-card__title">{c.call}</h2>
              <p className="snz-card__text"><a className="snz-contact__phone" href={L.phoneHref}>{L.phone}</a></p>
            </div>
          </li>
          <li>
            <div className="snz-card">
              <span className="snz-badge"><Icon name="clock" /></span>
              <h2 className="snz-card__title">{c.hours}</h2>
              <p className="snz-card__text">{L.hours[locale][0]}<br />{L.hours[locale][1]}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
