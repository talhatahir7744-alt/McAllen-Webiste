import { localizeHref, ui, type Locale } from '@/lib/i18n';
import { ArrowRightIcon, Icon, type IconName } from './icons';

/* "Mattresses by size & type" (October 27, 2026): the six size/type pages (SEO audit build pass, section E) as icon
   cards — the labels are the menu's (lib/i18n.ts sizeLinks), the one-line description under each is existing copy
   (the size rows of the buying guide's table in lib/pages/how-to-choose-a-mattress.ts, the pages' own descriptions),
   each card one link. At the end of the home page and, without the page's own card, on the size/type pages and the
   buying guide (components/ContentPage.tsx). Server-rendered. Styles: overrides/global.css (.snz-sizes, .snz-card). */
const ICONS: Record<string, IconName> = {
  '/queen-mattresses': 'bed',
  '/king-mattresses': 'bed-wide',
  '/full-twin-mattresses': 'bed-single',
  '/memory-foam-mattresses': 'layers',
  '/mattresses-for-back-pain': 'spine',
  '/cooling-mattresses': 'snowflake',
};
const LINES: Record<Locale, Record<string, string>> = {
  en: {
    '/queen-mattresses': 'Couples in a standard bedroom; the most common size',
    '/king-mattresses': 'Couples who want the width of a twin each',
    '/full-twin-mattresses': 'For kids, guest rooms and smaller bedrooms',
    '/memory-foam-mattresses': 'Contours closely, relieves pressure points and absorbs a partner’s movement',
    '/mattresses-for-back-pain': 'A free Dream Mapping scan finds your pressure points and the Sleep Coach finds the support',
    '/cooling-mattresses': 'Tempur-Pedic cooling models and the Spring Air Copper Collection',
  },
  es: {
    '/queen-mattresses': 'Parejas en una recámara estándar; el tamaño más común',
    '/king-mattresses': 'Parejas que quieren el ancho de un twin cada uno',
    '/full-twin-mattresses': 'Para niños, cuartos de visitas y recámaras pequeñas',
    '/memory-foam-mattresses': 'Se amolda de cerca, alivia los puntos de presión y absorbe el movimiento de la pareja',
    '/mattresses-for-back-pain': 'Un escaneo gratis de Dream Mapping encuentra tus puntos de presión y el soporte',
    '/cooling-mattresses': 'Modelos Tempur-Pedic con enfriamiento y la Copper Collection de Spring Air',
  },
};

export function SizeTypeGrid({ locale, current, inline = false }: { locale: Locale; current?: string; inline?: boolean }) {
  const t = ui(locale);
  const items = t.menu.sizeLinks.filter(([, href]) => href !== current);
  const id = inline ? 'snz-sizes-inline-title' : 'snz-sizes-title';
  return (
    <section className={`snz-sizes${inline ? ' snz-sizes--inline' : ''}`} aria-labelledby={id}>
      <div className="snz-sizes__inner">
        <h2 id={id} className="snz-sizes__title">{t.menu.sizes}</h2>
        <ul className="snz-cards">
          {items.map(([label, href]) => (
            <li key={href}>
              <a className="snz-card snz-card--link" href={localizeHref(href, locale)}>
                <span className="snz-badge snz-badge--soft"><Icon name={ICONS[href] || 'bed'} /></span>
                <span className="snz-card__title">{label}</span>
                <span className="snz-card__text">{(LINES[locale] || LINES.en)[href]}</span>
                <span className="snz-card__more" aria-hidden="true"><ArrowRightIcon /></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
