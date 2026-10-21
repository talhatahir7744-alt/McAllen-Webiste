import { LOCATION } from '@/lib/location';
import { localizeHref, type Locale } from '@/lib/i18n';

/* "Shopping from Edinburg, Mission or Pharr?" — a short band at the end of the home page linking the service-area
   pages (SEO audit build pass, C1). Server-rendered, so it reads with or without JavaScript. No drive times: the
   client has not supplied them. Styles: overrides/global.css (.snz-areas). */
const COPY = {
  en: {
    eyebrow: 'Service area',
    title: 'Shopping from Edinburg, Mission or Pharr?',
    text: `Snooze Mattress + Wellness is in McAllen at ${LOCATION.street}, and fits shoppers from across the Rio Grande Valley with a free five-minute Dream Mapping session. See what a visit from your city gets you:`,
    aria: (city: string) => `Mattress store serving ${city}, TX`,
  },
  es: {
    eyebrow: 'Zona de servicio',
    title: '¿Vienes de Edinburg, Mission o Pharr?',
    text: `Snooze Mattress + Wellness está en McAllen, en ${LOCATION.street}, y atiende a clientes de todo el Valle del Río Grande con una sesión gratis de Dream Mapping de cinco minutos. Mira qué te da una visita desde tu ciudad:`,
    aria: (city: string) => `Tienda de colchones que atiende a ${city}, TX`,
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
        <ul className="snz-areas__links">
          {AREAS.map(([city, href]) => (
            <li key={href}><a className="snz-areas__link" href={localizeHref(href, locale)} aria-label={c.aria(city)}>{city}</a></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
