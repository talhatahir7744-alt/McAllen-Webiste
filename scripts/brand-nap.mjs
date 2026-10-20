/*
 * Business name and NAP normalisation (SEO audit, October 2026). The client's rules: the business is
 * "Snooze Mattress + Wellness" everywhere ("Snooze Mattress Company", "Snooze Mattress & Wellness" and
 * "Snooze Mattress McAllen" were all in use; plain "Snooze" stays as shorthand), and the NAP reads exactly
 * "7913 N 10th St, Suite 130, McAllen, TX 78504 · (956) 586-5646 · Mon–Sat 10 AM–7 PM, Sun 12–6 PM".
 *
 * Applies to the generated pages (markup + Nuxt payload, so hydration keeps the text), the generated page
 * metadata, the hand-written UI strings (lib/i18n.ts, lib/blog-posts.ts, components), the quiz script, the
 * override templates and the Spanish dictionary VALUES (overrides/i18n/es*.json: the keys are the builder's
 * original English and must stay as they are for scripts/convert.mjs to find them). URLs, e-mail addresses
 * and tel: links are never touched (the domain carries no spaces, so no rule can match it).
 *
 *   node scripts/brand-nap.mjs            (npm run brand)   — run after `npm run convert` and the other post-convert scripts
 *   node scripts/brand-nap.mjs --check                      — dry run: counts and sample matches per rule, writes nothing
 * Idempotent: a second run reports 0 replacements.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const NAME = 'Snooze Mattress + Wellness';
// any spacing the builder emits between hour tokens: plain space, NBSP, the entity, or the NBSP escaped inside the payload JSON
const SP = '(?:\\s|&nbsp;|\\u00a0|\\\\u00a0)*';
const RULES = [
  { name: 'Snooze Mattress Company → + Wellness', re: /Snooze Mattress Company/g, to: NAME },
  { name: 'Snooze Mattress & Wellness → + Wellness', re: /Snooze Mattress (?:&amp;|&) Wellness/g, to: NAME },
  { name: 'Snooze Mattress McAllen → + Wellness', re: /Snooze Mattress McAllen/g, to: NAME },
  { name: 'street: North 10th Street → N 10th St', re: /7913 North 10th Street, Suite 130/g, to: '7913 N 10th St, Suite 130' },
  { name: 'street in map queries', re: /7913\+North\+10th\+Street,\+Suite\+130/g, to: '7913+N+10th+St,+Suite+130' },
  { name: 'hours EN Mon–Sat', re: new RegExp(`Mon${SP}[–-]${SP}Sat${SP}10${SP}AM${SP}[–-]${SP}7${SP}PM`, 'g'), to: 'Mon–Sat 10 AM–7 PM' },
  { name: 'hours EN Sun', re: new RegExp(`Sunday${SP}12${SP}[–-]${SP}6${SP}PM`, 'g'), to: 'Sun 12–6 PM' },
  { name: 'hours ES Lun–Sáb', re: new RegExp(`Lun${SP}[–-]${SP}S[áa]b${SP}10${SP}AM${SP}[–-]${SP}7${SP}PM`, 'g'), to: 'Lun–Sáb 10 AM–7 PM' },
  { name: 'hours ES Dom', re: new RegExp(`Domingo${SP}12${SP}[–-]${SP}6${SP}PM`, 'g'), to: 'Dom 12–6 PM' },
];

const walk = (d, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');
const isDictionary = (f) => /^overrides\/i18n\/es[^/]*\.json$/.test(rel(f));
const FILES = [
  ...walk(path.join(ROOT, 'app')).filter((f) => /\.(ts|tsx)$/.test(f)),
  ...walk(path.join(ROOT, 'components')).filter((f) => /\.(ts|tsx)$/.test(f)),
  path.join(ROOT, 'lib/i18n.ts'), path.join(ROOT, 'lib/blog-posts.ts'), path.join(ROOT, 'lib/location.ts'),
  ...walk(path.join(ROOT, 'lib/i18n')).filter((f) => /\.ts$/.test(f)), // Spanish blog posts
  path.join(ROOT, 'public/sleep-fit-quiz.js'),
  ...walk(path.join(ROOT, 'overrides')).filter((f) => /\.html$/.test(f) || isDictionary(f)),
  path.join(ROOT, 'overrides/overrides.json'),
  path.join(ROOT, 'scripts/relocate.mjs'), path.join(ROOT, 'scripts/seo-metadata.mjs'), path.join(ROOT, 'scripts/convert.mjs'),
].filter((f) => fs.existsSync(f));

const totals = {}; const samples = {}; let filesChanged = 0;
for (const f of FILES) {
  const before = fs.readFileSync(f, 'utf8'); let s = before; const hits = [];
  const dictionary = isDictionary(f); // JSON dictionaries: translate the VALUES only, never the English keys
  for (const r of RULES) {
    let n = 0;
    const apply = (text) => text.replace(r.re, (m) => { if (m === r.to) return m; n++; (samples[r.name] ||= new Set()); if (samples[r.name].size < 4) samples[r.name].add(m); return r.to; });
    if (dictionary) s = s.replace(/^(\s*"(?:[^"\\]|\\.)*":\s*)("(?:[^"\\]|\\.)*")/gm, (m, k, v) => k + apply(v));
    else s = apply(s);
    if (n) { hits.push(`${r.name} ×${n}`); totals[r.name] = (totals[r.name] || 0) + n; }
  }
  if (s !== before) { filesChanged++; if (!CHECK) fs.writeFileSync(f, s); console.log(`${rel(f)}: ${hits.join('; ')}`); }
}
console.log(`\n${filesChanged} files${CHECK ? ' would change' : ' changed'}; replacements per rule: ${JSON.stringify(totals, null, 1)}`);
for (const [k, v] of Object.entries(samples)) console.log(`   ${k}: ${[...v].map((x) => JSON.stringify(x)).join(', ')}`);
