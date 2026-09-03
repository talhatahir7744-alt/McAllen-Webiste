# McAllen Snooze — Next.js conversion

Next.js 15 (App Router, TypeScript) rendering of the static wget clone of
`https://brownsville.snoozemattresscompany.com/` (a GoHighLevel / LeadConnector funnel).
The whole project is **generated** by [`scripts/convert.mjs`](scripts/convert.mjs); re-run it whenever the clone is re-pulled:

```bash
npm install
CLONE_ROOT=C:/clones NEXT_PUBLIC_SITE_URL=https://mcallen.snoozemattresscompany.com npm run convert
npm run build && npm run start   # http://localhost:3000
npm run verify                    # routes, network capture, forbidden-host grep, screenshots
```

## Routes (42)

| Route | Source page | Title |
|---|---|---|
| `/about-us` | `about-us.html` | Stop Guessing. Start Sleeping Better Tonight. |
| `/es/about-us` | `about-us.html` | Deja de Adivinar. Empieza a Dormir Mejor Esta Noche. |
| `/adjustable-mattress-bases` | `adjustable-mattress-bases.html` | Elevate Your Sleep with Adjustable Mattress Bases |
| `/es/adjustable-mattress-bases` | `adjustable-mattress-bases.html` | Mejora tu Descanso con Bases Ajustables para Colchón |
| `/at-home-sleep-test-kit-by-sleepcorner` | `at-home-sleep-test-kit-by-sleepcorner.html` | Discover What's Disrupting Your Sleep—From Home |
| `/es/at-home-sleep-test-kit-by-sleepcorner` | `at-home-sleep-test-kit-by-sleepcorner.html` | Descubre Qué Interrumpe tu Sueño, Desde Casa |
| `/dream/map/thank/you` | `dream/map/thank/you.html` | Thank You for Scheduling Your  Dream Mapping Appointment! |
| `/es/dream/map/thank/you` | `dream/map/thank/you.html` | ¡Gracias por Agendar tu Cita de Dream Mapping! |
| `/home-page` | `home-page.html` | Best Mattress Store in McAllen, TX \| Snooze Mattress McAllen |
| `/es/home-page` | `home-page.html` | La Mejor Tienda de Colchones en McAllen, TX \| Snooze Mattress McAllen |
| `/` | `index.html` | Best Mattress Store in McAllen, TX \| Snooze Mattress McAllen |
| `/es` | `index.html` | La Mejor Tienda de Colchones en McAllen, TX \| Snooze Mattress McAllen |
| `/main-page` | `main-page.html` | Best Mattress Store in McAllen, TX \| Snooze Mattress McAllen |
| `/es/main-page` | `main-page.html` | La Mejor Tienda de Colchones en McAllen, TX \| Snooze Mattress McAllen |
| `/massage-chairs` | `massage-chairs.html` | Infinity® Massage Chairs in McAllen |
| `/es/massage-chairs` | `massage-chairs.html` | Sillas de Masaje Infinity® en McAllen |
| `/mattress-financing` | `mattress-financing.html` | Flexible Mattress Payment Plans at Snooze Mattress Company |
| `/es/mattress-financing` | `mattress-financing.html` | Planes de Pago Flexibles para Colchones en Snooze Mattress Company |
| `/mattress-protectors` | `mattress-protectors.html` | Protect Your Mattress, Protect Your Investment |
| `/es/mattress-protectors` | `mattress-protectors.html` | Protege tu Colchón, Protege tu Inversión |
| `/mattress-sales` | `mattress-sales.html` | Sleep Better. Save More. Shop Local. |
| `/es/mattress-sales` | `mattress-sales.html` | Duerme Mejor. Ahorra Más. Compra Local. |
| `/mattresses` | `mattresses.html` | Best Mattresses  in McAllen |
| `/es/mattresses` | `mattresses.html` | Los Mejores Colchones en McAllen |
| `/optin-page` | `optin-page.html` | Contact Us |
| `/es/optin-page` | `optin-page.html` | Contáctanos |
| `/pillows` | `pillows.html` | Elevate Your Sleep with Premium Pillows in McAllen |
| `/es/pillows` | `pillows.html` | Mejora tu Descanso con Almohadas Premium en McAllen |
| `/premium-sheets` | `premium-sheets.html` | Wrap Yourself in Luxury Every Night |
| `/es/premium-sheets` | `premium-sheets.html` | Envuélvete en Lujo Cada Noche |
| `/privacy-policy-page-1` | `privacy-policy-page-1.html` | Privacy Policy |
| `/es/privacy-policy-page-1` | `privacy-policy-page-1.html` | Política de Privacidad |
| `/privacy-policy-page` | `privacy-policy-page.html` | Privacy Policy |
| `/es/privacy-policy-page` | `privacy-policy-page.html` | Política de Privacidad |
| `/sleep-recliner` | `sleep-recliner.html` | Sleep Better, Recline Smarter with the Zcliner® |
| `/es/sleep-recliner` | `sleep-recliner.html` | Duerme Mejor y Reclínate con Inteligencia con el Zcliner® |
| `/terms-conditions-page` | `terms-conditions-page.html` | Terms & Conditions |
| `/es/terms-conditions-page` | `terms-conditions-page.html` | Términos y Condiciones |
| `/terms-conditions` | `terms-conditions.html` | Terms & Conditions |
| `/es/terms-conditions` | `terms-conditions.html` | Términos y Condiciones |
| `/thank/you` | `thank/you.html` | Thank You |
| `/es/thank/you` | `thank/you.html` | Gracias |

