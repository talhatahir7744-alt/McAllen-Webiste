/*
 * Page-level structured data for the generated GoHighLevel pages (SEO audit, October 2026 — section 5).
 * For every generated route (app/**／content.ts + page.tsx, English and Spanish):
 *   - FAQPage from the page's own FAQ accordion (overrides/faq-accordion.html markup: .snz-faq__item → question in
 *     .snz-faq__btn, answer in .snz-faq__a), questions deduplicated (the builder exports every section twice);
 *   - BreadcrumbList (Home › page) on the product pages;
 *   - the builder's own "schemaMarkup" is removed from the page payload: the GoHighLevel runtime used to inject it
 *     into <head> after hydration (a second FurnitureStore block with an incomplete address, next to the site's own
 *     LocalBusiness block rendered by the footer), so every page now carries exactly one LocalBusiness.
 * Writes app/<route>/schema.ts (PAGE_SCHEMA) and adds <PageSchema items={PAGE_SCHEMA} /> to the route's page.tsx
 * (components/PageSchema.tsx renders the JSON-LD server-side). Idempotent; run after `npm run convert` and the
 * other post-convert scripts:  node scripts/page-schema.mjs   (npm run schema)   [--check: report only]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cheerio = require('cheerio');
const CHECK = process.argv.includes('--check');
const SITE_URL = 'https://mcallen.snoozemattresscompany.com';
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');

/* product pages → breadcrumb name (the header's product labels, lib/i18n.ts) */
const PRODUCT_NAMES = {
  '/mattresses': { en: 'Mattresses', es: 'Colchones' },
  '/adjustable-mattress-bases': { en: 'Adjustable Mattress Bases', es: 'Bases Ajustables' },
  '/massage-chairs': { en: 'Massage Chairs', es: 'Sillas de Masaje' },
  '/pillows': { en: 'Pillows', es: 'Almohadas' },
  '/mattress-protectors': { en: 'Mattress Protectors', es: 'Protectores de Colchón' },
  '/premium-sheets': { en: 'Premium Sheets', es: 'Sábanas Premium' },
  '/sleep-recliner': { en: 'Sleep Recliner', es: 'Sillón Reclinable' },
  '/at-home-sleep-test-kit-by-sleepcorner': { en: 'At-Home Sleep Test Kit', es: 'Kit de Prueba de Sueño en Casa' },
};
const HOME = { en: 'Home', es: 'Inicio' };

const pages = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts' && fs.existsSync(path.join(d, 'page.tsx'))) pages.push(d); } })(path.join(ROOT, 'app'));
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');
const routeOf = (dir) => { const r = rel(dir).replace(/^app\/(\(en\)|es)\/?/, (m, g) => (g === 'es' ? '/es/' : '/')); return r.replace(/\/$/, '') || '/'; };
const text = ($el) => $el.text().replace(/\s+/g, ' ').trim();
const totals = { pages: 0, faq: 0, crumbs: 0, builderBlocksRemoved: 0 };

for (const dir of pages) {
  const route = routeOf(dir); const locale = route === '/es' || route.startsWith('/es/') ? 'es' : 'en'; const base = locale === 'es' ? route.replace(/^\/es/, '') || '/' : route;
  const file = path.join(dir, 'content.ts'); let src = fs.readFileSync(file, 'utf8');
  const bodyM = src.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) continue;
  const body = JSON.parse(bodyM[1]);
  const $ = cheerio.load(body, { decodeEntities: false }, false);
  // ---- FAQPage from the accordion (deduplicated by question; the builder exports every section twice)
  const seen = new Set(); const faqs = [];
  $('.snz-faq__item').each((_, it) => {
    const q = text($(it).find('.snz-faq__btn').first()); const a = text($(it).find('.snz-faq__a').first());
    if (!q || !a) return; const key = q.toLowerCase(); if (seen.has(key)) return; seen.add(key); faqs.push({ q, a });
  });
  const items = [];
  if (faqs.length) items.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  if (PRODUCT_NAMES[base]) items.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: HOME[locale], item: locale === 'es' ? `${SITE_URL}/es` : SITE_URL },
    { '@type': 'ListItem', position: 2, name: PRODUCT_NAMES[base][locale], item: `${SITE_URL}${route}` },
  ] });
  // ---- the builder's schemaMarkup leaves the payload (devalue array: pageData.schemaMarkup → -1 = undefined)
  const $p = $('script#__NUXT_DATA__').first(); let payloadChanged = false;
  if ($p.length) {
    const nodes = JSON.parse($p.html());
    for (const n of nodes) if (n && typeof n === 'object' && !Array.isArray(n) && typeof n.schemaMarkup === 'number' && n.schemaMarkup >= 0) { n.schemaMarkup = -1; payloadChanged = true; totals.builderBlocksRemoved++; }
    if (payloadChanged) $p.html(escapeJsonForScript(JSON.stringify(nodes)));
  }
  // ---- write schema.ts + patch page.tsx
  const schemaTs = `// Generated by scripts/page-schema.mjs — do not edit by hand (FAQ from the page's accordion, breadcrumb from the route).\nimport type { JsonLd } from '@/components/PageSchema';\n\nexport const PAGE_SCHEMA: JsonLd[] = ${JSON.stringify(items, null, 2)};\n`;
  const schemaFile = path.join(dir, 'schema.ts'); const pageFile = path.join(dir, 'page.tsx');
  let page = fs.readFileSync(pageFile, 'utf8'); const pageBefore = page;
  if (!page.includes("from '@/components/PageSchema'")) {
    page = page.replace("import PageClient from './client';", "import PageClient from './client';\nimport { PageSchema } from '@/components/PageSchema';\nimport { PAGE_SCHEMA } from './schema';");
    if (/return <PageClient \/>;/.test(page)) page = page.replace('return <PageClient />;', 'return (\n    <>\n      {/* page-level JSON-LD (scripts/page-schema.mjs) */}\n      <PageSchema items={PAGE_SCHEMA} />\n      <PageClient />\n    </>\n  );');
    else page = page.replace('      <PageClient />', '      {/* page-level JSON-LD (scripts/page-schema.mjs) */}\n      <PageSchema items={PAGE_SCHEMA} />\n      <PageClient />');
    if (!page.includes('<PageSchema items={PAGE_SCHEMA} />')) throw new Error(`${rel(pageFile)}: could not place <PageSchema>`);
  }
  const line = `${route.padEnd(44)} FAQ ${String(faqs.length).padStart(2)}  breadcrumb ${PRODUCT_NAMES[base] ? 'yes' : 'no '}  builder block ${payloadChanged ? 'removed' : 'absent '}`;
  console.log(line);
  totals.pages++; totals.faq += faqs.length; if (PRODUCT_NAMES[base]) totals.crumbs++;
  if (CHECK) continue;
  if (!fs.existsSync(schemaFile) || fs.readFileSync(schemaFile, 'utf8') !== schemaTs) fs.writeFileSync(schemaFile, schemaTs);
  if (page !== pageBefore) fs.writeFileSync(pageFile, page);
  if (payloadChanged) { src = src.replace(bodyM[1], () => JSON.stringify($.html())); fs.writeFileSync(file, src); }
}
console.log(`\n${totals.pages} pages: ${totals.faq} FAQ questions, ${totals.crumbs} breadcrumb lists, ${totals.builderBlocksRemoved} builder schema blocks removed from payloads${CHECK ? ' (check only, nothing written)' : ''}`);
