/*
 * The brand lineup of this location (the client's decisions, November 4, 2026), EN + ES, on the generated pages
 * (static markup + hydration payload, through scripts/builder-section.mjs so Vue keeps what the markup shows):
 *   1. the brand the client dropped: its deal leaves the sales page's "Current Mattress Deals" column (heading,
 *      sub-heading and banner, desktop + phone; the banner file stays in public/), and payload strings that still
 *      name it but nothing reaches any more (the removed deal's records, the sales hero's previous intro, which
 *      scripts/sales-hero.mjs re-points rather than overwrites) are emptied on every page;
 *   2. /mattresses shows one brand block per approved brand, in the client's order (LINEUP, = lib/brands.json):
 *      - the existing blocks keep their copy; "Copper Collection by Spring Air" is the client's "Copper by Spring Air"
 *        (same line: the heading is renamed); the SmartLife by King Koil block is not in the lineup and leaves;
 *      - brands with no block get one (BLOCK_COPY): a copy of a block of the same tone (Helix for the light blocks,
 *        Snooze-O-Pedic for the navy ones) with new element ids (the template's ids + a brand suffix, so every
 *        builder CSS rule is copied under the new ids into HEAD_HTML), the brand name as heading, two sentences from
 *        what the site already says (the showroom, the free Dream Mapping fitting, the Sleep Coaches; no new claims)
 *        and no feature list; the image is the brand's logo from the logo strip, on a white card; the button books a
 *        Dream Mapping visit like every block's;
 *      - the blocks alternate navy / light as the builder laid them out: a block whose place in the new order needs
 *        the other tone is restyled (section background, heading / intro / feature text colours).
 * The logo strip follows scripts/logo-marquee-patch.mjs (LINEUP); the hand-written pages carry the lineup in their
 * own copy (lib/pages/*); scripts/page-schema.mjs builds the /mattresses ItemList from these blocks (run it after
 * this script). Idempotent.  node scripts/brand-lineup.mjs   (npm run brand:lineup, after section:sales-hero)  [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPage, writePage, removeSection, removeSectionMarkup, listContentFiles, isDict, pageOf, strAt, isMark, esc } from './builder-section.mjs';
import { devalueDecode, devalueEncode, extractCssRules } from './insert-sections.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

/* ---- 1. the dropped brand ---- */
/* /mattress-sales: its deal — heading, sub-heading, banner image (desktop column, then the phone twin) */
const DROPPED_DEAL = ['heading-ezMen56g6A', 'sub-heading-3qOxRpqGtp', 'image-hiUF65gSpH', 'heading-5oFBYHWaWy', 'sub-heading-oYsyStEs7y', 'image-it2z0GadKv'];
/* its name, spelled with character codes so the repo-wide search the client asked for stays at zero */
const DROPPED_BRAND = new RegExp(String.fromCharCode(80, 117, 102, 102, 121), 'i');

