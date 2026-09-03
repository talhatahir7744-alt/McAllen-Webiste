import type { MetadataRoute } from 'next';
import { POSTS } from '@/lib/blog-posts';
import { localizeHref } from '@/lib/i18n';

const SITE_URL = 'https://mcallen.snoozemattresscompany.com';

/* Public pages of the converted site (hand-maintained; regeneration keeps this file). Every page exists in
   English and Spanish (/es/...); each sitemap entry lists both as hreflang alternates. */
const PAGES: Array<[path: string, priority: number]> = [
  ['/', 1],
  ['/about-us', 0.8],
  ['/mattresses', 0.8],
  ['/adjustable-mattress-bases', 0.7],
  ['/massage-chairs', 0.7],
  ['/pillows', 0.7],
  ['/mattress-protectors', 0.7],
  ['/premium-sheets', 0.7],
  ['/sleep-recliner', 0.7],
  ['/at-home-sleep-test-kit-by-sleepcorner', 0.7],
  ['/mattress-financing', 0.8],
  ['/mattress-sales', 0.8],
  ['/booking', 0.6],
  ['/optin-page', 0.5],
  ['/blog', 0.7],
  ['/privacy-policy-page', 0.2],
  ['/terms-conditions-page', 0.2],
];

const abs = (path: string) => `${SITE_URL}${path}`;
const languages = (path: string) => ({ en: abs(localizeHref(path, 'en')), es: abs(localizeHref(path, 'es')), 'x-default': abs(path) });

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const out: MetadataRoute.Sitemap = [];
  for (const [path, priority] of PAGES) {
    for (const locale of ['en', 'es'] as const) {
      out.push({ url: abs(localizeHref(path, locale)), lastModified: now, changeFrequency: 'monthly', priority: locale === 'en' ? priority : Math.max(0.1, priority - 0.1), alternates: { languages: languages(path) } });
    }
  }
  for (const p of POSTS) {
    const path = `/blog/${p.slug}`;
    for (const locale of ['en', 'es'] as const) {
      out.push({ url: abs(localizeHref(path, locale)), lastModified: new Date(p.datePublished), changeFrequency: 'yearly', priority: locale === 'en' ? 0.6 : 0.5, alternates: { languages: languages(path) } });
    }
  }
  return out;
}
