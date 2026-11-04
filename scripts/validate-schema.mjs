/*
 * Structured-data check for the static export (SEO audit, October 2026 — section 5g). For every HTML page in out/
 * (or every live page with --live) it parses each <script type="application/ld+json">, flattens @graph, and checks:
 *   - JSON parses; every object has a known schema.org @type;
 *   - one graph per page (November 3, 2026): exactly one JSON-LD block, no @id twice, and the site nodes
 *     #organization, #store and #website present (lib/schema.ts); {"@id"} references resolve to the page's own nodes;
 *   - exactly ONE LocalBusiness (FurnitureStore) per page, with name, full postal address, telephone, url, image,
 *     geo, hasMap, opening hours, priceRange, sameAs, parentOrganization, languages, currencies, payment, brands and
 *     the Dream Mapping offer; Organization: name, url, logo, sameAs, parent; WebSite: name, url, publisher, languages;
 *   - FAQPage: ≥1 Question with name + acceptedAnswer.text; BreadcrumbList: ListItems 1..n with name + item;
 *   - ContactPage: name, url, mainEntity; BlogPosting: @id, headline, image, datePublished, author.name,
 *     publisher.name + logo; Service: @id, name, provider, areaServed, offers, the booking ReserveAction;
 *     WebPage / CollectionPage: @id, url, name, isPartOf, about; an ItemList: positions 1..n, each with a name;
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
const TYPES = new Set(['ContactPage', 'FurnitureStore', 'LocalBusiness', 'Store', 'PostalAddress', 'GeoCoordinates', 'OpeningHoursSpecification', 'City', 'State', 'Country', 'ImageObject', 'Organization', 'FAQPage', 'Question', 'Answer', 'BreadcrumbList', 'ListItem', 'BlogPosting', 'Article', 'WebPage', 'CollectionPage', 'ItemList', 'Brand', 'Person', 'Service', 'Offer', 'ReserveAction', 'EntryPoint', 'ContactPoint', 'WebSite', 'AdministrativeArea']);
const FORBIDDEN = new Set(['AggregateRating', 'Review', 'Rating']);
const BUSINESS = new Set(['FurnitureStore', 'LocalBusiness', 'Store']);
/* one graph per page (lib/schema.ts, November 3, 2026): these three site nodes on every page, once each */
const SITE_IDS = { organization: `${SITE_URL}/#organization`, store: `${SITE_URL}/#store`, website: `${SITE_URL}/#website` };

const htmlFiles = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html') && !/^(404|ghl-stub)/.test(e.name) && !p.includes(`${path.sep}ghl-stub${path.sep}`)) htmlFiles.push(p); } })(path.join(ROOT, 'out'));
const routeOf = (f) => '/' + path.relative(path.join(ROOT, 'out'), f).split(path.sep).join('/').replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');
const typesOf = (o) => (Array.isArray(o['@type']) ? o['@type'] : [o['@type']]).filter(Boolean);
const flatten = (o, out = []) => { if (!o || typeof o !== 'object') return out; if (Array.isArray(o)) { o.forEach((x) => flatten(x, out)); return out; } if (o['@type']) out.push(o); for (const [k, v] of Object.entries(o)) if (k !== '@type' && v && typeof v === 'object') flatten(v, out); return out; };
/* a required property, following {"@id": …} references to the page's own nodes (an unresolved reference is missing) */
const need = (o, keys, errs, label, byId = new Map()) => {
  const deref = (v) => (v && typeof v === 'object' && !Array.isArray(v) && v['@id'] && Object.keys(v).length === 1 ? byId.get(v['@id']) : v);
  for (const k of keys) { const v = k.split('.').reduce((a, b) => { const x = deref(a); return x && x[b] !== undefined ? x[b] : undefined; }, o); const r = deref(v); if (r === undefined || r === '' || (Array.isArray(r) && !r.length)) errs.push(`${label}: missing ${k}`); }
};