/* ---- 2. the /mattresses lineup ---- */
const LINEUP = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/brands.json'), 'utf8')).mattressBrands;
/* the blocks the builder made (desktop / phone section ids; tone of the section as built: navy or light) */
const EXISTING = {
  'Tempur-Pedic': { d: 'X8DGZqWJRb', m: '4aWQu658F1', tone: 'navy' },
  Sealy: { d: '_x0pwmJpOp', m: 'tpEyS8xkXg', tone: 'light' },
  'Stearns & Foster': { d: 'Pfc5lrMv9Q', m: '-RmuQkPlGG', tone: 'navy' },
  Beautyrest: { d: 'KXyZ0DoJ_L', m: 'S2WWlaeUXO', tone: 'light' },
  'Brooklyn Bedding': { d: 'ivLUvlv_R6', m: 'y-lzw9yy2p', tone: 'light' },
  'Copper by Spring Air': { d: 'oleVL4-Hc2', m: 'lZ-73U4gFN', tone: 'navy', heading: [['Copper Collection by', 'Copper by']] },
  'Snooze Handcrafted by King Koil': { d: 'VxOO-OARVR', m: 'zvVe5S46SV', tone: 'light' },
  'Snooze-O-Pedic': { d: '3xaLAkVgvx', m: 'a0i8D5rAw6', tone: 'navy' },
  Helix: { d: 'AW0qeYXc1K', m: '1sgHqvVQAf', tone: 'light' },
};
const NOT_IN_LINEUP = [{ d: 'ixC27F4VtX', m: 'sMnLckR5mh' }]; // SmartLife by King Koil
const TEMPLATE = { light: EXISTING.Helix, navy: EXISTING['Snooze-O-Pedic'] };
/* the new blocks: id suffix and the logo (media id in the logo strip) */
const NEW_BLOCKS = {
  Serta: { suffix: 'srt', logo: '6a7f5039fe4291bd109175a0' },
  'FLOWT by King Koil': { suffix: 'flw', logo: '6a7f502df762745222a0f105' },
  BedTech: { suffix: 'btc', logo: '6a7f503a84abba640bb0b486' },
  BedGear: { suffix: 'bgr', logo: '6a7f503999074f5ef6d34d4b' },
  Sleeptone: { suffix: 'slt', logo: '6a7f502da6a03cda06a1aa88' },
  DreamFit: { suffix: 'dft', logo: '6a7f5039cf50f900f2814ec2' },
};
const BLOCK_COPY = {
  en: (b) => `${b} is part of the lineup on the Snooze Mattress + Wellness showroom floor in McAllen. See it in person, and book a free Dream Mapping fitting so a Sleep Coach can show you how it fits your body and the way you sleep.`,
  es: (b) => `${b} forma parte de la selección de la sala de exhibición de Snooze Mattress + Wellness en McAllen. Conócelo en persona y reserva una sesión gratis de Dream Mapping para que un Sleep Coach te muestre cómo se ajusta a tu cuerpo y a tu forma de dormir.`,
};
const LOGO_ALT = { en: (b) => `${b} logo`, es: (b) => `Logotipo de ${b}` };
const BG = { navy: '69961ce3fa6b7baf8d3d9c10.png', light: '6972852310cc279c971af034.jpg.webp' };
const toneAt = (i) => (i % 2 === 0 ? 'navy' : 'light'); // Tempur-Pedic opens the run on navy, as built

const PREFIX = /^(section|row|col|image|button|heading|sub-heading|bulletList|paragraph)-/;
const tokenOf = (id) => id.replace(PREFIX, '');

/* text colours for a tone: heading span, intro span, feature paragraphs (light blocks set them inline; on navy the
   builder CSS makes the features white) */
