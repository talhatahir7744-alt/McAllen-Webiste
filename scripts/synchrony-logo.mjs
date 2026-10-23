/*
 * Restores the Synchrony Bank logo in the "Mattress Payment Plans" cards of /mattress-financing and /es/mattress-financing
 * as a local asset. The builder hotlinked https://www.synchrony.com/syc/img/2023_synchrony_basic_logo.svg; that URL went
 * dead and commit 2c5be9a removed the two image elements (image--5renCqep5 desktop, image-D4fcGQBl6w phone) from the markup
 * and from the page's elements list — the element records themselves stayed in the payload. The same file, recovered from
 * the Wayback Machine (snapshot of August 22, 2026, a viewBox added so it scales), is public/assets/logos/synchrony.svg.
 * Per page this script
 *   - markup: puts each image element back in the empty fragment after its heading block (heading-LzVSxdD-Mw /
 *     heading-tn9VIrZtwd), cloned from the Wells Fargo image of the same card copy — the same c-image component shape, in
 *     the runtime's <img> form (scripts/image-hydration-match.mjs) — with the local src and the alt text;
 *   - payload: puts the two element records back in the page's elements list (ascending, where they were), points the
 *     URL string node at the local asset (every field holding that value is this logo's url, one meaning, so the shared
 *     string is changed in place) and sets the two alt-text nodes.
 * overrides.json (imageReplacements, imageAlt, removeElements) and overrides/i18n/es.extra.json carry the same mapping,
 * so a re-convert produces the same pages and this script then finds nothing to do. Idempotent.
 *   node scripts/synchrony-logo.mjs   (npm run logo:synchrony)   [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPage, writePage, pageOf, strAt, isDict, isMark, cheerio } from './builder-section.mjs';
import { devalueDecode } from './insert-sections.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const LOCAL = '/assets/logos/synchrony.svg';
const OLD_URL = 'https://www.synchrony.com/syc/img/2023_synchrony_basic_logo.svg';
const ALT = { en: 'Synchrony financing at Snooze Mattress + Wellness McAllen', es: 'Financiamiento Synchrony en Snooze Mattress + Wellness McAllen' };
const OLD_ALT = { en: ['Synchrony logo'], es: ['Logotipo de Synchrony'] };
// the desktop and the phone copy of the card: the Synchrony image, the heading it follows, the Wells Fargo image of the same copy (template)
const COPIES = [
  { id: 'image--5renCqep5', token: '-5renCqep5', heading: 'heading-LzVSxdD-Mw', template: 'image-0ZKu02g8l1', tplToken: '0ZKu02g8l1' },
  { id: 'image-D4fcGQBl6w', token: 'D4fcGQBl6w', heading: 'heading-tn9VIrZtwd', template: 'image-mn4E4RUoc5', tplToken: 'mn4E4RUoc5' },
];
const PAGES = [['app/(en)/mattress-financing/content.ts', 'en'], ['app/es/mattress-financing/content.ts', 'es']];
/* cheerio's after() is a no-op on a comment node, so the new nodes go into the parent's children list by hand, siblings relinked */
function insertAfter(mark, nodes) {
  const parent = mark.parent; const kids = parent.children; const at = kids.indexOf(mark); if (at < 0) throw new Error('mark not in its parent');
  for (const n of nodes) n.parent = parent; kids.splice(at + 1, 0, ...nodes);
  for (let i = 0; i < kids.length; i++) { kids[i].prev = kids[i - 1] || null; kids[i].next = kids[i + 1] || null; }
}
if (!fs.existsSync(path.join(ROOT, 'public', LOCAL))) throw new Error('missing asset public' + LOCAL);

for (const [rel, locale] of PAGES) {
  const file = path.join(ROOT, rel); const page = readPage(file); if (!page) throw new Error(rel + ': unreadable');
  const { $, nodes } = page; const str = strAt(nodes); const { elements } = pageOf(nodes); if (!elements) throw new Error(rel + ': no elements list');
  const notes = [];
  for (const c of COPIES) {
    if (!$('#' + c.id).length) {
      const heading = $('#' + c.heading)[0]; if (!heading) throw new Error(`${rel}: ${c.heading} missing`);
      // after the heading element: "]" closes its fragment, then "[" + "]" is the empty fragment the image was removed from
      const marks = []; let n = heading.nextSibling;
      while (n && marks.length < 3) { if (n.type === 'comment') marks.push(n); else if (n.type === 'tag') throw new Error(`${rel}: an element follows ${c.heading}`); n = n.nextSibling; }
      if (!(isMark(marks[0], ']') && isMark(marks[1], '[') && isMark(marks[2], ']'))) throw new Error(`${rel}: no empty fragment after ${c.heading}`);
      const tpl = $('#' + c.template); if (!tpl.length) throw new Error(`${rel}: template ${c.template} missing`);
      const $el = cheerio.load($.html(tpl).split(c.tplToken).join(c.token), { decodeEntities: false }, false);
      const img = $el('img'); if (img.length !== 1) throw new Error(`${rel}: template has ${img.length} img`);
      img.attr('src', LOCAL); img.attr('alt', ALT[locale]); img.removeAttr('width'); img.removeAttr('height'); img.attr('style', '');
      insertAfter(marks[1], [...$el.root()[0].children]); notes.push(`markup ${c.id} restored`);
    }
    let k = -1; for (let i = 0; i < nodes.length; i++) { const r = nodes[i]; if (isDict(r) && 'tagName' in r && str(r.id) === c.id) { k = i; break; } }
    if (k < 0) throw new Error(`${rel}: payload record for ${c.id} missing`);
    if (!elements.includes(k)) { let at = elements.findIndex((e) => e > k); if (at < 0) at = elements.length; elements.splice(at, 0, k); notes.push(`payload ${c.id} (node ${k}) back in elements[${at}]`); }
    const rec = devalueDecode(nodes, k); const url = rec && rec.extra && rec.extra.imageProperties && rec.extra.imageProperties.value && rec.extra.imageProperties.value.url;
    if (url !== OLD_URL && url !== LOCAL) throw new Error(`${rel}: ${c.id} payload url is ${JSON.stringify(url)}`);
  }
  const u = nodes.indexOf(OLD_URL); if (u >= 0) { nodes[u] = LOCAL; notes.push(`url node ${u} → ${LOCAL}`); }
  for (const old of OLD_ALT[locale]) { let i; while ((i = nodes.indexOf(old)) >= 0) { nodes[i] = ALT[locale]; notes.push(`alt node ${i} set`); } }
  const r = writePage(page, { check: CHECK });
  console.log(`${rel}: ${notes.length ? notes.join('; ') : 'nothing to do'}${r.changed ? (CHECK ? ' (would change)' : ' (written)') : ''}`);
}
