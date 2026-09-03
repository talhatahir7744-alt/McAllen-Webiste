/* Blog entries shown in the site navigation (header dropdown + mobile drawer). Kept tiny on purpose:
   the header is a client component and must not pull the full article content into every page.
   Hrefs are English paths; the header localizes them (/es/...) for the Spanish site. */
import type { Locale } from './i18n';

export const BLOG_INDEX = { label: 'All articles', href: '/blog' };

export const BLOG_NAV = [
  { label: 'Custom Mattresses Improving Health', href: '/blog/custom-mattresses-improving-health', blurb: 'Why a mattress fitted to you changes more than your nights' },
  { label: 'Pressure Maps For Sleep', href: '/blog/pressure-mapping-for-sleep', blurb: 'What the colours reveal about support and alignment' },
  { label: 'Mattresses That Relieve Aches', href: '/blog/mattresses-that-relieve-aches', blurb: 'Wake up without the morning stiffness' },
];

export const BLOG_NAV_ES = [
  { label: 'Colchones a tu Medida que Mejoran tu Salud', href: '/blog/custom-mattresses-improving-health', blurb: 'Por qué un colchón hecho para ti cambia más que tus noches' },
  { label: 'Mapas de Presión para Dormir Mejor', href: '/blog/pressure-mapping-for-sleep', blurb: 'Lo que revelan los colores sobre soporte y alineación' },
  { label: 'Colchones que Alivian los Dolores', href: '/blog/mattresses-that-relieve-aches', blurb: 'Despierta sin la rigidez de la mañana' },
];

export const blogNav = (locale: Locale) => (locale === 'es' ? BLOG_NAV_ES : BLOG_NAV);
