import type { Metadata } from 'next';
import Script from 'next/script';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PageLoader } from '@/components/PageLoader';
import '../../overrides/global.css';

export const metadata: Metadata = {
  metadataBase: new URL("https://brownsville-webiste.vercel.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <PageLoader locale="es" />
        <SiteHeader locale="es" />
        {children}
        <SiteFooter locale="es" />
        <Script src="/snz-motion.js?v=mtlqkuqs" strategy="afterInteractive" />
        {/* Safety net: rewrites any asset URL the GHL runtime still builds against the original CDNs to the
            local copies, and provides window.__ghlOnReady for the site's own DOMContentLoaded scripts. */}
        <Script src="/ghl-offline-shim.js?v=mtlqkuqs" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
