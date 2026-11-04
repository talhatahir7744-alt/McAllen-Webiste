import { pageGraph, type JsonLd } from '@/lib/schema';
import type { Locale } from '@/lib/i18n';

/* Page-level structured data (SEO audit, October 2026 — section 5; one graph per page since November 3, 2026). Renders
   ONE JSON-LD script, server-side, so it is in the static HTML for every visitor and crawler: the site-wide nodes
   (#organization, #store, #website — lib/schema.ts) and the page's own items, which come from the page's generated
   schema.ts (scripts/page-schema.mjs: FAQPage from the on-page accordion, BreadcrumbList, CollectionPage, ContactPage)
   or are written by hand (content pages, the booking page's Service, blog posts). Every route renders it exactly once. */
export type { JsonLd };

export function PageSchema({ items, locale }: { items: JsonLd[]; locale: Locale }) {
  return (
    <script
      type="application/ld+json"
      // JSON inside a script element: escape "<" so no markup can terminate the block
      dangerouslySetInnerHTML={{ __html: JSON.stringify(pageGraph(items, locale)).replace(/</g, '\\u003c') }}
    />
  );
}