## How the conversion works

1. **Assets** — every non-HTML file of the clone is copied to `public/assets/<alias>/…` with Windows-safe, collision-free names
   (see [`asset-map.json`](asset-map.json) for original-local-path → public-path). Host aliases:

| Original host | Served from |
|---|---|
| `assets.cdn.filesafe.space` | `/assets/filesafe/…` |
| `images.leadconnectorhq.com` | `/assets/lcimg/…` |
| `stcdn.leadconnectorhq.com` | `/assets/lcstatic/…` |
| `fonts.googleapis.com` | `/assets/gfonts-css/…` |
| `fonts.gstatic.com` | `/assets/gfonts/…` |

   Proxied image variants (`images.leadconnectorhq.com/image/f_webp/q_80/r_<size>/u_https://assets.cdn.filesafe.space/<id>`) live under
   `/assets/lcimg/image/…/u/filesafe/<id>`. Google Fonts CSS and the `fonts.gstatic.com` woff2 files are served from `public/`, so the app makes no external font requests.
2. **Pages** — for each HTML page one route is generated (`app/<slug>/page.tsx` + `content.ts`). `<title>`, description, keywords, robots, og:* and twitter:* tags become `export const metadata`; canonical/og:url point at `https://mcallen.snoozemattresscompany.com`.
   The `<head>` stylesheet/style sequence (external `<link rel="stylesheet">`, the data-URI custom-font stylesheet and every inline `<style>`) is emitted **verbatim and in the original order** in front of the `<body>` markup, both rendered through `dangerouslySetInnerHTML` in a server component (`components/GhlPage.tsx`). This keeps the builder's cascade order exactly; importing the stylesheets through `globals.css` would have moved the page-specific inline styles after the external sheets.
3. **Scripts** — every `<script src>` and executable inline script is re-emitted through `next/script` (`strategy="afterInteractive"`) in the original order; the Nuxt JSON payload (`#__NUXT_DATA__`) and the JSON-LD block are data blocks and stay inline. Because `afterInteractive` scripts run after `DOMContentLoaded`, the site's own `document.addEventListener("DOMContentLoaded", fn)` calls were rewritten to `window.__ghlOnReady(fn)` (defined in `public/ghl-offline-shim.js`).
4. **URL rewriting** — HTML attributes, inline CSS `url()`, the Nuxt payload strings, the Nuxt runtime config (`window.__NUXT__.config`: `cdnURL`, `IMAGE_CDN`, storage/API URLs) and the copied JS bundles (`public/assets/lcstatic/_preview/*.js`) were rewritten so nothing points at `snoozemattresscompany.com`, `filesafe.space`, `leadconnectorhq.com` or `msgsndr.com`. `public/ghl-offline-shim.js` is a runtime safety net that rewrites any such URL the GHL runtime still builds at hydration time, and `middleware.ts` maps the Google Fonts stylesheet URLs the runtime assembles (`…/gfonts-css/css?family=…`) onto the local copies.
5. **Teleport fix** — Vue's `<Teleport to="body">` hydration expects its SSR anchors to be direct children of `<body>`; React needs a host element, so `components/GhlPage.tsx` moves those body-level nodes out of the wrapper right after React hydration and before the Nuxt entry runs. Without this the GHL runtime "repairs" the DOM by deleting the page.

