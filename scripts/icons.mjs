/*
 * Inline SVG icons instead of emoji and lost font markers on the generated pages (site-wide cleanup, October 2026).
 * For every generated page (app/**／content.ts, EN + ES, static markup AND the hydration payload, so the builder
 * runtime renders the same nodes after hydration):
 *   1. bullet lists (.c-bullet-list): every <li> gets the orange check-circle SVG before its text; the list HTML
 *      string in the payload (one per unique list, shared by the desktop and mobile copies) gets the same;
 *   2. the Sleep Fit Quiz call-to-action buttons: the trailing "->" in the label becomes the site's arrow icon;
 *   3. the home ticker separators "✦" become a small sparkle icon (aria-hidden);
 *   4. payload-only leftovers that never render: the original mobile-nav custom code (emoji menu icons), the
 *      builder's footer line (💙💤), a "✅" HTML comment in the timeline section, and "->" inside code comments
 *      (also in HEAD_HTML) become plain text.
 * Review stars are handled by scripts/recent-reviews.mjs. Idempotent.  node scripts/icons.mjs  (npm run icons)  [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');

export const ICON = {
  check: '<svg class="snz-ico snz-ico--check snz-li-ico" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"></circle><path d="m8.2 12.3 2.6 2.6 5.2-5.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  arrow: '<svg class="snz-ico snz-ico--arrow" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14m-6-6 6 6-6 6"></path></svg>',
  sparkle: '<svg class="snz-ico snz-ico--sparkle" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.5 14.3 9.7 21.5 12l-7.2 2.3L12 21.5l-2.3-7.2L2.5 12l7.2-2.3z"></path></svg>',
};
export const TICKER_SEP = `<span class="snooze-ticker-sep" aria-hidden="true">${ICON.sparkle}</span>`;

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{FE0F}\u{200D}]/gu;
/* glyphs inside HTML comments (the ticker and timeline custom code carry authoring notes) are not copy, but they are still emoji in the page source: strip them, arrows become ASCII */
const COMMENT_GLYPH = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{FE0F}\u{200D}]/gu;
const cleanComments = (html) => html.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/swap ✦ for ★ ● ◆ | or any emoji/g, 'swap the sparkle SVG for another icon').replace(COMMENT_GLYPH, '').replace(/→/g, '->'));
const listInject = (ul) => ul.replace(/<li(\s[^>]*)?>(?!<svg)/g, (m, attrs) => `<li${attrs || ''}>${ICON.check}`);
/* One text block per item: the builder exports some bullets as two <p>s ("…pressure points in" + "under 5 minutes.")
   or with a hard <br>; laid out as a flex row (icon + text) those render as two columns. Merge the paragraphs into
   the first one, joined by a space, and turn <br>s into spaces, so each bullet is one wrapping sentence. */
const normalizeLi = (ul) => ul.replace(/(<li(?:\s[^>]*)?>)([\s\S]*?)(<\/li>)/g, (m, open, inner, close) => {
  const svg = (inner.match(/^<svg[\s\S]*?<\/svg>/) || [''])[0]; let rest = inner.slice(svg.length);
  const ps = [...rest.matchAll(/<p(\s[^>]*)?>([\s\S]*?)<\/p>/g)];
  if (ps.length > 1 && ps.map((p) => p[0]).join('') === rest.replace(/\s+(?=<p)/g, '')) {
    const parts = ps.map((p) => p[2].trim()).filter(Boolean); rest = `<p${ps[0][1] || ''}>${parts.join(' ')}</p>`;
  }
  rest = rest.replace(/\s*<br\s*\/?>\s*/g, ' ').replace(/ {2,}/g, ' ');
  return open + svg + rest + close;
});
const stats = { pages: 0, lists: 0, li: 0, payloadLists: 0, arrows: 0, seps: 0, navStrings: 0, misc: 0, headArrows: 0 };

