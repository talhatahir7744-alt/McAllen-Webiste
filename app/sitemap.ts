import type { MetadataRoute } from 'next';

// static export (next.config output: 'export'): generated once at build time, served as a plain file
export const dynamic = 'force-static';
import { POSTS } from '@/lib/blog-posts';
import { localizeHref } from '@/lib/i18n';
import LASTMOD from '@/lib/lastmod.json';

const SITE_URL = 'https://mcallen.snoozemattresscompany.com';

/* Public, indexable pages of the converted site (hand-maintained; regeneration keeps this file). Every page exists in
   English and Spanish (/es/...); each sitemap entry lists both as hreflang alternates. Not listed on purpose: the
   noindex pages (/optin-page contact form, the /thank/you and /dream/map/thank/you confirmation pages), the URLs that
   redirect (/home-page, /main-page, the duplicate legal pages) and the /ghl-stub placeholders.
   lastmod is per page: the date of the last commit that touched the page's own source (lib/lastmod.json, written by
   scripts/lastmod.mjs: run `npm run lastmod` before building whenever page content changed); blog posts carry their
   own dates from lib/blog-posts.ts. */
/* priorities: home 1.0, main pages 0.8, blog posts 0.6 (below), legal pages 0.3; the Spanish twin of a page carries the same priority */
const PAGES: Array<[path: string, priority: number]> = [
  ['/', 1],
  ['/about-us', 0.8],
  ['/mattresses', 0.8],
  ['/adjustable-mattress-bases', 0.8],
  ['/massage-chairs', 0.8],
  ['/pillows', 0.8],
  ['/mattress-protectors', 0.8],
  ['/premium-sheets', 0.8],
  ['/sleep-recliner', 0.8],
  ['/at-home-sleep-test-kit-by-sleepcorner', 0.8],
  ['/mattress-financing', 0.8],
  ['/mattress-sales', 0.8],
  ['/booking', 0.8],
  ['/sleep-quiz', 0.8],
  ['/blog', 0.8],
  ['/privacy-policy-page', 0.3],
  ['/terms-conditions-page', 0.3],
];

const abs = (path: string) => `${SITE_URL}${path}`;
const languages = (path: string) => ({ en: abs(localizeHref(path, 'en')), es: abs(localizeHref(path, 'es')), 'x-default': abs(path) });
const lastmod = (path: string, fallback: Date) => { const d = (LASTMOD as Record<string, string>)[path]; return d ? new Date(d) : fallback; };

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const out: MetadataRoute.Sitemap = [];
  for (const [path, priority] of PAGES) {
    for (const locale of ['en', 'es'] as const) {
      const url = localizeHref(path, locale);
      out.push({ url: abs(url), lastModified: lastmod(url, now), changeFrequency: 'monthly', priority, alternates: { languages: languages(path) } });
    }
  }
  for (const p of POSTS) {
    const path = `/blog/${p.slug}`;
    const date = new Date((p as { dateModified?: string }).dateModified || p.datePublished);
    for (const locale of ['en', 'es'] as const) {
      out.push({ url: abs(localizeHref(path, locale)), lastModified: date, changeFrequency: 'yearly', priority: 0.6, alternates: { languages: languages(path) } });
    }
  }
  return out;
}