## Header / navigation

The GoHighLevel header (desktop section `section-n2EJ48xJKc`, mobile section `section-EZ3DGo6-8h`, the "active page / magnetic hover" script and the custom mobile drawer) is removed from every page (markup and Nuxt payload) and replaced by [`components/SiteHeader.tsx`](components/SiteHeader.tsx) + [`SiteHeader.module.css`](components/SiteHeader.module.css), rendered from the root layout: sticky white bar, the original logo, the same five links, an "Our Products" mega menu (Products / Sleep Accessories + a Dream Mapping card), a "Blog" dropdown (the three articles + "All articles", from `lib/blog-nav.ts`), a premium phone CTA, and an off-canvas mobile drawer with expandable Products and Blog groups (staggered items, swipe-to-close). Hover intent, Escape, outside-click, focus management and reduced-motion are handled in the component. Site values (phone, logo, feature image) come from `overrides/overrides.json` → `components/site-config.ts`.

## Footer

One footer for the whole site: `components/SiteFooter.tsx` (+ module CSS), rendered by the root layout on every route (GoHighLevel pages and the blog). It merges the light footer (logo, description, social icons, Our Products, Company, Visit Us, bottom bar with Terms / Privacy) with the pieces of the old blue footer: the Google Map with the "Our Location" card (address, Get Directions, Open Maps), the phone with its orange icon and the two CTA buttons (Book Your Dream Mapping Appointment, Get In Touch With Us). The old GHL footer sections (`section-ghjYZIxTU2` mobile, `section-zTxb2Wa9Nv` desktop) are removed from every page via `removeElements`.

## Buttons

`overrides/buttons.css` is injected after every page's own CSS and applies the client's `.waitlist-button` look to every GoHighLevel button: orange gradient, no border, 8px radius, Poppins 16px/600 uppercase, shine sweep, lift on hover, compact sizing on phones (≤ 767px). GHL "buttons" that are really plain text links (transparent background + `noBorder`: the address/phone strips, the footer product list) are excluded per page through a generated `:not(.cbutton-ID)` chain (the `{{not}}` placeholder), so they keep their original look.

## Blog (hand-written Next.js routes)

`/blog` and the three posts (`/blog/custom-mattresses-improving-health`, `/blog/pressure-mapping-for-sleep`, `/blog/mattresses-that-relieve-aches`) are native App Router pages: content in `lib/blog-posts.ts` (client copy verbatim), template in `components/blog/` (hero → featured image → article → FAQ accordion → CTA → related posts → footer, one continuous lavender gradient), unique meta title/description, canonical, Open Graph + Twitter cards, JSON-LD BlogPosting + FAQPage + BreadcrumbList, `app/sitemap.ts` and `app/robots.ts`. Images are site assets served through `next/image`. The converter keeps `app/blog`, `app/sitemap.ts` and `app/robots.ts` when it regenerates `app/`.

## Page fixes (`overrides/site.css`, `overrides/global.css`)

`site.css` is injected after every page stylesheet: the Financing / About Us / Home timeline block is transparent so the section's own lavender background flows from the heading into the timeline (no white seam). `global.css` is imported by the root layout for every route: smooth scrolling (disabled under reduced motion) with `scroll-padding-top` so anchors land below the sticky header. The timeline / guarantee scripts in `overrides/*.html` initialise every copy of a section (GHL renders a desktop and a mobile copy), so they animate on phones.

## Mobile navigation (paste-ready, vanilla)

