#!/usr/bin/env node
/**
 * Adds a new client image to the clone tree the way wget captured the originals, so scripts/convert.mjs serves it
 * exactly like every other media file: the original under assets.cdn.filesafe.space/<mediaPath> and the resized
 * WebP variants (r_320 … r_1200) the builder's <picture> sources ask for, under images.leadconnectorhq.com/…
 *
 *   node scripts/image-variants.mjs <source file> <mediaPath> [--max=1600]
 *   e.g. node scripts/image-variants.mjs C:/downloads/store.jpg ARD47WoZpqaZSQ9MSxLD/media/69a1d3acb617a750cec56a9b.jpg
 *
 * --max caps the stored "original" (a 6000px camera JPEG would otherwise ship as-is to every page).
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const CLONE = (process.env.CLONE_ROOT || 'C:/clones').replace(/\\/g, '/').replace(/\/+$/, '');
const SIZES = [320, 640, 768, 900, 1200];

const [src, mediaPath, ...rest] = process.argv.slice(2);
if (!src || !mediaPath) { console.error('usage: node scripts/image-variants.mjs <source file> <mediaPath> [--max=1600]'); process.exit(1); }
const max = Number((rest.find((a) => a.startsWith('--max=')) || '--max=1600').slice(6));

const original = path.join(CLONE, 'assets.cdn.filesafe.space', mediaPath);
const input = sharp(src, { failOn: 'none' }).rotate();
const meta = await input.metadata();
fs.mkdirSync(path.dirname(original), { recursive: true });
const isPng = /\.png$/i.test(mediaPath);
const origPipe = sharp(src).rotate().resize({ width: Math.min(max, meta.width || max), withoutEnlargement: true });
await (isPng ? origPipe.png() : origPipe.jpeg({ quality: 82, mozjpeg: true })).toFile(original);
const om = await sharp(original).metadata();
console.log(`original: ${path.relative(CLONE, original)} ${om.width}x${om.height} ${(fs.statSync(original).size / 1024).toFixed(0)} KB`);

for (const size of SIZES) {
  const out = path.join(CLONE, 'images.leadconnectorhq.com', 'image', 'f_webp', 'q_80', `r_${size}`, 'u_https%3A', 'assets.cdn.filesafe.space', mediaPath);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(src).rotate().resize({ width: size, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
  console.log(`variant r_${size}: ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
}
