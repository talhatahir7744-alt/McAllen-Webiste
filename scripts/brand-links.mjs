/*
 * Brand links on /mattresses (SEO audit build pass, October 2026 — section D1).
 * Each brand heading on the mattresses page (EN + /es; `<h2 class="snz-h"><span style=…>Tempur-Pedic® Mattresses</span></h2>`,
 * desktop + mobile copies, in the static markup and the hydration payload) becomes a link to the brand's own site,
 * opened in a new tab with rel="noopener noreferrer". Snooze-O-Pedic is the store's own line and keeps no link.
 * Idempotent; run after scripts/heading-structure.mjs.  node scripts/brand-links.mjs  (npm run brand:links)  [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');

const BRANDS = [
  [/Tempur-Pedic/i, 'https://www.tempurpedic.com/'],
  [/Sealy/i, 'https://www.sealy.com/'],
  [/Stearns/i, 'https://www.stearnsandfoster.com/'],
  [/Beautyrest/i, 'https://www.beautyrest.com/'],
  [/King Koil/i, 'https://www.kingkoil.com/'],
  [/Brooklyn Bedding/i, 'https://brooklynbedding.com/'],
  [/Spring Air/i, 'https://www.springair.com/'],
  [/Helix/i, 'https://helixsleep.com/'],
  [/Puffy/i, 'https://puffy.com/'],
];
const H2 = /<h2 class="snz-h"><span style="([^"]*)">([^<]*)<\/span><\/h2>/g;
const linkHeadings = (html, stats) => html.replace(H2, (m, style, text) => {
  if (/Snooze-o-Pedic/i.test(text)) return m;
  const hit = BRANDS.find(([re]) => re.test(text)); if (!hit) return m;
  stats.set(text, (stats.get(text) || 0) + 1);
  return `<h2 class="snz-h"><span style="${style}"><a class="snz-brand-link" href="${hit[1]}" target="_blank" rel="noopener noreferrer">${text}</a></span></h2>`;
});

let changed = 0;
for (const f of ['app/(en)/mattresses/content.ts', 'app/es/mattresses/content.ts']) {
  const file = path.join(ROOT, f); const s = fs.readFileSync(file, 'utf8');
  const bodyM = s.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) continue;
  const body = JSON.parse(bodyM[1]);
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  const markup = pm ? body.replace(pm[0], '\u0000PAYLOAD\u0000') : body;
  const stats = new Map(); const newMarkup = linkHeadings(markup, stats); let payload = pm ? pm[0] : ''; let payloadHits = 0;
  if (pm) {
    const nodes = JSON.parse(pm[2]); let touched = false;
    for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string' && nodes[i].includes('<h2 class="snz-h">')) { const v = linkHeadings(nodes[i], new Map()); if (v !== nodes[i]) { nodes[i] = v; touched = true; payloadHits++; } }
    if (touched) payload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3];
  }
  const next = pm ? newMarkup.replace('\u0000PAYLOAD\u0000', () => payload) : newMarkup;
  if (next !== body) { changed++; if (!CHECK) fs.writeFileSync(file, s.replace(bodyM[1], () => JSON.stringify(next))); }
  const already = (body.match(/snz-brand-link/g) || []).length;
  console.log(`${f}: ${[...stats].map(([t, n]) => `${t} ×${n}`).join(', ') || 'no new headings'}; payload strings ${payloadHits}${already ? `; already linked ${already}` : ''}${next !== body ? '' : ' (no change)'}`);
}
console.log(`${changed} files ${CHECK ? 'would change' : 'changed'}`);
