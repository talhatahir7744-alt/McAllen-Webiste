import { LOCATION } from '@/lib/location';
import { localizeHref, type Locale } from '@/lib/i18n';
import { ArrowRightIcon, Icon } from './icons';

/* "Shopping from Edinburg, Mission or Pharr?" — a short band at the end of the home page linking the service-area
   pages (SEO audit build pass, C1). Server-rendered, so it reads with or without JavaScript. Since October 27, 2026
   the three links are cards (map-pin badge, city, the drive line the agency supplied, "View page"), each card one
   link. Styles: overrides/global.css (.snz-areas, .snz-card). */
const COPY = {
  en: {
    eyebrow: 'Service area',
    title: 'Shopping from Edinburg, Mission or Pharr?',
    text: `Snooze Mattress + Wellness is in McAllen at ${LOCATION.street}, and fits shoppers from across the Rio Grande Valley with a free five-minute Dream Mapping session. See what a visit from your city gets you:`,
    drive: 'About a 15–20 minute drive',
    view: 'View page',
  },
  es: {
    eyebrow: 'Zona de servicio',
    title: '¿Vienes de Edinburg, Mission o Pharr?',
    text: `Snooze Mattress + Wellness está en McAllen, en ${LOCATION.street}, y atiende a clientes de todo el Valle del Río Grande con una sesión gratis de Dream Mapping de cinco minutos. Mira qué te da una visita desde tu ciudad:`,
    drive: 'A unos 15–20 minutos en auto',
    view: 'Ver página',
  },
};
const AREAS: Array<[city: string, href: string]> = [['Edinburg', '/mattress-store-edinburg'], ['Mission', '/mattress-store-mission'], ['Pharr', '/mattress-store-pharr']];

export function AreaLinks({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  return (
    <section className="snz-areas" aria-labelledby="snz-areas-title">
      <div className="snz-areas__inner">
        <p className="snz-areas__eyebrow">{c.eyebrow}</p>
        <h2 id="snz-areas-title" className="snz-areas__title">{c.title}</h2>
        <p className="snz-areas__text">{c.text}</p>
        <ul className="snz-cards snz-areas__cards">
          {AREAS.map(([city, href]) => (
            <li key={href}>
              <a className="snz-card snz-card--link" href={localizeHref(href, locale)}>
                <span className="snz-badge"><Icon name="map-pin" /></span>
                <span className="snz-card__title">{city}</span>
                <span className="snz-card__text">{c.drive}</span>
                <span className="snz-card__more">{c.view} <ArrowRightIcon /></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
