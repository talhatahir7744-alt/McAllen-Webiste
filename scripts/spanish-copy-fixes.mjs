/*
 * Spanish copy fixes from the SEO audit (October 2026, section 3c), applied to the generated /es pages (server markup
 * and the Nuxt payload copy alike), the hand-written UI strings and the translation dictionaries (values only — their
 * keys must keep matching the English clone text). Runs AFTER `npm run convert`; idempotent:
 *   node scripts/spanish-copy-fixes.mjs        (npm run es:fixes)       --check reports without writing
 *
 *   - the financing band's duplicated sentence end ("… sin pagar todo por adelantado. sin pagar todo por adelantado.")
 *   - "crezca en el McAllen" -> "crezca en McAllen"
 *   - the missing opening "¡" ("¡Obtén una Solución de Sueño Respaldada por la Ciencia!", "¡Nuestros Sleep Coaches
 *     están ansiosos …!" — that one also fixes the number agreement, "Nuestra" -> "Nuestros")
 *   - the menu / quiz name "Quiz Sleep Fit" -> "Sleep Fit Quiz" (brand name)
 * "Mapeo de Presión" is left where it describes the pressure-mapping technology ("¿Qué es el Mapeo de Presión?",
 * "Nuestra tecnología de Mapeo de Presión", the blog post about it); the service is "Dream Mapping" everywhere else.
 * In content.ts the markup is a JS string: attribute quotes are \" (server markup) or \\\" (payload copy) and payload
 * tags open with \\u003C — the patterns accept both forms.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const walk = (d, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };

const RULES = [
  { name: 'duplicate "sin pagar todo por adelantado"', re: /(?:<|\\\\u003C)span style=\\{1,3}"color: var\(--white\); font-family: Montserrat\\{1,3}"> sin pagar todo por adelantado\.(?:<|\\\\u003C)\/span>/g, to: '' },
  { name: '"crezca en el McAllen" -> "crezca en McAllen"', re: /crezca en el (?=(?:<|\\\\u003C)\/span>(?:<|\\\\u003C)strong>)/g, to: 'crezca en ' },
  { name: 'opening ¡ (science-backed sentence)', re: /(?<!¡)Obtén una (?=(?:<|\\\\u003C)\/span>)/g, to: '¡Obtén una ' },
  { name: 'opening ¡ + agreement (thank-you page)', re: /(?<!¡)Nuestra (?=(?:<|\\\\u003C)\/span>(?:<|\\\\u003C)strong>(?:<|\\\\u003C)span style=\\{1,3}"[^>]*>Sleep Coaches)/g, to: '¡Nuestros ' },
  { name: '"Quiz Sleep Fit" -> "Sleep Fit Quiz"', re: /Quiz Sleep Fit/g, to: 'Sleep Fit Quiz' },
];
const FILES = [
  ...walk(path.join(ROOT, 'app/es')).filter((f) => /content\.ts$|page\.tsx$/.test(f)),
  path.join(ROOT, 'lib/i18n.ts'), path.join(ROOT, 'components/SleepQuiz.tsx'),
  ...walk(path.join(ROOT, 'overrides/i18n')).filter((f) => /^es\./.test(path.basename(f)) && f.endsWith('.json')),
];
const totals = {};
for (const f of FILES) {
  let s = fs.readFileSync(f, 'utf8'); const before = s; const hits = [];
  for (const r of RULES) {
    if (f.endsWith('.json')) { // dictionaries: values only
      let n = 0; s = s.replace(/^(\s*"(?:[^"\\]|\\.)*":\s*)("(?:[^"\\]|\\.)*")/gm, (m, k, v) => k + v.replace(r.re, () => { n++; return r.to; })); if (n) hits.push(`${r.name} x${n}`);
    } else { const n = (s.match(r.re) || []).length; if (n) { s = s.replace(r.re, r.to); hits.push(`${r.name} x${n}`); } }
  }
  if (s !== before) { if (!CHECK) fs.writeFileSync(f, s); console.log(path.relative(ROOT, f).replace(/\\/g, '/') + ': ' + hits.join('; ')); for (const h of hits) { const k = h.replace(/ x\d+$/, ''); totals[k] = (totals[k] || 0) + Number(h.match(/x(\d+)$/)[1]); } }
}
console.log(`replacements per rule: ${JSON.stringify(totals)}${CHECK ? ' (check only, nothing written)' : ''}`);
