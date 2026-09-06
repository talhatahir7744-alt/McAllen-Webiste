#!/usr/bin/env node
/**
 * Location audit: Brownsville leftovers + McAllen data consistency, over the source tree and every built route.
 *   npm run build && node scripts/audit-location.mjs
 * Exit code 1 when an unintended leftover or an inconsistency is found.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILT = path.join(ROOT, '.next', 'server', 'app');

const NEW = {
  address: '7913 North 10th Street, Suite 130',
  cityZip: 'McAllen, TX 78504',
  phone: '(956) 586-5646',
  tel: 'tel:+19565865646',
  email: 'northmcallen@snoozemattresscompany.com',
  fb: 'https://www.facebook.com/p/Snooze-Mattress-Wellness-61575812121380/',
  ig: 'https://www.instagram.com/snoozemcallen',
  yt: 'https://www.youtube.com/@SnoozeMcAllen',
  mapsQ: '7913+North+10th+Street,+Suite+130,+McAllen,+TX+78504',
  hoursEn: ['Mon – Sat 10 AM – 7 PM', 'Sunday 12 – 6 PM'],
  hoursEs: ['Lun – Sáb 10 AM – 7 PM', 'Domingo 12 – 6 PM'],
  domain: 'https://mcallen.snoozemattresscompany.com',
};

/** Leftover patterns; each with an "allowed context" test (returns true when the hit is expected). */
const LEFTOVERS = [
  // tooling (scripts/, README) may name the old location: the converter reads the Brownsville clone and relocate.mjs holds the mapping
  { name: 'Brownsville', re: /brownsville/gi, ok: (ctx, file) => /^scripts\/|^README/.test(file) },
  { name: 'old phone', re: /303[-. ]?3666|9563033666|306-3666/g, ok: (ctx, file) => /scripts\/relocate\.mjs/.test(file) },
  { name: 'old street', re: /3831\s*\+?\s*Frontage|Frontage (Rd|Road)/gi, ok: (ctx, file) => /scripts\/relocate\.mjs/.test(file) },
  { name: 'old zip', re: /78520/g, ok: (ctx, file) => /unsplash\.com\/photo-1597852075012|scripts\/relocate\.mjs/.test(ctx + file) },
  { name: 'old email', re: /brownsville@|tfrench\.snoozemattresscompany/gi, ok: (ctx, file) => /scripts\/relocate\.mjs/.test(file) },
  { name: 'old socials', re: /profile\.php\?id=61593118197488|snoozebrownsville/gi, ok: (ctx, file) => /scripts\/relocate\.mjs/.test(file) },
  // both superseded storefront photos: the Brownsville one and the wrong-store one that briefly replaced it
  // (the shim's WebP-twin map lists every heavy original in the clone tree, the superseded photos included; harmless)
  { name: 'old storefront file', re: /6a7577099a9c7792ea578a2c|69a1d3acb617a750cec56a9b/g, ok: (ctx, file) => /overrides\.json$|scripts\/relocate\.mjs|conversion-report|asset-map|ghl-offline-shim\.js/.test(file) },
  { name: 'old map links', re: /share\.google\/tRQVAaAurSFu6jvKl|maps\.app\.goo\.gl\/KevCK7WVkFbBDRir5|q=3831/g, ok: (ctx, file) => /scripts\/relocate\.mjs/.test(file) },
  { name: 'old hosts', re: /brownsville-webiste|rockwall\.snoozemattresscompany|brownsville\.snoozemattresscompany\.com/gi, ok: (ctx, file) => /scripts\/|README|overrides\/i18n\/|\.vercel\//.test(file) },
  { name: 'tel: not E.164', re: /tel:(?!\+19565865646)[^"'\\\s<>]+/g, ok: (ctx, file) => /scripts\/|README/.test(file) || /tel:\/mailto:/.test(ctx) },
  { name: 'old widget ids', re: /cUKX8RzffonzLORrzIhS|7oZZd8zPpnUYzsMS4VZM|6a721a99bae62cba6f021c61|FGnjGEW3dBnx4oPyRpNm/g, ok: (ctx, file) => /scripts\/relocate\.mjs/.test(file) },
  { name: 'Spanish grammar', re: /en el McAllen|McAllen ?['’]s(?=[^a-z])/g, ok: (ctx, file) => !/\/es\//.test(file) },
];

const SKIP = new Set(['node_modules', '.next', '.git', 'verify-out', 'public', '.vercel']);
function walk(dir, out = []) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (SKIP.has(e.name)) continue; const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, out); else if (/\.(ts|tsx|mjs|js|json|html|css|md)$/.test(e.name) && !/package-lock|tsbuildinfo|asset-map|conversion-report/.test(e.name)) out.push(p); } return out; }
function walkHtml(dir, out = []) { if (!fs.existsSync(dir)) return out; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walkHtml(p, out); else if (e.name.endsWith('.html')) out.push(p); } return out; }
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

let problems = 0;
const DICT = /overrides\/i18n\/es(\.part-\d+|\.extra)\.json$/; // translation dictionaries: keys are the English clone text, only values are audited
const ARTIFACT = /overrides\/i18n\/(chunks\/|segments\.json|missing\.json)|scripts\/audit-location\.mjs/; // extraction artifacts of the clone / this script
function scan(files, label) {
  console.log(`\n=== ${label}: ${files.length} file(s) ===`);
  const found = {};
  for (const f of files) {
    const r = rel(f); if (ARTIFACT.test(r)) continue;
    const s = DICT.test(r) ? Object.values(JSON.parse(fs.readFileSync(f, 'utf8'))).join('\n') : fs.readFileSync(f, 'utf8');
    for (const L of LEFTOVERS) {
      const re = new RegExp(L.re.source, L.re.flags); let m;
      while ((m = re.exec(s))) { const ctx = s.slice(Math.max(0, m.index - 70), m.index + m[0].length + 70).replace(/\s+/g, ' '); if (L.ok(ctx, r)) continue; (found[L.name] ??= []).push(`${r}: …${ctx}…`); }
    }
  }
  for (const [name, hits] of Object.entries(found)) { problems += hits.length; console.log(`  ✗ ${name}: ${hits.length} hit(s)`); for (const h of hits.slice(0, 6)) console.log(`      ${h.slice(0, 230)}`); if (hits.length > 6) console.log(`      … ${hits.length - 6} more`); }
  if (!Object.keys(found).length) console.log('  ✓ no unintended leftovers');
}

scan(walk(ROOT).concat([path.join(ROOT, 'public', 'ghl-offline-shim.js'), path.join(ROOT, 'public', 'ghl-stub.html')].filter(fs.existsSync)), 'source tree');
const html = walkHtml(BUILT).filter((f) => !/_not-found\.html$/.test(f)); // the 404 page has no location data by design
scan(html, 'built routes (.next/server/app)');

// ---- McAllen data on every built route
console.log('\n=== McAllen data per built route ===');
const count = (s, needle) => s.split(needle).length - 1;
const rows = [];
for (const f of html) {
  const s = fs.readFileSync(f, 'utf8'); const r = rel(f).replace('.next/server/app/', '/').replace(/\.html$/, '').replace(/^\/index$/, '/');
  const es = r === '/es' || r.startsWith('/es/');
  const ld = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch { return null; } });
  const store = ld.find((d) => d && Array.isArray(d['@type']) && d['@type'].includes('LocalBusiness'));
  const ldOk = !!store && store.address?.streetAddress === NEW.address && store.address?.addressLocality === 'McAllen' && store.address?.postalCode === '78504' && store.telephone === '+1 956-586-5646' && store.email === NEW.email && typeof store.geo?.latitude === 'number' && Array.isArray(store.sameAs) && store.sameAs.length === 3 && Array.isArray(store.openingHoursSpecification) && store.openingHoursSpecification.length === 2 && String(store['@id']).startsWith(NEW.domain);
  const row = {
    route: r,
    address: count(s, NEW.address), cityZip: count(s, NEW.cityZip), phone: count(s, NEW.phone), tel: count(s, NEW.tel),
    mailto: count(s, `mailto:${NEW.email}`), fb: count(s, NEW.fb), ig: count(s, `href="${NEW.ig}"`), yt: count(s, NEW.yt),
    hours: (es ? NEW.hoursEs : NEW.hoursEn).every((h) => s.includes(h)), maps: count(s, NEW.mapsQ), jsonld: ldOk,
    canonical: (s.match(/rel="canonical" href="([^"]+)"/) || [])[1] || '',
  };
  rows.push(row);
  const bad = [];
  if (!row.address || !row.phone || !row.tel || !row.mailto || !row.fb || !row.ig || !row.yt || !row.hours || !row.maps || !row.jsonld) bad.push('missing McAllen data');
  if (!row.canonical.startsWith(NEW.domain)) bad.push('canonical ' + row.canonical);
  if (bad.length) { problems++; console.log(`  ✗ ${r}: ${bad.join('; ')} ${JSON.stringify(row)}`); }
}
console.log(`  routes checked: ${rows.length}; all carry address, phone, tel:+1…, mailto, 3 socials, hours, McAllen map query, valid LocalBusiness JSON-LD, McAllen canonical: ${rows.every((x) => x.address && x.phone && x.tel && x.mailto && x.fb && x.ig && x.yt && x.hours && x.maps && x.jsonld && x.canonical.startsWith(NEW.domain)) ? 'YES' : 'NO'}`);

