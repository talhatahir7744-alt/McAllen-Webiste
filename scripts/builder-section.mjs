/*
 * Shared helpers for scripts that add, refresh or remove a builder section on the generated pages
 * (app/**／content.ts): scripts/ribbon-band.mjs (the crossing-ribbons band on the home page) and
 * scripts/sales-hero.mjs (the dated offer block under the sales-page hero). A section must exist both in the static
 * markup and in the Nuxt hydration payload (the devalue array in #__NUXT_DATA__) or Vue drops it on hydration, so
 * every operation here touches both. The template is the home page's empty custom-code section (section-x8iH4TeG-J):
 * a one-column section whose custom-code element renders whatever HTML it is given.
 *
 * Payload rules (see README): strings in the payload are deduplicated, so a string node is never overwritten in place
 * unless the caller knows it is unique; new values are appended and the owner re-pointed. `{"value": idx}` wrapper
 * objects carry element props. Section insertion = the four element records appended + the section id added to the
 * page's `elements` list (after the anchor) and to the root's `child` list.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { devalueDecode, devalueEncode } from './insert-sections.mjs';

const require = createRequire(import.meta.url);
export const cheerio = require('cheerio');
const BS = String.fromCharCode(92);
export const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const isDict = (v) => v && typeof v === 'object' && !Array.isArray(v);
/* the payload script is swapped for a comment placeholder while cheerio works on the markup (a NUL-based placeholder
   would be replaced by the HTML parser and the payload lost) */
export const SLOT = '<!--snz-payload-slot-->';
export const splitBody = (body) => { const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/); return { pm, markup: pm ? body.replace(pm[0], SLOT) : body }; };
export const pageOf = (nodes) => { const page = nodes.find((n) => isDict(n) && 'elements' in n && 'popup' in n); const elements = page && Array.isArray(nodes[page.elements]) ? nodes[page.elements] : null; return { page, elements }; };
export const strAt = (nodes) => (i) => (typeof i === 'number' && i >= 0 && typeof nodes[i] === 'string' ? nodes[i] : null);
export const isMark = (n, m) => !!(n && n.type === 'comment' && String(n.data).trim() === m);
export const prevElement = (node) => { let p = node.previousSibling; while (p && p.type !== 'tag') p = p.previousSibling; return p; };

/** every generated page file under app/ */
export function listContentFiles(root) { const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts') files.push(p); } })(path.join(root, 'app')); return files; }

/** read a content.ts: source, BODY_HTML, payload match, cheerio markup (payload swapped for SLOT), parsed nodes */
export function readPage(file) {
  const s = fs.readFileSync(file, 'utf8'); const bodyM = s.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) return null;
  const body = JSON.parse(bodyM[1]); const { pm, markup } = splitBody(body); if (!pm) return null;
  const nodes = JSON.parse(pm[2]); const $ = cheerio.load(markup, { decodeEntities: false }, false);
  return { file, s, bodyM, body, pm, nodes, $ };
}
/** serialise back; returns { out, changed }; writes when changed and !check */
export function writePage(page, { check = false } = {}) {
  const { s, bodyM, body, pm, nodes, $, file } = page;
  const payload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3];
  const out = $.html().replace(SLOT, () => payload);
  if (!out.includes('__NUXT_DATA__') || out.includes(SLOT)) throw new Error(path.basename(path.dirname(file)) + ': payload slot lost');
  const changed = out !== body; if (changed && !check) fs.writeFileSync(file, s.replace(bodyM[1], () => JSON.stringify(out)));
  return { out, changed };
}

/** the template section (markup + decoded payload records) read from a page; `rename` maps template ids to new ids
    so a page can carry an independent copy (ids also live inside class names and the container id) */
