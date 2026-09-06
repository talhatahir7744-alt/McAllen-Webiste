#!/usr/bin/env node
/**
 * WebP twins for the clone's heavy raster images. Runs before scripts/convert.mjs (`npm run convert` does both).
 *
 * Every PNG/JPEG of 80 KB or more under the clone's media hosts gets a sibling `<file>.webp` (longest side capped
 * at 2000px, quality 82, alpha kept). The converter then serves that twin under the original's public path plus
 * ".webp" wherever the original is referenced: <img src>, <picture> variants, CSS backgrounds, the hydration payload.
 * Originals are left untouched; files that already are WebP (some resize variants carry a .jpg name) are skipped.
 *
 *   node scripts/optimize-images.mjs            # CLONE_ROOT defaults to C:/clones
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const CLONE = (process.env.CLONE_ROOT || 'C:/clones').replace(/\\/g, '/').replace(/\/+$/, '');
const HOSTS = ['assets.cdn.filesafe.space', 'images.leadconnectorhq.com', 'storage.googleapis.com'];
const MIN_BYTES = 80 * 1024;
const MAX_SIDE = 2000;
const QUALITY = 82;

function walk(dir, out = []) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; }

const files = [];
for (const host of HOSTS) { const dir = path.join(CLONE, host); if (fs.existsSync(dir)) for (const f of walk(dir)) if (/\.(png|jpe?g)$/i.test(f) && fs.statSync(f).size >= MIN_BYTES) files.push(f); }

let made = 0, kept = 0, skipped = 0, before = 0, after = 0;
for (const file of files) {
  const twin = `${file}.webp`;
  const st = fs.statSync(file);
  if (fs.existsSync(twin) && fs.statSync(twin).mtimeMs >= st.mtimeMs) { kept++; before += st.size; after += fs.statSync(twin).size; continue; }
  let meta;
  try { meta = await sharp(file, { failOn: 'none' }).metadata(); } catch { skipped++; continue; }
  if (meta.format === 'webp' || meta.format === 'gif') { skipped++; continue; }
  try {
    await sharp(file, { failOn: 'none', limitInputPixels: false }).rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY, alphaQuality: 90, effort: 4 })
      .toFile(twin);
    const out = fs.statSync(twin).size;
    if (out >= st.size) { fs.unlinkSync(twin); skipped++; continue; } // no gain: keep serving the original
    made++; before += st.size; after += out;
    console.log(`${(st.size / 1024).toFixed(0).padStart(6)} KB -> ${(out / 1024).toFixed(0).padStart(5)} KB  ${path.relative(CLONE, file).replace(/\\/g, '/')}`);
  } catch (err) { skipped++; console.error(`skip ${file}: ${err.message}`); }
}
console.log(`\noptimize-images: ${made} twin(s) written, ${kept} up to date, ${skipped} skipped; ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);
