/*
 * Financing page, "Why Finance a Mattress in …?" (client request, November 3, 2026): /mattress-financing and
 * /es/mattress-financing, the desktop and the phone copy of the section (sections XBwOtU_0-H / vzbbwksJ6W):
 *   1. both check-icon lists ("They want better sleep immediately…", "Back and joint support…") render regular and
 *      upright: the builder's <em> / <strong> (and any <i> / <b>) inside the items go, the spans (family, colour) stay;
 *   2. the lead-in "When you spend one-third of your life in bed, investing in the right mattress impacts:" renders at
 *      regular weight: its span was set in the builder's headline face (inline "Visby Extrabold", which site.css maps
 *      onto the Poppins 800 cut) and is set in Montserrat like the section's other lines (Poppins 400 on the page); the
 *      <u>right mattress</u> highlight keeps its orange (colour only).
 * The H2, the intro line, the image and the CTA are untouched; no CSS changes. Static markup and the hydration payload:
 * each of these HTML strings occurs only in the two copies of this section (checked on every run) and is replaced in
 * place. Idempotent.  node scripts/financing-why-plain.mjs  (npm run section:financing-why, after icons)  [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cheerio = require('cheerio');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');

const PAGES = ['app/(en)/mattress-financing/content.ts', 'app/es/mattress-financing/content.ts'];
const SECTIONS = '#section-XBwOtU_0-H, #section-vzbbwksJ6W';
const LEAD_IDS = ['sub-heading-n6KDRrCCC5', 'sub-heading-HK4F9Gjvmg']; // "When you spend one-third…" (desktop, phone)
const HEADLINE_FACE = /font-family: 'customhl-[0-9a-f]+-Visby Extrabold'/g;

let changed = 0;
for (const rel of PAGES) {
  const file = path.join(ROOT, rel);
  const s = fs.readFileSync(file, 'utf8'); const bodyM = s.match(/export const BODY_HTML = ("[\s\S]*");\s*$/);
  if (!bodyM) throw new Error(`${rel}: no BODY_HTML`);
  const body = JSON.parse(bodyM[1]);
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  if (!pm) throw new Error(`${rel}: no payload`);
  let markup = body.replace(pm[0], '\u0000PAYLOAD\u0000');
  // old -> new inner HTML of every list item paragraph and of the lead-in paragraph in the two copies of the section
  const $ = cheerio.load(markup, { decodeEntities: false }, false);
  const swaps = new Map();
  $(SECTIONS).find('.c-bullet-list li > p').each((_, p) => { const html = $(p).html(); const next = html.replace(/<\/?(?:em|strong|i|b)(?:\s[^>]*)?>/g, ''); if (next !== html) swaps.set(html, next); });
  for (const id of LEAD_IDS) $(`#${id} p`).each((_, p) => { const html = $(p).html(); const next = html.replace(HEADLINE_FACE, 'font-family: Montserrat'); if (next !== html) swaps.set(html, next); });
  const nodes = JSON.parse(pm[2]); let items = 0, payloadHits = 0;
  for (const [from, to] of swaps) {
    // the string must belong to this section alone: twice in the markup (desktop + phone copy), once in the payload
    const inMarkup = markup.split(from).length - 1; const inSection = $(SECTIONS).find('p').toArray().filter((p) => $(p).html() === from).length;
    if (inMarkup !== inSection) throw new Error(`${rel}: "${from.slice(0, 60)}" also occurs outside the section (${inMarkup} vs ${inSection})`);
    markup = markup.split(from).join(to); items += inMarkup;
    for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string' && nodes[i].includes(from)) { nodes[i] = nodes[i].split(from).join(to); payloadHits++; }
  }
  const next = markup.replace('\u0000PAYLOAD\u0000', () => (swaps.size ? pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3] : pm[0]));
  if (next !== body) { changed++; if (!CHECK) fs.writeFileSync(file, s.replace(bodyM[1], () => JSON.stringify(next))); }
  console.log(`  ${rel.padEnd(40)} ${swaps.size} strings, ${items} elements in the markup, ${payloadHits} payload strings${swaps.size ? '' : ' (already applied)'}`);
}
console.log(`${changed} files ${CHECK ? 'would change' : 'changed'}`);
