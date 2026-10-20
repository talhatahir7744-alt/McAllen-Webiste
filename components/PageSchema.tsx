/* Page-level structured data (SEO audit, October 2026 — section 5). Renders one JSON-LD script per item, server-side,
   so it is in the static HTML for every visitor and crawler. The items come from the page's own generated schema.ts
   (scripts/page-schema.mjs: FAQPage from the on-page accordion, BreadcrumbList on product pages) or are written by hand
   (the booking page's Service). The site-wide LocalBusiness block is rendered once per page by the footer
   (components/LocalBusinessJsonLd.tsx) and is not repeated here. */
export type JsonLd = Record<string, unknown>;

export function PageSchema({ items }: { items: JsonLd[] }) {
  if (!items.length) return null;
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON inside a script element: escape "<" so no markup can terminate the block
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
}
