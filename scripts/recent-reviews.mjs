/*
 * "Recent Reviews" block (SEO audit, October 2026 — section 6d): renders lib/reviews.json (first name, city, stars,
 * text, date) with overrides/recent-reviews.html and places it ABOVE the existing LeadConnector reviews widget on
 * every generated page that carries one (the "Some of Our Happy Customers" section, desktop + phone copies, both
 * languages). The block is written into the widget's custom-code HTML in the page markup AND in the Nuxt payload,
 * so hydration keeps it. lib/reviews.json ships EMPTY on purpose — never write reviews that the client did not
 * supply (NEEDS CLIENT INPUT); with no reviews nothing is rendered and a previously rendered block is removed.
 *
 *   node scripts/recent-reviews.mjs           (npm run reviews)   — after `npm run convert` and the other post-convert scripts
 *   node scripts/recent-reviews.mjs --check                        — report only
 * Idempotent: the block sits between <!--snz-recent-reviews--> … <!--/snz-recent-reviews--> markers and is replaced on every run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/reviews.json'), 'utf8'));
const TEMPLATE = fs.readFileSync(path.join(ROOT, 'overrides/recent-reviews.html'), 'utf8');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STAR = '<svg class="snz-ico snz-ico--star" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9z"></path></svg>';
const START = '<!--snz-recent-reviews-->', END = '<!--/snz-recent-reviews-->';
// the widget embed: its loader script (present once per page in the markup, in every copy of the payload string) followed
// by the iframe; attributes are double-quoted in the page markup (the converter normalises them), single-quoted in the payload
const WIDGET_START = /(?:<script type=["']text\/javascript["'] src=["']https:\/\/reputationhub\.site\/reputation\/assets\/review-widget\.js["']><\/script>\s*)?<iframe[^>]*\blc_reviews_widget\b/g;
const placeBefore = (html, block) => strip(html).replace(WIDGET_START, (m) => block + m);
const LABELS = { en: { title: 'Recent Reviews', stars: (n) => `${n} out of 5 stars`, from: 'Google review' }, es: { title: 'Reseñas Recientes', stars: (n) => `${n} de 5 estrellas`, from: 'Reseña en Google' } };

const reviews = (DATA.reviews || []).filter((r) => r && r.name && r.text && r.stars);
function render(locale) {
  if (!reviews.length) return '';
  const t = LABELS[locale] || LABELS.en;
  const fmt = (d) => { try { return new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${d}T00:00:00Z`)); } catch { return esc(d); } };
  const items = reviews.map((r) => `<li class="snz-reviews__item"><div class="snz-reviews__head"><span class="snz-reviews__stars" role="img" aria-label="${esc(t.stars(r.stars))}">${STAR.repeat(Math.max(1, Math.min(5, Math.round(r.stars))))}</span><span class="snz-reviews__who">${esc(r.name)}${r.city ? `, ${esc(r.city)}` : ''}</span>${r.date ? `<time class="snz-reviews__date" datetime="${esc(r.date)}">${fmt(r.date)}</time>` : ''}<span class="snz-reviews__source">${esc(t.from)}</span></div><p class="snz-reviews__text">${esc(r.text)}</p></li>`).join('');
  return START + TEMPLATE.replace('{{title}}', esc(t.title)).replace('{{items}}', items) + END;
}
const strip = (html) => html.replace(new RegExp(`${START}[\\s\\S]*?${END}`, 'g'), '');

const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts') files.push(p); } })(path.join(ROOT, 'app'));
let changed = 0, placed = 0;
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/'); const locale = /^app\/es\//.test(rel) ? 'es' : 'en';
  const src = fs.readFileSync(f, 'utf8'); if (!src.includes('lc_reviews_widget')) continue;
  const bodyM = src.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) continue;
  let body = JSON.parse(bodyM[1]);
  const block = render(locale);
  // markup: the block goes in front of the widget's own embed inside the custom-code container
  const before = body;
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  const markup = pm ? body.replace(pm[0], '\u0000PAYLOAD\u0000') : body;
  let newMarkup = placeBefore(markup, block);
  let newPayload = pm ? pm[0] : '';
  // payload: the same custom-code HTML string(s), so hydration renders the block too
  if (pm) {
    const nodes = JSON.parse(pm[2]); let touched = false;
    for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string' && nodes[i].includes('lc_reviews_widget')) { const v = placeBefore(nodes[i], block); if (v !== nodes[i]) { nodes[i] = v; touched = true; } }
    if (touched) newPayload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3];
  }
  body = pm ? newMarkup.replace('\u0000PAYLOAD\u0000', () => newPayload) : newMarkup;
  const n = newMarkup.split(START).length - 1; placed += n;
  if (body !== before) { changed++; if (!CHECK) fs.writeFileSync(f, src.replace(bodyM[1], () => JSON.stringify(body))); console.log(`${rel}: ${n ? n + ' blocks' : 'block removed'}`); }
}
console.log(`${reviews.length} reviews in lib/reviews.json; ${changed} pages ${CHECK ? 'would change' : 'changed'}, ${placed} blocks placed${reviews.length ? '' : ' (JSON empty: nothing rendered — NEEDS CLIENT INPUT)'}`);
