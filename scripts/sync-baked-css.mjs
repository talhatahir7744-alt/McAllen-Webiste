/*
 * The converter bakes overrides/motion.css and overrides/buttons.css into every generated page's <head> (HEAD_HTML in
 * app/**／content.ts, as <style data-snz-override="…">), so an edit to those files only reaches the pages after a
 * re-convert. This copies the current files into the baked blocks on every page — buttons.css with the page's own
 * {{not}} chain (the :not(.cbutton-…) list the converter inserted), read back from the baked block. site.css stays as
 * converted. Performance pass, October 2026: the reveal system became transform-only (content never held at opacity
 * 0) and the button shine sweep moves by transform instead of `left`. Idempotent.
 *   node scripts/sync-baked-css.mjs   (npm run css:baked)   [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listContentFiles } from './builder-section.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const read = (f) => fs.readFileSync(path.join(ROOT, 'overrides', f), 'utf8').replace(/\r\n/g, '\n');
const motion = read('motion.css'); const buttons = read('buttons.css');
if (motion.includes('{{not}}')) throw new Error('motion.css uses the {{not}} placeholder: run the converter instead');
const MOTION_RE = /<style data-snz-override="motion\.css">[\s\S]*?<\/style>/;
const BUTTONS_RE = /<style data-snz-override="buttons\.css">([\s\S]*?)<\/style>/;
let changed = 0, found = 0;
for (const file of listContentFiles(ROOT)) {
  const s = fs.readFileSync(file, 'utf8'); const m = s.match(/export const HEAD_HTML = ("(?:[^"\\]|\\.)*");/); if (!m) continue;
  const head = JSON.parse(m[1]); let next = head;
  if (MOTION_RE.test(next)) { found++; next = next.replace(MOTION_RE, () => `<style data-snz-override="motion.css">${motion}</style>`); }
  const b = next.match(BUTTONS_RE);
  if (b) {
    const chain = (b[1].match(/\.c-button a\.custom(.*?)::before,/) || [])[1];
    if (chain === undefined) throw new Error(path.relative(ROOT, file) + ': cannot read the buttons.css not-chain');
    next = next.replace(BUTTONS_RE, () => `<style data-snz-override="buttons.css">${buttons.split('{{not}}').join(chain)}</style>`);
  }
  if (next === head) continue; changed++;
  if (!CHECK) fs.writeFileSync(file, s.replace(m[1], () => JSON.stringify(next)));
}
console.log(`baked override blocks on ${found} pages; ${changed} ${CHECK ? 'would change' : 'updated'}`);
