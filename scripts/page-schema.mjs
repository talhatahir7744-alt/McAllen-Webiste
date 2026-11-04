/*
 * Page-level structured data for the generated GoHighLevel pages (SEO audit, October 2026 — section 5).
 * For every generated route (app/**／content.ts + page.tsx, English and Spanish):
 *   - FAQPage from the page's own FAQ accordion (overrides/faq-accordion.html markup: .snz-faq__item -> question in
 *     .snz-faq__btn, answer in .snz-faq__a), questions deduplicated (the builder exports every section twice);
 *   - BreadcrumbList (Home › page) on the product pages;
 *   - CollectionPage on the category pages (schema review, November 3, 2026): @id …#webpage, name and description
 *     from the page's metadata, part of #website, about #store; on /mattresses its mainEntity is an ItemList of
 *     Brand from the page's brand blocks (h2 headings, page order), which must equal lib/brands.json (the store's
 *     brand[]); a mismatch stops the script;
 *   - the builder's own "schemaMarkup" is removed from the page payload: the GoHighLevel runtime used to inject it
 *     into <head> after hydration (a second FurnitureStore block with an incomplete address, next to the site's own
 *     #store node), so every page now carries exactly one LocalBusiness.
 * Writes app/<route>/schema.ts (PAGE_SCHEMA) and renders it with <PageSchema items={PAGE_SCHEMA} locale="…" /> from
 * the route's page.tsx (components/PageSchema.tsx: one JSON-LD graph per page, the site nodes of lib/schema.ts first).
 * Idempotent; run after `npm run convert` and the other post-convert scripts:
 *   node scripts/page-schema.mjs   (npm run schema)   [--check: report only]
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

/* product pages -> breadcrumb name (the header's product labels, lib/i18n.ts) */
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
/* the contact page (/contact-us, October 29, 2026): ContactPage about the store (the site-wide LocalBusiness record,
   @id …/#store, rendered by the footer and unchanged) + BreadcrumbList Home › Contact Us; name = the page's H1 */
const CONTACT = { '/contact-us': { en: { name: 'Contact Snooze Mattress in McAllen', crumb: 'Contact Us' }, es: { name: 'Contacta a Snooze Mattress en McAllen', crumb: 'Contáctanos' } } };
/* the category pages of the GoHighLevel export (the size/type category pages are hand-written: lib/pages/*.ts schemaPage) */
const CATEGORY = new Set(['/mattresses', '/pillows', '/mattress-protectors', '/premium-sheets', '/adjustable-mattress-bases', '/massage-chairs', '/sleep-recliner']);
const STORE_ID = `${SITE_URL}/#store`; const WEBSITE_ID = `${SITE_URL}/#website`;
const BRANDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/brands.json'), 'utf8')).mattressBrands;
const norm = (s) => s.replace(/[®™]/g, '').replace(/\s+/g, ' ').toLowerCase();
/* the brands of /mattresses in page order: the brand each section's headings name (a heading may be split over two h2s,
   "Snooze Handcrafted®" / "by King Koil Mattresses"), each brand once */
