/* The blog's author (the client's decision, November 4, 2026; it replaces the October 27 "Snooze Mattress Company"):
   the Organization "Snooze Mattress + Wellness in McAllen" at the site's home URL, on every post in both languages:
   the BlogPosting author and the article:author tag carry that one name, and the visible byline reads "By Snooze
   Mattress + Wellness in McAllen" / "Por Snooze Mattress + Wellness en McAllen" (lib/i18n.ts `by` + the name below
   for the page's language). The LocalBusiness legalName is unchanged. The city comes from lib/location.ts. */
import { LOCATION } from './location';
import { SITE_URL } from './schema';
import type { Locale } from './i18n';

export const BLOG_AUTHOR = { name: `Snooze Mattress + Wellness in ${LOCATION.city}`, url: `${SITE_URL}/` } as const;

/* the name as the byline shows it, per language */
export const BLOG_BYLINE_NAME: Record<Locale, string> = { en: BLOG_AUTHOR.name, es: `Snooze Mattress + Wellness en ${LOCATION.city}` };
