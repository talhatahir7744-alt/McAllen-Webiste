/*
 * Third-party embed loaders inside the generated pages' custom code load async (performance pass, October 2026):
 *   - reputationhub.site review-widget.js (24 pages, the Google-reviews widget): it was a parser-blocking <script src>
 *     in the middle of <body>, so the HTML parser stopped until a third-party server answered;
 *   - link.snoozesleep.com form_embed.js (the opt-in pages' form).
 * Both only listen for the height messages their iframe posts (the reviews iframe is loading="lazy" and far below
 * the fold; the booking page already loads form_embed.js after its iframe exists), so loading them async keeps the
 * auto-resize working. Changed in the static markup and in the hydration payload (the custom-code strings); the
 * payload strings that hold these tags belong to those custom-code elements only. Idempotent.
 *   node scripts/async-embeds.mjs   (npm run embeds:async)   [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listContentFiles, readPage, writePage } from './builder-section.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const SRCS = ['https://reputationhub.site/reputation/assets/review-widget.js', 'https://link.snoozesleep.com/js/form_embed.js'];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
/* any <script ...src=SRC...> (either quote style) that has no async/defer yet: add async right after "<script" */
const RE = new RegExp(`<script(?![^>]*\\b(?:async|defer)\\b)((?:[^>]*?)\\ssrc=(["'])(?:${SRCS.map(esc).join('|')})\\2[^>]*)>`, 'g');
const fix = (s) => s.replace(RE, '<script async$1>');

let changed = 0; const report = [];
for (const file of listContentFiles(ROOT)) {
  const page = readPage(file); if (!page) continue;
  let markupHits = 0, payloadHits = 0;
  page.$('script').each((_, el) => {
    const src = page.$(el).attr('src'); if (!src || !SRCS.includes(src)) return;
    if (page.$(el).attr('async') === undefined && page.$(el).attr('defer') === undefined) { page.$(el).attr('async', ''); markupHits++; }
  });
  for (let i = 0; i < page.nodes.length; i++) { const n = page.nodes[i]; if (typeof n !== 'string' || !RE.test(n)) { RE.lastIndex = 0; continue; } RE.lastIndex = 0; page.nodes[i] = fix(n); payloadHits++; }
  const res = writePage(page, { check: CHECK }); if (res.changed) changed++;
  if (markupHits || payloadHits) report.push(`  ${path.relative(ROOT, file).split(path.sep).join('/').padEnd(52)} markup ${markupHits}, payload strings ${payloadHits}`);
}
console.log(report.join('\n') || '  nothing to do');
console.log(`${changed} files ${CHECK ? 'would change' : 'changed'}`);
