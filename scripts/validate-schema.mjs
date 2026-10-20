/*
 * Structured-data check for the static export (SEO audit, October 2026 — section 5g). For every HTML page in out/
 * (or every live page with --live) it parses each <script type="application/ld+json">, flattens @graph, and checks:
 *   - JSON parses; every object has a known schema.org @type;
 *   - exactly ONE LocalBusiness (FurnitureStore) per page, with name, full postal address, telephone, url, image,
 *     geo, opening hours, priceRange and sameAs;
 *   - FAQPage: ≥1 Question with name + acceptedAnswer.text; BreadcrumbList: ListItems 1..n with name + item;
 *   - BlogPosting: headline, image, datePublished, author.name, publisher.name + logo; Service: name, provider,
 *     areaServed, offers;
 *   - no AggregateRating / Review anywhere (the audit forbids them for the store).
 *   node scripts/validate-schema.mjs [--live] [--verbose]      (npm run schema:check)
 * Google's Rich Results Test (search.google.com/test/rich-results) and validator.schema.org are the authoritative
 * validators; this script is the automated gate run before every commit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIVE = process.argv.includes('--live'); const VERBOSE = process.argv.includes('--verbose');
const SITE_URL = 'https://mcallen.snoozemattresscompany.com';
const TYPES = new Set(['FurnitureStore', 'LocalBusiness', 'Store', 'PostalAddress', 'GeoCoordinates', 'OpeningHoursSpecification', 'City', 'State', 'Country', 'ImageObject', 'Organization', 'FAQPage', 'Question', 'Answer', 'BreadcrumbList', 'ListItem', 'BlogPosting', 'Article', 'WebPage', 'Person', 'Service', 'Offer', 'ContactPoint', 'WebSite', 'AdministrativeArea']);
const FORBIDDEN = new Set(['AggregateRating', 'Review', 'Rating']);
const BUSINESS = new Set(['FurnitureStore', 'LocalBusiness', 'Store']);

const htmlFiles = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html') && !/^(404|ghl-stub)/.test(e.name) && !p.includes(`${path.sep}ghl-stub${path.sep}`)) htmlFiles.push(p); } })(path.join(ROOT, 'out'));
const routeOf = (f) => '/' + path.relative(path.join(ROOT, 'out'), f).split(path.sep).join('/').replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');
const typesOf = (o) => (Array.isArray(o['@type']) ? o['@type'] : [o['@type']]).filter(Boolean);
const flatten = (o, out = []) => { if (!o || typeof o !== 'object') return out; if (Array.isArray(o)) { o.forEach((x) => flatten(x, out)); return out; } if (o['@type']) out.push(o); for (const [k, v] of Object.entries(o)) if (k !== '@type' && v && typeof v === 'object') flatten(v, out); return out; };
const need = (o, keys, errs, label) => { for (const k of keys) { const v = k.split('.').reduce((a, b) => (a && a[b] !== undefined ? a[b] : undefined), o); if (v === undefined || v === '' || (Array.isArray(v) && !v.length)) errs.push(`${label}: missing ${k}`); } };

let pagesChecked = 0, pagesBad = 0; const summary = {};
for (const f of htmlFiles) {
  const route = routeOf(f) || '/';
  const html = LIVE ? await (await fetch(`${SITE_URL}${route === '/' ? '' : route}`, { headers: { 'user-agent': 'Mozilla/5.0 (schema-check)' } })).text() : fs.readFileSync(f, 'utf8');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const errs = []; const objs = [];
  for (const b of blocks) { try { objs.push(...flatten(JSON.parse(b))); } catch (e) { errs.push(`unparseable JSON-LD block: ${String(e.message).slice(0, 60)}`); } }
  const tops = []; for (const b of blocks) { try { const j = JSON.parse(b); tops.push(...(j['@graph'] ? j['@graph'] : [j])); } catch {} }
  for (const o of objs) for (const t of typesOf(o)) { if (FORBIDDEN.has(t)) errs.push(`forbidden type ${t}`); else if (!TYPES.has(t)) errs.push(`unknown @type ${t}`); }
  const biz = tops.filter((o) => typesOf(o).some((t) => BUSINESS.has(t)));
  if (biz.length !== 1) errs.push(`${biz.length} LocalBusiness blocks (expected 1)`);
  for (const b of biz) need(b, ['name', 'address.streetAddress', 'address.addressLocality', 'address.addressRegion', 'address.postalCode', 'address.addressCountry', 'telephone', 'url', 'image', 'geo.latitude', 'geo.longitude', 'openingHoursSpecification', 'priceRange', 'sameAs', 'areaServed'], errs, 'LocalBusiness');
  for (const o of tops.filter((o) => typesOf(o).includes('FAQPage'))) { if (!Array.isArray(o.mainEntity) || !o.mainEntity.length) errs.push('FAQPage: empty mainEntity'); else o.mainEntity.forEach((q, i) => need(q, ['name', 'acceptedAnswer.text'], errs, `FAQ #${i + 1}`)); }
  for (const o of tops.filter((o) => typesOf(o).includes('BreadcrumbList'))) { const l = o.itemListElement || []; if (!l.length) errs.push('BreadcrumbList: empty'); l.forEach((it, i) => { if (it.position !== i + 1) errs.push(`Breadcrumb position ${it.position} ≠ ${i + 1}`); need(it, ['name', 'item'], errs, `Breadcrumb #${i + 1}`); }); }
  for (const o of tops.filter((o) => typesOf(o).some((t) => t === 'BlogPosting' || t === 'Article'))) need(o, ['headline', 'image', 'datePublished', 'author.name', 'publisher.name', 'publisher.logo', 'mainEntityOfPage'], errs, 'BlogPosting');
  for (const o of tops.filter((o) => typesOf(o).includes('Service'))) need(o, ['name', 'description', 'provider', 'areaServed', 'offers', 'url'], errs, 'Service');
  const kinds = tops.map((o) => typesOf(o).join('+')).join(', ');
  summary[kinds] = (summary[kinds] || 0) + 1;
  pagesChecked++; if (errs.length) pagesBad++;
  if (errs.length || VERBOSE) console.log(`${route.padEnd(46)} ${blocks.length} blocks [${kinds}]${errs.length ? '\n   ' + errs.join('\n   ') : ''}`);
}
console.log(`\n${pagesChecked} pages checked${LIVE ? ' (live)' : ' (out/)'}, ${pagesBad} with errors`);
for (const [k, v] of Object.entries(summary).sort((a, b) => b[1] - a[1])) console.log(`   ${String(v).padStart(3)} × [${k}]`);
process.exit(pagesBad ? 1 : 0);
