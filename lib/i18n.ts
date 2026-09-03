/* UI strings of the hand-written parts of the site (header, footer, blog chrome) per locale, plus the
   helpers that map a path between the English site and its /es mirror. Page copy of the GoHighLevel
   pages is translated by scripts/convert.mjs from overrides/i18n/*.json. */

export type Locale = 'en' | 'es';
export const LOCALES: Locale[] = ['en', 'es'];
export const DEFAULT_LOCALE: Locale = 'en';

/** '/mattresses' -> '/es/mattresses' for es; unchanged for en, assets, anchors, tel:/mailto:, external URLs. */
export function localizeHref(href: string, locale: Locale): string {
  if (locale === 'en' || !href.startsWith('/') || href.startsWith('//') || /^\/(assets|ghl-stub|_next|api)\//.test(href) || href === '/es' || href.startsWith('/es/')) return href;
  return href === '/' ? '/es' : `/es${href}`;
}

/** Locale of a pathname and its path without the locale prefix. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (p === '/es') return { locale: 'es', path: '/' };
  if (p.startsWith('/es/')) return { locale: 'es', path: p.slice(3) };
  return { locale: 'en', path: p || '/' };
}

/** The same page in the other language (used by the EN | ES switcher). */
export function alternateHref(pathname: string, target: Locale): string {
  const { path } = splitLocale(pathname);
  return localizeHref(path, target);
}

type ProductItem = { label: string; desc: string };
export type UiStrings = {
  langName: string;
  nav: { home: string; about: string; products: string; financing: string; sales: string; blog: string; allArticles: string };
  menu: { products: string; accessories: string; latest: string; openMenu: (label: string) => string; closeMenu: (label: string) => string; openSite: string; closeSite: string; siteMenu: string; homeAria: string; call: (phone: string) => string; switchTo: string };
  products: Record<string, ProductItem>;
  feature: { eyebrow: string; title: string; cta: string };
  drawerBook: string;
  footer: {
    about: string; book: string; contact: string; products: string; company: string; visit: string; hours1: string; hours2: string; location: string; directions: string; openMaps: string; mapTitle: string;
    rights: string; madeWith: string; terms: string; privacy: string; facebook: string; instagram: string; youtube: string;
    companyLinks: Array<[label: string, href: string]>;
  };
  blog: {
    eyebrow: string; indexTitle: string; indexIntro: string; home: string; blogCrumb: string; readArticle: string; read: (title: string) => string; faq: string; related: string;
    ctaEyebrow: string; ctaTitle: string; ctaText: string; ctaBook: string; ctaCall: (phone: string) => string; ctaAddr: string;
    indexMetaTitle: string; indexMetaDesc: string; ogDesc: string; section: string; org: string;
  };
};

const PRODUCT_KEYS = ['mattresses', 'bases', 'chairs', 'pillows', 'protectors', 'sheets', 'recliner', 'kit'] as const;
export type ProductKey = (typeof PRODUCT_KEYS)[number];

const en: UiStrings = {
  langName: 'English',
  nav: { home: 'Home', about: 'About Us', products: 'Our Products', financing: 'Financing', sales: 'Sales', blog: 'Blog', allArticles: 'All articles' },
  menu: { products: 'Products', accessories: 'Sleep Accessories', latest: 'Latest articles', openMenu: (l) => `Open ${l} menu`, closeMenu: (l) => `Close ${l} menu`, openSite: 'Open menu', closeSite: 'Close menu', siteMenu: 'Site menu', homeAria: 'Snooze Mattress + Wellness — home', call: (p) => `Call ${p}`, switchTo: 'Ver en español' },
  products: {
    mattresses: { label: 'Mattresses', desc: 'Fitted to you with Dream Mapping' },
    bases: { label: 'Adjustable Mattress Bases', desc: 'Elevate your sleep position' },
    chairs: { label: 'Massage Chairs', desc: 'Infinity® massage chairs' },
    pillows: { label: 'Pillows', desc: 'Premium support for every sleeper' },
    protectors: { label: 'Mattress Protectors', desc: 'Protect your investment' },
    sheets: { label: 'Premium Sheets', desc: 'Luxury you can feel every night' },
    recliner: { label: 'Sleep Recliner', desc: 'Recline smarter with the Zcliner®' },
    kit: { label: 'At-Home Sleep Test Kit', desc: 'Find what disrupts your sleep' },
  },
  feature: { eyebrow: 'Dream Mapping', title: 'Find your perfect mattress in about 5 minutes', cta: 'Book a free fitting' },
  drawerBook: 'Book Free Dream Mapping Appointment',
  footer: {
    about: 'Locally owned and operated in McAllen. We treat every person who walks through our door like family, and we are passionate about better health through better sleep.',
    book: 'Book Your Dream Mapping Appointment!', contact: 'Get In Touch With Us', products: 'Our Products', company: 'Company', visit: 'Visit Us',
    hours1: 'Mon – Sat 10 AM – 7 PM', hours2: 'Sunday 12 – 6 PM', location: 'Our Location', directions: 'Get Directions', openMaps: 'Open Maps',
    mapTitle: 'Map to Snooze Mattress Company, 7913 North 10th Street, Suite 130, McAllen, TX 78504',
    rights: 'Snooze Mattress McAllen. All Rights Reserved', madeWith: 'Made with', terms: 'Terms & Conditions', privacy: 'Privacy Policy',
    facebook: 'Snooze McAllen on Facebook', instagram: 'Snooze McAllen on Instagram', youtube: 'Snooze McAllen on YouTube',
    companyLinks: [['About Us', '/about-us'], ['Financing', '/mattress-financing'], ['Sales', '/mattress-sales'], ['Sleep Blog', '/blog'], ['Book a Dream Mapping Appointment', '/booking'], ['Get In Touch', '/optin-page']],
  },
  blog: {
    eyebrow: 'Snooze Sleep Blog', indexTitle: 'Better Sleep Starts Here',
    indexIntro: 'Custom mattresses, pressure mapping and pain-free mornings — straight from the sleep specialists at Snooze Mattress Company in McAllen.',
    home: 'Home', blogCrumb: 'Sleep Blog', readArticle: 'Read article', read: (t) => `Read: ${t}`, faq: 'Frequently Asked Questions', related: 'Related Posts',
    ctaEyebrow: 'Real People. Real Results. Real Sleep.', ctaTitle: 'Visit Our Showroom',
    ctaText: 'Talk to our Sleep Specialists in McAllen. Get pressure-mapped, try the mattresses that fit your body, and ask about 0% financing — we treat every person who walks through our door like family.',
    ctaBook: 'Book Your Dream Mapping Appointment', ctaCall: (p) => `Call ${p}`, ctaAddr: '7913 North 10th Street, Suite 130, McAllen, TX 78504 · Mon – Sat 10 AM – 7 PM · Sunday 12 – 6 PM',
    indexMetaTitle: 'Sleep Blog | Snooze Mattress Company McAllen',
    indexMetaDesc: 'Sleep tips from Snooze Mattress Company in McAllen: custom mattresses, pressure mapping and how the right mattress relieves aches and pains.',
    ogDesc: 'Custom mattresses, pressure mapping and better sleep — from the Snooze team in McAllen.', section: 'Sleep & Wellness', org: 'Snooze Mattress Company – McAllen',
  },
};

const es: UiStrings = {
  langName: 'Español',
  nav: { home: 'Inicio', about: 'Nosotros', products: 'Productos', financing: 'Financiamiento', sales: 'Ofertas', blog: 'Blog', allArticles: 'Todos los artículos' }, // nav label kept short so the desktop row fits on one line; the full 'Nuestros Productos' stays in the footer
  menu: { products: 'Productos', accessories: 'Accesorios para Dormir', latest: 'Artículos recientes', openMenu: (l) => `Abrir menú ${l}`, closeMenu: (l) => `Cerrar menú ${l}`, openSite: 'Abrir menú', closeSite: 'Cerrar menú', siteMenu: 'Menú del sitio', homeAria: 'Snooze Mattress + Wellness — inicio', call: (p) => `Llamar al ${p}`, switchTo: 'View in English' },
  products: {
    mattresses: { label: 'Colchones', desc: 'A tu medida con Dream Mapping' },
    bases: { label: 'Bases Ajustables', desc: 'Eleva tu posición para dormir' },
    chairs: { label: 'Sillas de Masaje', desc: 'Sillas de masaje Infinity®' },
    pillows: { label: 'Almohadas', desc: 'Soporte premium para cada tipo de durmiente' },
    protectors: { label: 'Protectores de Colchón', desc: 'Protege tu inversión' },
    sheets: { label: 'Sábanas Premium', desc: 'Lujo que se siente cada noche' },
    recliner: { label: 'Sillón Reclinable', desc: 'Reclínate mejor con el Zcliner®' },
    kit: { label: 'Kit de Prueba de Sueño en Casa', desc: 'Descubre qué interrumpe tu sueño' },
  },
  feature: { eyebrow: 'Dream Mapping', title: 'Encuentra tu colchón perfecto en unos 5 minutos', cta: 'Reserva tu cita de Dream Mapping' },
  drawerBook: 'Reserva tu cita de Dream Mapping',
  footer: {
    about: 'Negocio local de McAllen, de la familia para la familia. Tratamos a cada persona que entra por nuestra puerta como si fuera de casa, y nos apasiona mejorar tu salud a través de un mejor sueño.',
    book: 'Reserva tu cita de Dream Mapping', contact: 'Contáctanos', products: 'Nuestros Productos', company: 'Empresa', visit: 'Visítanos',
    hours1: 'Lun – Sáb 10 AM – 7 PM', hours2: 'Domingo 12 – 6 PM', location: 'Nuestra Ubicación', directions: 'Cómo Llegar', openMaps: 'Abrir en Maps',
    mapTitle: 'Mapa para llegar a Snooze Mattress Company, 7913 North 10th Street, Suite 130, McAllen, TX 78504',
    rights: 'Snooze Mattress McAllen. Todos los derechos reservados', madeWith: 'Hecho con', terms: 'Términos y Condiciones', privacy: 'Política de Privacidad',
    facebook: 'Snooze McAllen en Facebook', instagram: 'Snooze McAllen en Instagram', youtube: 'Snooze McAllen en YouTube',
    companyLinks: [['Nosotros', '/about-us'], ['Financiamiento', '/mattress-financing'], ['Ofertas', '/mattress-sales'], ['Blog del Sueño', '/blog'], ['Reserva tu cita de Dream Mapping', '/booking'], ['Contáctanos', '/optin-page']],
  },
  blog: {
    eyebrow: 'Blog del Sueño de Snooze', indexTitle: 'Dormir Mejor Empieza Aquí',
    indexIntro: 'Colchones a tu medida, mapeo de presión y mañanas sin dolor, directo de los Especialistas en Sueño de Snooze Mattress Company en McAllen.',
    home: 'Inicio', blogCrumb: 'Blog del Sueño', readArticle: 'Leer artículo', read: (t) => `Leer: ${t}`, faq: 'Preguntas Frecuentes', related: 'Artículos Relacionados',
    ctaEyebrow: 'Gente Real. Resultados Reales. Sueño Real.', ctaTitle: 'Visita Nuestra Tienda',
    ctaText: 'Platica con nuestros Especialistas en Sueño en McAllen. Hazte tu mapeo de presión, prueba los colchones que le quedan a tu cuerpo y pregunta por el financiamiento al 0%. Aquí tratamos a cada persona que entra por nuestra puerta como familia.',
    ctaBook: 'Reserva tu cita de Dream Mapping', ctaCall: (p) => `Llama al ${p}`, ctaAddr: '7913 North 10th Street, Suite 130, McAllen, TX 78504 · Lun – Sáb 10 AM – 7 PM · Domingo 12 – 6 PM',
    indexMetaTitle: 'Blog del Sueño | Snooze Mattress Company McAllen',
    indexMetaDesc: 'Consejos para dormir mejor de Snooze Mattress Company en McAllen: colchones a tu medida, mapeo de presión y cómo el colchón correcto alivia dolores y molestias.',
    ogDesc: 'Colchones a tu medida, mapeo de presión y mejor sueño, del equipo de Snooze en McAllen.', section: 'Sueño y Bienestar', org: 'Snooze Mattress Company – McAllen',
  },
};

export const UI: Record<Locale, UiStrings> = { en, es };
export const ui = (locale: Locale) => UI[locale] || en;
export { PRODUCT_KEYS };
