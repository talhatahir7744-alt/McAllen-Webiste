import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // the page's own CSS (global.css, the Poppins faces, component modules: ~15 KB) is written into the HTML instead
  // of three render-blocking stylesheet requests
  experimental: { inlineCss: true },
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