function retoneText(kind, html, tone) {
  if (kind === 'heading') return html.replace(/color:\s*var\(--(?:white|black)\)/g, `color: var(--${tone === 'navy' ? 'white' : 'black'})`);
  if (kind === 'sub-heading') {
    const plain = html.replace(/color:\s*var\(--(?:white|black)\);?\s*/g, '');
    return tone === 'navy' ? plain.replace(/<span style="/g, '<span style="color: var(--white); ') : plain;
  }
  if (kind === 'bulletList') {
    // black / white set inline (a word the navy design highlighted white) goes; the paragraph carries the tone's colour
    let out = html.replace(/color:\s*var\(--(?:black|white)\);?\s*/g, '').replace(/ style=""/g, '').replace(/<p style="color: var\(--black\)">/g, '<p>');
    if (tone === 'light') out = out.replace(/<p>/g, '<p style="color: var(--black)">');
    return out;
  }
  return html;
}

function lineupMattresses(page, head, locale) {
  const { $, nodes } = page; const str = strAt(nodes); const notes = [];
  /* the elements list is re-read at every use: removeSection replaces it with a filtered copy */
  const els = () => pageOf(nodes).elements;
  const byId = () => { const m = new Map(); for (const i of els()) { const n = nodes[i]; if (isDict(n) && str(n.id)) m.set(str(n.id), i); } return m; };
  const rootOf = (sectionId) => els().map((i) => nodes[i]).find((n) => isDict(n) && typeof n.child === 'number' && Array.isArray(nodes[n.child]) && nodes[n.child].some((c) => str(c) === sectionId));
  const field = (obj, key) => (isDict(obj) && typeof obj[key] === 'number' ? nodes[obj[key]] : undefined);
  /* re-point a string field (never overwrite a payload string in place: strings are shared) */
  const setStr = (holder, key, value) => { if (!isDict(holder) || typeof holder[key] !== 'number') return false; if (nodes[holder[key]] === value) return false; holder[key] = nodes.push(value) - 1; return true; };
  const textHolder = (id) => { const i = byId().get(id); const extra = i === undefined ? null : field(nodes[i], 'extra'); return field(extra, 'text'); };
  const subtreeIds = (sid) => [`section-${sid}`, ...$(`[id="section-${sid}"]`).find('[id]').toArray().map((e) => $(e).attr('id'))];

  // ---- remove the blocks that are not in the lineup
  for (const b of NOT_IN_LINEUP) for (const t of [b.d, b.m]) if (removeSection(page, `section-${t}`)) notes.push(`-${t}`);

  // ---- rename headings (markup + payload)
  for (const [name, b] of Object.entries(EXISTING)) for (const [from, to] of b.heading || []) for (const t of [b.d, b.m]) {
    for (const id of subtreeIds(t).filter((x) => x.startsWith('heading-'))) {
      const h = textHolder(id); const cur = h && nodes[h.value];
      if (typeof cur === 'string' && cur.includes(from)) { setStr(h, 'value', cur.split(from).join(to)); notes.push(`${name}: heading renamed`); }
      const el = $(`[id="${id}"] .text-output`).first(); if (el.length && el.html().includes(from)) el.html(el.html().split(from).join(to));
    }
  }

  // ---- new blocks: copies of a same-tone template, inserted after the template for now (placed below)
  const headCss = [...head.css.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n'); let cssAdd = '';
  LINEUP.forEach((name, idx) => {
    const nb = NEW_BLOCKS[name]; if (!nb) return;
    const tone = toneAt(idx); const tpl = TEMPLATE[tone];
    for (const t of [tpl.d, tpl.m]) {
      const newSid = `${t}-${nb.suffix}`; if ($(`[id="section-${newSid}"]`).length) continue; // already there
      const ids = subtreeIds(t); const map = byId();
      // the element ids with a payload record; derived ids (the button's inner "…_btn") follow their element's
      const tokens = ids.filter((x) => map.has(x)).map(tokenOf).sort((a, b) => b.length - a.length);
      const rename = (s) => tokens.reduce((acc, tok) => acc.split(tok).join(`${tok}-${nb.suffix}`), s);
      // payload: decoded records, renamed, edited, re-encoded; the feature lists are left out
      const bullets = ids.filter((x) => x.startsWith('bulletList-'));
      const recs = ids.filter((x) => map.has(x) && !bullets.includes(x)).map((x) => [x, JSON.parse(rename(JSON.stringify(devalueDecode(nodes, map.get(x)))))]);
      const logoTag = ($.html().match(new RegExp(`<img\\b[^>]*media/${nb.logo}[^>]*>`)) || [])[0]; if (!logoTag) throw new Error(`${name}: logo ${nb.logo} not in the page`);
      const logoSrc = logoTag.match(/src="([^"]*)"/)[1]; const lw = +(logoTag.match(/width="(\d+)"/) || [, 0])[1]; const lh = +(logoTag.match(/height="(\d+)"/) || [, 0])[1];
      let headingHtml = '', introHtml = '';
      for (const [, r] of recs) {
        const kind = (r.id || '').match(PREFIX)?.[1];
        if (Array.isArray(r.child)) r.child = r.child.filter((c) => !bullets.map(rename).includes(c));
        if (kind === 'heading') { const style = ((r.extra.text.value || '').match(/<span style="([^"]*)"/) || [, `color: var(--${tone === 'navy' ? 'white' : 'black'}); font-family: 'customhl-6a7218f28a84cd95ca4e22e1-Visby Extrabold'`])[1]; headingHtml = `<h2 class="snz-h"><span style="${style}">${esc(name)}</span></h2>`; r.extra.text.value = headingHtml; }
        if (kind === 'sub-heading') { const style = ((r.extra.text.value || '').match(/<span style="([^"]*)"/) || [, 'font-family: Montserrat'])[1]; introHtml = `<p class="snz-h" style="font-weight:400"><span style="${style}">${esc(BLOCK_COPY[locale](name))}</span></p>`; r.extra.text.value = introHtml; }
        if (kind === 'image') { r.extra.imageProperties.value.url = logoSrc; r.extra.imageProperties.value.altText = LOGO_ALT[locale](name); }
      }
      // markup: the renamed section, its feature lists removed, heading / intro / logo filled in
      const src = $(`[id="section-${t}"]`).first();
      const holder = $('<div></div>').html(rename($.html(src)));
      for (const b of bullets) { const el = holder.find(`[id="${rename(b)}"]`); const prev = el.get(0)?.previousSibling, next = el.get(0)?.nextSibling; el.remove(); if (isMark(prev, '[') && isMark(next, ']')) { $(prev).remove(); $(next).remove(); } }
      holder.find('.c-heading .text-output').first().html(`<div>${headingHtml}</div>`);
      holder.find('.c-sub-heading .text-output').first().html(`<div>${introHtml}</div>`);
      const img = holder.find('.c-image img').first();
      img.attr('src', logoSrc); img.attr('alt', LOGO_ALT[locale](name)); if (lw && lh) { img.attr('width', String(lw)); img.attr('height', String(lh)); img.attr('style', `width:min(100%, ${lw}px)`); }
      holder.find('[data-animate]').removeAttr('data-animate');
      const html = holder.html();
      // insert after the template section (moved into place below)
      const anchor = src.get(0); const hasClose = isMark(anchor.nextSibling, ']');
      $(anchor).after(hasClose ? `<!--]--><!--[-->${html}` : `<!--[-->${html}<!--]-->`);
      const newIdx = recs.map(([, r]) => devalueEncode(nodes, r));
      const list = els(); const pos = list.findIndex((i) => str(nodes[i].id) === `section-${t}`); if (pos < 0) throw new Error(`section-${t} not in the elements list`); list.splice(pos + 1, 0, ...newIdx);
      const root = rootOf(`section-${t}`); const kids = nodes[root.child]; kids.splice(kids.findIndex((c) => str(c) === `section-${t}`) + 1, 0, devalueEncode(nodes, `section-${newSid}`));
      // CSS: every builder rule of the template's elements, under the new ids; the logo on a white card
      const rules = extractCssRules(headCss, ids.filter((x) => !bullets.includes(x)).map(tokenOf));
      const imgTok = `${tokenOf(ids.find((x) => x.startsWith('image-')))}-${nb.suffix}`;
      cssAdd += `\n/* ${name} (${locale}) — copy of section-${t} */\n${rename(rules)}\n#image-${imgTok} .image-container img{aspect-ratio:auto!important;width:min(100%, 360px)!important;height:auto!important;background:#fff;padding:22px 26px;border-radius:16px;box-sizing:border-box}`;
      notes.push(`+${name} (${tone}, ${t === tpl.d ? 'desktop' : 'phone'})`);
    }
  });

  // ---- tone of every block in its new place
  const pairOf = (name) => (EXISTING[name] ? EXISTING[name] : { d: `${TEMPLATE[toneAt(LINEUP.indexOf(name))].d}-${NEW_BLOCKS[name].suffix}`, m: `${TEMPLATE[toneAt(LINEUP.indexOf(name))].m}-${NEW_BLOCKS[name].suffix}` });
  let css = head.css;
  LINEUP.forEach((name, idx) => {
    const want = toneAt(idx); const b = EXISTING[name]; if (!b || b.tone === want) return;
    for (const t of [b.d, b.m]) {
      const map = byId();
      for (const id of subtreeIds(t)) {
        const kind = id.match(PREFIX)?.[1]; if (!['heading', 'sub-heading', 'bulletList'].includes(kind)) continue;
        const h = textHolder(id); const cur = h && nodes[h.value]; if (typeof cur === 'string') setStr(h, 'value', retoneText(kind, cur, want));
        const el = $(`[id="${id}"] .text-output`).first(); if (el.length) el.html(retoneText(kind, el.html(), want));
      }
      // section background: the builder CSS rules and the payload value
      const tok = t.replace(/[-_]/g, (m) => '\\' + m);
      css = css.replace(new RegExp(`(\\.bg-section-${tok}\\s*\\{[^}]*?)${BG[b.tone].replace(/\./g, '\\.')}`, 'g'), `$1${BG[want]}`);
      const sec = nodes[map.get(`section-${t}`)]; const bg = field(field(field(sec, 'extra'), 'bgImage'), 'value');
      if (isDict(bg) && typeof bg.url === 'number' && typeof nodes[bg.url] === 'string') setStr(bg, 'url', nodes[bg.url].replace(BG[b.tone], BG[want]));
    }
    notes.push(`${name}: ${b.tone} -> ${want}`);
  });
  // the new blocks' rules go into one style element at the end of HEAD_HTML (added when the blocks are created)
  head.css = css + (cssAdd ? `<style data-snz="brand-lineup">${cssAdd}\n</style>` : '');

  // ---- order: the lineup's blocks one after another, from Tempur-Pedic's phone copy on
  let anchorId = `section-${EXISTING[LINEUP[0]].m}`;
  for (const name of LINEUP.slice(1)) {
    const p = pairOf(name);
    for (const t of [p.d, p.m]) {
      const id = `section-${t}`; const el = $(`[id="${id}"]`).first(); if (!el.length) throw new Error(`${name}: ${id} missing`);
      const anchor = $(`[id="${anchorId}"]`).first().get(0);
      let n = anchor.nextSibling; while (n && n.type === 'text') n = n.nextSibling; const after = isMark(n, ']') ? n : anchor;
      let m = after.nextSibling; while (m && (m.type === 'text' || isMark(m, '['))) m = m.nextSibling;
      if (m !== el.get(0)) { // move: markup (with its fragment marks) + the root's child list
        const html = $.html(el); removeSectionMarkup($, id);
        const a = $(`[id="${anchorId}"]`).first(); const close = isMark(a.get(0).nextSibling, ']');
        a.after(close ? `<!--]--><!--[-->${html}` : `<!--[-->${html}<!--]-->`);
        const root = rootOf(id); const kids = nodes[root.child]; const from = kids.findIndex((c) => str(c) === id); const [ref] = kids.splice(from, 1); kids.splice(kids.findIndex((c) => str(c) === anchorId) + 1, 0, ref);
        notes.push(`moved ${name}`);
      }
      anchorId = id;
    }
  }
  return notes;
}

/* indexes reachable from the payload root (devalue: an array [tag, i] wraps one value; other arrays and dict values
   hold indexes; strings, numbers and booleans are leaves) */
function reachable(nodes) {
  const seen = new Set(); const stack = [0];
  while (stack.length) {
    const i = stack.pop(); if (typeof i !== 'number' || i < 0 || i >= nodes.length || seen.has(i)) continue;
    seen.add(i); const v = nodes[i];
    if (Array.isArray(v)) { if (v.length === 2 && typeof v[0] === 'string') stack.push(v[1]); else stack.push(...v); }
    else if (isDict(v)) stack.push(...Object.values(v));
  }
  return seen;
}

let changed = 0;
for (const file of listContentFiles(ROOT)) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/'); const locale = rel.startsWith('app/es/') ? 'es' : 'en';
  const page = readPage(file); if (!page) continue;
  const notes = [];
  if (/^app\/(\(en\)|es)\/mattress-sales\/content\.ts$/.test(rel)) {
    const removed = DROPPED_DEAL.filter((id) => removeSection(page, id));
    notes.push(removed.length ? `deal removed (${removed.length} elements)` : 'deal already gone');
  }
  let headLine = null, head = null;
  if (/^app\/(\(en\)|es)\/mattresses\/content\.ts$/.test(rel)) {
    headLine = page.s.split(/\r?\n/).find((l) => l.startsWith('export const HEAD_HTML = '));
    const headHtml = JSON.parse(headLine.replace(/^export const HEAD_HTML = /, '').replace(/;\s*$/, ''));
    head = { css: headHtml };
    notes.push(...lineupMattresses(page, head, locale));
    if (head.css !== headHtml) page.s = page.s.replace(headLine, () => `export const HEAD_HTML = ${JSON.stringify(head.css)};`);
  }
  const live = reachable(page.nodes); let emptied = 0;
  page.nodes.forEach((v, i) => { if (typeof v === 'string' && DROPPED_BRAND.test(v) && !live.has(i)) { page.nodes[i] = ''; emptied++; } });
  if (emptied) notes.push(`${emptied} unreachable payload strings emptied`);
  const left = page.nodes.filter((v) => typeof v === 'string' && DROPPED_BRAND.test(v)).length + (DROPPED_BRAND.test(page.$.html()) ? 1 : 0);
  if (left) notes.push(`STILL NAMED (${left} reachable string(s) or markup)`);
  const { changed: c } = writePage(page, { check: CHECK }); if (c) changed++;
  if (notes.length) console.log(`  ${rel.padEnd(44)} ${notes.join('; ')}`);
}
console.log(`${changed} files ${CHECK ? 'would change' : 'changed'}`);
