/*
 * Build-time background removal for the brand-logo marquee (overrides/logo-marquee.html).
 * The marquee used to redraw every logo on a <canvas> in the browser, erase its white/grey box and swap the
 * <img> to a PNG data URI: 34 canvases per page view, every logo downloaded twice (a second, CORS-tagged
 * request) and ~600 KB of base64 PNG on the main thread. The same flood fill now runs once here with sharp:
 * pixels connected to the image edge that are light AND grey-ish become transparent, light details enclosed
 * inside a logo are kept, and the result is written next to the original as <public path>.scrub.webp (alpha WebP).
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const LIGHT = 192; // edge pixels brighter than this (per channel) count as background
const DESAT = 32; // ...but only if grey-ish: max-min channel gap <= this
const MAXDIM = 800; // downscale very large files first (the marquee shows them at <= 170 px wide)

/** Writes the scrubbed WebP for one logo; returns { width, height } of the output, or null when the source is unreadable. */
export async function scrubLogo(srcFile, outFile) {
  let img;
  try { img = sharp(srcFile, { failOn: 'none', limitInputPixels: false }).rotate().ensureAlpha(); } catch { return null; }
  const meta = await img.metadata().catch(() => null);
  if (!meta || !meta.width || !meta.height) return null;
  const sc = Math.min(1, MAXDIM / Math.max(meta.width, meta.height));
  if (sc < 1) img = img.resize(Math.max(1, Math.round(meta.width * sc)), Math.max(1, Math.round(meta.height * sc)));
  const { data: d, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const isBg = (i) => { const a = d[i + 3]; if (a === 0) return true; const r = d[i], g = d[i + 1], b = d[i + 2]; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx - mn <= DESAT && mn >= LIGHT; };
  const seen = new Uint8Array(w * h); const stack = []; let changed = 0;
  for (let x = 0; x < w; x++) { stack.push(x); stack.push(x + (h - 1) * w); }
  for (let y = 0; y < h; y++) { stack.push(y * w); stack.push(w - 1 + y * w); }
  while (stack.length) {
    const p = stack.pop();
    if (p < 0 || p >= w * h || seen[p]) continue;
    seen[p] = 1;
    const i4 = p * 4;
    if (!isBg(i4)) continue;
    if (d[i4 + 3] !== 0) { d[i4 + 3] = 0; changed++; }
    const px = p % w;
    if (px > 0) stack.push(p - 1);
    if (px < w - 1) stack.push(p + 1);
    stack.push(p - w); stack.push(p + w);
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  await sharp(d, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 88, alphaQuality: 90, effort: 5 }).toFile(outFile);
  return { width: w, height: h, changed };
}

/**
 * Rewrites the marquee template: every <img src="https://…"> whose file `resolve(url)` locates becomes the
 * scrubbed WebP with width/height attributes and the .snz-scrubbed class (no whitening filter); the runtime
 * scrub <script> is dropped. `resolve(url)` -> { src: clone file, publicPath: '/assets/…' } or null.
 */
export async function prepareLogoMarquee(html, resolve, publicDir, log = () => {}) {
  const cache = new Map(); let scrubbed = 0, reused = 0, missing = 0;
  const tags = [...html.matchAll(/<img\b[^>]*\bsrc="(https?:\/\/[^"]+)"[^>]*>/g)];
  for (const m of tags) {
    const tag = m[0], url = m[1];
    if (!cache.has(url)) {
      const hit = resolve(url);
      if (!hit) { missing++; cache.set(url, null); continue; }
      const outPublic = hit.publicPath + '.scrub.webp';
      const outFile = path.join(publicDir, outPublic.replace(/^\//, ''));
      let dims = null;
      if (fs.existsSync(outFile) && fs.statSync(outFile).mtimeMs >= fs.statSync(hit.src).mtimeMs) {
        const meta = await sharp(outFile).metadata().catch(() => null);
        if (meta && meta.width) { dims = { width: meta.width, height: meta.height }; reused++; }
      }
      if (!dims) { dims = await scrubLogo(hit.src, outFile); if (dims) scrubbed++; else missing++; }
      cache.set(url, dims && { publicPath: outPublic, ...dims });
    }
    const out = cache.get(url); if (!out) continue;
    let t = tag.replace(/\bsrc="[^"]+"/, `src="${out.publicPath}" width="${out.width}" height="${out.height}"`);
    t = /\bclass="/.test(t) ? t.replace(/\bclass="/, 'class="snz-scrubbed ') : t.replace(/^<img\b/, '<img class="snz-scrubbed"');
    html = html.replace(tag, t);
  }
  html = html.replace(/<script>\s*\/\*\s*── True background removal[\s\S]*?<\/script>\s*/, '');
  log(`logo marquee: ${scrubbed} logos scrubbed, ${reused} reused, ${missing} not found`);
  return html;
}