`overrides/mobile-nav/snooze-mobile-nav.html` is a self-contained mobile-only (≤ 767px) drawer (HTML + CSS + JS, `snzm-` prefix, no dependencies) for a custom-code element: slide-in drawer, blurred overlay, hamburger→X, staggered items, animated submenus (Our Products, Blog), focus trap, ARIA, swipe-to-close, current-page highlight, body scroll lock. This site uses the React drawer in `components/SiteHeader.tsx`, which has the same behaviours.

## Replaced sections (hand-provided code)

Custom-code elements whose content matches a rule in `overrides/overrides.json` are swapped for the file below, in both the server markup and the Nuxt payload; `{{custom_values.*}}` merge tags are filled from the `vars` block:

- **trust-ticker** → `overrides/trust-ticker.html` on about-us.html (2 elements)
- **store-experience-timeline** → `overrides/store-experience-timeline.html` on about-us.html, mattress-financing.html (4 elements)
- **our-promise-guarantee** → `overrides/our-promise-guarantee.html` on about-us.html, adjustable-mattress-bases.html, at-home-sleep-test-kit-by-sleepcorner.html, home-page.html, index.html, main-page.html, massage-chairs.html, mattress-financing.html, mattress-protectors.html, mattress-sales.html, mattresses.html, pillows.html, premium-sheets.html, sleep-recliner.html (2 elements)
- **remove-giveaway-popup** → `overrides/empty.html` on home-page.html, index.html, main-page.html (1 element)
- **dream-map-timeline** → `overrides/dream-map-timeline.html` on home-page.html, index.html, main-page.html (2 elements)
- **logo-marquee** → `overrides/logo-marquee.html` on home-page.html, index.html, main-page.html, mattresses.html (1 element)
- **logo-marquee-mobile** → `overrides/logo-marquee.html` on home-page.html, index.html, main-page.html, mattresses.html (2 elements)

## Inserted sections (copied from another page)

`overrides.json` → `insertSections` copies whole GoHighLevel sections from one page into the others: the "Our Promise / We Stand Behind Every Single Night's Sleep" guarantee (desktop + mobile copies) from `about-us.html` is inserted right before the section containing "Some of Our Happy Customers" on every page that has it. `scripts/insert-sections.mjs` does it in the three places hydration needs: SSR markup, the Nuxt payload (nodes encoded into the devalue array, listed before the anchor in `pageData.elements` and in the root child list) and the per-element CSS (media queries preserved). Pages touched: 28.

## Hero backgrounds

`overrides.json` → `heroBackgrounds` maps a page to the image its hero should use; `scripts/hero-backgrounds.mjs` applies it to the first desktop-only section that carries a background (CSS variants + payload); the mobile hero copy keeps its own image. Pages configured: 28.

## Responsive pass

`overrides/site.css` normalises the horizontal gutter of every content row (20px on phones, 32px on tablets; tickers/marquees excluded), makes the timelines single-column on phones (card centred, watermark inside the card, decorative blobs off), keeps media inside its container, gives the financing band a matching background colour behind its rounded image plus a slight darkening and large semibold copy for WCAG AA, and deepens the orange address strips (`.snz-orange-strip`, class set by the converter) to 4.5:1. `scripts/responsive-extras.mjs`: every text element's mobile and desktop font size become one `clamp()` between 390px and 1440px, and every local image gets width/height attributes read from the file (536 added).

## Motion

One shared system: `overrides/motion.css` + `public/snz-motion.js` (loaded by the root layout). Elements carry `data-animate="fade-up|fade-down|fade-left|fade-right|zoom-in|fade"` and optional `data-delay`; the converter tags server-rendered elements from `overrides/motion.json` (page rules first, then the `*` defaults; custom-code sections keep their own animations). The hidden state only applies while `html.js` is set by the shim before first paint (never under reduced motion), so content is visible without JavaScript. Also: hover lift / press-down on buttons, a soft pulse on the hero CTA (`.snz-pulse`), card lift on the timelines.

## Locales (/es)

