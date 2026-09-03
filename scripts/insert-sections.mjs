/*
 * Copy whole GoHighLevel sections from one page into other pages ("insertSections" in overrides.json).
 *
 * A GHL page is server-rendered HTML plus a Nuxt/devalue payload (#__NUXT_DATA__) that Vue hydrates
 * against, so a section has to be inserted in three places to survive hydration:
 *   1. the SSR markup (the section's outer HTML, wrapped in Vue's <!--[--> … <!--]--> fragment markers,
 *      placed before the anchor section's own opening marker),
 *   2. the payload (the section, row, column and element nodes, encoded into the devalue array and
 *      listed in pageData.elements and in the root node's child list, right before the anchor), and
 *   3. the page CSS (the per-element rules for the copied ids, media queries preserved).
 * GHL renders most sections twice (a desktop-only and a mobile-only copy) and the two copies of the
 * anchor are not always adjacent, so every copied section is anchored to a matching section with a
 * compatible visibility (desktop copy → desktop/any anchor, mobile copy → mobile/any anchor).
 * The regular pipeline then treats the copies like native content: content overrides, URL rewriting…
 */
import fs from 'node:fs';
import * as cheerio from 'cheerio';

const isDict = (v) => v && typeof v === 'object' && !Array.isArray(v);
const norm = (s) => String(s || '').replace(/\s+/g, ' ');
const visibilityOf = (cls) => (/\bdesktop-only\b/.test(cls) ? 'desktop' : /\bmobile-only\b/.test(cls) ? 'mobile' : 'all');
const compatible = (copyVis, anchorVis) => copyVis === 'all' || anchorVis === 'all' || copyVis === anchorVis;

/** devalue array -> plain JS value (indices resolved; ["Type", idx] wrappers kept as {__wrap, value}). */
export function devalueDecode(nodes, i) {
  if (typeof i !== 'number') return i;
  if (i < 0) return undefined;
  const v = nodes[i];
  if (Array.isArray(v)) {
    if (v.length === 2 && typeof v[0] === 'string') return { __wrap: v[0], value: devalueDecode(nodes, v[1]) };
    return v.map((x) => devalueDecode(nodes, x));
  }
  if (isDict(v)) {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = devalueDecode(nodes, x);
    return o;
  }
  return v;
}

/** plain JS value -> new entries appended to the devalue array; returns the index of the value. */
export function devalueEncode(nodes, value) {
  if (value === undefined) return -1;
  if (Array.isArray(value)) {
    const idx = nodes.push(null) - 1;
    nodes[idx] = value.map((x) => devalueEncode(nodes, x));
    return idx;
  }
  if (isDict(value)) {
    const idx = nodes.push(null) - 1;
    if (typeof value.__wrap === 'string' && 'value' in value && Object.keys(value).length === 2) {
      nodes[idx] = [value.__wrap, devalueEncode(nodes, value.value)];
      return idx;
    }
    const o = {};
    for (const [k, x] of Object.entries(value)) o[k] = devalueEncode(nodes, x);
    nodes[idx] = o;
    return idx;
  }
  return nodes.push(value) - 1;
}

/** Every rule whose prelude mentions one of the ids, re-wrapped in its @media/@supports blocks. */
export function extractCssRules(css, ids) {
  const out = [];
  const hit = (s) => ids.some((id) => s.includes(id));
  const walk = (text, wraps) => {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf('{', i);
      if (open < 0) break;
      const prelude = text.slice(i, open).trim();
      let depth = 1, j = open + 1;
      while (j < text.length && depth) { const ch = text[j]; if (ch === '{') depth++; else if (ch === '}') depth--; j++; }
      const body = text.slice(open + 1, j - 1);
      if (/^@(media|supports|container|layer)\b/.test(prelude)) walk(body, [...wraps, prelude]);
      else if (prelude && !prelude.startsWith('@') && hit(prelude)) out.push(wraps.reduceRight((acc, w) => `${w}{${acc}}`, `${prelude}{${body}}`));
      i = j;
    }
  };
  walk(css, []);
  return out.join('\n');
}

