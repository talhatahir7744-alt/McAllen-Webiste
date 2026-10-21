/*
 * Brand-logo marquee (SEO audit, October 2026 — section 8b): lazy-loaded WebP logos with descriptive alt text and
 * one network request per logo. Applied to the template (overrides/logo-marquee.html, so `npm run convert` produces
 * the same) and to the already-converted pages (markup + Nuxt payload copies of the custom-code block):
 *   - every logo <img> gets loading="lazy" (plus decoding="async"); a small script switches the marquee's images to
 *     eager as soon as the marquee comes within one viewport of the screen, so the moving strip never shows a blank
 *     gap (a lazy image that enters the strip's visible window loads too late) while nothing is fetched for a marquee
 *     far below the fold;
 *   - alt text "<Brand> mattresses at Snooze McAllen" (bedding brands: "<Brand> at Snooze McAllen"), Spanish on /es;
 *   - the second (loop) copy of the strip uses the same URLs as the first, so the browser makes one request per logo.
 *   node scripts/logo-marquee-patch.mjs            (npm run marquee)   — after `npm run convert`
 *   node scripts/logo-marquee-patch.mjs --check                        — report only
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');

/* media id -> brand (the order of the strip); `bedding: true` for brands whose products here are not mattresses */
const BRANDS = {
  '6a7f503a84abba640bb0b486': { name: 'BedTech' },
  '6a7f5039dc6b0a15e53bc0be': { name: 'Helix' },
  '6a7f503999074f5ef6d34d4b': { name: 'Bedgear', bedding: true },
  '6a7f5039255b571c8e272951': { name: 'Englander' },
  '6a7f5039fe4291bd1091759a': { name: 'Beautyrest' },
  '6a7f5039cf50f900f2814ec2': { name: 'DreamFit', bedding: true },
  '6a7f5039fe4291bd109175a0': { name: 'Serta' },
  '6a7f50372b48e84b4fa8ae5d': { name: 'Stearns & Foster' },
  '6a7f50378921ecbd9ca94ef7': { name: 'Puffy' },
  '6a7f5037a6a03cda06a1d795': { name: 'Tempur-Pedic' },
  '6a7f50378921ecbd9ca94ef2': { name: 'Spring Air' },
  '6a7f5037f762745222a0f1d5': { name: 'Sealy' },
  '6a7f5037f762745222a0f1da': { name: 'King Koil' },
  '6a7f502ddc6b0a15e53b8cba': { name: 'Snooze-O-Pedic' },
  '6a7f502da6a03cda06a1aa88': { name: 'Sleeptone', bedding: true },
  '6a7f502df762745222a0f105': { name: 'Flowt by King Koil' },
  '6a7f502da6a03cda06a1aa99': { name: 'Brooklyn Bedding' },
};
const altFor = (id, locale) => { const b = BRANDS[id]; if (!b) return null; const n = b.name.replace(/&/g, '&amp;'); if (locale === 'es') return b.bedding ? `${n} en Snooze McAllen` : `Colchones ${n} en Snooze McAllen`; return b.bedding ? `${n} at Snooze McAllen` : `${n} mattresses at Snooze McAllen`; };

/* the eager switch: runs once per document, armed only after the window load event (so the logo fetches never compete
   with the hero image / LCP: measured on the mattresses page, switching at DOMContentLoaded pushed the LCP from 3.4 s
   to ~12 s on a simulated slow phone), observing the marquee's section (which survives hydration) */
