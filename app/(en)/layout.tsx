import type { Metadata } from 'next';
import Script from 'next/script';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PageLoader } from '@/components/PageLoader';
import { TrackingHead, TrackingBody } from '@/components/Tracking';
import '../../overrides/global.css';

export const metadata: Metadata = {
  metadataBase: new URL("https://mcallen.snoozemattresscompany.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <TrackingHead />
        {/* Safety net: rewrites any asset URL the GHL runtime still builds against the original CDNs to the
            local copies, provides window.__ghlOnReady for the site's own DOMContentLoaded scripts, and filters the
            review widget's height messages. A plain parser-blocking script on purpose: next/script's
            "beforeInteractive" runs after the page's own inline scripts (the review-widget.js embed among them),
            and the message filter must register before the vendor's listener. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/ghl-offline-shim.js?v=mtnkeeal" />
      </head>
      <body>
        <TrackingBody />
        <PageLoader locale="en" />
        <SiteHeader locale="en" />
        {children}
        <SiteFooter locale="en" />
        <Script src="/snz-motion.js?v=mtnkeeal" strategy="afterInteractive" />
      </body>
    </html>
  );
}
