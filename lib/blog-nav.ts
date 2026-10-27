/* Blog entries shown in the site navigation (header dropdown + mobile drawer). Kept tiny on purpose:
   the header is a client component and must not pull the full article content into every page.
   Hrefs are English paths; the header localizes them (/es/...) for the Spanish site. */
import type { Locale } from './i18n';

export const BLOG_INDEX = { label: 'All articles', href: '/blog' };

/* The October 27, 2026 posts carry different slugs per language: English slug -> Spanish slug. lib/i18n.ts
   alternateHref() uses it so the EN | ES switcher lands on the right article; components/blog/pages.tsx and
   app/sitemap.ts take the same pairing from BlogPost.altSlug. */
export const BLOG_SLUG_ES: Record<string, string> = {
  'memory-foam-vs-hybrid-mattress-mcallen': 'colchon-memory-foam-vs-hibrido-mcallen',
  'mattress-size-guide-mcallen': 'guia-tamanos-de-colchon-mcallen',
};
/** the slug of a blog post in `target` (unchanged when both languages share it) */
export function blogSlugFor(slug: string, target: Locale): string {
  if (target === 'es') return BLOG_SLUG_ES[slug] || slug;
  return Object.keys(BLOG_SLUG_ES).find((en) => BLOG_SLUG_ES[en] === slug) || slug;
}

export const BLOG_NAV = [
  { label: 'Memory Foam or Hybrid? A Guide for Hot McAllen Nights', href: '/blog/memory-foam-vs-hybrid-mattress-mcallen', blurb: 'Which sleeps cooler, which suits couples, how long each lasts' },
  { label: 'Full, Queen or King? Mattress Size Guide', href: '/blog/mattress-size-guide-mcallen', blurb: 'Real dimensions, room sizes and who each size suits' },
  { label: 'Custom Mattresses Improving Health', href: '/blog/custom-mattresses-improving-health', blurb: 'Why a mattress fitted to you changes more than your nights' },
  { label: 'Dream Mapping: Pressure Maps for Better Sleep', href: '/blog/pressure-mapping-for-sleep', blurb: 'What the colours reveal about support and alignment' },
  { label: 'Mattresses That Relieve Aches', href: '/blog/mattresses-that-relieve-aches', blurb: 'Wake up without the morning stiffness' },
];

export const BLOG_NAV_ES = [
  { label: '¿Memory Foam o Híbrido? Guía para las Noches Calurosas de McAllen', href: '/blog/colchon-memory-foam-vs-hibrido-mcallen', blurb: 'Cuál duerme más fresco, cuál conviene a las parejas, cuánto dura cada uno' },
  { label: '¿Full, Queen o King? Guía de Tamaños de Colchón', href: '/blog/guia-tamanos-de-colchon-mcallen', blurb: 'Medidas reales, tamaños de recámara y para quién es cada tamaño' },
  { label: 'Colchones a tu Medida que Mejoran tu Salud', href: '/blog/custom-mattresses-improving-health', blurb: 'Por qué un colchón hecho para ti cambia más que tus noches' },
  { label: 'Dream Mapping: Mapas de Presión para Dormir Mejor', href: '/blog/pressure-mapping-for-sleep', blurb: 'Lo que revelan los colores sobre soporte y alineación' },
  { label: 'Colchones para el Dolor de Espalda en McAllen', href: '/blog/mattresses-that-relieve-aches', blurb: 'Despierta sin la rigidez de la mañana' },
];

export const blogNav = (locale: Locale) => (locale === 'es' ? BLOG_NAV_ES : BLOG_NAV);
