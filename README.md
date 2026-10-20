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

## Routes (38)

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
| `/privacy-policy-page` | `privacy-policy-page.html` | Privacy Policy |
| `/es/privacy-policy-page` | `privacy-policy-page.html` | Política de Privacidad |
| `/sleep-recliner` | `sleep-recliner.html` | Sleep Better, Recline Smarter with the Zcliner® |
| `/es/sleep-recliner` | `sleep-recliner.html` | Duerme Mejor y Reclínate con Inteligencia con el Zcliner® |
| `/terms-conditions-page` | `terms-conditions-page.html` | Terms & Conditions |
| `/es/terms-conditions-page` | `terms-conditions-page.html` | Términos y Condiciones |
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
4. **URL rewriting** — HTML attributes, inline CSS `url()`, the Nuxt payload strings, the Nuxt runtime config (`window.__NUXT__.config`: `cdnURL`, `IMAGE_CDN`, storage/API URLs) and the copied JS bundles (`public/assets/lcstatic/_preview/*.js`) were rewritten so nothing points at `snoozemattresscompany.com`, `filesafe.space`, `leadconnectorhq.com` or `msgsndr.com`. `public/ghl-offline-shim.js` is a runtime safety net that rewrites any such URL the GHL runtime still builds at hydration time, and FONTMAP in the shim maps the Google Fonts stylesheet URLs the runtime assembles onto the local copies.
5. **Teleport fix** — Vue's `<Teleport to="body">` hydration expects its SSR anchors to be direct children of `<body>`; React needs a host element, so `components/GhlPage.tsx` moves those body-level nodes out of the wrapper right after React hydration and before the Nuxt entry runs. Without this the GHL runtime "repairs" the DOM by deleting the page.

## Header / navigation

The GoHighLevel header (desktop section `section-n2EJ48xJKc`, mobile section `section-EZ3DGo6-8h`, the "active page / magnetic hover" script and the custom mobile drawer) is removed from every page (markup and Nuxt payload) and replaced by [`components/SiteHeader.tsx`](components/SiteHeader.tsx) + [`SiteHeader.module.css`](components/SiteHeader.module.css), rendered from the root layout: sticky white bar, the original logo, the same five links, an "Our Products" mega menu (Products / Sleep Accessories + a Dream Mapping card), a "Blog" dropdown (the three articles + "All articles", from `lib/blog-nav.ts`), a premium phone CTA, and an off-canvas mobile drawer with expandable Products and Blog groups (staggered items, swipe-to-close). Hover intent, Escape, outside-click, focus management and reduced-motion are handled in the component. Site values (phone, logo, feature image) come from `overrides/overrides.json` → `components/site-config.ts`.

## Footer

One footer for the whole site: `components/SiteFooter.tsx` (+ module CSS), rendered by the root layout on every route (GoHighLevel pages and the blog). It merges the light footer (logo, description, social icons, Our Products, Company, Visit Us, bottom bar with Terms / Privacy) with the pieces of the old blue footer: the Google Map with the "Our Location" card (address, Get Directions, Open Maps), the phone with its orange icon and the two CTA buttons (Book Your Dream Mapping Appointment, Get In Touch With Us). The old GHL footer sections (`section-ghjYZIxTU2` mobile, `section-zTxb2Wa9Nv` desktop) are removed from every page via `removeElements`.

## Buttons

`overrides/buttons.css` is injected after every page's own CSS and applies the client's `.waitlist-button` look to every GoHighLevel button: orange gradient, no border, 8px radius, Poppins 16px/600 uppercase, shine sweep, lift on hover, compact sizing on phones (≤ 767px). GHL "buttons" that are really plain text links (transparent background + `noBorder`: the address/phone strips, the footer product list) are excluded per page through a generated `:not(.cbutton-ID)` chain (the `{{not}}` placeholder), so they keep their original look.

## Blog (hand-written Next.js routes)

`/blog` and the three posts (`/blog/custom-mattresses-improving-health`, `/blog/pressure-mapping-for-sleep`, `/blog/mattresses-that-relieve-aches`) are native App Router pages: content in `lib/blog-posts.ts` (client copy verbatim), template in `components/blog/` (hero → featured image → article → FAQ accordion → CTA → related posts → footer, one continuous lavender gradient), unique meta title/description, canonical, Open Graph + Twitter cards, JSON-LD BlogPosting + FAQPage + BreadcrumbList, `app/sitemap.ts` and `app/robots.ts`. Images are site assets served through `next/image`. The converter keeps `app/blog`, `app/sitemap.ts` and `app/robots.ts` when it regenerates `app/`.

