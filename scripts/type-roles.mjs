/*
 * Shared type & spacing system (November 3, 2026) — the GoHighLevel pages' side. The site's own pages render the shared
 * components (components/TypeSystem.tsx); the builder pages in scope cannot, so this script tags the builder's own
 * wrappers with scope and role classes and overrides/global.css ("Shared type & spacing system") maps those classes to
 * the same tokens and rules. Static markup only (like the converter's .snz-card / .snz-orange-strip): the classes sit on
 * wrappers the runtime does not re-render, the payload is untouched, nothing in the copy or the order changes.
 *   - scope: .snz-ts on an in-scope section (or, where a section also holds location cards, on the FAQ rows only, with
 *     .snz-ts-pad on the section for the padding rhythm); .snz-ts--dark on navy bands;
 *   - roles, in document order: a heading element with an <h2> -> .snz-ts-r-h2 (+ --center when the builder centres
 *     it); a sub-heading / paragraph / demoted heading -> .snz-ts-r-lead when it follows the H2 or introduces a list
 *     (not after one), else .snz-ts-r-body; a button -> .snz-ts-r-cta (+ --center); bullet lists are styled by scope;
 *   - two-column blocks: a row of exactly two columns, one holding only images, the other text -> .snz-ts-r-twocol with
 *     .snz-ts-r-media / .snz-ts-r-text on the columns.
 * Out of scope (never tagged): heroes, offer / guarantee bands, reviews, location cards, the financing partner cards and
 * the about-us feature cards (only their section heading and button take the roles).
 * Idempotent (old snz-ts* classes are removed first).  node scripts/type-roles.mjs  (npm run type:roles)  [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cheerio = require('cheerio');
const CHECK = process.argv.includes('--check');

/* per page: groups of builder sections (desktop copy, phone copy) */
const SCOPE = {
  'mattress-financing': [
    { sections: ['XBwOtU_0-H', 'vzbbwksJ6W'] },                     // Trusted brands + "Why Finance a Mattress in …?"
    { sections: ['mrQ86h5oMc', 'OmxFD-kPjw'], dark: true,             // "Mattress Payment Plans in …": the Synchrony / Wells Fargo / Snap block
      skipColumns: ['e6UhMdx0Cj', '5JX2mN7nt9', 'fhV_DwS040', '6HMYAM9IgW', 'Vs2CXnLrvV', 'FmB8D540hm'] }, // the three partner cards
    { sections: ['XBz7r5mHB5', 's9jzFpVhnj'] },                     // "Traditional Mattress Financing (Synchrony & Wells Fargo)"
    { sections: ['JQnfWLwzTU', 'XmMa-6lqge'] },                     // "How to Apply for Mattress Financing in …"
    { sections: ['DUEP1KpgWk', 'VkmK8dASpi'], faqRows: true },      // location cards (untouched) + FAQ + final CTA
  ],
  'about-us': [
    { sections: ['BmqcJGH-kR', 'defONbS5bl'], dark: true, only: ['h2', 'cta'] }, // "This Isn't Your Typical Mattress Store." (its cards keep their own styles)
    { sections: ['10yS8YSpkS', 'I86LyrTsOd'], dark: true },         // "Your Body. Your Perfect Mattress" (navy card + image)
    { sections: ['72yUJTTGpi', 'cLE10FLtIz'] },                     // "How to Apply …" (the store-experience timeline)
    { sections: ['tpWh2qZzTP', 'wUF9nf9pjV'], faqRows: true },      // location cards (untouched) + FAQ + final CTA
  ],
};

const TEXT_KINDS = ['c-heading', 'c-sub-heading', 'c-paragraph', 'c-bullet-list', 'c-button'];
const kindOf = ($w) => TEXT_KINDS.find((k) => $w.hasClass(k));
const textOf = ($, el) => $(el).text().replace(/\s+/g, ' ').trim();

