/*
 * Guarantee wording (the agency's review, November 3, 2026, section B2): the store's guarantee is the
 * "365-Night Sleep Guarantee on major brands" (the client's wording, already on the about cards and the guarantee
 * band), and the older "Sleep Comfort Guarantee" copy goes, EN + ES, on every generated page, static markup and
 * hydration payload alike (the strings are replaced everywhere they occur, so every reference changes together):
 *   - the "Our Promise" band's paragraph: "…every purchase … comes backed by our Sleep Comfort Guarantee - because …"
 *     -> "…Snooze Mattress + Wellness offers the 365-Night Sleep Guarantee on major brands - because …";
 *   - the FAQ answer "Why choose Snooze…": "a one-of-a-kind Sleep Comfort Guarantee on your new mattress"
 *     -> "the 365-Night Sleep Guarantee on major brands" (scripts/page-schema.mjs then rebuilds the FAQPage);
 *   - the labels (the band's first card, its seal ring and marquee, the about page's trust ticker) carry the name,
 *     "365-Night Sleep Guarantee"; the sentences beside them carry "on major brands".
 * Spanish: "Garantía de Sueño de 365 Noches en las marcas principales" (the about cards' wording). The override
 * templates (overrides/our-promise-guarantee.html, trust-ticker.html) and scripts/faq-direct.mjs keep the builder's
 * original wording as the converter's input; this script runs after them. Idempotent.
 *   node scripts/guarantee-wording.mjs   (npm run copy:guarantee, after section:about-cards)   [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');
/* a phrase as a pattern: any run of whitespace between its words, an optional gap around <br> */
const phrase = (s) => new RegExp(s.split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+').replace(/<br>/g, '\\s*<br\\s*\\/?>\\s*'), 'g');
const RULES = [
  ['band paragraph', 'every purchase at Snooze Mattress + Wellness comes backed by our Sleep Comfort Guarantee - because', 'Snooze Mattress + Wellness offers the 365-Night Sleep Guarantee on major brands - because'],
  ['FAQ answer', 'a one-of-a-kind Sleep Comfort Guarantee on your new mattress,', 'the 365-Night Sleep Guarantee on major brands,'],
  ['card label', 'Sleep Comfort<br>Guarantee', '365-Night Sleep<br>Guarantee'],
  ['seal / marquee / ticker label', 'Sleep Comfort Guarantee', '365-Night Sleep Guarantee'],
  ['band paragraph (es)', 'Por eso cada compra en Snooze Mattress + Wellness está respaldada por nuestra Garantía de Confort de Sueño - porque', 'Por eso Snooze Mattress + Wellness ofrece la Garantía de Sueño de 365 Noches en las marcas principales - porque'],
  ['FAQ answer (es)', 'una Garantía de Confort de Sueño única para tu colchón nuevo,', 'la Garantía de Sueño de 365 Noches en las marcas principales,'],
  ['card label (es)', 'Garantía de Confort<br>de Sueño', 'Garantía de Sueño<br>de 365 Noches'],
  ['seal / marquee / ticker label (es)', 'Garantía de Confort de Sueño', 'Garantía de Sueño de 365 Noches'],
].map(([name, from, to]) => ({ name, re: phrase(from), to }));

const pages = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts') pages.push(p); } })(path.join(ROOT, 'app'));
const totals = {}; let changed = 0;
for (const file of pages) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const s = fs.readFileSync(file, 'utf8'); const bodyM = s.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) continue;
  const body = JSON.parse(bodyM[1]);
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  const counts = {};
  const apply = (text, where) => { for (const r of RULES) text = text.replace(r.re, () => { const k = `${r.name} [${where}]`; counts[k] = (counts[k] || 0) + 1; return r.to; }); return text; };
  let markup = pm ? body.replace(pm[0], '\u0000PAYLOAD\u0000') : body;
  markup = apply(markup, 'markup');
  let payload = pm ? pm[0] : '';
  if (pm) {
    const nodes = JSON.parse(pm[2]); let touched = false;
    for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string') { const next = apply(nodes[i], 'payload'); if (next !== nodes[i]) { nodes[i] = next; touched = true; } }
    if (touched) payload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3];
  }
  const next = pm ? markup.replace('\u0000PAYLOAD\u0000', () => payload) : markup;
  if (next === body) continue;
  changed++; if (!CHECK) fs.writeFileSync(file, s.replace(bodyM[1], () => JSON.stringify(next)));
  for (const [k, v] of Object.entries(counts)) totals[k] = (totals[k] || 0) + v;
  console.log(`  ${rel.padEnd(52)} ${Object.entries(counts).map(([k, v]) => `${k} ×${v}`).join('; ')}`);
}
console.log(`${changed} files ${CHECK ? 'would change' : 'changed'}`);
for (const [k, v] of Object.entries(totals).sort()) console.log(`   ${String(v).padStart(4)}  ${k}`);
