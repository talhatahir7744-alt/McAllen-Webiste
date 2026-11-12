> **McAllen site note (November 12, 2026).** This is the client's kit README, kept for reference. On this site the
> listings are **not** in `content/clearance.json` and there is no `public/clearance/` folder: they come from a
> **published Google Sheet** (File → Share → Publish to web → CSV; its URL is `CLEARANCE_URL` in Vercel). `lib/clearance.ts`
> → `getClearance()` reads and parses the CSV (columns: location, id, category, brand, model, size, comfort,
> construction, condition, new_in_box, retail, sale, qty, listed, photos, description, status, sold_date), keeps the
> rows whose `location` is McAllen, converts Google Drive share links to direct image URLs, accepts YYYY-MM-DD or
> MM/DD/YYYY dates, skips rows without id/brand/model/sale/retail (logged), refreshes every 60 s (`/clearance` is ISR)
> and shows the empty state when the sheet is unavailable. The "Managing listings" section below therefore does not
> apply here (edit the sheet instead); everything else (GHL setup, fields, jump links, analytics, spam protection)
> does. The page is at `app/(en)/clearance/page.tsx` (same URL), the request route at `app/api/clearance-request/
> route.ts`; env names are in `.env.example`; parser tests in `tests/clearance.test.ts` (`npm test`).

# Clearance & Floor Models page – Next.js drop-in kit

Prepared by Snooze mattress + wellness Corporate Marketing, November 2026.
Built and test-compiled against **Next.js 15 (App Router) + React 19 + TypeScript 5**. Read with the
"Clearance Page – Dev Spec" document, which has the business rules and the GHL setup.

## What's in the kit

```
app/clearance/page.tsx                  Page (server component): hero, board, fine print, SEO metadata
app/api/clearance-request/route.ts      API route: validates, looks up the listing, forwards to GHL
components/clearance/ClearanceBoard.tsx Filters, sort, listing cards, photo carousel, jump links
components/clearance/RequestInfoModal.tsx  "Request info" pop-up (bottom sheet on phones)
components/clearance/NotifyForm.tsx     "Text me new deals" sign-up
components/clearance/clearance.module.css  All styles, scoped (no Tailwind needed)
lib/clearance.ts                        Types + rules (visibility, warranty/delivery lines, pricing)
content/clearance.json                  THE DATA FILE – Corp Marketing edits this
public/clearance/<store>/               Listing photos
```

No new npm packages. Uses the `@/` import alias; if the repo doesn't have it, add
`"baseUrl": ".", "paths": { "@/*": ["./*"] }` to `tsconfig.json` or switch to relative imports.
If the repo uses `src/`, put the folders under `src/`.

## Install (about 30 minutes)

1. Copy the folders into the store site's repo.
2. Add the nav link **Clearance** → `/clearance` (keep the existing **Sales** link).
3. In Vercel → Project → Settings → Environment Variables add
   `GHL_CLEARANCE_WEBHOOK_URL` = the store's GHL Inbound Webhook URL (step below). Production + Preview.
4. Deploy a Preview, submit a test request, confirm the contact lands in the store's GHL sub-account.
5. Add the page to the sitemap. Fonts: the components expect Poppins + Montserrat, which the site already loads.

## Go High Level setup (per store sub-account)

1. **Automation → Workflows → Create workflow → Trigger: Inbound Webhook.** Copy its URL into
   `GHL_CLEARANCE_WEBHOOK_URL`. Submit one test request so GHL can see the fields, then map them.
   (Confirm the Inbound Webhook trigger is available on your GHL plan.)
2. Actions, in order:
   - **Create/Update Contact** – first_name, last_name, phone, email.
   - **Add Tags** – from `tags` (`clearance-lead`, `listing-mca-1101`, plus `hold-request` when checked).
     For `type = alerts`, tag `clearance-alerts` only and stop there.
   - **Create/Update Opportunity** – pipeline "Clearance", stage "New request",
     name = `item_summary`, value = `sale_price`.
   - **Internal notification (SMS + app)** to the Sleep Coach on duty:
     "New clearance lead: {{first_name}} {{phone}} – {{item_summary}} – Hold: {{hold_request}} – Best time: {{best_time}}".
   - **Send SMS to contact**: "Thanks {{first_name}}! A Sleep Coach from Snooze Mattress in McAllen
     will call you shortly about the {{brand}} {{model}}. Reply STOP to opt out."
   - **Wait 10 minutes → If opportunity still "New request" → notify the store manager.**
3. Fields sent in every request:
   `type, store, store_name, first_name, last_name, phone, email, best_time, message, hold_request,
   sms_consent, listing_id, brand, model, size, condition, sale_price, retail_price, item_summary,
   page_url, submitted_at, tags`.

## Managing listings (no code changes)

Edit `content/clearance.json` in GitHub (pencil icon) and commit. Vercel redeploys in about a minute.

| Task | What to change |
|---|---|
| Add an item | Add an object to `listings`; upload photos to `public/clearance/<store>/` |
| Mark sold | `"status": "sold"` and `"soldDate": "YYYY-MM-DD"` – shows a SOLD ribbon for `soldVisibleDays`, then disappears |
| Pull an item | `"status": "hidden"` (or delete the object) |
| Keep an old listing live | Update `listed` to today (items auto-hide after `autoExpireDays`; set 0 to turn off) |

Rules built into `lib/clearance.ts`: `newInBox: true` shows "Full manufacturer warranty", otherwise
"Warranty available"; every item shows "Delivery & setup available"; mattresses also show
"Old mattress haul-away available"; savings % and "You save" are calculated from retail and sale.

Photos: 3–5 per item, landscape 4:3, ~1600 px wide, JPG/WebP under 400 KB, named
`<listing id>-1.jpg`, `-2.jpg` … The first photo is the cover. Full https URLs (e.g. GHL media library) also work.

## Jump links

`/clearance#MCA-1101` scrolls to that card and outlines it for 3 seconds. If the item is gone the
visitor simply lands on the page, so there are no dead links to redirect.

## Several stores

- **One repo per store:** each repo has its own `content/clearance.json` and its own env var. Nothing else changes.
- **One repo, many stores:** change `content/clearance.json` to `content/clearance/<store>.json`, pick the
  file by host name or a `STORE_SLUG` env var in `lib/clearance.ts`, and use one webhook URL per store
  (e.g. `GHL_CLEARANCE_WEBHOOK_URL_MCALLEN`).

## Pages Router

If the site uses `pages/` instead of `app/`: the components work as they are. Render
`<ClearanceBoard>` from `pages/clearance.tsx` (do the `isVisible` filter in `getStaticProps` with
`revalidate: 3600`) and convert the route to `pages/api/clearance-request.ts` (same logic, `req.body`/`res.json`).

## Analytics

`RequestInfoModal` pushes `clearance_request_submit` (with `listing_id`, `hold`) to `dataLayer`
for the existing GTM container. Add a GA4 event tag on that trigger.

## Spam protection

Each form has a hidden honeypot field (`company`). The route also requires a 10-digit phone and SMS consent,
and only accepts listing IDs that exist. If spam shows up, add Vercel's BotID or Cloudflare Turnstile.
