/*
 * Collects every visible English text segment of the generated site (page markup + head metadata + the
 * hand-written override sections) into overrides/i18n/segments.json, so translators can produce
 * overrides/i18n/es.json (English segment -> Spanish). Run after `npm run convert`.
 *
 * A "segment" is one text node (whitespace collapsed, trimmed) or one translatable attribute value
 * (alt, title, placeholder, aria-label, submit value, meta title/description). GoHighLevel splits
 * sentences across inline spans, so each segment carries the full text of its block as context.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(ROOT, 'app');
const OUT = path.join(ROOT, 'overrides', 'i18n');
fs.mkdirSync(OUT, { recursive: true });

export const ATTRS = ['alt', 'title', 'placeholder', 'aria-label'];
const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'template', 'code', 'pre']);
const BLOCK = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'div', 'section', 'td', 'th', 'button', 'a', 'span', 'label', 'figcaption', 'blockquote', 'text']);

export const norm = (s) => s.replace(/\s+/g, ' ').trim();
export const translatable = (t) => /[A-Za-z]{2,}/.test(t) && !/^\{\{.*\}\}$/.test(t) && !/^[\d\s.,:;()+\-–—/%$#&|©®™"'!?…•·]*$/.test(t);

const segments = new Map(); // text -> { count, context, pages:Set }
function add(text, context, page) {
  const t = norm(text);
  if (!translatable(t)) return;
  const e = segments.get(t) || { count: 0, context: '', pages: new Set() };
  e.count++; if (!e.context && context && context !== t) e.context = context; e.pages.add(page);
  segments.set(t, e);
}

function blockContext($, node) {
  let p = node.parent;
  while (p && p.type === 'tag' && !BLOCK.has(p.name)) p = p.parent;
  while (p && p.type === 'tag' && (p.name === 'span' || p.name === 'a' || p.name === 'strong' || p.name === 'b' || p.name === 'em') && p.parent && p.parent.type === 'tag') p = p.parent;
  return p ? norm($(p).text()).slice(0, 240) : '';
}

export function walk($, root, page) {
  const visit = (node) => {
    if (node.type === 'text') { if (node.data && norm(node.data)) add(node.data, blockContext($, node), page); return; }
    if (node.type !== 'tag') return;
    if (SKIP_TAGS.has(node.name)) return;
    for (const a of ATTRS) if (node.attribs && node.attribs[a]) add(node.attribs[a], '', page);
    if (node.name === 'input' && node.attribs && /^(submit|button)$/i.test(node.attribs.type || '') && node.attribs.value) add(node.attribs.value, '', page);
    for (const c of node.children || []) visit(c);
  };
  for (const c of root.children || []) visit(c);
}

// 1. generated pages
const pageDirs = [];
const findPages = (dir, rel) => { for (const e of fs.readdirSync(dir)) { const p = path.join(dir, e); if (fs.statSync(p).isDirectory()) findPages(p, rel ? rel + '/' + e : e); else if (e === 'content.ts' && !/(^|\/)es(\/|$)/.test(rel || '')) pageDirs.push(rel || '/'); } };
findPages(APP, '');
for (const rel of pageDirs) {
  const file = path.join(APP, rel === '/' ? '' : rel, 'content.ts');
  const mod = await import(path.resolve(file).replace(/\\/g, '/').replace(/^([A-Za-z]):/, 'file:///$1:'));
  const $b = cheerio.load(mod.BODY_HTML, null, false);
  walk($b, $b.root()[0], rel);
  const $h = cheerio.load(mod.HEAD_HTML, null, false);
  const title = $h('title').first().text(); if (title) add(title, 'META title', rel);
  $h('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]').each((_, m) => { const c = $h(m).attr('content'); if (c) add(c, 'META ' + ($h(m).attr('name') || $h(m).attr('property')), rel); });
}
// 2. override sections (their text lands in the pages through scripts/convert.mjs)
const OVR = path.join(ROOT, 'overrides');
for (const f of fs.readdirSync(OVR).filter((f) => f.endsWith('.html')).concat(fs.readdirSync(path.join(OVR, 'widgets')).map((f) => 'widgets/' + f))) {
  const html = fs.readFileSync(path.join(OVR, f), 'utf8');
  const $ = cheerio.load(html, null, false);
  walk($, $.root()[0], 'overrides/' + f);
}

// document order (fragments of one block stay together), CSS/JS-looking leftovers dropped
const junk = (s) => /@import|[{}]|url\(/.test(s.text) || /@import|[{}]/.test(s.context);
const list = [...segments.entries()].map(([text, e]) => ({ text, count: e.count, context: e.context, pages: [...e.pages].slice(0, 6) })).filter((s) => !junk(s));
fs.writeFileSync(path.join(OUT, 'segments.json'), JSON.stringify(list, null, 1));
// translator work packages of ~1300 words each
const PART = 1300; const parts = []; let cur = [], w = 0;
for (const s of list) { const n = s.text.split(' ').length; if (w + n > PART && cur.length) { parts.push(cur); cur = []; w = 0; } cur.push({ text: s.text, context: s.context || undefined }); w += n; }
if (cur.length) parts.push(cur);
fs.mkdirSync(path.join(OUT, 'chunks'), { recursive: true });
for (const f of fs.readdirSync(path.join(OUT, 'chunks'))) fs.unlinkSync(path.join(OUT, 'chunks', f));
parts.forEach((p, i) => fs.writeFileSync(path.join(OUT, 'chunks', `part-${i + 1}.json`), JSON.stringify(p, null, 1)));
console.log(`chunks: ${parts.length} (${parts.map((p) => p.length).join(', ')} segments)`);
const words = list.reduce((n, s) => n + s.text.split(' ').length, 0);
console.log(`segments: ${list.length} unique (${words} words) from ${pageDirs.length} pages + overrides -> overrides/i18n/segments.json`);