/** Read the source page once and pull out every section holding a custom-code element that matches. */
export function extractSections(siteDir, cfg) {
  const html = fs.readFileSync(`${siteDir}/${cfg.from.page}`, 'utf8');
  const $ = cheerio.load(html);
  const nodes = JSON.parse($('script#__NUXT_DATA__').first().html() || '[]');
  const str = (i) => (typeof i === 'number' && i >= 0 && typeof nodes[i] === 'string' ? nodes[i] : null);
  const dict = (i) => (typeof i === 'number' && i >= 0 && isDict(nodes[i]) ? nodes[i] : null);
  const page = nodes.find((n) => isDict(n) && 'elements' in n && 'popup' in n);
  const elements = page && Array.isArray(nodes[page.elements]) ? nodes[page.elements] : [];
  const byId = new Map();
  for (const i of elements) { const n = dict(i); const id = n && str(n.id); if (id) byId.set(id, i); }
  const childIds = (i) => { const n = dict(i); const arr = n && typeof n.child === 'number' ? nodes[n.child] : null; return Array.isArray(arr) ? arr.map(str).filter(Boolean) : []; };
  const parentOf = new Map();
  for (const i of elements) for (const c of childIds(i)) parentOf.set(c, str(nodes[i].id));

  const matches = [];
  for (const i of elements) {
    const n = dict(i);
    if (!n || str(n.meta) !== 'custom-code' || !cfg.from.match) continue;
    const extra = dict(n.extra); const cc = extra && dict(extra.customCode); const val = cc && dict(cc.value);
    const raw = val && str(val.rawCustomCode);
    if (raw && cfg.from.match.every((m) => raw.includes(m))) matches.push(str(n.id));
  }
  if (Array.isArray(cfg.from.sectionIds)) for (const id of cfg.from.sectionIds) if (byId.has(id)) matches.push(id);
  const sectionIds = [];
  for (const id of matches) {
    let cur = id;
    while (cur && !cur.startsWith('section-') && parentOf.has(cur)) cur = parentOf.get(cur);
    if (cur && cur.startsWith('section-') && !sectionIds.includes(cur)) sectionIds.push(cur);
  }
  sectionIds.sort((a, b) => elements.indexOf(byId.get(a)) - elements.indexOf(byId.get(b)));

  const css = $('style').map((_, el) => $(el).html() || '').get().join('\n');
  const sections = sectionIds.map((sid) => {
    const ids = [];
    const collect = (id) => { ids.push(id); for (const c of childIds(byId.get(id))) collect(c); };
    collect(sid);
    const plain = elements.filter((i) => ids.includes(str(nodes[i].id))).map((i) => devalueDecode(nodes, i));
    const el = $(`[id="${sid}"]`).first();
    return { id: sid, ids, visibility: visibilityOf(el.attr('class') || ''), html: el.length ? $.html(el) : '', css: extractCssRules(css, ids), nodes: plain };
  });
  return { name: cfg.name, sourcePage: cfg.from.page, before: cfg.before, after: cfg.after, only: cfg.onlyPages ? new Set(cfg.onlyPages) : null, skip: new Set(cfg.skipPages || []), sections };
}

