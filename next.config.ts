import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Every route is prerendered, so the site ships as plain static files (out/): no server functions, no ISR cache
  // (each page view from Vercel's prerender cache counted as an ISR read and as origin transfer), smaller
  // deployments. Redirects, rewrites and cache headers live in vercel.json, which Vercel applies to static output.
  output: 'export',
  // the page's own CSS (global.css, the Poppins faces, component modules: ~15 KB) is written into the HTML instead
  // of three render-blocking stylesheet requests
  experimental: { inlineCss: true },
  // next/image (footer logo, blog images) serves the local files as they are; nothing is optimized per request
  images: { unoptimized: true },
};

export default nextConfig;
