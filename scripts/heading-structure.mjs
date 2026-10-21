/*
 * Heading structure for the generated pages (SEO audit, October 2026 — section 4): one H1 per page, everything else
 * demoted, no stat-label, sentence-length or empty "headings". Runs AFTER `npm run convert` and the other post-convert
 * scripts (seo:meta, es:fixes); idempotent:
 *   node scripts/heading-structure.mjs            (npm run headings)      --report prints the decisions, writes nothing
 *
 * The builder exports every page twice (a desktop-only and a mobile-only copy of each section; one of them is hidden
 * by CSS at any width) and marks nearly every heading component as <h1>. Rules, applied to each layout copy:
 *   - the page H1 is the first non-empty heading component of the layout (the hero headline); when the builder split
 *     it into several <h1> lines they are merged into ONE <h1> with <br> (same lines, same CSS);
 *   - every other <h1> in a heading component becomes <h2> (section titles, brand blocks, FAQs, Visit Us);
 *     the location bar's "Location / Phone / Store Hours" labels become <h3>;
 *   - heading components that hold a stat label ("5 Min", "85%"), a sentence (twelve words or more ending in a
 *     period) or nothing at all become <p>, as do the heading tags inside sub-heading components (taglines, brand
 *     descriptions) and inside paragraph components unless the text is a short title (≤ 10 words -> <h2>);
 *   - the legal pages keep their document outline: the first bold title of each layout ("Privacy Policy" /
 *     "Terms & Conditions") -> <h1>, the numbered section titles stay <h2>, sub-sections stay <h3>, body lines -> <p>.
 * A retagged element keeps its builder CSS (every component rule targets h1…h6 and the container alike) and gets the
 * class "snz-h". Two things the old tag itself carried are restored: the builder's base rule gives headings
 * `margin: unset` (overrides/global.css sets margin: 0 on p.snz-h) and the heading's weight (the builder's typography
 * rule `.heading-X h1, …` declares it, else the base rule's 500) is written on the <p> as an inline font-weight, so the
 * text renders exactly as before. The same decision is applied to the component's copy inside the Nuxt payload
 * (#__NUXT_DATA__ -> the element's extra.* HTML string), so the runtime never re-renders the old tags on hydration.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cheerio = require('cheerio');
const REPORT = process.argv.includes('--report') || process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');

/** location-bar labels (EN + ES) -> h3 */
const LOCATION_LABELS = new Set(['Location', 'Phone', 'Store Hours', 'Ubicación', 'Teléfono', 'Horario', 'Horario de la Tienda', 'Horarios']);
/** heading components that are really paragraphs (desktop + phone copies) */
const SENTENCE_HEADINGS = new Set(['heading-0Ke59u-Zyv', 'heading-LvWh8ejTgG', 'heading-x_lOMCWdWN', 'heading-xFUkiLXSB7', 'heading-a_3Xyhe6O1', 'heading-N7kZBR2b2E', 'heading-_a8z5FzSKp', 'heading-8MiTGEtfaV']);
/** long section headlines that stay headings despite their length */
const KEEP_HEADING = new Set(['heading-JQfUWePMYv', 'heading-yw8zA6doto']);
const LEGAL = /privacy-policy-page|terms-conditions-page/;
const STAT = /^\d+(?:[.,]\d+)?\s*(?:%|°|\+|min|mins?|minutes?|hrs?|hours?|days?|nights?|yrs?|years?)?\.?$/i;
const HEAD_TAGS = 'h1,h2,h3,h4,h5,h6';
const words = (t) => t.trim().split(/\s+/).filter(Boolean).length;

const pages = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts') pages.push(p); } })(path.join(ROOT, 'app'));
const rel = (f) => path.relative(ROOT, f).replace(/\\/g, '/');
const layoutOf = ($el) => { const cls = ['.c-section', '.c-row', '.c-column', '.c-wrapper'].map((s) => $el.closest(s).attr('class') || '').join(' '); const m = cls.includes('mobile-only'), d = cls.includes('desktop-only'); return m && d ? 'hidden' : m ? 'mobile' : d ? 'desktop' : 'all'; };
/** top-level heading elements of a fragment root (not nested inside another heading) */
const heads = ($, $root) => $root.find(HEAD_TAGS).toArray().filter((h) => !$(h).parents(HEAD_TAGS).length);