Every page is generated once per locale: English under `app/(en)/` and Spanish under `app/es/` (same route, `/es` prefix), each route group with its own root layout (`<html lang>`, header/footer locale). The Spanish text comes from `overrides/i18n/es.part-*.json` (+ `es.extra.json` for manual fixes), an English-segment -> Spanish dictionary produced from `node scripts/i18n-extract.mjs`; `scripts/i18n.mjs` applies it to every text node and alt/title/placeholder/aria-label of the markup and to every string of the Nuxt payload (hydration re-renders from the payload, so both must agree), and prefixes internal links. Segments without a translation are listed in `overrides/i18n/missing.json` after each run. Metadata (title, description, Open Graph) is translated the same way; every page declares `hreflang` alternates for en, es and x-default. The header, footer and blog use `lib/i18n.ts`; the blog posts have hand-translated Spanish versions in `lib/i18n/blog-es/`. The LeadConnector embeds (reviews, popup form, booking calendar) are the client's CRM widgets and render in the language configured there.

## FAQ accordions, financing ribbon, navy cards

Every GoHighLevel FAQ element is rebuilt as the blog-style accordion (`overrides/faq-accordion.html`, questions and answers taken verbatim from the element; one delegated click handler serves every copy). The GoHighLevel FAQ component rewrote its items' class lists on every toggle, which also removed the scroll-reveal class and faded the answers out. The "0% Financing Available" ribbon PNG (whose folds were drawn unevenly) is replaced by the coded ribbon in `overrides/ribbon.html` (`.snz-ribbon`: navy body, folded ends, dotted border, white logo, translatable headline; centred, up to 620px, flush with the section top). Both become custom-code elements in markup and payload, like the CRM widgets. Navy rounded cards with the orange border carry `.snz-card` (detected from their page CSS) so `overrides/site.css` can give them one inner padding on phones.

## CRM widgets (live embeds)

The reviews widget iframe is sized by a `message` listener in `public/ghl-offline-shim.js` (installed before the iframe can post its height). The widget posts a 1px collapse right after every real height and restores it ~5 s later, so the listener ignores collapses once a real height is known and the vendor helper `review-widget.js` (which re-applies them) is not embedded; `overrides/widgets/reviews.html` reserves space with a loading placeholder until the first real height arrives. The booking calendar iframe is sized by a second listener for the widget's `highlevel.setHeight` message (the vendor `form_embed.js` looks for an iframe id the embed does not carry, which left the calendar cut off at 150px); `overrides/site.css` gives it a 760px minimum until the first message.

The LeadConnector form, booking-calendar and review-widget elements are rendered as the client's white-label embeds (`link.snoozesleep.com`, `reputationhub.site`) configured in `overrides/overrides.json` → `widgets`. These iframes talk to the client's CRM on their own; the page itself still makes no request to leadconnectorhq.com (its API base URLs point at `/ghl-stub/api/…`, which returns 404):

- **review-widget** × 56 on 14 pages: live reviews embed (67f5847f79c4ab793baf0087).
- **form** × 20 on 9 pages: live form embed (0BTnYKylVR6OcWJug3r8).

There is no chat widget in the page code itself; the LeadConnector chat widget (`widgets.leadconnectorhq.com`) was loaded by the Google Tag Manager container, which is removed.

## Removed tracking / analytics

- payload.globalHeadTrackingCode (21 pages): `inline script: (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),…`
- payload.globalHeadTrackingCode (21 pages): `script src=https://www.googletagmanager.com/gtag/js?id=G-VT9FVLEFMS`
- payload.globalHeadTrackingCode (21 pages): `inline script:  window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(argum…`
- payload.globalBodyTrackingCode (21 pages): `noscript: <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TVPN94M" height="0"`
- body noscript (21 pages): `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TVPN94M" height="0" width="0" style="di`

Removed external scripts:

- `https://apisystem.tech/js/reviews_widget.js` (14 pages): GoHighLevel reviews-widget loader (CRM widget)

## Known differences from the original

- Third-party embeds that are not the client's CRM are kept as-is and still load from their own hosts: Google Maps embeds (`maps.google.com`), social links.
- The reviews widget, popup form and booking calendar show placeholders instead of live CRM content.
- Fonts, images, CSS and the GoHighLevel runtime (Nuxt bundle + 1301 asset files) are served locally.
- 49 referenced file(s) did not exist in the clone and now resolve to a local 404 instead of the CDN (see conversion-report.json → missingReferenced).

Generated 2026-09-03T19:15:06.676Z from `C:/clones`.
