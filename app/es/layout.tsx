import type { Metadata } from 'next';
import Script from 'next/script';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PageLoader } from '@/components/PageLoader';
import { TrackingHead, TrackingBody } from '@/components/Tracking';
import { GHL_SHIM } from '@/lib/ghl-shim';
import { Poppins } from 'next/font/google';
import '../../overrides/global.css';

/* The site typeface. next/font downloads the Google Fonts files at build time and serves them from this origin (no
   request to fonts.googleapis.com / fonts.gstatic.com at runtime), emits the @font-face rules with font-display: swap,
   preloads the files and generates a metric-matched fallback face so the swap causes no layout shift. Weights: 400 body,
   500 medium copy, 600 buttons / navigation, 700 bold text, 800 headings. The latin subset covers every English and
   Spanish character (accents and ñ are in U+00C0-00FF), so only five files are preloaded. Exposed as --font-poppins; overrides/global.css
   builds --font-poppins-stack from it. Declared in the root layout itself: Next only registers a font for preloading when
   the call sits in a layout or page module. */
const poppins = Poppins({ weight: ['400', '500', '600', '700', '800'], subsets: ['latin'], display: 'swap', variable: '--font-poppins', preload: true });

export const metadata: Metadata = {
  metadataBase: new URL("https://mcallen.snoozemattresscompany.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={poppins.variable}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://link.snoozesleep.com" />
        <link rel="dns-prefetch" href="https://reputationhub.site" />
        <link rel="dns-prefetch" href="https://tag.simpli.fi" />
        <TrackingHead />
        {/* Safety net: rewrites any asset URL the GHL runtime still builds against the original CDNs to the
            local copies, provides window.__ghlOnReady for the site's own DOMContentLoaded scripts, and filters the
            review widget's height messages. A plain parser-blocking script on purpose: next/script's
            "beforeInteractive" runs after the page's own inline scripts (the review-widget.js embed among them),
            and the message filter must register before the vendor's listener. Inlined (lib/ghl-shim.ts, generated
            with public/ghl-offline-shim.js) so it costs no extra request on the critical path. */}
        <script dangerouslySetInnerHTML={{ __html: GHL_SHIM }} />
      </head>
      <body>
        <TrackingBody />
        <PageLoader locale="es" />
        <SiteHeader locale="es" />
        {children}
        <SiteFooter locale="es" />
        <Script src="/snz-motion.js?v=mu30qwes" strategy="afterInteractive" />
      </body>
    </html>
  );
}
