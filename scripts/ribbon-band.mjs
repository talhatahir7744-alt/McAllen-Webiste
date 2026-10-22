/*
 * The crossing-ribbons band (October 2026): two diagonal marquee ribbons on the HOME page only (/ and /es), directly
 * after the hero, bridging it and the next section (overrides/global.css, the .snz-cross block). Both ribbons carry
 * the current offer from lib/offer.ts — ribbon A orange, scrolls left; ribbon B tan, scrolls right; the whole band is
 * one link to the sales page. While the offer is date-gated off the band is left out entirely (the home section that carries it stays
 * in place, empty, so the next run can fill it again); an inline script inside the band also removes it on the client
 * once the end date has passed.
 *
 * Generated builder pages (app/**／content.ts): the band is a real builder section so it survives Vue hydration — the
 * empty custom-code section section-x8iH4TeG-J of the home page, moved right after the mobile hero in the markup and
 * in the hydration payload (scripts/builder-section.mjs), with the band HTML as the custom code. On every other page
 * the script removes any band section a previous run inserted. On all pages it removes the old home ticker section
 * (the announcement ticker is now components/AnnouncementTicker.tsx, rendered by both root layouts under the site
 * header), the brown address/phone strip sections and the offer item the old ticker script put into the logo marquee.
 * Idempotent.   node scripts/ribbon-band.mjs   (npm run ribbon)   [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listContentFiles, readPage, writePage, loadTemplate, removeSection, refreshCustomCode, placeAfterHero, esc } from './builder-section.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

/* ---- content: both ribbons carry the current offer from lib/offer.ts ---- */
const offerSrc = fs.readFileSync(path.join(ROOT, 'lib/offer.ts'), 'utf8');
const offerField = (name, loc) => (offerSrc.match(new RegExp(`${name}:\\s*\\{[^}]*?\\b${loc}:\\s*'((?:[^'\\\\]|\\\\.)*)'`)) || [])[1]?.replace(/\\'/g, "'") || '';
const OFFER = {
  enabled: /^\s*enabled:\s*true/m.test(offerSrc),
  startDate: (offerSrc.match(/^\s*startDate:\s*'([^']*)'/m) || [])[1] || '',
  endDate: (offerSrc.match(/^\s*endDate:\s*'([^']*)'/m) || [])[1] || '',
  href: (offerSrc.match(/cta:\s*\{\s*href:\s*'([^']*)'/) || [])[1] || '/mattress-sales',
  items: (loc) => [offerField('headline', loc), ...offerField('details', loc).split(/\s*·\s*/)].map((t) => t.trim()).filter(Boolean),
};
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const ACTIVE = OFFER.enabled && (!OFFER.startDate || today >= OFFER.startDate) && (!OFFER.endDate || today <= OFFER.endDate) && OFFER.items('en').length > 0;

/* ---- band HTML: one link holding two ribbons; each track = two identical copies of the items (3 × the offer items) so
   the 50% keyframe loop is seamless ---- */
const CHEV = '<svg class="snz-cross__sep" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const copy = (items, reps) => `<span class="snz-cross__copy">${Array.from({ length: reps }, () => items.map((t) => `<span class="snz-cross__item">${esc(t)}</span>${CHEV}`).join('')).join('')}</span>`;
const track = (items, reps) => `<div class="snz-cross__track" aria-hidden="true">${copy(items, reps)}${copy(items, reps)}</div>`;
/* the whole band is ONE link to the sales page (both ribbons, every item); the visible text is decorative
   (aria-hidden tracks), the link text is the label below */
const LABEL = { en: (headline) => `See the ${headline}`, es: (headline) => `Ver la ${headline}` };
function bandHtml(loc) {
  if (!ACTIVE) return '';
  const items = OFFER.items(loc); const href = `${loc === 'es' ? '/es' : ''}${OFFER.href}`;
  const a = `<div class="snz-cross__rb snz-cross__rb--a">${track(items, 3)}</div>`;
  const b = `<div class="snz-cross__rb snz-cross__rb--b">${track(items, 3)}</div>`;
  const expiry = OFFER.endDate ? `<script>(function(){var e=document.currentScript&&document.currentScript.parentNode;if(!e||!e.parentNode)return;var t=new Date('${OFFER.endDate}T23:59:59-06:00');if(!isNaN(t)&&Date.now()>t.getTime())e.parentNode.removeChild(e);})();</script>` : '';
  return `<a class="snz-cross" href="${href}" aria-label="${esc((LABEL[loc] || LABEL.en)(offerField('headline', loc)))}" data-snz-cross="${loc}">${a}${b}${expiry}</a>`;
}

/* ---- builder pages ---- */
const T = { section: 'section-x8iH4TeG-J', row: 'row-EdKIR9VJhr', col: 'col-44O5Jbh-BJ', cc: 'custom-code-pO-5dtepaB' };
const HOME = new Set(['app/(en)/content.ts', 'app/es/content.ts']);
const STRIP_SECTIONS = ['section-ZJqP1gmkX-', 'section-TdwlaucWWz', 'section--kgEfG5qpr', 'section-LyNiGFNVB_', 'section-z3JZmHy_Yy', 'section-RoGpWzwIrG', 'section-DZE9FzkB6N'];
const TICKER_SECTIONS = ['section-XXfgRYmP-7'];
const OFFER_TICKER_ITEM = /<!--snz-offer-ticker-->[\s\S]*?<!--\/snz-offer-ticker-->\s*/g;
const TEMPLATE = loadTemplate(path.join(ROOT, 'app/(en)/content.ts'), T);

let changed = 0; const report = []; const files = listContentFiles(ROOT);
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/'); const loc = rel.startsWith('app/es/') ? 'es' : 'en'; const home = HOME.has(rel);
  const page = readPage(file); if (!page) continue; const { $, nodes } = page;
  const notes = [];
  // 1. the old home ticker section and the brown strips
  for (const id of [...TICKER_SECTIONS, ...STRIP_SECTIONS]) if (removeSection(page, id)) notes.push(`−${id.replace('section-', '')}`);
  // 2. the offer item the old ticker script put into the logo marquee custom code (markup + payload)
  $('.custom-code-container').each((_, el) => { const h = $(el).html() || ''; if (OFFER_TICKER_ITEM.test(h)) { OFFER_TICKER_ITEM.lastIndex = 0; $(el).html(h.replace(OFFER_TICKER_ITEM, '')); notes.push('−offer-ticker-item'); } OFFER_TICKER_ITEM.lastIndex = 0; });
  for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string' && OFFER_TICKER_ITEM.test(nodes[i])) { OFFER_TICKER_ITEM.lastIndex = 0; nodes[i] = nodes[i].replace(OFFER_TICKER_ITEM, ''); } OFFER_TICKER_ITEM.lastIndex = 0;
  const exists = $(`[id="${T.section}"]`).length > 0;
  if (!home) {
    // 3a. every other page: no band
    if (exists && removeSection(page, T.section)) notes.push('−band');
  } else if (!ACTIVE) {
    // 3b. home while the offer is off: the section stays, empty (zero height), so a later run can fill it again
    if (exists && refreshCustomCode(page, T.cc, '')) notes.push('band emptied (offer off)');
  } else {
    // 3c. home: the band right after the last hero section (else the second section, the mobile twin of the first)
    notes.push(placeAfterHero(page, TEMPLATE, bandHtml(loc)));
  }
  const res = writePage(page, { check: CHECK }); if (res.changed) changed++;
  report.push(`  ${rel.padEnd(44)} ${notes.join(' ') || '(nothing to do)'}${res.changed ? '' : ' (no change)'}`);
}
console.log(report.join('\n'));
console.log(`offer ${ACTIVE ? 'ACTIVE' : 'inactive'} (${today}; ends ${OFFER.endDate || 'never'}); ${files.length} pages, ${changed} files ${CHECK ? 'would change' : 'changed'}`);
