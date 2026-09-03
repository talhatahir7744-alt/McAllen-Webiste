/*
 * Responsive extras used by scripts/convert.mjs:
 *  - fluidTypography(css): GoHighLevel writes every text element's font size twice, once in a
 *    "(min-width:0px) and (max-width:767px)" block and once in "(min-width:768px) and (max-width:10000px)".
 *    Between 390px and 1440px those two values become one clamp() so the type scales smoothly instead of
 *    jumping at 768px. The generated rules use the same selectors and come later, so they win inside that
 *    range; outside it the original values apply.
 *  - addImageDimensions($, publicDir): every <img> without width/height gets them from the local file
 *    (PNG / JPEG / WebP / GIF headers read synchronously), so images keep an explicit aspect ratio and cause
 *    no layout shift. Images inside custom code are skipped (re-rendered on hydration).
 */
import fs from 'node:fs';
import path from 'node:path';

const MIN_VW = 390, MAX_VW = 1440;

function blocks(css, preludeRe) {
  const out = [];
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf('@media', i);
    if (at < 0) break;
    const open = css.indexOf('{', at);
    if (open < 0) break;
    const prelude = css.slice(at, open).replace(/\s+/g, '');
    let depth = 1, j = open + 1;
    while (j < css.length && depth) { const ch = css[j]; if (ch === '{') depth++; else if (ch === '}') depth--; j++; }
    if (preludeRe.test(prelude)) out.push(css.slice(open + 1, j - 1));
    i = j;
  }
  return out;
}

function sizesBySelector(blockCss) {
  const map = new Map();
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(blockCss))) {
    const fs_ = /(?:^|;)\s*font-size:\s*(\d+(?:\.\d+)?)px/.exec(m[2]);
    if (!fs_) continue;
    const sel = m[1].trim().replace(/\s+/g, ' ');
    if (!/\.(heading|sub-heading|paragraph)-/.test(sel)) continue;
    map.set(sel, parseFloat(fs_[1]));
  }
  return map;
}

export function fluidTypography(css) {
  const mobile = new Map(), desktop = new Map();
  for (const b of blocks(css, /min-width:0px.*max-width:767px/)) for (const [k, v] of sizesBySelector(b)) mobile.set(k, v);
  for (const b of blocks(css, /min-width:768px.*max-width:10000px/)) for (const [k, v] of sizesBySelector(b)) desktop.set(k, v);
  const rules = [];
  for (const [sel, m] of mobile) {
    const d = desktop.get(sel);
    if (d === undefined || Math.abs(d - m) < 1) continue;
    const lo = Math.min(m, d), hi = Math.max(m, d);
    const slope = ((d - m) / (MAX_VW - MIN_VW)).toFixed(5);
    rules.push(`${sel}{font-size:clamp(${lo}px,calc(${m}px + (100vw - ${MIN_VW}px) * ${slope}),${hi}px)}`);
  }
  if (!rules.length) return '';
  return `@media (min-width:${MIN_VW}px) and (max-width:${MAX_VW}px){${rules.join('')}}`;
}

export function imageSize(file) {
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    const b = Buffer.alloc(64 * 1024);
    const n = fs.readSync(fd, b, 0, b.length, 0);
    if (n >= 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    if (n >= 10 && b.toString('ascii', 0, 6).startsWith('GIF8')) return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
    if (n >= 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
      const tag = b.toString('ascii', 12, 16);
      if (tag === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
      if (tag === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
      if (tag === 'VP8L') { const bits = b.readUInt32LE(21); return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) }; }
    }
    if (n >= 4 && b[0] === 0xff && b[1] === 0xd8) {
      let off = 2;
      while (off + 9 < n) {
        if (b[off] !== 0xff) { off++; continue; }
        const marker = b[off + 1];
        if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01 || marker === 0xff) { off += 2; continue; }
        const len = b.readUInt16BE(off + 2);
        if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return { height: b.readUInt16BE(off + 5), width: b.readUInt16BE(off + 7) };
        off += 2 + len;
      }
    }
  } catch (err) { /* unreadable */ } finally { if (fd !== undefined) fs.closeSync(fd); }
  return null;
}

export function addImageDimensions($, publicDir) {
  let added = 0;
  $('img[src^="/assets/"]').each((_, el) => {
    const $img = $(el);
    if ($img.attr('width') && $img.attr('height')) return;
    if ($img.closest('.custom-code-container').length) return;
    const src = ($img.attr('src') || '').split('?')[0].split('#')[0];
    const file = path.join(publicDir, decodeURIComponent(src));
    const dims = imageSize(file);
    if (!dims || !dims.width || !dims.height) return;
    $img.attr('width', String(dims.width)); $img.attr('height', String(dims.height));
    added++;
  });
  return added;
}
