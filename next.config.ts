import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // the page's own CSS (global.css, the Poppins faces, component modules: ~15 KB) is written into the HTML instead
  // of three render-blocking stylesheet requests
  experimental: { inlineCss: true },
  async redirects() {
    // the builder's duplicate legal pages (same text under a second URL) permanently point at the kept copy,
    // in both languages, so search engines see one canonical URL per page
    return [
      { source: '/terms-conditions', destination: '/terms-conditions-page', permanent: true },
      { source: '/es/terms-conditions', destination: '/es/terms-conditions-page', permanent: true },
      { source: '/privacy-policy-page-1', destination: '/privacy-policy-page', permanent: true },
      { source: '/es/privacy-policy-page-1', destination: '/es/privacy-policy-page', permanent: true },
    ];
  },
  async rewrites() {
    // Every LeadConnector widget (reviews iframe, popup form, calendar) now points at /ghl-stub/…;
    // serve the visible placeholder page for those. API paths (/ghl-stub/api/…) intentionally 404.
    return [
      { source: '/ghl-stub/widget/:path*', destination: '/ghl-stub.html' },
      { source: '/ghl-stub/form/:path*', destination: '/ghl-stub.html' },
      { source: '/ghl-stub/link/:path*', destination: '/ghl-stub.html' },
      { source: '/ghl-stub/api/js/:path*', destination: '/ghl-stub/empty.js' },
    ];
  },
};

export default nextConfig;