/** the weight the builder's typography rule gives this component's heading tags (".heading-X h1, …{font-weight:N}"), else the base rule's 500 */
function headingWeights(headHtml) {
  const css = [...headHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const out = new Map();
  for (const rule of css.match(/[^{}]+\{[^{}]*\}/g) || []) {
    const [sel, body] = rule.split('{');
    const w = (body.match(/font-weight\s*:\s*(\d{3}|bold|normal)\b/g) || []).pop();
    if (!w) continue;
    const value = w.replace(/.*:\s*/, '').replace('bold', '700').replace('normal', '400');
    for (const s of sel.split(',')) { const m = s.match(/\.((?:sub-)?heading-[A-Za-z0-9_-]+|paragraph-[A-Za-z0-9_-]+)\s+h[1-6]\b/); if (m) out.set(m[1], value); }
  }
  return out;
}

const retag = ($, el, tag, cls, style) => {
  const $el = $(el); const $n = $(`<${tag}></${tag}>`);
  for (const [k, v] of Object.entries(el.attribs || {})) $n.attr(k, v);
  if (cls) $n.addClass(cls);
  if (style) $n.attr('style', ((el.attribs && el.attribs.style) ? el.attribs.style.replace(/;?\s*$/, '; ') : '') + style);
  $n.html($el.html()); $el.replaceWith($n); return $n;
};

/** some pages' builder stylesheet makes <strong> inside a heading inherit the heading's weight
    (":is(h1,…,h6) :is(strong) { font-weight: unset }"); inside a <p> the browser's bolder would apply instead */
const strongInheritsOn = (headHtml) => /:is\(h1,h2,h3,h4,h5,h6\)\s*:is\(strong\)\s*\{\s*font-weight:\s*unset/.test(headHtml);
const toP = ($, h, pStyle, strongInherit) => { const $n = retag($, h, 'p', 'snz-h', pStyle); if (strongInherit) $n.find('strong, b').each((_, s) => { if (!/font-weight/.test($(s).attr('style') || '')) $(s).attr('style', (($(s).attr('style') || '').replace(/;?\s*$/, '; ') + 'font-weight:inherit').replace(/^; /, '')); }); return $n; };

/** apply one decision to a fragment root; returns the counters it touched */
function apply($, $root, decision, weight, strongInherit = false) {
  const c = { merged: 0, toH1: 0, toH2: 0, toH3: 0, toP: 0 };
  const hs = heads($, $root);
  const pStyle = `font-weight:${weight || '500'}`;
  switch (decision) {
    // a split hero becomes one heading whose lines are joined by a newline character (white-space: pre-line via
    // .snz-h1-merged in overrides/global.css): a <br> element would shift the span:nth-child() positions that the
    // baked site.css rules for the home hero depend on
    case 'hero': { const lines = hs.filter((h) => $(h).text().trim()); if (lines.length > 1) { $(lines[0]).html(lines.map((h) => $(h).html()).join('\n')); $(lines[0]).addClass('snz-h1-merged'); for (const h of lines.slice(1)) $(h).remove(); c.merged++; } for (const h of heads($, $root)) if (h.tagName.toLowerCase() !== 'h1') { retag($, h, 'h1'); c.toH1++; } break; }
    case 'h2': for (const h of hs) if (h.tagName.toLowerCase() === 'h1') { retag($, h, 'h2', 'snz-h'); c.toH2++; } break;
    case 'h3': for (const h of hs) if (h.tagName.toLowerCase() !== 'h3') { retag($, h, 'h3', 'snz-h'); c.toH3++; } break;
    case 'p': for (const h of hs) { toP($, h, pStyle, strongInherit); c.toP++; } break;
    case 'legal-title': for (const h of hs) { const tag = h.tagName.toLowerCase(); if (tag !== 'h2') continue; const $h = $(h); const t = $h.text().trim(); const isTitle = $h.children().first().is('strong') && t && t.length <= 80; if (isTitle) { if (!c.toH1 && decision === 'legal-title') { retag($, h, 'h1'); c.toH1++; } } else { toP($, h, pStyle, strongInherit); c.toP++; } } break;
    case 'legal': for (const h of hs) { const tag = h.tagName.toLowerCase(); if (tag !== 'h2') continue; const $h = $(h); const t = $h.text().trim(); const isTitle = $h.children().first().is('strong') && t && t.length <= 80; if (!isTitle) { toP($, h, pStyle, strongInherit); c.toP++; } } break;
    case 'paragraph': for (const h of hs) { const t = $(h).text().trim(); if (t && words(t) <= 10) { if (h.tagName.toLowerCase() !== 'h2') { retag($, h, 'h2', 'snz-h'); c.toH2++; } } else { toP($, h, pStyle, strongInherit); c.toP++; } } break;
  }
  return c;
}

const summary = { pages: 0, merged: 0, toH1: 0, toH2: 0, toH3: 0, toP: 0, payloadMirrored: 0, payloadShared: 0, payloadMissed: 0, payloadSkipped: 0 };
const add = (c) => { for (const k of Object.keys(c)) summary[k] += c[k]; };
const missed = [];
for (const file of pages) {
  const route = rel(file).replace(/^app\/(\(en\)|es)\/?/, (m, g) => (g === 'es' ? '/es/' : '/')).replace(/\/content\.ts$/, '').replace(/\/$/, '') || '/';
  let src = fs.readFileSync(file, 'utf8');
  const head = src.match(/export const HEAD_HTML = ("[\s\S]*?");\r?\n/);
  // BODY_HTML is the last export: greedy to the final closing quote (an escaped \"; inside the markup must not end the match)
  const m = src.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!m) { console.error(`${rel(file)}: BODY_HTML not found`); continue; }
  const headHtml = head ? JSON.parse(head[1]) : '';
  const weights = headingWeights(headHtml);
  const strongInherit = strongInheritsOn(headHtml);
  const body = JSON.parse(m[1]);
  const $ = cheerio.load(body, { decodeEntities: false }, false);
  if ($.html() !== body) throw new Error(`${rel(file)}: cheerio round-trip differs`);
  const decisions = []; // [componentId, decision, weight]
  const comps = $('[id^="heading-"], [id^="sub-heading-"], [id^="paragraph-"]').toArray().filter((el) => $(el).hasClass('c-wrapper'));
  const heroDone = { desktop: false, mobile: false };
  const outline = []; let changedComponents = 0;
  const legal = LEGAL.test(route);
  for (const el of comps) {
    const $c = $(el); const id = $c.attr('id'); const kind = id.startsWith('sub-heading') ? 'sub-heading' : id.split('-')[0];
    const $out = $c.find('.text-output').first(); if (!$out.length) continue;
    const hs = heads($, $out); if (!hs.length) continue;
    const layout = layoutOf($c); const text = $out.text().replace(/\s+/g, ' ').trim();
    const cls = ($out.attr('class') || '').split(/\s+/).find((k) => /^(?:sub-)?heading-|^paragraph-/.test(k)) || id;
    const weight = weights.get(cls);
    let decision = null, note = '';
    const firstOfLayout = ((layout === 'desktop' || layout === 'all') && !heroDone.desktop) || ((layout === 'mobile' || layout === 'all') && !heroDone.mobile);
    const markLayout = () => { if (layout === 'desktop' || layout === 'all') heroDone.desktop = true; if (layout === 'mobile' || layout === 'all') heroDone.mobile = true; };
    if (legal) {
      if (kind === 'sub-heading' || kind === 'paragraph') {
        const hasTitle = hs.some((h) => { const $h = $(h); return $h.children().first().is('strong') && $h.text().trim() && $h.text().trim().length <= 80; });
        const hasH1 = $out.find('h1').length > 0; // already promoted on an earlier run: the layout's H1 is done
        if (hasH1) { markLayout(); decision = 'legal'; note = 'legal: H1 present, titles stay h2, lines → p'; }
        else if (firstOfLayout && hasTitle) { decision = 'legal-title'; note = 'legal: first title → h1, lines → p'; markLayout(); }
        else { decision = 'legal'; note = 'legal: titles stay h2, lines → p'; }
      } else { decision = 'h2'; note = 'legal heading component'; }
    } else if (kind === 'heading') {
      if (text && firstOfLayout) { markLayout(); decision = 'hero'; note = 'H1 (hero)'; }
      else if (!text) { decision = 'p'; note = 'empty → p'; }
      else if (LOCATION_LABELS.has(text)) { decision = 'h3'; note = 'location label → h3'; }
      else if (STAT.test(text)) { decision = 'p'; note = 'stat label → p'; }
      else if ((SENTENCE_HEADINGS.has(id) || (words(text) >= 12 && /[.!?]$/.test(text))) && !KEEP_HEADING.has(id)) { decision = 'p'; note = 'sentence → p'; }
      else { decision = 'h2'; note = hs.some((h) => h.tagName.toLowerCase() === 'h1') ? 'h1 → h2' : 'kept'; }
    } else if (kind === 'sub-heading') { decision = 'p'; note = 'sub-heading → p'; }
    else { decision = 'paragraph'; note = 'paragraph component'; }
    const before = $out.html();
    const c = apply($, $out, decision, weight, strongInherit);
    if ($out.html() !== before) { changedComponents++; decisions.push([id, decision, weight]); if (!REPORT) add(c); }
    outline.push(`${layout.padEnd(8)} ${id.padEnd(26)} ${note.padEnd(34)} w=${(weight || '500').padEnd(4)} "${text.slice(0, 60)}"`);
  }
  if (REPORT) { console.log(`\n== ${route}: ${changedComponents} components would change`); for (const o of outline) console.log('   ' + o); continue; }
  if (!changedComponents) continue;
  // mirror into the payload: the element node (id) keeps its HTML in extra.* strings; the same decision is applied there
  const $p = $('script#__NUXT_DATA__').first();
  if ($p.length) {
    const nodes = JSON.parse($p.html());
    const str = (i) => (typeof i === 'number' && typeof nodes[i] === 'string' ? nodes[i] : null);
    const dict = (i) => (typeof i === 'number' && nodes[i] && typeof nodes[i] === 'object' && !Array.isArray(nodes[i]) ? nodes[i] : null);
    const byId = new Map(); nodes.forEach((n, i) => { if (n && typeof n === 'object' && !Array.isArray(n) && typeof n.id === 'number' && str(n.id)) byId.set(str(n.id), i); });
    const htmlStringsOf = (i, acc = new Set(), depth = 0) => { const d = dict(i); if (!d || depth > 6) return acc; for (const k of Object.keys(d)) { const v = d[k]; if (typeof v === 'number') { const s = str(v); if (s && /<h[1-6][\s>]/i.test(s)) acc.add(v); else if (dict(v)) htmlStringsOf(v, acc, depth + 1); } } return acc; };
    // the payload stores identical strings once: a line shared by the desktop and phone copies (the store hours) is
    // converted with the first copy, so the second finds no heading left — counted as "shared", not missed
    const alreadyDone = (i, depth = 0) => { const d = dict(i); if (!d || depth > 6) return false; return Object.values(d).some((v) => typeof v === 'number' && ((str(v) && /class="snz-h|snz-h1-merged/.test(str(v))) || alreadyDone(v, depth + 1))); };
    for (const [id, decision, weight] of decisions) {
      const ni = byId.get(id); if (ni === undefined) { summary.payloadMissed++; missed.push(`${route} ${id} (no payload node: static markup only)`); continue; }
      const targets = [...htmlStringsOf(ni)]; if (!targets.length) { if (alreadyDone(ni)) summary.payloadShared++; else { summary.payloadMissed++; missed.push(`${route} ${id} (no html string)`); } continue; }
      for (const ti of targets) {
        const frag = nodes[ti]; const $f = cheerio.load(frag, { decodeEntities: false }, false);
        if ($f.html() !== frag) { summary.payloadSkipped++; continue; }
        apply($f, $f.root(), decision, weight, strongInherit);
        nodes[ti] = $f.html(); summary.payloadMirrored++;
      }
    }
    $p.html(escapeJsonForScript(JSON.stringify(nodes)));
  }
  const out = $.html();
  src = src.replace(m[1], () => JSON.stringify(out));
  fs.writeFileSync(file, src); summary.pages++;
  console.log(`${rel(file).padEnd(60)} ${changedComponents} components`);
}
if (!REPORT) {
  console.log(`\n${summary.pages} pages written: ${summary.merged} hero headlines merged, ${summary.toH1} tags promoted to h1, ${summary.toH2} h1→h2, ${summary.toH3} →h3, ${summary.toP} →p; payload: ${summary.payloadMirrored} fragments mirrored, ${summary.payloadShared} shared strings already converted, ${summary.payloadMissed} components with no payload copy (the runtime leaves their markup as is; verify in a browser after the build), ${summary.payloadSkipped} fragments skipped (not round-trip safe)`);
  if (missed.length && process.argv.includes('--verbose')) for (const m of missed) console.log('   ' + m);
} else console.log('\n(report only, nothing written)');
