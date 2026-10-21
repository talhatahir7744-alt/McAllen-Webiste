/*
 * The "365 Night Sleep Guarantee" band (client copy, October 22, 2026) replaces the text of the builder's
 * "We Can't Be Beat on Price" section on every page that carries it (EN + ES; the desktop and mobile copies:
 * sections 3zREM4j5wa / eC_eoiXfK_, headings JQfUWePMYv / yw8zA6doto, paragraphs PrZZn5Z-3B / wjKoORCf6l,
 * buttons gjkl1mA16J / Fp1GGeipKX). Layout, background, image and button style are untouched: only the heading
 * (two lines, H2), the paragraph, the button label / sub-label and the button link (→ the financing page) change,
 * in the static markup and in the hydration payload (heading and paragraph HTML strings are unique to this section
 * and are replaced; the button's text/subText/stepPath wrappers belong to that button alone and are re-pointed to
 * new string nodes — shared strings are never overwritten).
 * Idempotent; run after scripts/heading-structure.mjs.  node scripts/guarantee-section.mjs  (npm run section:guarantee)  [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const COPY = {
  en: {
    line1: '365 NIGHT SLEEP GUARANTEE',
    line2: 'PLUS 0% FINANCING FOR UP TO 60 MONTHS',
    p: 'Experience the ultimate peace of mind with our year-long comfort pledge and easy, affordable plans. Shop confidently for personalized sleep solutions and premium brands.',
    label: 'EXPLORE OUR SLEEP PROMISES AND FINANCING',
    sub: 'Learn more about our terms and apply today!',
    href: '/mattress-financing',
  },
  es: {
    line1: 'GARANTÍA DE 365 NOCHES DE SUEÑO',
    line2: 'MÁS 0% DE FINANCIAMIENTO HASTA 60 MESES',
    p: 'Disfruta de total tranquilidad con nuestra promesa de confort de un año completo y planes fáciles y accesibles. Compra con confianza soluciones de sueño personalizadas y marcas premium.',
    label: 'EXPLORA NUESTRAS PROMESAS DE SUEÑO Y FINANCIAMIENTO',
    sub: 'Conoce nuestros términos y solicita hoy.',
    href: '/es/mattress-financing',
  },
};
const BUTTONS = ['button-Fp1GGeipKX', 'button-gjkl1mA16J'];
const OLD_HEADING = /<h2 class="snz-h"><span style="color: var\(--white\)">[^<]*(?:Be Beat on Price|Nadie Nos Gana [Ee]n Precio)[\s\S]*?<\/span><\/h2>/g;
const OLD_PARAGRAPH = /<p><span style="color: var\(--white\); font-family: Montserrat">(?:Shop confidently with personalized sleep solutions|Compra con confianza con soluciones de sueño personalizadas)[^<]*<\/span><\/p>/g;
const headingHtml = (c) => `<h2 class="snz-h"><span style="color: var(--white)"><span class="snz-h2-line snz-h2-line--big">${escHtml(c.line1)}</span><span class="snz-h2-line snz-h2-line--small">${escHtml(c.line2)}</span></span></h2>`;
const paragraphHtml = (c) => `<p><span style="color: var(--white); font-family: Montserrat">${escHtml(c.p)}</span></p>`;

const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts') files.push(p); } })(path.join(ROOT, 'app'));
let changed = 0, pages = 0;
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/'); const loc = rel.startsWith('app/es/') ? 'es' : 'en'; const c = COPY[loc];
  const s = fs.readFileSync(file, 'utf8'); const bodyM = s.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) continue;
  const body = JSON.parse(bodyM[1]);
  if (!OLD_HEADING.test(body) && !body.includes(c.line1)) { OLD_HEADING.lastIndex = 0; continue; } OLD_HEADING.lastIndex = 0;
  pages++;
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  let markup = pm ? body.replace(pm[0], '\u0000PAYLOAD\u0000') : body;
  const counts = { h: 0, p: 0, b: 0, ph: 0, pp: 0, pb: 0 };
  // ---- markup
  markup = markup.replace(OLD_HEADING, () => { counts.h++; return headingHtml(c); });
  markup = markup.replace(OLD_PARAGRAPH, () => { counts.p++; return paragraphHtml(c); });
  for (const id of BUTTONS) {
    const re = new RegExp(`(<a id="${id}_btn"[^>]*>)([\\s\\S]*?<\\/a>)`);
    markup = markup.replace(re, (m, open, rest) => {
      if (open.includes(`aria-label="${escHtml(c.label)}`)) return m; counts.b++;
      const o = open.replace(/href="[^"]*"/, `href="${c.href}"`).replace(/aria-label="[^"]*"/, `aria-label="${escHtml(c.label)} ${escHtml(c.sub)}"`);
      const r = rest.replace(/(<span class="main-heading-button">)[^<]*(<\/span>)/, `$1${escHtml(c.label)}$2`).replace(/(<span class="sub-heading-button">)[^<]*(<\/span>)/, `$1${escHtml(c.sub)}$2`);
      return o + r;
    });
  }
  // ---- payload
  let payload = pm ? pm[0] : '';
  if (pm) {
    const nodes = JSON.parse(pm[2]); let touched = false;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]; if (typeof n !== 'string') continue;
      if (OLD_HEADING.test(n)) { OLD_HEADING.lastIndex = 0; nodes[i] = n.replace(OLD_HEADING, headingHtml(c)); counts.ph++; touched = true; }
      OLD_HEADING.lastIndex = 0;
      if (OLD_PARAGRAPH.test(n)) { OLD_PARAGRAPH.lastIndex = 0; nodes[i] = n.replace(OLD_PARAGRAPH, paragraphHtml(c)); counts.pp++; touched = true; }
      OLD_PARAGRAPH.lastIndex = 0;
    }
    // the financing funnel step (url → stepPath uuid) for this locale
    const step = nodes.find((n) => n && typeof n === 'object' && !Array.isArray(n) && typeof n.url === 'number' && nodes[n.url] === c.href && typeof n.value === 'number');
    const stepIdx = step ? step.value : -1;
    const push = (v) => { const i = nodes.indexOf(v); if (i >= 0 && typeof v === 'string') return i; nodes.push(v); return nodes.length - 1; };
    for (const id of BUTTONS) {
      const idIdx = nodes.indexOf(id); if (idIdx < 0) continue;
      const el = nodes.find((n) => n && typeof n === 'object' && !Array.isArray(n) && n.id === idIdx); if (!el || typeof el.extra !== 'number') continue;
      const extra = nodes[el.extra]; const w = (key) => (typeof extra[key] === 'number' && nodes[extra[key]] && typeof nodes[extra[key]] === 'object') ? nodes[extra[key]] : null;
      const text = w('text'), sub = w('subText'), stepW = w('stepPath');
      if (text && nodes[text.value] !== c.label) { text.value = push(c.label); touched = true; counts.pb++; }
      if (sub && nodes[sub.value] !== c.sub) { sub.value = push(c.sub); touched = true; }
      if (stepW && stepIdx >= 0 && stepW.value !== stepIdx) { stepW.value = stepIdx; touched = true; }
    }
    if (touched) payload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3];
  }
  const next = pm ? markup.replace('\u0000PAYLOAD\u0000', () => payload) : markup;
  if (next !== body) { changed++; if (!CHECK) fs.writeFileSync(file, s.replace(bodyM[1], () => JSON.stringify(next))); }
  console.log(`  ${rel.padEnd(44)} markup: ${counts.h} headings, ${counts.p} paragraphs, ${counts.b} buttons; payload: ${counts.ph} headings, ${counts.pp} paragraphs, ${counts.pb} buttons${next !== body ? '' : ' (no change)'}`);
}
console.log(`${pages} pages carry the section; ${changed} files ${CHECK ? 'would change' : 'changed'}`);