function transformMarkup(markup) {
  const lists = new Map(); // original <ul>…</ul> -> injected
  let out = markup.replace(/(<div class="bulletList-[^"]*\btext-output\b[^"]*"[^>]*><div>)(<ul>[\s\S]*?<\/ul>)/g, (m, open, ul) => {
    const next = normalizeLi(listInject(ul)); if (next === ul) return m;
    stats.lists++; stats.li += (ul.match(/<li/g) || []).length; lists.set(ul, next); return open + next;
  });
  out = out.replace(/(<span class="main-heading-button">[^<]*?)\s*→\s*(<\/span>)/g, (m, a, b) => { stats.arrows++; return `${a} ${ICON.arrow}${b}`; });
  out = out.replace(/<span class="snooze-ticker-sep">✦<\/span>/g, () => { stats.seps++; return TICKER_SEP; });
  const cleaned = cleanComments(out); if (cleaned !== out) { stats.misc++; out = cleaned; }
  return { out, lists };
}
function transformPayloadString(n, lists) {
  let v = n;
  if (lists.has(v)) { v = lists.get(v); stats.payloadLists++; return v; }
  if (/<span class="main-heading-button">[^<]*?\s*→\s*<\/span>/.test(v)) v = v.replace(/(<span class="main-heading-button">[^<]*?)\s*→\s*(<\/span>)/g, (m, a, b) => `${a} ${ICON.arrow}${b}`);
  if (v.includes('<span class="snooze-ticker-sep">✦</span>')) v = v.replace(/<span class="snooze-ticker-sep">✦<\/span>/g, TICKER_SEP);
  if (v.includes('SNOOZE NAV') && EMOJI.test(v)) { EMOJI.lastIndex = 0; v = v.replace(/<span>\s*(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]\s*)+<\/span>\s*/gu, '').replace(EMOJI, ''); stats.navStrings++; }
  if (v.includes('💙💤')) { v = v.replace(/\s*💙💤\s*/g, ' '); stats.misc++; }
  if (v.includes('<!-- ✅ ')) { v = v.replace(/<!-- ✅ /g, '<!-- '); stats.misc++; }
  if (v.includes('swap ✦ for ★ ● ◆ | or any emoji')) { v = v.replace('swap ✦ for ★ ● ◆ | or any emoji', 'swap the sparkle SVG for another icon'); stats.misc++; }
  if (v.includes('<!--')) { const c = cleanComments(v); if (c !== v) { v = c; stats.misc++; } }
  if (v.includes('→')) { v = v.replace(/→/g, '->'); stats.misc++; }
  EMOJI.lastIndex = 0;
  return v;
}

const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts') files.push(p); } })(path.join(ROOT, 'app'));
let changed = 0;
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  let s = fs.readFileSync(file, 'utf8'); const orig = s;
  const bodyM = s.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) continue;
  const body = JSON.parse(bodyM[1]);
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  const markup = pm ? body.replace(pm[0], '\u0000PAYLOAD\u0000') : body;
  const { out: newMarkup, lists } = transformMarkup(markup);
  let payload = pm ? pm[0] : '';
  if (pm) {
    const nodes = JSON.parse(pm[2]); let touched = false;
    for (let i = 0; i < nodes.length; i++) { if (typeof nodes[i] !== 'string') continue; const v = transformPayloadString(nodes[i], lists); if (v !== nodes[i]) { nodes[i] = v; touched = true; } }
    if (touched) payload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3];
  }
  const next = pm ? newMarkup.replace('\u0000PAYLOAD\u0000', () => payload) : newMarkup;
  if (next !== body) s = s.replace(bodyM[1], () => JSON.stringify(next));
  // HEAD_HTML: "->" only ever appears in comments there
  const headM = s.match(/export const HEAD_HTML = ("[^\n]*");/);
  if (headM && headM[1].includes('→')) { s = s.replace(headM[1], () => headM[1].replace(/→/g, '->')); stats.headArrows++; }
  if (s !== orig) { changed++; if (!CHECK) fs.writeFileSync(file, s); }
  stats.pages++;
  console.log(`  ${rel.padEnd(52)} lists ${lists.size}${next !== body || s !== orig ? '' : ' (no change)'}`);
}
console.log(`${stats.pages} pages: ${stats.lists} list elements / ${stats.li} <li> given the check icon in markup, ${stats.payloadLists} list strings in payloads; ${stats.arrows} CTA arrows (markup); ${stats.seps} ticker separators (markup); ${stats.navStrings} mobile-nav strings cleaned; ${stats.misc} other payload strings; ${stats.headArrows} HEAD_HTML comments; ${changed} files ${CHECK ? 'would change' : 'changed'}`);
