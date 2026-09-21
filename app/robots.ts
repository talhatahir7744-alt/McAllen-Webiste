import type { MetadataRoute } from 'next';

// static export (next.config output: 'export'): generated once at build time, served as a plain file
export const dynamic = 'force-static';

const SITE_URL = 'https://mcallen.snoozemattresscompany.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/ghl-stub/', '/ghl-stub.html', '/thank', '/dream'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
