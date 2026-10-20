/*
 * Image alt text for the generated pages (SEO audit, October 2026 — section 8b/8c). Source of truth:
 * overrides/overrides.json → "imageAlt" ({ "<media id or file name>": "<English alt>" }), translated for /es through
 * overrides/i18n/es.extra.json (key = the English alt). Applied to every <img> whose src carries the id — in the page
 * markup, in the Nuxt payload (imageProperties.altText and custom-code HTML strings), both languages — so hydration
 * keeps the text. scripts/convert.mjs applies the same map at convert time; this script brings already-converted
 * pages up to date and is idempotent.
 *   node scripts/image-alts.mjs            (npm run alts)   — after `npm run convert` and the other post-convert scripts
 *   node scripts/image-alts.mjs --check                     — report only
 * Decorative images (icons, the map/phone/clock glyphs) keep alt="" on purpose: the map lists only images that convey content.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const OVR = JSON.parse(fs.readFileSync(path.join(ROOT, 'overrides/overrides.json'), 'utf8'));
const ES = JSON.parse(fs.readFileSync(path.join(ROOT, 'overrides/i18n/es.extra.json'), 'utf8'));
const MAP = Object.entries(OVR.imageAlt || {}).filter(([k]) => k !== '_comment');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');
const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const altFor = (src, locale) => { const hit = MAP.find(([needle]) => src.includes(needle)); if (!hit) return null; const en = hit[1]; return locale === 'es' ? (ES[en] || en) : en; };

const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts') files.push(p); } })(path.join(ROOT, 'app'));
let filesChanged = 0, tagsChanged = 0, payloadChanged = 0; const missingEs = new Set();
const patchHtml = (html, locale) => html.replace(/<img\b[^>]*>/g, (tag) => {
  const src = (tag.match(/\bsrc="([^"]*)"/) || tag.match(/\bsrc=\\"([^"\\]*)\\"/) || [])[1]; if (!src) return tag;
  const alt = altFor(src, locale); if (alt === null) return tag;
  if (locale === 'es' && !ES[MAP.find(([n]) => src.includes(n))[1]]) missingEs.add(MAP.find(([n]) => src.includes(n))[1]);
  const quoted = `alt="${escAttr(alt)}"`;
  let out = /\balt="[^"]*"/.test(tag) ? tag.replace(/\balt="[^"]*"/, quoted) : tag.replace(/^<img\b/, `<img ${quoted}`);
  if (out !== tag) tagsChanged++;
  return out;
});
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/'); const locale = /^app\/es\//.test(rel) ? 'es' : 'en';
  const src = fs.readFileSync(f, 'utf8'); const bodyM = src.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) continue;
  let body = JSON.parse(bodyM[1]); const before = body;
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  const markup = pm ? body.replace(pm[0], '\u0000PAYLOAD\u0000') : body;
  let newMarkup = patchHtml(markup, locale);
  let newPayload = pm ? pm[0] : '';
  if (pm) {
    const nodes = JSON.parse(pm[2]); let touched = false;
    // image elements: extra.imageProperties → { value } → { url, compression[, altText] } (the runtime re-renders the
    // <img> from this dict after hydration, so the alt must live here too — same place scripts/convert.mjs writes it)
    const dictOf = (i) => (typeof i === 'number' && nodes[i] && typeof nodes[i] === 'object' && !Array.isArray(nodes[i]) ? nodes[i] : null);
    const str = (i) => (typeof i === 'number' && typeof nodes[i] === 'string' ? nodes[i] : null);
    for (const n of nodes) {
      if (!n || typeof n !== 'object' || Array.isArray(n) || !('imageProperties' in n)) continue;
      let ip = dictOf(n.imageProperties); if (ip && !('url' in ip) && 'value' in ip) ip = dictOf(ip.value);
      const url = ip && str(ip.url); if (!url) continue;
      const alt = altFor(url, locale); if (alt === null) continue;
      if (str(ip.altText) === alt) continue;
      // ALWAYS a new string node, never an in-place overwrite: the payload deduplicates strings, so an existing altText
      // usually points at the one shared "" node that thousands of other fields (video urls, posters, classes…) share.
      ip.altText = nodes.push(alt) - 1;
      touched = true; payloadChanged++;
    }
    for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string' && nodes[i].includes('<img')) { const v = patchHtml(nodes[i], locale); if (v !== nodes[i]) { nodes[i] = v; touched = true; payloadChanged++; } }
    if (touched) newPayload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3];
  }
  body = pm ? newMarkup.replace('\u0000PAYLOAD\u0000', () => newPayload) : newMarkup;
  if (body !== before) { filesChanged++; if (!CHECK) fs.writeFileSync(f, src.replace(bodyM[1], () => JSON.stringify(body))); console.log(`${rel}: updated`); }
}
console.log(`${filesChanged} files ${CHECK ? 'would change' : 'changed'}: ${tagsChanged} <img> tags, ${payloadChanged} payload values; ${MAP.length} alt entries`);
if (missingEs.size) console.log('no Spanish translation yet (English alt used on /es): ' + [...missingEs].join(' | '));
