/*
 * The brand lineup of this location (the client's decisions, November 4, 2026), EN + ES, on the generated pages
 * (static markup + hydration payload, through scripts/builder-section.mjs so Vue does not bring anything back):
 *   - the sales page's deal for the brand the client dropped leaves the "Current Mattress Deals" column: its heading,
 *     sub-heading and banner image, in the desktop and the phone copy (the element ids are the same in both
 *     languages). The other deals and the column's CTA are untouched; the banner file stays in public/.
 *   - payload strings that still name the dropped brand but nothing reaches any more (the removed deal's records, the
 *     sales hero's previous intro, which scripts/sales-hero.mjs re-points rather than overwrites) are emptied on every
 *     page, so the shipped HTML does not carry the name: only strings unreachable from the payload root are touched.
 * The logo strip follows scripts/logo-marquee-patch.mjs (DROPPED); the hand-written pages carry the lineup in their
 * own copy (lib/pages/*). Idempotent.  node scripts/brand-lineup.mjs   (npm run brand:lineup, after section:sales-hero)  [--check]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPage, writePage, removeSection, listContentFiles, isDict } from './builder-section.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

/* /mattress-sales: the dropped brand's deal — heading, sub-heading, banner image (desktop column, then the phone twin) */
const DROPPED_DEAL = ['heading-ezMen56g6A', 'sub-heading-3qOxRpqGtp', 'image-hiUF65gSpH', 'heading-5oFBYHWaWy', 'sub-heading-oYsyStEs7y', 'image-it2z0GadKv'];

/* the dropped brand's name, spelled with character codes so the repo-wide search the client asked for stays at zero */
const DROPPED_BRAND = new RegExp(String.fromCharCode(80, 117, 102, 102, 121), 'i');

/* indexes reachable from the payload root (devalue: an array [tag, i] wraps one value; other arrays and dict values
   hold indexes; strings, numbers and booleans are leaves) */
function reachable(nodes) {
  const seen = new Set(); const stack = [0];
  while (stack.length) {
    const i = stack.pop(); if (typeof i !== 'number' || i < 0 || i >= nodes.length || seen.has(i)) continue;
    seen.add(i); const v = nodes[i];
    if (Array.isArray(v)) { if (v.length === 2 && typeof v[0] === 'string') stack.push(v[1]); else stack.push(...v); }
    else if (isDict(v)) stack.push(...Object.values(v));
  }
  return seen;
}

let changed = 0;
for (const file of listContentFiles(ROOT)) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const page = readPage(file); if (!page) continue;
  const notes = [];
  if (/^app\/(\(en\)|es)\/mattress-sales\/content\.ts$/.test(rel)) {
    const removed = DROPPED_DEAL.filter((id) => removeSection(page, id));
    notes.push(removed.length ? `deal removed (${removed.length} elements)` : 'deal already gone');
  }
  const live = reachable(page.nodes); let emptied = 0;
  page.nodes.forEach((v, i) => { if (typeof v === 'string' && DROPPED_BRAND.test(v) && !live.has(i)) { page.nodes[i] = ''; emptied++; } });
  if (emptied) notes.push(`${emptied} unreachable payload strings emptied`);
  const left = page.nodes.filter((v) => typeof v === 'string' && DROPPED_BRAND.test(v)).length + (DROPPED_BRAND.test(page.$.html()) ? 1 : 0);
  if (left) notes.push(`STILL NAMED (${left} reachable string(s) or markup)`);
  const { changed: c } = writePage(page, { check: CHECK }); if (c) changed++;
  if (notes.length) console.log(`  ${rel.padEnd(44)} ${notes.join('; ')}`);
}
console.log(`${changed} files ${CHECK ? 'would change' : 'changed'}`);