const EAGER_SCRIPT = `<script>(function(){if(window.__snzMarqueeEager)return;window.__snzMarqueeEager=1;var near=[];function eager(box){box.querySelectorAll('.snz-logo-marquee img[loading="lazy"]').forEach(function(i){i.loading='eager'})}function arm(){var ms=document.querySelectorAll('.snz-logo-marquee');if(!ms.length)return;if(!('IntersectionObserver' in window)){ms.forEach(function(m){eager(m.closest('.c-section')||m)});return}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.unobserve(e.target);near.push(e.target);eager(e.target)})},{rootMargin:'100% 0px'});ms.forEach(function(m){io.observe(m.closest('.c-section')||m)});var n=0,t=setInterval(function(){near.forEach(eager);if(++n>24)clearInterval(t)},500)}if(document.readyState==='complete')setTimeout(arm,0);else window.addEventListener('load',function(){setTimeout(arm,0)})})();</script>`;
const EAGER_RE = /<script>\(function\(\)\{if\(window\.__snzMarqueeEager\)[\s\S]*?<\/script>/;

function patchBlock(html, locale) {
  let n = 0;
  let out = html.replace(/<img\b[^>]*>/g, (tag) => {
    if (!/snz-logo-marquee|snz-scrubbed|\/media\/6a7f50/.test(tag) && !/snz-scrubbed/.test(tag)) return tag;
    const id = (tag.match(/media\/([a-f0-9]{24})/) || [])[1]; const alt = id ? altFor(id, locale) : null;
    let t = tag.replace(/\bloading="eager"/, 'loading="lazy"');
    if (!/\bloading=/.test(t)) t = t.replace(/^<img\b/, '<img loading="lazy"');
    if (!/\bdecoding=/.test(t)) t = t.replace(/^<img\b/, '<img decoding="async"');
    if (!/\bfetchpriority=/.test(t)) t = t.replace(/^<img\b/, '<img fetchpriority="low"'); // never ahead of the hero image
    if (alt !== null) t = /\balt="[^"]*"/.test(t) ? t.replace(/\balt="[^"]*"/, `alt="${alt}"`) : t.replace(/^<img\b/, `<img alt="${alt}"`);
    if (t !== tag) n++; return t;
  });
  if (EAGER_RE.test(out)) { const cur = out.match(EAGER_RE)[0]; if (cur !== EAGER_SCRIPT) { out = out.replace(EAGER_RE, () => EAGER_SCRIPT); n++; } }
  else out = out.replace(/(<div class="snz-logo-marquee"[^>]*>)/, EAGER_SCRIPT + '$1');
  return { out, n };
}

// ---- template
const tpl = path.join(ROOT, 'overrides/logo-marquee.html');
{ const s = fs.readFileSync(tpl, 'utf8'); const { out, n } = patchBlock(s, 'en'); if (out !== s) { if (!CHECK) fs.writeFileSync(tpl, out); console.log(`overrides/logo-marquee.html: ${n} img tags`); } }
// ---- generated pages
const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts') files.push(p); } })(path.join(ROOT, 'app'));
let changed = 0;
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/'); const locale = /^app\/es\//.test(rel) ? 'es' : 'en';
  const src = fs.readFileSync(f, 'utf8'); if (!src.includes('snz-logo-marquee')) continue;
  const bodyM = src.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) continue;
  const body = JSON.parse(bodyM[1]);
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  const markup = pm ? body.replace(pm[0], '\u0000PAYLOAD\u0000') : body;
  const m = patchBlock(markup, locale); let payload = pm ? pm[0] : ''; let pn = 0;
  if (pm) { const nodes = JSON.parse(pm[2]); let touched = false; for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string' && nodes[i].includes('snz-logo-marquee')) { const r = patchBlock(nodes[i], locale); if (r.out !== nodes[i]) { nodes[i] = r.out; touched = true; pn += r.n; } } if (touched) payload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3]; }
  const next = pm ? m.out.replace('\u0000PAYLOAD\u0000', () => payload) : m.out;
  if (next !== body) { changed++; if (!CHECK) fs.writeFileSync(f, src.replace(bodyM[1], () => JSON.stringify(next))); console.log(`${rel}: ${m.n} markup img tags, ${pn} payload img tags`); }
}
console.log(`${changed} pages ${CHECK ? 'would change' : 'changed'}`);
