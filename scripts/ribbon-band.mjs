/*
 * The crossing-ribbons band (October 2026): two diagonal marquee ribbons placed directly after the hero on every
 * page. Ribbon A (orange, scrolls left, links to the sales page) carries the current offer from lib/offer.ts and is
 * left out while the offer is date-gated off (an inline script also removes it on the client once the end date has
 * passed); ribbon B (tan, scrolls right) carries the announcement items below. Pure CSS animation (overrides/global.css).
 *
 * Generated builder pages (app/**／content.ts, EN + ES): the band is a real builder section so it survives Vue
 * hydration — a copy of the empty custom-code section section-x8iH4TeG-J (home) inserted right after the mobile hero
 * (after the second section when a page has no hero) in the markup and in the hydration payload, with the band HTML
 * as the custom code. The old home ticker section, the brown address/phone strip sections and the offer item the old
 * ticker script put into the logo marquee are removed. Idempotent: a band already in place only gets its HTML
 * refreshed, so re-running after editing lib/offer.ts updates every page without growing the payload.
 *
 * Hand-written pages read the same HTML from components/ribbon-band.generated.ts (written here) through
 * components/RibbonBand.tsx.   node scripts/ribbon-band.mjs   (npm run ribbon)   [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { devalueDecode, devalueEncode } from './insert-sections.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cheerio = require('cheerio');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isDict = (v) => v && typeof v === 'object' && !Array.isArray(v);

/* ---- content: ribbon B is a config array, ribbon A comes from lib/offer.ts ---- */
const B_ITEMS = {
  en: ['Shop the Best Mattress Deals Today', 'King for a Queen Specials or 0% Financing!', 'Visit Your Local Snooze Today!', 'Free Delivery on Orders Over $999'],
  es: ['Aprovecha Hoy las Mejores Ofertas en Colchones', '¡Especiales King al Precio de Queen o Financiamiento al 0%!', '¡Visita Hoy tu Snooze más Cercano!', 'Entrega Gratis en Compras Mayores a $999'],
};
const offerSrc = fs.readFileSync(path.join(ROOT, 'lib/offer.ts'), 'utf8');
const offerField = (name, loc) => (offerSrc.match(new RegExp(`${name}:\\s*\\{[^}]*?\\b${loc}:\\s*'((?:[^'\\\\]|\\\\.)*)'`)) || [])[1]?.replace(/\\'/g, "'") || '';
const OFFER = {
  enabled: /^\s*enabled:\s*true/m.test(offerSrc),
  startDate: (offerSrc.match(/^\s*startDate:\s*'([^']*)'/m) || [])[1] || '',
  endDate: (offerSrc.match(/^\s*endDate:\s*'([^']*)'/m) || [])[1] || '',
  href: (offerSrc.match(/cta:\s*\{\s*href:\s*'([^']*)'/) || [])[1] || '/mattress-sales',
  items: (loc) => [offerField('headline', loc), ...offerField('details', loc).split(/\s*·\s*/)].map((t) => t.trim()).filter(Boolean),
};
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const ACTIVE = OFFER.enabled && (!OFFER.startDate || today >= OFFER.startDate) && (!OFFER.endDate || today <= OFFER.endDate) && OFFER.items('en').length > 0;

/* ---- band HTML ---- */
const CHEV = '<svg class="snz-cross__sep" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
const copy = (items, reps) => `<span class="snz-cross__copy">${Array.from({ length: reps }, () => items.map((t) => `<span class="snz-cross__item">${esc(t)}</span>${CHEV}`).join('')).join('')}</span>`;
const track = (items, reps) => `<div class="snz-cross__track" aria-hidden="true">${copy(items, reps)}${copy(items, reps)}</div>`;
export function bandHtml(loc) {
  const a = ACTIVE ? `<a class="snz-cross__rb snz-cross__rb--a" href="${loc === 'es' ? '/es' : ''}${OFFER.href}" aria-label="${esc(OFFER.items(loc).join(', '))}">${track(OFFER.items(loc), 3)}</a>` : '';
  const b = `<div class="snz-cross__rb snz-cross__rb--b" role="group" aria-label="${esc(B_ITEMS[loc].join(', '))}">${track(B_ITEMS[loc], 2)}</div>`;
  const expiry = ACTIVE && OFFER.endDate ? `<script>(function(){var e=document.currentScript&&document.currentScript.parentNode;if(!e)return;var t=new Date('${OFFER.endDate}T23:59:59-06:00');if(!isNaN(t)&&Date.now()>t.getTime()){var a=e.querySelector('.snz-cross__rb--a');if(a)a.parentNode.removeChild(a);e.classList.add('snz-cross--single');}})();</script>` : '';
  return `<div class="snz-cross${ACTIVE ? '' : ' snz-cross--single'}" data-snz-cross="${loc}">${a}${b}${expiry}</div>`;
}

/* ---- builder pages ---- */
const T = { section: 'section-x8iH4TeG-J', row: 'row-EdKIR9VJhr', col: 'col-44O5Jbh-BJ', cc: 'custom-code-pO-5dtepaB' };
const STRIP_SECTIONS = ['section-ZJqP1gmkX-', 'section-TdwlaucWWz', 'section--kgEfG5qpr', 'section-LyNiGFNVB_', 'section-z3JZmHy_Yy', 'section-RoGpWzwIrG', 'section-DZE9FzkB6N'];
const TICKER_SECTIONS = ['section-XXfgRYmP-7'];
const OFFER_TICKER_ITEM = /<!--snz-offer-ticker-->[\s\S]*?<!--\/snz-offer-ticker-->\s*/g;
/* the payload script is swapped for a comment placeholder while cheerio works on the markup (a NUL-based placeholder
   would be replaced by the HTML parser and the payload lost) */
const SLOT = '<!--snz-payload-slot-->';
const splitBody = (body) => { const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/); return { pm, markup: pm ? body.replace(pm[0], SLOT) : body }; };
const pageOf = (nodes) => { const page = nodes.find((n) => isDict(n) && 'elements' in n && 'popup' in n); const elements = page && Array.isArray(nodes[page.elements]) ? nodes[page.elements] : null; return { page, elements }; };
const strAt = (nodes) => (i) => (typeof i === 'number' && i >= 0 && typeof nodes[i] === 'string' ? nodes[i] : null);
const isMark = (n, m) => !!(n && n.type === 'comment' && String(n.data).trim() === m);
const prevElement = (node) => { let p = node.previousSibling; while (p && p.type !== 'tag') p = p.previousSibling; return p; };

/* template: the empty custom-code section on the English home page, read from git HEAD's copy of the file if the
   working copy no longer has it in its original place (it is moved after the hero on the first run) */
let TEMPLATE = null;
function loadTemplate() {
  let s = fs.readFileSync(path.join(ROOT, 'app/(en)/content.ts'), 'utf8');
  const body = JSON.parse(s.match(/export const BODY_HTML = ("[\s\S]*");\s*$/)[1]);
  const { pm, markup } = splitBody(body); const nodes = JSON.parse(pm[2]); const str = strAt(nodes); const { elements } = pageOf(nodes);
  const byId = new Map(); for (const i of elements) { const n = nodes[i]; if (isDict(n) && str(n.id)) byId.set(str(n.id), i); }
  const ids = [T.section, T.row, T.col, T.cc]; if (!ids.every((id) => byId.has(id))) throw new Error('template section not found on the home page');
  const plain = ids.map((id) => devalueDecode(nodes, byId.get(id)));
  const $ = cheerio.load(markup, { decodeEntities: false }, false); const el = $(`[id="${T.section}"]`).first(); if (!el.length) throw new Error('template markup missing');
  el.removeAttr('data-animate'); el.find('[data-animate]').removeAttr('data-animate');
  el.find('.custom-code-container').first().html('');
  TEMPLATE = { nodes: plain, html: $.html(el) };
}

function removeSectionMarkup($, id) {
  const el = $(`[id="${id}"]`).first(); if (!el.length) return false;
  const node = el.get(0); const prev = node.previousSibling, next = node.nextSibling;
  el.remove(); if (isMark(prev, '[') && isMark(next, ']')) { $(prev).remove(); $(next).remove(); }
  return true;
}
function removeSectionPayload(nodes, id) {
  const str = strAt(nodes); const { elements } = pageOf(nodes); if (!elements) return 0;
  const byId = new Map(); for (const i of elements) { const n = nodes[i]; if (isDict(n) && str(n.id)) byId.set(str(n.id), i); }
  if (!byId.has(id)) return 0;
  const drop = new Set(); const walk = (eid) => { const i = byId.get(eid); if (i === undefined) return; drop.add(i); const n = nodes[i]; const ch = typeof n.child === 'number' ? nodes[n.child] : null; if (Array.isArray(ch)) for (const c of ch) if (str(c)) walk(str(c)); };
  walk(id);
  let removed = 0;
  for (let i = 0; i < nodes.length; i++) if (Array.isArray(nodes[i]) && nodes[i].some((x) => drop.has(x) || (typeof x === 'number' && nodes[x] === id))) { const before = nodes[i].length; nodes[i] = nodes[i].filter((x) => !(drop.has(x) || (typeof x === 'number' && nodes[x] === id))); removed += before - nodes[i].length; }
  return removed;
}
function sectionHtml(loc) { const $ = cheerio.load(TEMPLATE.html, { decodeEntities: false }, false); $('.custom-code-container').first().html(bandHtml(loc)); return $.html(); }
function sectionNodes(loc) {
  const plain = JSON.parse(JSON.stringify(TEMPLATE.nodes));
  const v = plain[3].extra && plain[3].extra.customCode && plain[3].extra.customCode.value; if (!v || !('rawCustomCode' in v)) throw new Error('template custom code shape changed');
  v.rawCustomCode = bandHtml(loc); return plain;
}
/* in-place refresh of a band that is already in the right place: markup container + the payload's rawCustomCode string */
function refreshBand($, nodes, loc) {
  const container = $(`[id="${T.cc}"] .custom-code-container`).first(); if (!container.length) return false;
  container.html(bandHtml(loc));
  const str = strAt(nodes); const { elements } = pageOf(nodes); const ccIdx = elements.find((i) => isDict(nodes[i]) && str(nodes[i].id) === T.cc); if (ccIdx === undefined) return false;
  const extra = nodes[nodes[ccIdx].extra]; const cc = extra && nodes[extra.customCode]; const v = cc && nodes[cc.value]; if (!v || typeof v.rawCustomCode !== 'number') return false;
  nodes[v.rawCustomCode] = bandHtml(loc); return true;
}

loadTemplate();
const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts') files.push(p); } })(path.join(ROOT, 'app'));
let changed = 0; const report = [];
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/'); const loc = rel.startsWith('app/es/') ? 'es' : 'en';
  const s = fs.readFileSync(file, 'utf8'); const bodyM = s.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) continue;
  const body = JSON.parse(bodyM[1]); const { pm, markup } = splitBody(body); if (!pm) continue;
  const nodes = JSON.parse(pm[2]); const str = strAt(nodes);
  const $ = cheerio.load(markup, { decodeEntities: false }, false);
  const notes = [];
  // 1. the old ticker and the brown strips
  for (const id of [...TICKER_SECTIONS, ...STRIP_SECTIONS]) { const m = removeSectionMarkup($, id); const p = removeSectionPayload(nodes, id); if (m || p) notes.push(`−${id.replace('section-', '')}`); }
  // 2. the offer item the old ticker script put into the logo marquee custom code (markup + payload)
  $('.custom-code-container').each((_, el) => { const h = $(el).html() || ''; if (OFFER_TICKER_ITEM.test(h)) { OFFER_TICKER_ITEM.lastIndex = 0; $(el).html(h.replace(OFFER_TICKER_ITEM, '')); notes.push('−offer-ticker-item'); } OFFER_TICKER_ITEM.lastIndex = 0; });
  for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string' && OFFER_TICKER_ITEM.test(nodes[i])) { OFFER_TICKER_ITEM.lastIndex = 0; nodes[i] = nodes[i].replace(OFFER_TICKER_ITEM, ''); } OFFER_TICKER_ITEM.lastIndex = 0;
  // 3. anchor: the last hero section, else the second section (the mobile twin of the first), else the first
  const sections = $('#__nuxt .c-section').toArray().filter((el) => $(el).attr('id') !== T.section); if (!sections.length) { console.log(`  ${rel.padEnd(52)} no sections, skipped`); continue; }
  const heroes = sections.filter((el) => $(el).is('[data-snz-hero]')); const anchor = heroes.length ? heroes[heroes.length - 1] : sections[Math.min(1, sections.length - 1)];
  const anchorId = $(anchor).attr('id');
  // 4. a band already right after the anchor is refreshed in place; one anywhere else is removed and re-inserted
  const existing = $(`[id="${T.section}"]`).first();
  if (existing.length && prevElement(existing.get(0)) === anchor && refreshBand($, nodes, loc)) notes.push(`=band after ${anchorId.replace('section-', '')}`);
  else {
    if (existing.length) { removeSectionMarkup($, T.section); removeSectionPayload(nodes, T.section); notes.push('−band'); }
    const next = anchor.nextSibling; const hasClose = isMark(next, ']');
    const copyHtml = `<!--[-->${sectionHtml(loc)}<!--]-->`;
    $(anchor).after(hasClose ? '<!--]-->' + copyHtml.replace(/<!--\]-->$/, '') : copyHtml);
    const { elements } = pageOf(nodes); const anchorPos = elements.findIndex((i) => isDict(nodes[i]) && str(nodes[i].id) === anchorId);
    const root = elements.map((i) => nodes[i]).find((n) => isDict(n) && typeof n.child === 'number' && Array.isArray(nodes[n.child]) && nodes[n.child].some((c) => str(c) === anchorId));
    if (anchorPos < 0 || !root) { console.log(`  ${rel.padEnd(52)} anchor ${anchorId} not in payload, skipped`); continue; }
    const newIdx = sectionNodes(loc).map((n) => devalueEncode(nodes, n)); elements.splice(anchorPos + 1, 0, ...newIdx);
    const childArr = nodes[root.child]; const cpos = childArr.findIndex((c) => str(c) === anchorId); childArr.splice(cpos + 1, 0, devalueEncode(nodes, T.section));
    notes.push(`+band after ${anchorId.replace('section-', '')}${heroes.length ? ' (hero)' : ''}`);
  }
  const payload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3];
  const out = $.html().replace(SLOT, () => payload);
  if (!out.includes('__NUXT_DATA__') || out.includes(SLOT)) throw new Error(rel + ': payload slot lost');
  if (out !== body) { changed++; if (!CHECK) fs.writeFileSync(file, s.replace(bodyM[1], () => JSON.stringify(out))); }
  report.push(`  ${rel.padEnd(44)} ${notes.join(' ')}${out !== body ? '' : ' (no change)'}`);
}
console.log(report.join('\n'));
// hand-written pages read the same HTML
const gen = `// Generated by scripts/ribbon-band.mjs — do not edit by hand. Rendered by components/RibbonBand.tsx.\nexport const RIBBON_BAND_HTML = { en: ${JSON.stringify(bandHtml('en'))}, es: ${JSON.stringify(bandHtml('es'))} } as const;\n`;
const genPath = path.join(ROOT, 'components/ribbon-band.generated.ts');
if (!CHECK && (!fs.existsSync(genPath) || fs.readFileSync(genPath, 'utf8') !== gen)) { fs.writeFileSync(genPath, gen); console.log('  components/ribbon-band.generated.ts written'); }
console.log(`offer ${ACTIVE ? 'ACTIVE' : 'inactive'} (${today}; ends ${OFFER.endDate || 'never'}); ${files.length} pages, ${changed} files ${CHECK ? 'would change' : 'changed'}`);