let pagesChecked = 0, pagesBad = 0; const summary = {};
for (const f of htmlFiles) {
  const route = routeOf(f) || '/';
  const html = LIVE ? await (await fetch(`${SITE_URL}${route === '/' ? '' : route}`, { headers: { 'user-agent': 'Mozilla/5.0 (schema-check)' } })).text() : fs.readFileSync(f, 'utf8');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const errs = []; const objs = [];
  for (const b of blocks) { try { objs.push(...flatten(JSON.parse(b))); } catch (e) { errs.push(`unparseable JSON-LD block: ${String(e.message).slice(0, 60)}`); } }
  const tops = []; for (const b of blocks) { try { const j = JSON.parse(b); tops.push(...(j['@graph'] ? j['@graph'] : [j])); } catch {} }
  for (const o of objs) for (const t of typesOf(o)) { if (FORBIDDEN.has(t)) errs.push(`forbidden type ${t}`); else if (!TYPES.has(t)) errs.push(`unknown @type ${t}`); }
  if (blocks.length !== 1) errs.push(`${blocks.length} JSON-LD blocks (expected one graph)`);
  const byId = new Map(); for (const o of tops) if (o['@id']) { if (byId.has(o['@id'])) errs.push(`duplicate @id ${o['@id']}`); byId.set(o['@id'], o); }
  for (const [k, id] of Object.entries(SITE_IDS)) if (!byId.has(id)) errs.push(`missing site node #${k}`);
  const biz = tops.filter((o) => typesOf(o).some((t) => BUSINESS.has(t)));
  if (biz.length !== 1) errs.push(`${biz.length} LocalBusiness blocks (expected 1)`);
  for (const b of biz) need(b, ['@id', 'name', 'address.streetAddress', 'address.addressLocality', 'address.addressRegion', 'address.postalCode', 'address.addressCountry', 'telephone', 'url', 'image', 'geo.latitude', 'geo.longitude', 'hasMap', 'openingHoursSpecification', 'priceRange', 'sameAs', 'areaServed', 'parentOrganization.name', 'knowsLanguage', 'currenciesAccepted', 'paymentAccepted', 'brand', 'makesOffer.itemOffered'], errs, 'LocalBusiness', byId);
  for (const o of tops.filter((o) => o['@id'] === SITE_IDS.organization)) need(o, ['name', 'url', 'logo.url', 'sameAs', 'parentOrganization.name'], errs, 'Organization', byId);
  for (const o of tops.filter((o) => o['@id'] === SITE_IDS.website)) need(o, ['name', 'url', 'publisher.name', 'inLanguage'], errs, 'WebSite', byId);
  for (const o of tops.filter((o) => typesOf(o).includes('FAQPage'))) { if (!Array.isArray(o.mainEntity) || !o.mainEntity.length) errs.push('FAQPage: empty mainEntity'); else o.mainEntity.forEach((q, i) => need(q, ['name', 'acceptedAnswer.text'], errs, `FAQ #${i + 1}`)); }
  for (const o of tops.filter((o) => typesOf(o).includes('BreadcrumbList'))) { const l = o.itemListElement || []; if (!l.length) errs.push('BreadcrumbList: empty'); l.forEach((it, i) => { if (it.position !== i + 1) errs.push(`Breadcrumb position ${it.position} ≠ ${i + 1}`); need(it, ['name', 'item'], errs, `Breadcrumb #${i + 1}`); }); }
  for (const o of tops.filter((o) => typesOf(o).some((t) => t === 'BlogPosting' || t === 'Article'))) need(o, ['@id', 'headline', 'image', 'datePublished', 'author.name', 'publisher.name', 'publisher.logo', 'mainEntityOfPage'], errs, 'BlogPosting', byId);
  for (const o of tops.filter((o) => typesOf(o).includes('ContactPage'))) need(o, ['name', 'url', 'mainEntity'], errs, 'ContactPage', byId);
  for (const o of tops.filter((o) => typesOf(o).some((t) => t === 'WebPage' || t === 'CollectionPage'))) need(o, ['@id', 'url', 'name', 'isPartOf.name', 'about.name'], errs, typesOf(o).join('+'), byId);
  for (const o of tops.filter((o) => typesOf(o).includes('CollectionPage') && o.mainEntity)) { const l = o.mainEntity.itemListElement || []; if (!l.length) errs.push('ItemList: empty'); l.forEach((it, i) => { if (it.position !== i + 1) errs.push(`ItemList position ${it.position} ≠ ${i + 1}`); need(it, ['item.name'], errs, `ItemList #${i + 1}`); }); }
  for (const o of tops.filter((o) => typesOf(o).includes('Service'))) need(o, ['@id', 'name', 'description', 'provider.name', 'areaServed', 'offers.price', 'url', 'potentialAction.target.urlTemplate'], errs, 'Service', byId);
  const kinds = tops.map((o) => typesOf(o).join('+')).join(', ');
  summary[kinds] = (summary[kinds] || 0) + 1;
  pagesChecked++; if (errs.length) pagesBad++;
  if (errs.length || VERBOSE) console.log(`${route.padEnd(46)} ${blocks.length} blocks [${kinds}]${errs.length ? '\n   ' + errs.join('\n   ') : ''}`);
}
console.log(`\n${pagesChecked} pages checked${LIVE ? ' (live)' : ' (out/)'}, ${pagesBad} with errors`);
for (const [k, v] of Object.entries(summary).sort((a, b) => b[1] - a[1])) console.log(`   ${String(v).padStart(3)} × [${k}]`);
process.exit(pagesBad ? 1 : 0);
