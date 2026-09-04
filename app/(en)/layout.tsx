import type { Metadata } from 'next';
import Script from 'next/script';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PageLoader } from '@/components/PageLoader';
import '../../overrides/global.css';

export const metadata: Metadata = {
  metadataBase: new URL("https://mcallen.snoozemattresscompany.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageLoader locale="en" />
        <SiteHeader locale="en" />
        {children}
        <SiteFooter locale="en" />
        <Script src="/snz-motion.js?v=mtndbsf9" strategy="afterInteractive" />
        {/* Safety net: rewrites any asset URL the GHL runtime still builds against the original CDNs to the
            local copies, and provides window.__ghlOnReady for the site's own DOMContentLoaded scripts. */}
        <Script src="/ghl-offline-shim.js?v=mtndbsf9" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
