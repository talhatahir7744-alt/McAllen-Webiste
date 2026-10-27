/*
 * About page, "This Isn't Your Typical Mattress Store." cards (client request, October 28, 2026): /about-us and /es/about-us,
 * the desktop and the mobile copy of the section (sections BmqcJGH-kR / defONbS5bl):
 *   1. the third card, "Best Price Guaranteed", had a one-line body ("We price-match any competitor."); it carries the
 *      client's price-match line now (paragraphs G-cya1V3Xn / jR61fp3rtv);
 *   2. the second card, "Real Sleep Coaches", says "Sleep Coaches" (site standard) instead of "Snooze Coaches"
 *      (paragraphs 1dQ269twNp / mZ9nAHV1rk).
 * Static markup and the hydration payload (the paragraph HTML strings belong to this section alone and are replaced in
 * place; nothing else on the page changes). Heading, card colours and icons are untouched; the equal-height layout of the
 * cards is CSS in overrides/global.css. Idempotent.  node scripts/about-cards.mjs  (npm run section:about-cards)  [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const PAGES = { en: 'app/(en)/about-us/content.ts', es: 'app/es/about-us/content.ts' };
const COPY = {
  en: {
    price: "Find the same mattress for less at another authorized retailer and we'll match the price — so you can choose the bed that fits your body, not the one that fits a sale. Plus the 365-Night Sleep Guarantee on major brands.",
    oldPrice: /(<p><span style="color: var\(--white\); font-family: Montserrat">)We price-match any competitor\.(<\/span><\/p>)/g,
    coaches: /(No commission-hungry salespeople here\. Our )Snooze( Coaches are trained sleep experts)/g,
  },
  es: {
    price: 'Si encuentras el mismo colchón a menor precio en otra tienda autorizada, igualamos el precio — para que elijas la cama que se ajusta a tu cuerpo, no la que está en oferta. Además, Garantía de Sueño de 365 Noches en las marcas principales.',
    oldPrice: /(<p><span style="color: var\(--white\); font-family: Montserrat">)Igualamos el precio de cualquier competidor\.(<\/span><\/p>)/g,
    coaches: /(Aquí no hay vendedores desesperados por comisiones\. Nuestros )Snooze( Coaches son expertos en sueño)/g,
  },
};

let changed = 0;
for (const [loc, rel] of Object.entries(PAGES)) {
  const file = path.join(ROOT, rel); const c = COPY[loc];
  const s = fs.readFileSync(file, 'utf8'); const bodyM = s.match(/export const BODY_HTML = ("[\s\S]*");\s*$/);
  if (!bodyM) { console.log(`  ${rel}: no BODY_HTML, skipped`); continue; }
  const body = JSON.parse(bodyM[1]);
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  let markup = pm ? body.replace(pm[0], '\u0000PAYLOAD\u0000') : body;
  const counts = { price: 0, coaches: 0, pPrice: 0, pCoaches: 0 };
  const apply = (html, key) => {
    html = html.replace(c.oldPrice, (m, open, close) => { counts[key === 'p' ? 'pPrice' : 'price']++; return `${open}${escHtml(c.price)}${close}`; });
    html = html.replace(c.coaches, (m, before, after) => { counts[key === 'p' ? 'pCoaches' : 'coaches']++; return `${before}Sleep${after}`; });
    return html;
  };
  markup = apply(markup, 'm');
  let payload = pm ? pm[0] : '';
  if (pm) {
    const nodes = JSON.parse(pm[2]); let touched = false;
    for (let i = 0; i < nodes.length; i++) {
      if (typeof nodes[i] !== 'string') continue;
      const next = apply(nodes[i], 'p'); if (next !== nodes[i]) { nodes[i] = next; touched = true; }
    }
    if (touched) payload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3];
  }
  const next = pm ? markup.replace('\u0000PAYLOAD\u0000', () => payload) : markup;
  const present = body.includes(escHtml(c.price)) && !c.coaches.test(body); c.coaches.lastIndex = 0;
  if (next !== body) { changed++; if (!CHECK) fs.writeFileSync(file, s.replace(bodyM[1], () => JSON.stringify(next))); }
  console.log(`  ${rel.padEnd(32)} markup: ${counts.price} price lines, ${counts.coaches} "Sleep Coaches"; payload: ${counts.pPrice} price lines, ${counts.pCoaches} "Sleep Coaches"${next !== body ? '' : present ? ' (already applied)' : ' (nothing matched)'}`);
}
console.log(`${changed} files ${CHECK ? 'would change' : 'changed'}`);
