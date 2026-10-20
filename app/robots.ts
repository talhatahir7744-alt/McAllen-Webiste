import type { MetadataRoute } from 'next';

// static export (next.config output: 'export'): generated once at build time, served as a plain file
export const dynamic = 'force-static';

const SITE_URL = 'https://mcallen.snoozemattresscompany.com';

/* /robots.txt: everything is crawlable except the offline placeholders under /ghl-stub. The booking and Dream
   Mapping thank-you pages (/thank/you, /dream/map/thank/you) and the contact opt-in form (/optin-page) are
   deliberately NOT disallowed: they carry a noindex,follow robots meta tag (scripts/convert.mjs NOINDEX_ROUTES),
   and Google can only honour it if it is allowed to fetch the page. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/ghl-stub/', '/ghl-stub.html'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
