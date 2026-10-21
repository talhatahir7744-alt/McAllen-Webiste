/*
 * Marks each generated page's hero sections (the phone copy, which the converter tags with .snz-hero, and the desktop
 * copy right before it) with data-snz-hero="", so overrides/motion.css can let them paint on the first frame instead
 * of waiting for the JavaScript reveal gate (SEO audit build pass, October 2026 — section B). Markup only: the
 * GoHighLevel runtime keeps unknown attributes through hydration, as it does the converter's own .snz-hero class.
 * scripts/convert.mjs sets the same attribute on freshly converted pages; this script brings existing pages up to date.
 *   node scripts/hero-mark.mjs          (npm run hero:mark)   [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cheerio = require('cheerio');
const CHECK = process.argv.includes('--check');
const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts') files.push(p); } })(path.join(ROOT, 'app'));
let changed = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8'); const bodyM = src.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) continue;
  const body = JSON.parse(bodyM[1]); const $ = cheerio.load(body, { decodeEntities: false }, false);
  const $hero = $('.c-section.snz-hero').first(); if (!$hero.length) continue;
  const sections = $('.c-section').toArray(); const idx = sections.findIndex((e) => e.attribs.id === $hero.attr('id'));
  const prev = idx > 0 ? sections[idx - 1] : null; const desktop = prev && /\bdesktop-only\b/.test(prev.attribs.class || '') && !/\bmobile-only\b/.test(prev.attribs.class || '') ? prev : null;
  const targets = [$hero[0], desktop].filter(Boolean); let n = 0;
  for (const el of targets) if (!('data-snz-hero' in el.attribs)) { $(el).attr('data-snz-hero', ''); n++; }
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  if (n) { changed++; if (!CHECK) fs.writeFileSync(f, src.replace(bodyM[1], () => JSON.stringify($.html()))); }
  console.log(`${rel.padEnd(58)} hero ${$hero.attr('id')} + desktop ${desktop ? desktop.attribs.id : '(none)'} → ${n ? n + ' marked' : 'already marked'}`);
}
console.log(`${changed} files ${CHECK ? 'would change' : 'changed'}`);