const brandBlocks = ($) => {
  const found = [];
  $('.c-section').each((_, s) => { const t = norm($(s).find('h2').toArray().map((h) => $(h).text()).join(' ')); for (const b of BRANDS) if (t.includes(norm(b)) && !found.includes(b)) found.push(b); });
  return found;
};
/* the page's title and description as its metadata states them (the generated page.tsx) */
const metaOf = (pageSrc) => { const m = pageSrc.match(/export const metadata: Metadata = (\{[\s\S]*?\n\});/); const meta = m ? JSON.parse(m[1]) : {}; return { name: String(meta.title || '').replace(/\s*\|\s*Snooze Mattress\s*$/, ''), description: meta.description }; };

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
  // (also by answer: the desktop and phone copies word one question two ways — "…in McAllen, TX?" / "…in McAllen?" —
  // with the same answer, and the FAQPage lists it once; schema review, November 3, 2026)
  const seen = new Set(); const seenAnswers = new Set(); const faqs = [];
  $('.snz-faq__item').each((_, it) => {
    const q = text($(it).find('.snz-faq__btn').first()); const a = text($(it).find('.snz-faq__a').first());
    if (!q || !a) return; const key = q.toLowerCase(); const akey = a.toLowerCase(); if (seen.has(key) || seenAnswers.has(akey)) return; seen.add(key); seenAnswers.add(akey); faqs.push({ q, a });
  });
  const items = [];
  if (faqs.length) items.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  if (PRODUCT_NAMES[base]) items.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: HOME[locale], item: locale === 'es' ? `${SITE_URL}/es` : SITE_URL },
    { '@type': 'ListItem', position: 2, name: PRODUCT_NAMES[base][locale], item: `${SITE_URL}${route}` },
  ] });
  if (CONTACT[base]) {
    items.push({ '@context': 'https://schema.org', '@type': 'ContactPage', '@id': `${SITE_URL}${route}#webpage`, url: `${SITE_URL}${route}`, name: CONTACT[base][locale].name, inLanguage: locale === 'es' ? 'es-US' : 'en-US', about: { '@id': `${SITE_URL}/#store` }, mainEntity: { '@id': `${SITE_URL}/#store` } });
    items.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: HOME[locale], item: locale === 'es' ? `${SITE_URL}/es` : SITE_URL },
      { '@type': 'ListItem', position: 2, name: CONTACT[base][locale].crumb, item: `${SITE_URL}${route}` },
    ] });
  }
  if (CATEGORY.has(base)) {
    const { name, description } = metaOf(fs.readFileSync(path.join(dir, 'page.tsx'), 'utf8'));
    if (!name) throw new Error(`${route}: no metadata title for the CollectionPage`);
    const node = { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${SITE_URL}${route}#webpage`, url: `${SITE_URL}${route}`, name, ...(description ? { description } : {}), inLanguage: locale === 'es' ? 'es-US' : 'en-US', isPartOf: { '@id': WEBSITE_ID }, about: { '@id': STORE_ID } };
    if (base === '/mattresses') {
      const brands = brandBlocks($);
      if (brands.join('|') !== BRANDS.join('|')) throw new Error(`${route}: brand blocks ${JSON.stringify(brands)} differ from lib/brands.json ${JSON.stringify(BRANDS)}`);
      node.mainEntity = { '@type': 'ItemList', name: locale === 'es' ? 'Marcas de colchones' : 'Mattress brands', numberOfItems: brands.length, itemListElement: brands.map((b, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Brand', name: b } })) };
    }
    items.push(node);
  }
  // ---- the builder's schemaMarkup leaves the payload (devalue array: pageData.schemaMarkup -> -1 = undefined)
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
  const tag = `<PageSchema items={PAGE_SCHEMA} locale="${locale}" />`;
  if (!page.includes("from '@/components/PageSchema'")) {
    page = page.replace("import PageClient from './client';", "import PageClient from './client';\nimport { PageSchema } from '@/components/PageSchema';\nimport { PAGE_SCHEMA } from './schema';");
    if (/return <PageClient \/>;/.test(page)) page = page.replace('return <PageClient />;', `return (\n    <>\n      {/* page-level JSON-LD (scripts/page-schema.mjs) */}\n      ${tag}\n      <PageClient />\n    </>\n  );`);
    else page = page.replace('      <PageClient />', `      {/* page-level JSON-LD (scripts/page-schema.mjs) */}\n      ${tag}\n      <PageClient />`);
  }
  page = page.replace(/<PageSchema items=\{PAGE_SCHEMA\}(?: locale="[a-z]+")? \/>/, tag); // the page's locale (one graph per page)
  if (!page.includes(tag)) throw new Error(`${rel(pageFile)}: could not place <PageSchema>`);
  const line = `${route.padEnd(44)} FAQ ${String(faqs.length).padStart(2)}  breadcrumb ${PRODUCT_NAMES[base] || CONTACT[base] ? 'yes' : 'no '}  builder block ${payloadChanged ? 'removed' : 'absent '}${CATEGORY.has(base) ? '  CollectionPage' + (base === '/mattresses' ? ' + brand ItemList' : '') : ''}`;
  console.log(line);
  totals.pages++; totals.faq += faqs.length; if (PRODUCT_NAMES[base] || CONTACT[base]) totals.crumbs++;
  if (CHECK) continue;
  if (!fs.existsSync(schemaFile) || fs.readFileSync(schemaFile, 'utf8') !== schemaTs) fs.writeFileSync(schemaFile, schemaTs);
  if (page !== pageBefore) fs.writeFileSync(pageFile, page);
  if (payloadChanged) { src = src.replace(bodyM[1], () => JSON.stringify($.html())); fs.writeFileSync(file, src); }
}
console.log(`\n${totals.pages} pages: ${totals.faq} FAQ questions, ${totals.crumbs} breadcrumb lists, ${totals.builderBlocksRemoved} builder schema blocks removed from payloads${CHECK ? ' (check only, nothing written)' : ''}`);