let changedFiles = 0; const totals = {};
const bump = (k) => { totals[k] = (totals[k] || 0) + 1; };
for (const [page, groups] of Object.entries(SCOPE)) {
  for (const base of ['app/(en)', 'app/es']) {
    const rel = `${base}/${page}/content.ts`; const file = path.join(ROOT, rel);
    const src = fs.readFileSync(file, 'utf8');
    const bodyM = src.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) throw new Error(`${rel}: no BODY_HTML`);
    const headLine = src.split(/\r?\n/).find((l) => l.startsWith('export const HEAD_HTML = '));
    const css = JSON.parse(headLine.replace(/^export const HEAD_HTML = /, '').replace(/;\s*$/, '')).replace(/\s+/g, '');
    const centred = (cls) => new RegExp(`\\.${cls.replace(/[-]/g, '\\-')}(?:,[^{]*)?\\{[^}]*text-align:center`).test(css);
    const body = JSON.parse(bodyM[1]);
    const $ = cheerio.load(body, { decodeEntities: false }, false);
    // idempotent: drop every class this script adds
    $('[class*="snz-ts"]').each((_, el) => { const cls = ($(el).attr('class') || '').split(/\s+/).filter((c) => c && !c.startsWith('snz-ts')); $(el).attr('class', cls.join(' ')); });
    for (const g of groups) {
      for (const sid of g.sections) {
        const $sec = $(`#section-${sid}`); if (!$sec.length) throw new Error(`${rel}: section-${sid} not found`);
        let targets;
        if (g.faqRows) {
          $sec.addClass('snz-ts-pad');
          targets = $sec.find('.c-row').filter((_, row) => { const $r = $(row); return !$r.closest('.snz-card').length && ($r.find('.c-custom-code[id^="faq-"]').length > 0 || $r.find('.c-heading h2').toArray().some((h) => /^(FAQs?|Preguntas)/i.test(textOf($, h)))); });
          targets.addClass('snz-ts'); bump('faq rows');
        } else { $sec.addClass('snz-ts'); targets = $sec; }
        if (g.dark) targets.addClass('snz-ts--dark');
        bump('scopes');
        // roles in document order
        const skip = (el) => (g.skipColumns || []).some((c) => $(el).closest(`#col-${c}`).length); // location cards are never in a target (FAQ rows only)
        const wrappers = targets.find('.c-wrapper').toArray().filter((el) => kindOf($(el)) && !skip(el));
        let prev = null;
        wrappers.forEach((el, i) => {
          const $w = $(el); const kind = kindOf($w); const id = $w.attr('id') || ''; // e.g. heading-W6Zb9D4tyD: its text box is .cheading-W6Zb9D4tyD, a button's box is .button-…
          const next = wrappers[i + 1] ? kindOf($(wrappers[i + 1])) : null;
          let role = null;
          if (kind === 'c-heading' && $w.find('h2').length && textOf($, $w.find('h2').first())) role = 'h2';
          else if (kind === 'c-bullet-list') role = 'list';
          else if (kind === 'c-button') role = 'cta';
          else if (['c-heading', 'c-sub-heading', 'c-paragraph'].includes(kind) && textOf($, el) && !$w.find('h1, h3, h4').length) {
            role = prev === 'h2' || (next === 'c-bullet-list' && prev !== 'list') ? 'lead' : 'body';
          }
          if (role && g.only && !g.only.includes(role)) role = null;
          if (role === 'h2') { $w.addClass('snz-ts-r-h2'); if (centred(`c${id}`)) $w.addClass('snz-ts-r-h2--center'); }
          if (role === 'lead' || role === 'body') $w.addClass(`snz-ts-r-${role}`);
          if (role === 'cta') { $w.addClass('snz-ts-r-cta'); if (!id || centred(id)) $w.addClass('snz-ts-r-cta--center'); } // the FAQ's quiz button (no builder id) is centred
          if (role) { bump(role); prev = role; }
        });
        // two-column blocks: image-only column + text column
        if (!g.only) targets.find('.c-row').each((_, row) => {
          const cols = $(row).children('.inner').children('.c-column'); if (cols.length !== 2) return;
          // the media side: only images, or a column whose picture is its own background (its elements, if any, are empty)
          const onlyImages = (col) => { const kids = $(col).children('.inner').children('.c-wrapper'); return kids.length > 0 && kids.toArray().every((k) => $(k).hasClass('c-image') || !textOf($, k)); };
          const hasText = (col) => $(col).find('.snz-ts-r-h2, .snz-ts-r-lead, .snz-ts-r-body, .c-bullet-list, .snz-ts-r-cta').length > 0;
          const [a, b] = cols.toArray(); let media = null, text = null;
          if (onlyImages(a) && hasText(b)) { media = a; text = b; } else if (onlyImages(b) && hasText(a)) { media = b; text = a; }
          if (!media || skip(media)) return;
          $(row).addClass('snz-ts-r-twocol'); $(media).addClass('snz-ts-r-media'); $(text).addClass('snz-ts-r-text'); bump('twocol');
        });
      }
    }
    const next = $.html();
    if (next !== body) { changedFiles++; if (!CHECK) fs.writeFileSync(file, src.replace(bodyM[1], () => JSON.stringify(next))); }
    console.log(`  ${rel.padEnd(36)} ${next !== body ? (CHECK ? 'would change' : 'tagged') : 'unchanged'}`);
  }
}
console.log(`roles: ${Object.entries(totals).map(([k, v]) => `${k} ${v}`).join(', ')}; ${changedFiles} files ${CHECK ? 'would change' : 'changed'}`);
