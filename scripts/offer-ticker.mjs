/*
 * Keeps the home page's promotions ticker in step with lib/offer.ts (the shared current offer): while the offer is
 * active (build date inside its window) one ticker item with the offer line is present in both sets of the loop,
 * marked so the script can replace or remove it; when the offer is off the item is removed. Markup + Nuxt payload
 * (the ticker is a custom-code element the runtime re-renders after hydration), English and Spanish home pages.
 *   node scripts/offer-ticker.mjs            (npm run offer:ticker)   — run before every build, after the other post-convert scripts
 *   node scripts/offer-ticker.mjs --check                             — report only
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// the offer config is TypeScript; read the few values this script needs with regexes (same source of truth, no build step)
const src = fs.readFileSync(path.join(ROOT, 'lib/offer.ts'), 'utf8');
const val = (key) => (src.match(new RegExp(`^\\s*${key}:\\s*'([^']*)'`, 'm')) || [])[1] ?? '';
const enabled = /^\s*enabled:\s*true/m.test(src); const startDate = val('startDate'), endDate = val('endDate');
const line = { en: (src.match(/offerLine[\s\S]*?:\s*'([^']*)'/) || [])[1] || '', es: (src.match(/locale === 'es' \? '([^']*)'/) || [])[1] || '' };
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const active = enabled && (!startDate || today >= startDate) && (!endDate || today <= endDate) && line.en;
const START = '<!--snz-offer-ticker-->', END = '<!--/snz-offer-ticker-->';
const item = (locale) => `${START}<div class="snooze-ticker-item"> <span class="snooze-ticker-text">${esc(line[locale])}</span> <span class="snooze-ticker-sep">✦</span> </div>${END}`;
const strip = (html) => html.replace(new RegExp(`${START}[\\s\\S]*?${END}\\s*`, 'g'), '');
// insert the item as the first item of each set (after the SET comment), so both copies of the loop carry it
const place = (html, locale) => { const s = strip(html); if (!active) return s; return s.replace(/(<!-- ── SET [12][^>]*-->\s*)/g, (m) => m + item(locale) + ' '); };

let changed = 0;
for (const f of ['app/(en)/content.ts', 'app/es/content.ts']) {
  const file = path.join(ROOT, f); const locale = f.startsWith('app/es') ? 'es' : 'en';
  const s = fs.readFileSync(file, 'utf8'); const bodyM = s.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) continue;
  const body = JSON.parse(bodyM[1]); if (!body.includes('snooze-ticker-item')) continue;
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  const markup = pm ? body.replace(pm[0], '\u0000PAYLOAD\u0000') : body;
  const newMarkup = place(markup, locale); let payload = pm ? pm[0] : '';
  if (pm) { const nodes = JSON.parse(pm[2]); let touched = false; for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string' && nodes[i].includes('snooze-ticker-item')) { const v = place(nodes[i], locale); if (v !== nodes[i]) { nodes[i] = v; touched = true; } } if (touched) payload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3]; }
  const next = pm ? newMarkup.replace('\u0000PAYLOAD\u0000', () => payload) : newMarkup;
  const n = (newMarkup.match(new RegExp(START, 'g')) || []).length;
  if (next !== body) { changed++; if (!CHECK) fs.writeFileSync(file, s.replace(bodyM[1], () => JSON.stringify(next))); }
  console.log(`${f}: ${active ? n + ' offer items in the ticker' : 'offer off, item removed'}${next !== body ? '' : ' (no change)'}`);
}
console.log(`offer ${active ? 'ACTIVE' : 'inactive'} (${today}; window ${startDate || 'open'} → ${endDate || 'open'}); ${changed} files ${CHECK ? 'would change' : 'changed'}`);
