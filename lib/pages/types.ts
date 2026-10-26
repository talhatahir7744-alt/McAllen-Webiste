/* Hand-written content pages (SEO audit build pass, October 2026 — section E): one data module per page under
   lib/pages/, rendered by components/ContentPage.tsx for /<slug> and /es/<slug>. Every page: one H1, a visible
   breadcrumb, 500–800 words of copy that only restates the store's real facts (lib/location.ts, Dream Mapping as
   described on the site, the brands carried, delivery on orders over $999, the financing partners), an FAQ block
   (also emitted as FAQPage JSON-LD), a BreadcrumbList, and a call to action to /booking. */
import type { Locale } from '@/lib/i18n';

export type Faq = { question: string; answer: string };
/** how a bullet list renders (October 27, 2026): icon cards (benefits / features), a numbered timeline (steps), the
    check list in a navy card (key facts); unset = the plain check list */
export type ListStyle = 'cards' | 'steps' | 'facts';
export type Section = {
  h2: string;
  paragraphs?: string[];
  bullets?: string[];
  listStyle?: ListStyle;
  /** optional subsections */
  h3s?: Array<{ h3: string; paragraphs?: string[]; bullets?: string[]; listStyle?: ListStyle }>;
};
export type Table = { caption: string; head: string[]; rows: string[][] };
export type PageCopy = {
  title: string; // <title>, ≤60 characters
  description: string; // meta description, ≤155 characters
  crumb: string; // breadcrumb label
  eyebrow?: string;
  h1: string;
  intro: string[]; // opening paragraphs
  sections: Section[];
  table?: Table;
  faqTitle: string;
  faqs: Faq[]; // every question (also the FAQPage JSON-LD)
  /** when set, the page renders one accordion per group instead of the flat list (the /faq page) */
  faqGroups?: Array<{ h2: string; faqs: Faq[] }>;
  cta: { title: string; text: string; button: string };
};
export type ContentPage = {
  slug: string; // '/dream-mapping'
  kind: 'guide' | 'area' | 'product' | 'faq';
  copy: Record<Locale, PageCopy>;
  /** extra JSON-LD objects (e.g. the Dream Mapping Service) per locale */
  extraSchema?: (locale: Locale) => Record<string, unknown>[];
};
