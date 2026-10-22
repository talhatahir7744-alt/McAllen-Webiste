/*
 * Builder images render as the same element on the server and in the GoHighLevel runtime (performance pass, October
 * 2026). The runtime's HLImage component only renders its optimized <picture> for an absolute image URL on a
 * whitelisted CDN host; the converter rewrote every image URL to a local path, so on the client every builder image
 * renders as <img class="hl-un-optimized" src={payload url}>. The server markup still had the builder's <picture>
 * (whose fallback src sometimes pointed at a size variant that does not exist), so whenever the runtime hydrated a
 * section — lazily, as it became visible or the browser went idle — Vue replaced the <picture> with that <img>: the
 * image was downloaded again, the section collapsed until it loaded (CLS on /mattresses, more while scrolling) and an
 * image with an entrance animation came back at opacity 0. What visitors saw after hydration was always the <img>.
 *
 * Here every c-image's <picture> (or an <img> from an earlier run of this script) becomes exactly that <img>: the
 * payload URL as src, the server image's alt / loading / fetchpriority / data-animation-class / classes (plus
 * hl-un-optimized next to hl-optimized, which custom-code CSS targets). Vue's production hydration only checks the
 * element type, so nothing is replaced any more. To reserve the image's space before it loads, an image whose builder
 * CSS leaves width and height on auto (and has no w-100 / h-100 class) also gets its file's natural width/height and
 * width:min(100%, natural width) — exactly the size such an image renders at once loaded. Images with explicit sizes in
 * the builder CSS keep the runtime's markup untouched. The payload is unchanged. Idempotent.
 *   node scripts/image-hydration-match.mjs   (npm run images:hydration)   [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { listContentFiles, readPage, writePage, strAt, pageOf, isDict, esc } from './builder-section.mjs';
import { devalueDecode } from './insert-sections.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const dimCache = new Map();
async function naturalSize(url) {
  if (!url || !url.startsWith('/')) return null; const p = path.join(ROOT, 'public', decodeURIComponent(url.split('?')[0]));
  if (dimCache.has(p)) return dimCache.get(p);
  let v = null; try { if (fs.existsSync(p)) { const m = await sharp(p).metadata(); if (m.width && m.height) v = { w: m.width, h: m.height }; } } catch {}
  dimCache.set(p, v); return v;
}
/* every CSS rule of the page (head + body <style>, any media) that targets this image element's <img> */
function sizeRules(css, id) {
  const out = []; const idEsc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); const re = new RegExp(`(?:\\.|#)${idEsc}(?![\\w-])[^{},]*\\bimg\\b`);
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) { if (re.test(m[1])) out.push(m[2]); }
  return out;
}
const isAuto = (decls) => decls.every((d) => [...d.matchAll(/(?:^|;)\s*(width|height|min-width|min-height)\s*:\s*([^;!]+)/g)].every((m) => m[2].trim() === 'auto' || (m[1].startsWith('min') && /^0/.test(m[2].trim()))));

let changed = 0, total = 0, reserved = 0, missing = 0; const report = [];
for (const file of listContentFiles(ROOT)) {
  const page = readPage(file); if (!page) continue; const { $, nodes } = page; const str = strAt(nodes); const { elements } = pageOf(nodes);
  const byId = new Map(); for (const i of elements || []) { const n = nodes[i]; if (isDict(n) && str(n.id)) byId.set(str(n.id), i); }
  const s = fs.readFileSync(file, 'utf8'); const head = JSON.parse((s.match(/export const HEAD_HTML = ("(?:[^"\\]|\\.)*");/) || [, '""'])[1]);
  const css = [...(head + $.html()).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  let n = 0;
  for (const el of $('.c-image').toArray()) {
    const id = $(el).attr('id'); if (!id) continue;
    const $pic = $(el).find('picture.hl-image-picture').first(); const $img = $pic.length ? $pic.find('img').first() : $(el).find('img.hl-un-optimized, img.hl-optimized').first();
    if (!$img.length) continue;
    const rec = byId.has(id) ? devalueDecode(nodes, byId.get(id)) : null;
    const url = rec && rec.extra && rec.extra.imageProperties && rec.extra.imageProperties.value && rec.extra.imageProperties.value.url;
    if (!url) { missing++; continue; }
    const src = $img.attr('src') || '';
    const classes = String($img.attr('class') || '').split(/\s+/).filter(Boolean).filter((c) => c !== 'hl-un-optimized');
    const ci = classes.indexOf('hl-optimized'); if (ci >= 0) classes.splice(ci + 1, 0, 'hl-un-optimized'); else classes.push('hl-un-optimized');
    const attrs = { src: url, alt: $img.attr('alt') ?? '', class: classes.join(' '), loading: $img.attr('loading') || 'lazy', fetchpriority: $img.attr('fetchpriority') || 'auto', 'data-animation-class': $img.attr('data-animation-class') ?? '' };
    let style = String($img.attr('style') || '').replace(/(^|;)\s*width\s*:\s*min\([^)]*\)\s*;?/g, '$1').trim();
    const auto = !classes.some((c) => c === 'w-100' || c === 'h-100') && isAuto(sizeRules(css, id));
    const dims = auto ? await naturalSize(url) : null;
    if (dims) { attrs.width = String(dims.w); attrs.height = String(dims.h); style = `width:min(100%, ${dims.w}px)${style ? ';' + style : ''}`; reserved++; }
    attrs.style = style;
    const html = '<img ' + Object.entries(attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(' ') + '>';
    const target = $pic.length ? $pic : $img;
    if ($.html(target) !== html) { target.replaceWith(html); n++; }
    void src;
  }
  total += $('.c-image img.hl-un-optimized').length;
  const res = writePage(page, { check: CHECK }); if (res.changed) changed++;
  if (n) report.push(`  ${path.relative(ROOT, file).split(path.sep).join('/').padEnd(52)} ${n} images rewritten`);
}
console.log(report.join('\n') || '  nothing to do');
console.log(`${total} builder images now match the runtime (${reserved} with reserved size, ${missing} without a payload URL, left as they were); ${changed} files ${CHECK ? 'would change' : 'changed'}`);