// ---- EN / ES pairs: same amount of location data on both sides
console.log('\n=== EN / ES consistency ===');
let pairs = 0, mism = 0;
for (const en of rows.filter((x) => !(x.route === '/es' || x.route.startsWith('/es/')))) {
  const esRoute = en.route === '/' ? '/es' : `/es${en.route}`;
  const es = rows.find((x) => x.route === esRoute); if (!es) continue; pairs++;
  const diff = ['address', 'phone', 'tel', 'mailto', 'maps', 'yt'].filter((k) => en[k] !== es[k]);
  if (diff.length) { mism++; problems++; console.log(`  ✗ ${en.route} vs ${esRoute}: ${diff.map((k) => `${k} ${en[k]}/${es[k]}`).join(', ')}`); }
}
console.log(`  pairs: ${pairs}, mismatches: ${mism}`);

// ---- widgets in use
console.log('\n=== CRM widgets in built routes ===');
const w = { calendar: /widget\/booking\/([A-Za-z0-9]+)/g, form: /widget\/form\/([A-Za-z0-9]+)/g, reviews: /review_widget\/([A-Za-z0-9]+)\?widgetId=([a-f0-9]+)/g };
for (const [k, re] of Object.entries(w)) { const ids = new Map(); for (const f of html) { const s = fs.readFileSync(f, 'utf8'); for (const m of s.matchAll(re)) { const id = m.slice(1).join('/'); (ids.get(id) || ids.set(id, new Set()).get(id)).add(rel(f).replace('.next/server/app/', '/').replace(/\.html$/, '')); } } for (const [id, pages] of ids) console.log(`  ${k}: ${id} on ${pages.size} route(s)`); }

console.log(`\n${problems ? `PROBLEMS: ${problems}` : 'CLEAN: no unintended leftovers, McAllen data consistent on every route'}`);
process.exit(problems ? 1 : 0);