## Sleep Fit Quiz (hand-written route)

`/sleep-quiz` and `/es/sleep-quiz` are the client's Sleep Fit Quiz inside the site header and footer: `components/SleepQuiz.tsx` renders the quiz shell and metadata (self-canonical, hreflang pair, `?r=` results links canonical to the bare page), `components/sleep-quiz/sleep-fit-quiz.css` is the quiz stylesheet scoped under `.snz-quiz`, and `public/sleep-fit-quiz.js` is the quiz logic (scoring, screens, lead form, kiosk mode `?kiosk=1`, shareable results) with every human-readable string in an EN/ES table and the McAllen store CONFIG + GoHighLevel inbound webhook. The converter keeps `app/(en)/sleep-quiz` and `app/es/sleep-quiz`. Calls to action link to it from the header (desktop item + mobile drawer item and button), the footer Company column, the Dream Mapping steps, the brand marquee, the guarantee cards, every FAQ accordion (`overrides/*.html`, styled by `overrides/site.css` → `.snz-quiz-cta`, Spanish copy in `overrides/i18n/es.extra.json`) and the blog posts (`components/blog/BlogLayout.tsx` → `QuizCta`).

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

## Performance

- **Tag scripts** (`components/Tracking.tsx`): the dataLayer, `gtag()` and both GA4 config calls are inline in `<head>` as in the client's snippets, but gtag.js (x2), the GTM container and Simpli.fi are injected by one loader on the first user interaction or 6 s after the load event (12 s after start at the latest; a shorter fallback fired inside page-speed traces once the page got fast). The GTM container alone was ~2 s of main-thread work on a phone (the whole Total Blocking Time); nothing visible depends on it. The GTM noscript iframe is unchanged.
- **Logo marquee**: the brand logos' white/grey boxes are erased at build time (`scripts/scrub-logos.mjs`, flood fill from the edges, alpha WebP with width/height next to the original as `*.scrub.webp`); the page no longer redraws 34 logos on canvases or downloads each file twice.
- **GHL API stub**: the runtime's stats/attribution calls (`/ghl-stub/api/…`) are rewritten by vercel.json to `public/ghl-stub/ok.json` (an empty JSON object) instead of a console 404.
- **Hosting (static export)**: `next.config.ts` sets `output: 'export'`, so the deployment is the `out/` folder of plain files: no server functions, no ISR cache (every page view served from Vercel's prerender cache counted as an ISR read and origin transfer), and a smaller deployment. Redirects (duplicate legal URLs), rewrites (widget placeholders, API stub) and immutable cache headers for `/assets` and `/_next/static` live in `vercel.json`; `.vercelignore` uploads only what `next build` needs. The converter indexes but does not ship: Google font files other than the two 'Poppins Headline' cuts (all @font-face rules are stripped from the cloned Google stylesheets), Font Awesome's svg/eot/ttf formats, the form builder's GIFs and runtime chunks no page can reach.
- **Layout shifts**: every GHL image element gets an `aspect-ratio` rule (`<style data-snz-imgratio>`) because the runtime swaps its `<picture>` for a bare `<img>` while hydrating; phone-only sections use the 768px resize as the fallback src.
- **Critical path**: the offline shim is inlined in both layouts (`lib/ghl-shim.ts`, generated with `public/ghl-offline-shim.js`), the page's own CSS is inlined (`experimental.inlineCss`), the runtime's ~40 module preloads are emitted after the page markup, and only the latin Poppins subset (five files) is preloaded.
- **Page loader**: `<noscript>` hides the overlay, so the page is fully visible without JavaScript (the reveal system also only hides elements under `html.js`).
- **One copy of the markup** (LCP pass): each route's `client.tsx` renders `GhlPage` (a client component) and reads `content.ts` only on the server (`typeof window === 'undefined'` — Next drops that branch from the client bundle). The markup is server-rendered into the HTML exactly as before, but it is no longer serialized into React's hydration payload (which doubled every document: the home page went from 3.3 MB / 456 KB gzip to 1.6 MB / 240 KB) and not bundled into the route chunk. On the client React keeps the server-rendered innerHTML because the (empty) value never changes; every link into these routes is a plain `<a>`, so they are always full loads. The page scripts (`scripts.ts`: teleport fix, Nuxt payload, runtime entry) are appended by an effect after hydration instead of next/script, which had preloaded the 256 KB runtime entry in `<head>` ahead of the hero image; the runtime's module preloads are added on window load.

## Removed tracking / analytics

- payload.globalHeadTrackingCode (19 pages): `inline script: (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),…`
- payload.globalHeadTrackingCode (19 pages): `script src=https://www.googletagmanager.com/gtag/js?id=G-VT9FVLEFMS`
- payload.globalHeadTrackingCode (19 pages): `inline script:  window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(argum…`
- payload.globalBodyTrackingCode (19 pages): `noscript: <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TVPN94M" height="0"`
- body noscript (19 pages): `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TVPN94M" height="0" width="0" style="di`

Removed external scripts:

- `https://apisystem.tech/js/reviews_widget.js` (14 pages): GoHighLevel reviews-widget loader (CRM widget)

## Known differences from the original

- Third-party embeds that are not the client's CRM are kept as-is and still load from their own hosts: Google Maps embeds (`maps.google.com`), social links.
- The reviews widget, popup form and booking calendar show placeholders instead of live CRM content.
- Fonts, images, CSS and the GoHighLevel runtime (Nuxt bundle + 1113 asset files) are served locally.
- 34 referenced file(s) did not exist in the clone and now resolve to a local 404 instead of the CDN (see conversion-report.json → missingReferenced).

Generated 2026-10-09T21:34:45.787Z from `C:/Users/Talha/AppData/Local/Temp/claude/d--McAllen-Site/6033f56f-8fef-41c1-9d45-6e65fddfb68f/scratchpad/clone`.

## SEO audit implementation (October 2026)

### Rules — business name and NAP

- The business is **"Snooze Mattress + Wellness"** everywhere ("Snooze Mattress Company", "Snooze Mattress & Wellness" and "Snooze Mattress McAllen" were all in use; plain "Snooze" stays as shorthand) and the NAP reads exactly **7913 N 10th St, Suite 130, McAllen, TX 78504 · (956) 586-5646 · Mon–Sat 10 AM–7 PM, Sun 12–6 PM** (Spanish: Lun–Sáb 10 AM–7 PM, Dom 12–6 PM). `scripts/brand-nap.mjs` (`npm run brand`, after `npm run convert`, `seo:meta`, `es:fixes` and `headings`) applies both to the generated pages (markup + Nuxt payload), the generated metadata, `lib/i18n.ts`, `lib/blog-posts.ts`, the Spanish blog posts, the components, the quiz script, the override templates and the Spanish dictionary values (never the English keys the converter looks up). First run: 237 × "Company", 141 × "& Wellness", 147 × "McAllen", 265 street forms, 267 map-query street forms, 43–44 of each hours line. Idempotent; `--check` is a dry run. `lib/location.ts` carries the same name and NAP for the footer and the LocalBusiness schema.
- Not asserted anywhere any more: a legal entity name (the old `legalName` was "Snooze Mattress Company", which the client's rule replaces) — the registered name is NEEDS CLIENT INPUT. The legal pages' copy follows the same rule. URLs, e-mail addresses and `tel:` links are untouched.

### Section 1 — redirects and index hygiene

- The builder's duplicate Home pages (`/home-page`, `/main-page`, `/es/home-page`, `/es/main-page`: identical to `/` and `/es`, each self-canonical with 28 H1s) are no longer generated (`scripts/convert.mjs` skips `home-page.html` / `main-page.html`, `DUPLICATE_ROUTES` maps them to `/`) and `vercel.json` 308-redirects them to `/` and `/es`. Legacy GoHighLevel URLs from the audit redirect too: `/post/pressure-map-for-sleep` → `/blog/pressure-mapping-for-sleep`, `/mattress-financing-mcallen-tx` → `/mattress-financing`, `/massage-chairs-402809` → `/massage-chairs` (and their `/es/` twins), plus a generic rule for any other builder slug with a six-digit suffix (`/:slug-:id(\d{6})` → `/:slug`). The duplicate legal pages were already redirecting.
- `noindex,follow` on the contact opt-in form (`/optin-page`) and the two confirmation pages (`/thank/you`, `/dream/map/thank/you`), English and Spanish (`NOINDEX_ROUTES` in the converter, written into each page's metadata). `robots.txt` no longer disallows `/thank` and `/dream`: Google can only honour a noindex tag on a page it may fetch. `/dream` is only the Dream Mapping booking confirmation page.
- `sitemap.xml`: `/optin-page` removed; every entry carries its own `lastmod` — the date of the last commit that touched the page's own source files (`scripts/lastmod.mjs` → `lib/lastmod.json`, `npm run lastmod`; blog posts keep their dates from `lib/blog-posts.ts`). Shared files (layout, header, footer, global CSS) deliberately do not count.
- `goqr.mcallen.snoozemattresscompany.com` is outside this repo: it still serves the old GoHighLevel "Grand Opening — Win a FREE Mattress" giveaway page (title "Snooze Mattress", no canonical, no robots tag, container GTM-W6PF55FZ). Recommendation in the audit report.

### Section 2 — expired offer

- The builder's "Memorial Day Savings Event — Save up to 75% … until June 6th" block (`section-g0BQMsgMwp`, Home EN + ES; the builder had hidden it with its own classes, but the copy was still in the HTML and in the page payload) is removed from the markup and the Nuxt payload (`overrides/overrides.json` → `removeElements`, the same mechanism that drops the old footer sections, so a regeneration keeps it out).
- One shared, dated **current offer** component replaces it: copy, dates and the on/off switch live in `lib/offer.ts` (`CURRENT_OFFER`), rendered by `components/CurrentOffer.tsx` on `/` and `/es` directly under the header (the converter's page template emits it for the Home route), styled by the `.snz-offer` block in `overrides/global.css`. It ships **off** with the placeholder "Current offer — pending client approval" and renders nothing until the client supplies the approved copy and dates (NEEDS CLIENT INPUT). The site is a static export, so the date window is evaluated at build time: redeploy on the day an offer starts and the day after it ends.
- Sales page audit (no changes): every offer there — "Current Mattress Deals", Helix, Snooze-O-Pedic, Puffy ("limited-time in-store offers"), King Koil ("special pricing available now"), Adjustable Base Bundles, the 0% financing band and the "We Can't Be Beat on Price — or We'll Give You the Bed FREE" promise — carries no date range and no fine print. Listed for the client in the audit report.

### Section 3 — titles, meta descriptions, Spanish fixes

- `scripts/seo-metadata.mjs` (`npm run seo:meta`, after `npm run convert`): the audit's titles for the ten main pages (verbatim; the Mattresses title is 63 characters) with ≤155-character descriptions that only restate what each page says, plus natural Spanish titles and descriptions for the `/es` twins. It also fixes the "Best Mattresses  in McAllen" double space (title and page heading) and strips the meta keywords block; `scripts/convert.mjs` no longer emits keywords at all (the builder's English keywords tag sat on the Spanish pages too).
- `scripts/spanish-copy-fixes.mjs` (`npm run es:fixes`): the financing band's duplicated "sin pagar todo por adelantado" (36 occurrences: markup + payload, desktop + phone copies on nine pages), "crezca en el McAllen" → "crezca en McAllen", the missing opening "¡" on "¡Obtén una Solución de Sueño Respaldada por la Ciencia!" and "¡Nuestros Sleep Coaches están ansiosos …!" (that line also had "Nuestra" for a plural), and "Quiz Sleep Fit" → "Sleep Fit Quiz" in the menu, drawer, quiz page title and noscript text. "Mapeo de Presión" stays only where it names the pressure-mapping technology ("¿Qué es el Mapeo de Presión?", "Nuestra tecnología de Mapeo de Presión", the blog post about it); the service is "Dream Mapping" everywhere else.

### Section 4 — headings

- `scripts/heading-structure.mjs` (`npm run headings`, after `npm run convert`, `seo:meta` and `es:fixes`): one H1 per page. The builder marked almost every heading component as `<h1>` (28 on Home) and exports every section twice (a desktop-only and a phone-only copy, one hidden at any width), so the rule is one `<h1>` per layout copy: the hero headline (merged into one `<h1>` with `<br>` where the builder had split it into lines), every other `<h1>` → `<h2>` (section titles, brand blocks, FAQs, Visit Us), the location bar's "Location / Phone / Store Hours" → `<h3>`, stat labels ("5 Min", "85%"), taglines, sentence-length lines, the sub-heading components and empty headings → `<p>`. The legal pages keep a document outline: the first bold title → `<h1>`, numbered sections `<h2>`, sub-sections `<h3>`, body lines `<p>`. The hero copy is unchanged on every page (the audit's suggested H1 wording was not applied: the visible headlines are the client's copy).
- A retagged element keeps its builder CSS (the component rules target h1…h6 and the container alike) and carries the class `snz-h`; `overrides/global.css` restores the two things the old tag provided (headings had `margin: unset`, and `<strong>` inside a heading inherits its weight) and the script writes the heading's own weight (from the builder's typography rule, else the base 500) on each demoted `<p>` — and, on the pages whose builder stylesheet makes `<strong>` inside a heading inherit its weight (Home), `font-weight: inherit` on those bold spans — so nothing moves. Every page was compared against production in a browser (component boxes and typography, pixel diffs at 1366px and 390px, English and Spanish): identical. The same retag is mirrored into the Nuxt payload, so the runtime keeps the new tags after hydration (checked in a browser on all 34 generated pages). The HTML of a page therefore contains two identical hero `<h1>`s (desktop + phone copy); exactly one is rendered at any width.
- Not touched: the hand-written pages already had one H1 each (`/booking`, `/sleep-quiz`, the blog index and posts); the footer's column titles are `<h2>`.

### Section 5 — structured data

- **One LocalBusiness per page**: `components/LocalBusinessJsonLd.tsx` (rendered by the footer on every route, both locales) carries name, full address, geo, telephone, opening hours, `priceRange` "$$", url, the storefront photo + logo as `image`, `sameAs` (Facebook, Instagram, YouTube, and the Google Business Profile URL once `lib/location.ts` → `gbpUrl` is filled in — NEEDS CLIENT INPUT) and `areaServed` McAllen, Edinburg, Mission, Pharr. `@type` is `["FurnitureStore", "LocalBusiness"]`: schema.org has no "MattressStore" type (the audit's wording is a Google Business Profile category), and an unknown type fails every validator. No AggregateRating / Review markup anywhere. The builder's own schema block (`pageData.schemaMarkup` in each page payload, which the GoHighLevel runtime injected into `<head>` after hydration: a second FurnitureStore with an incomplete address and an empty `sameAs`, plus its own FAQPage) is removed from every payload by `scripts/page-schema.mjs`, so the static HTML and the hydrated page carry the same single block.
- **Page-level blocks** (`scripts/page-schema.mjs`, `npm run schema`, after `convert` → `seo:meta` → `es:fixes` → `headings` → `brand`): `FAQPage` generated from each page's own FAQ accordion (the exact on-page questions and answers, deduplicated because the builder exports every section twice: 9 questions on 22 pages, 11 on the financing pages — 220 in all), `BreadcrumbList` (Home › page) on the eight product pages in both languages, written to `app/<route>/schema.ts` and rendered by `components/PageSchema.tsx` from the route's `page.tsx`. Blog posts already carried BlogPosting (an Article subtype) + FAQPage + BreadcrumbList; their author/publisher is the organization "Snooze Mattress + Wellness" until the client names an author.
- **Service** on `/booking` and `/es/booking` (`components/BookingPage.tsx`): Dream Mapping — free, about 5 minutes, in the McAllen store (the facts the audit supplied), provider = the store's LocalBusiness `@id`, areaServed, an Offer at price 0, the store hours.
- **Validation**: `scripts/validate-schema.mjs` (`npm run schema:check`, also `--live`) parses every JSON-LD block of every exported page, checks the required fields per type, that exactly one LocalBusiness exists per page and that no forbidden rating/review type appears — 46 pages, 0 errors. The Schema Markup Validator (validator.schema.org) reports 0 errors and 0 warnings on the sampled pages; Google's Rich Results Test is a browser-only tool (run it on the live URLs). Note: Google now shows FAQ rich results only for government and health sites, so the FAQPage markup is valid but will not produce a rich result for this store.

### Section 6 — on-page facts and local signals

- **"Visit Us" on the home page** (`components/VisitUs.tsx`, rendered by `app/(en)/page.tsx` and `app/es/page.tsx` directly under the header; the converter writes the same into the Home page template): an H2 "Visit Us" / "Visítanos" with the address (linked to the store's Google Maps listing), the store hours and the phone (a `tel:` link) as plain server-rendered text, from `lib/location.ts` like the footer and the LocalBusiness schema. Styles: `overrides/global.css` (`.snz-visit`).
- **Google Maps = the business**: the footer map on every page (`lib/location.ts` → `mapEmbed`) and the map and "Get Directions" links of the generated location cards (`scripts/brand-nap.mjs` map rules: 34 embeds, 230 links) now query the business name plus the exact NAP (`Snooze Mattress + Wellness, 7913 N 10th St, Suite 130, McAllen, TX 78504`), so they resolve to the store's own listing instead of a bare street address.
- **/review and /es/review** ("Leave Us a Review" / "Déjanos una Reseña", `components/ReviewPage.tsx`, hand-written pages kept by the converter): one button to the Google review form, whose URL is `lib/location.ts` → `reviewUrl` (NEEDS CLIENT INPUT; while it is empty the page shows "Google review link: pending client setup" instead of a dead button). `noindex,follow`, self-canonical, not in the sitemap, not blocked by robots.txt.
- **Recent Reviews** (`scripts/recent-reviews.mjs`, `npm run reviews`, `overrides/recent-reviews.html`, `lib/reviews.json`): renders the client-supplied reviews (first name, city, stars, text, date) as plain markup directly above the existing LeadConnector reviews widget on the 24 pages that carry it (both section copies, both languages; written into the page markup and the payload so hydration keeps it). `lib/reviews.json` ships EMPTY on purpose (NEEDS CLIENT INPUT: 6–10 real reviews) — with no reviews nothing is rendered; verified with a temporary sample that was not committed.
- **UTM parameters**: `/`, `/booking` and `/es` with `?utm_source=google&utm_medium=organic&utm_campaign=gbp` return 200 with the parameters intact (no redirect strips them); the client should set these on the Google Business Profile website and appointment links.

### Section 7 — tracking

- **Why GA4 stopped on September 4, 2025**: that is the day the site moved from the GoHighLevel host to this build (commit dd87ca9), which shipped with no tags at all until September 7 (3b89947), and on September 16 a performance pass (2b8a39b) deferred the four external tag scripts (both gtag.js, gtm.js, Simpli.fi) until the visitor's first interaction or 6 s after the window load event — a visitor who neither scrolled nor stayed 6 s never loaded the tags, so GA4 recorded a fraction of the traffic from then on. Nothing on the site blocked the tags by loader or consent, and the Spanish pages carry the same tags. The property configuration itself (data stream, filters, which property the client looks at) cannot be checked from the code; if GA4 shows literally zero sessions, that part is inside Google Analytics / the GTM container, not the site.
- **Fix** (`components/Tracking.tsx`): the client's snippets now sit in `<head>` verbatim and load at parse time — `gtag.js` for G-9R1JGVBRBR with its config, the GTM-TVPN94M snippet, Simpli.fi, `gtag.js` for G-TS1RXQVPYT with its config — once per page, English and Spanish, plus the GTM noscript iframe first in `<body>`. Measured on the build with no interaction at all (phone viewport): gtag.js, gtm.js and Simpli.fi are requested ~0.5 s after navigation and the first GA4 `collect` hits for both properties go out ~1.2 s in, on `/` and `/es` alike. GTM-TVPN94M is a shared container (it also fires G-0MD7ZFNCDK, G-BF5KB1B4YY, eleven Google Ads IDs and re-requests gtag.js for both site properties); its contents are managed in Google Tag Manager, not here.
- **dataLayer events for GA4 key events** (`public/snz-events.js`, loaded by both root layouts after hydration; the converter writes the same tag): `phone_click` (any `tel:` link; `phone_number`, `link_text`), `directions_click` (any Google Maps link; `link_url`, `link_text`), `booking_confirmation` (the Dream Mapping confirmation page `/dream/map/thank/you`, `/es/…`), `optin_submit` (the contact form's confirmation page `/thank/you`, `/es/…` — the form itself is a LeadConnector iframe, so its redirect is the only hook), `booking_widget_message` (best effort: a confirmation-like postMessage from the LeadConnector calendar widget). The Sleep Fit Quiz already pushes `quiz_start`, `quiz_answer`, `quiz_lead_form_view`, `quiz_completed` and `quiz_results_revisit` (`public/sleep-fit-quiz.js`). Mark `phone_click`, `directions_click`, `booking_confirmation`, `optin_submit` and `quiz_completed` as key events in GA4 (and as triggers in the GTM container if the client wants them forwarded from there).