export function loadTemplate(file, ids, rename = null) {
  const page = readPage(file); if (!page) throw new Error('template page unreadable: ' + file);
  const { nodes, $ } = page; const str = strAt(nodes); const { elements } = pageOf(nodes);
  const byId = new Map(); for (const i of elements) { const n = nodes[i]; if (isDict(n) && str(n.id)) byId.set(str(n.id), i); }
  const list = [ids.section, ids.row, ids.col, ids.cc]; if (!list.every((id) => byId.has(id))) throw new Error('template section not found in ' + file);
  let plain = list.map((id) => devalueDecode(nodes, byId.get(id)));
  const el = $(`[id="${ids.section}"]`).first(); if (!el.length) throw new Error('template markup missing in ' + file);
  el.removeAttr('data-animate'); el.find('[data-animate]').removeAttr('data-animate');
  el.find('.custom-code-container').first().html('');
  let html = $.html(el); let out = { ...ids };
  if (rename) {
    let json = JSON.stringify(plain);
    for (const [from, to] of Object.entries(rename)) { html = html.split(from).join(to); json = json.split(from).join(to); for (const k of Object.keys(out)) if (out[k] === from) out[k] = to; }
    plain = JSON.parse(json);
  }
  return { nodes: plain, html, ids: out };
}
export function removeSectionMarkup($, id) {
  const el = $(`[id="${id}"]`).first(); if (!el.length) return false;
  const node = el.get(0); const prev = node.previousSibling, next = node.nextSibling;
  el.remove(); if (isMark(prev, '[') && isMark(next, ']')) { $(prev).remove(); $(next).remove(); }
  return true;
}
export function removeSectionPayload(nodes, id) {
  const str = strAt(nodes); const { elements } = pageOf(nodes); if (!elements) return 0;
  const byId = new Map(); for (const i of elements) { const n = nodes[i]; if (isDict(n) && str(n.id)) byId.set(str(n.id), i); }
  if (!byId.has(id)) return 0;
  const drop = new Set(); const walk = (eid) => { const i = byId.get(eid); if (i === undefined) return; drop.add(i); const n = nodes[i]; const ch = typeof n.child === 'number' ? nodes[n.child] : null; if (Array.isArray(ch)) for (const c of ch) if (str(c)) walk(str(c)); };
  walk(id);
  let removed = 0;
  for (let i = 0; i < nodes.length; i++) if (Array.isArray(nodes[i]) && nodes[i].some((x) => drop.has(x) || (typeof x === 'number' && nodes[x] === id))) { const before = nodes[i].length; nodes[i] = nodes[i].filter((x) => !(drop.has(x) || (typeof x === 'number' && nodes[x] === id))); removed += before - nodes[i].length; }
  return removed;
}
export function removeSection(page, id) { const m = removeSectionMarkup(page.$, id); const p = removeSectionPayload(page.nodes, id); return m || p > 0; }
/** section markup / payload records with the custom-code HTML filled in */
export function sectionHtml(template, customHtml) { const $ = cheerio.load(template.html, { decodeEntities: false }, false); $('.custom-code-container').first().html(customHtml); return $.html(); }
export function sectionNodes(template, customHtml) {
  const plain = JSON.parse(JSON.stringify(template.nodes));
  const v = plain[3].extra && plain[3].extra.customCode && plain[3].extra.customCode.value; if (!v || !('rawCustomCode' in v)) throw new Error('template custom code shape changed');
  v.rawCustomCode = customHtml; return plain;
}
/** in-place refresh of a section's custom code: the markup container + the payload's rawCustomCode string */
export function refreshCustomCode(page, ccId, html) {
  const { $, nodes } = page;
  const container = $(`[id="${ccId}"] .custom-code-container`).first(); if (!container.length) return false;
  container.html(html);
  const str = strAt(nodes); const { elements } = pageOf(nodes); const ccIdx = elements.find((i) => isDict(nodes[i]) && str(nodes[i].id) === ccId); if (ccIdx === undefined) return false;
  const extra = nodes[nodes[ccIdx].extra]; const cc = extra && nodes[extra.customCode]; const v = cc && nodes[cc.value]; if (!v || typeof v.rawCustomCode !== 'number') return false;
  nodes[v.rawCustomCode] = html; return true;
}
/** insert a copy of the template (with customHtml) right after `anchor` (a cheerio section element), markup + payload */
export function insertSectionAfter(page, anchor, template, customHtml) {
  const { $, nodes } = page; const str = strAt(nodes); const anchorId = $(anchor).attr('id');
  const next = anchor.nextSibling; const hasClose = isMark(next, ']');
  const copyHtml = `<!--[-->${sectionHtml(template, customHtml)}<!--]-->`;
  const { elements } = pageOf(nodes); const anchorPos = elements.findIndex((i) => isDict(nodes[i]) && str(nodes[i].id) === anchorId);
  const root = elements.map((i) => nodes[i]).find((n) => isDict(n) && typeof n.child === 'number' && Array.isArray(nodes[n.child]) && nodes[n.child].some((c) => str(c) === anchorId));
  if (anchorPos < 0 || !root) return false;
  $(anchor).after(hasClose ? '<!--]-->' + copyHtml.replace(/<!--\]-->$/, '') : copyHtml);
  const newIdx = sectionNodes(template, customHtml).map((n) => devalueEncode(nodes, n)); elements.splice(anchorPos + 1, 0, ...newIdx);
  const childArr = nodes[root.child]; const cpos = childArr.findIndex((c) => str(c) === anchorId); childArr.splice(cpos + 1, 0, devalueEncode(nodes, template.ids.section));
  return true;
}
/** the page's sections (cheerio elements) and its hero sections, excluding the given ids */
export function sectionsOf($, exclude = []) { const all = $('#__nuxt .c-section').toArray().filter((el) => !exclude.includes($(el).attr('id'))); return { all, heroes: all.filter((el) => $(el).is('[data-snz-hero]')) }; }
/** place a section copy right after the last hero (or the second section): refresh in place when already there,
    else remove any stray copy and insert; returns a note */
export function placeAfterHero(page, template, customHtml) {
  const { $ } = page; const id = template.ids.section;
  const { all, heroes } = sectionsOf($, [id]); if (!all.length) return 'no sections';
  const anchor = heroes.length ? heroes[heroes.length - 1] : all[Math.min(1, all.length - 1)]; const anchorId = $(anchor).attr('id');
  const existing = $(`[id="${id}"]`).first();
  if (existing.length && prevElement(existing.get(0)) === anchor && refreshCustomCode(page, template.ids.cc, customHtml)) return `=${id.replace('section-', '')} after ${anchorId.replace('section-', '')}`;
  if (existing.length) removeSection(page, id);
  return insertSectionAfter(page, anchor, template, customHtml) ? `+${id.replace('section-', '')} after ${anchorId.replace('section-', '')}${heroes.length ? ' (hero)' : ''}` : `anchor ${anchorId} not in payload`;
}
