import type { MetadataRoute } from 'next';

const SITE_URL = 'https://brownsville-webiste.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/ghl-stub/', '/ghl-stub.html', '/thank', '/dream'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