/** Insert a pack's sections into one page (cheerio document + payload JSON). Returns the new payload JSON or null. */
export function insertSectionsIntoPage($, json, rel, pack) {
  const out = { json: null, inserted: [], anchor: null, anchors: {} };
  if (pack.skip.has(rel) || rel === pack.sourcePage || !pack.sections.length) return out;
  if (pack.only && !pack.only.has(rel)) return out;
  const sections = pack.sections.filter((s) => !$(`[id="${s.id}"]`).length); // copies already on this page are kept as they are
  if (!sections.length) return out;
  const placeAfter = !!pack.after;

  // anchor candidates: sections containing the text. Matched on tag-stripped HTML with whitespace normalised,
  // because the heading may be split across elements ("Happy" / "Customers") or contain &nbsp;.
  const needle = norm((pack.after || pack.before).textMatch);
  const textOf = (el) => norm($.html(el).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' '));
  const candidates = [];
  $('body .c-section').each((_, el) => { if (textOf(el).includes(needle)) candidates.push({ el, id: $(el).attr('id'), vis: visibilityOf($(el).attr('class') || '') }); });
  if (!candidates.length) return out;
  const groups = new Map(); // anchor id -> { el, sections[] }
  for (const s of sections) {
    const a = candidates.find((c) => c.id && compatible(s.visibility, c.vis)) || candidates.find((c) => c.id);
    if (!a) continue;
    if (!groups.has(a.id)) groups.set(a.id, { el: a.el, sections: [] });
    groups.get(a.id).sections.push(s);
    out.anchors[s.id] = a.id;
  }
  if (!groups.size) return out;

  const nodes = JSON.parse(json || '[]');
  const str = (i) => (typeof i === 'number' && i >= 0 && typeof nodes[i] === 'string' ? nodes[i] : null);
  const page = nodes.find((n) => isDict(n) && 'elements' in n && 'popup' in n);
  const elements = page && Array.isArray(nodes[page.elements]) ? nodes[page.elements] : null;
  if (!elements) return out;

  for (const [anchorId, group] of groups) {
    const anchor = group.el;
    const anchorPos = elements.findIndex((i) => isDict(nodes[i]) && str(nodes[i].id) === anchorId);
    const root = elements.map((i) => nodes[i]).find((n) => isDict(n) && typeof n.child === 'number' && Array.isArray(nodes[n.child]) && nodes[n.child].some((c) => str(c) === anchorId));
    if (anchorPos < 0 || !root) continue;

    // 1. SSR markup: Vue renders each section as a fragment wrapped in <!--[--> … <!--]--> comment markers and
    //    hydrates by walking those markers, so every copy gets its own pair and goes in before the anchor's
    //    opening marker. cheerio cannot insert relative to a comment node, so the copies plus a new opening
    //    marker for the anchor go in before the anchor and the anchor's old opening marker is removed.
    const copies = group.sections.map((s) => `<!--[-->${s.html}<!--]-->`).join('');
    if (placeAfter) {
      // after the anchor: a new closing marker for the anchor, then the copies; the anchor's old closing marker
      // (the comment right after it) then closes the last copy's slot, so the pairs stay balanced
      const next = anchor.nextSibling;
      const hasClose = !!(next && next.type === 'comment' && String(next.data).trim() === ']');
      $(anchor).after(hasClose ? '<!--]-->' + copies.replace(/<!--\]-->$/, '') : copies);
    } else {
      const prev = anchor.previousSibling;
      const hasMarker = !!(prev && prev.type === 'comment' && String(prev.data).trim() === '[');
      $(anchor).before(copies + (hasMarker ? '<!--[-->' : ''));
      if (hasMarker) $(prev).remove();
    }

    // 2. payload: nodes into pageData.elements, section ids into the root's child list, before (or after) the anchor
    const newIdx = [];
    for (const s of group.sections) for (const node of s.nodes) newIdx.push(devalueEncode(nodes, node));
    elements.splice(placeAfter ? anchorPos + 1 : anchorPos, 0, ...newIdx);
    const childArr = nodes[root.child];
    const cpos = childArr.findIndex((c) => str(c) === anchorId);
    childArr.splice(cpos < 0 ? childArr.length : (placeAfter ? cpos + 1 : cpos), 0, ...group.sections.map((s) => devalueEncode(nodes, s.id)));

    out.inserted.push(...group.sections.map((s) => s.id));
    out.anchor = out.anchor || anchorId;
  }
  if (!out.inserted.length) return out;

  // 3. CSS for the copied ids
  $('head').append(`<style data-snz-inserted="${pack.name}">${pack.sections.map((s) => s.css).join('\n')}</style>`);
  out.json = JSON.stringify(nodes).replace(/</g, '\\u003C');
  return out;
}
