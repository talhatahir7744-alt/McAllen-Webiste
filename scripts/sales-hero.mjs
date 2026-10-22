/*
 * Sales page hero (October 2026): the "How mattress sales work at Snooze" intro lives INSIDE the hero of
 * /mattress-sales and /es/mattress-sales (desktop section CaKLDTKpp, mobile twin mjbWbTM8eI), so the page opens with
 * one block: H1 (unchanged), sub-headline, paragraph 1, a small H2, paragraphs 2–4 (the last one smaller and muted,
 * with the phone as a tel: link and the address as a link to the Google listing) and the hero's own CTA button. The
 * copy goes into the hero's two sub-heading elements (markup + hydration payload; their text strings are unique to
 * those elements, new strings are appended and the wrappers re-pointed). Layout: overrides/global.css ("Sales page hero").
 *
 * The dated offer block (lib/offer.ts: eyebrow, headline, details, CTA to the booking page) that used to render above
 * the builder page from components/SalesIntro.tsx now sits right under the hero as its own builder section (a renamed
 * copy of the home page's empty custom-code section, ids *-snzSalesOffer), only while the offer is active at build
 * time; an inline script also removes it on the client once the end date has passed. Idempotent.
 *   node scripts/sales-hero.mjs   (npm run section:sales-hero)   [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPage, writePage, loadTemplate, removeSection, placeAfterHero, esc, strAt, pageOf, isDict } from './builder-section.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

/* ---- the offer (lib/offer.ts) and the store facts (lib/location.ts) ---- */
const offerSrc = fs.readFileSync(path.join(ROOT, 'lib/offer.ts'), 'utf8');
const field = (name, loc) => (offerSrc.match(new RegExp(`${name}:\\s*\\{[^}]*?\\b${loc}:\\s*'((?:[^'\\\\]|\\\\.)*)'`)) || [])[1]?.replace(/\\'/g, "'") || '';
const OFFER = {
  enabled: /^\s*enabled:\s*true/m.test(offerSrc),
  startDate: (offerSrc.match(/^\s*startDate:\s*'([^']*)'/m) || [])[1] || '',
  endDate: (offerSrc.match(/^\s*endDate:\s*'([^']*)'/m) || [])[1] || '',
};
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const ACTIVE = OFFER.enabled && (!OFFER.startDate || today >= OFFER.startDate) && (!OFFER.endDate || today <= OFFER.endDate) && !!field('headline', 'en');
const locSrc = fs.readFileSync(path.join(ROOT, 'lib/location.ts'), 'utf8');
const PHONE = (locSrc.match(/^\s*phone:\s*'([^']*)'/m) || [])[1]; const PHONE_HREF = (locSrc.match(/^\s*phoneHref:\s*'([^']*)'/m) || [])[1]; const GBP = (locSrc.match(/^\s*gbpUrl:\s*'([^']*)'/m) || [])[1];
if (!PHONE || !PHONE_HREF || !GBP) throw new Error('lib/location.ts: phone / phoneHref / gbpUrl not found');
const ADDRESS = '7913 N 10th St, Suite 130, McAllen, TX 78504';

/* ---- copy ---- */
const COPY = {
  en: {
    sub: 'Looking for the best mattress deals in McAllen?',
    p1: 'You’re in the right place. At Snooze Mattress + Wellness, we help you find the perfect mattress at the perfect price — without pressure, gimmicks, or confusing fine print. Whether you’re upgrading your master bedroom, shopping for a guest room, or finally replacing that sagging mattress, we make it simple, affordable, and comfortable.',
    h2: 'How mattress sales work at Snooze',
    p2: 'Every sale starts the same way: a free Dream Mapping fitting. In about five minutes the pressure-mapping bed shows which mattresses fit your body, so the offer you leave with is one that actually suits how you sleep.',
    p3: 'Sale pricing applies to the brands on our McAllen showroom floor — Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, King Koil, Englander, Spring Air, Helix, Puffy and Snooze-O-Pedic. Financing is available through Synchrony, Wells Fargo and Snap, and delivery is free on orders over $999.',
    p4: (addr, tel) => `Details, dates and any exclusions for a specific offer are confirmed in store at ${addr}, or by phone at ${tel}.`,
    cta: 'Book your free Dream Mapping',
  },
  es: {
    sub: '¿Buscas las mejores ofertas de colchones en McAllen?',
    p1: 'Estás en el lugar correcto. En Snooze Mattress + Wellness te ayudamos a encontrar el colchón perfecto al precio perfecto — sin presiones, trucos ni letras chiquitas confusas. Ya sea que estés renovando tu recámara principal, buscando algo para el cuarto de visitas o por fin reemplazando ese colchón hundido, lo hacemos sencillo, accesible y cómodo.',
    h2: 'Cómo funcionan las ofertas de colchones en Snooze',
    p2: 'Toda oferta empieza igual: con una sesión gratis de Dream Mapping. En unos cinco minutos, la cama de mapeo de presión muestra qué colchones se ajustan a tu cuerpo, así que la oferta con la que te vas es una que de verdad va con tu forma de dormir.',
    p3: 'Los precios de oferta aplican a las marcas de nuestra sala de exhibición en McAllen: Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, King Koil, Englander, Spring Air, Helix, Puffy y Snooze-O-Pedic. Hay financiamiento con Synchrony, Wells Fargo y Snap, y la entrega es gratis en compras mayores a $999.',
    p4: (addr, tel) => `Los detalles, fechas y exclusiones de cada oferta se confirman en la tienda, en ${addr}, o por teléfono al ${tel}.`,
    cta: 'Reserva tu Dream Mapping gratis',
  },
};
const P = (html, cls = '') => `<p class="snz-h${cls ? ' ' + cls : ''}" style="font-weight:400">${html}</p>`;
const subHtml = (loc) => P(esc(COPY[loc].sub));
function introHtml(loc) {
  const c = COPY[loc];
  const addr = `<a href="${esc(GBP)}" target="_blank" rel="noopener">${esc(ADDRESS)}</a>`; const tel = `<a href="${esc(PHONE_HREF)}">${esc(PHONE)}</a>`;
  return P(esc(c.p1)) + `<h2 class="snz-sales-h2">${esc(c.h2)}</h2>` + P(esc(c.p2)) + P(esc(c.p3)) + P(c.p4(addr, tel), 'snz-sales-fine');
}
function offerHtml(loc) {
  if (!ACTIVE) return '';
  const eyebrow = field('eyebrow', loc), headline = field('headline', loc), details = field('details', loc);
  const expiry = OFFER.endDate ? `<script>(function(){var e=document.currentScript&&document.currentScript.parentNode;if(!e||!e.parentNode)return;var t=new Date('${OFFER.endDate}T23:59:59-06:00');if(!isNaN(t)&&Date.now()>t.getTime())e.parentNode.removeChild(e);})();</script>` : '';
  return `<div class="snz-offer snz-offer--sales"${OFFER.endDate ? ` data-offer-ends="${OFFER.endDate}"` : ''}><div class="snz-offer__inner"><p class="snz-offer__eyebrow">${esc(eyebrow)}</p><h2 class="snz-offer__title">${esc(headline)}</h2>${details ? `<p class="snz-offer__text">${esc(details)}</p>` : ''}<a class="snz-offer__cta" href="${loc === 'es' ? '/es' : ''}/booking">${esc(COPY[loc].cta)}</a></div>${expiry}</div>`;
}

/* ---- hero text elements (desktop, mobile) ---- */
const SUB_HEADLINE = ['sub-heading-mYqCj1bCt8', 'sub-heading-ukMFKo6iLI'];
const INTRO = ['sub-heading-qBu7fcf5l-', 'sub-heading-Q-TR52wCm0'];
function setText(page, id, html) {
  const { $, nodes } = page; const str = strAt(nodes);
  const box = $(`[id="${id}"] .text-output > div`).first(); if (!box.length) return 'missing';
  const same = box.html() === html; if (!same) box.html(html);
  const { elements } = pageOf(nodes); const idx = elements.find((i) => isDict(nodes[i]) && str(nodes[i].id) === id); if (idx === undefined) return 'no payload record';
  const extra = nodes[nodes[idx].extra]; const t = extra && nodes[extra.text]; if (!t || typeof t !== 'object' || !('value' in t)) return 'payload text shape changed';
  if (nodes[t.value] !== html) { nodes.push(html); t.value = nodes.length - 1; return 'set'; }
  return same ? 'same' : 'set';
}

/* ---- offer block section: a renamed copy of the home page's custom-code section ---- */
const HOME_T = { section: 'section-x8iH4TeG-J', row: 'row-EdKIR9VJhr', col: 'col-44O5Jbh-BJ', cc: 'custom-code-pO-5dtepaB' };
const RENAME = { 'section-x8iH4TeG-J': 'section-snzSalesOffer', 'row-EdKIR9VJhr': 'row-snzSalesOffer', 'col-44O5Jbh-BJ': 'col-snzSalesOffer', 'custom-code-pO-5dtepaB': 'custom-code-snzSalesOffer' };
const TEMPLATE = loadTemplate(path.join(ROOT, 'app/(en)/content.ts'), HOME_T, RENAME);

for (const rel of ['app/(en)/mattress-sales/content.ts', 'app/es/mattress-sales/content.ts']) {
  const loc = rel.startsWith('app/es/') ? 'es' : 'en';
  const page = readPage(path.join(ROOT, rel)); if (!page) { console.log(`  ${rel}: unreadable, skipped`); continue; }
  const notes = [];
  for (const id of SUB_HEADLINE) notes.push(`${id.replace('sub-heading-', 'sub ')} ${setText(page, id, subHtml(loc))}`);
  for (const id of INTRO) notes.push(`${id.replace('sub-heading-', 'intro ')} ${setText(page, id, introHtml(loc))}`);
  if (ACTIVE) notes.push(placeAfterHero(page, TEMPLATE, offerHtml(loc)));
  else if (page.$(`[id="${TEMPLATE.ids.section}"]`).length && removeSection(page, TEMPLATE.ids.section)) notes.push('−offer block (offer off)');
  const { changed } = writePage(page, { check: CHECK });
  console.log(`  ${rel.padEnd(40)} ${notes.join('; ')}${changed ? '' : ' (no change)'}`);
}
console.log(`offer ${ACTIVE ? 'ACTIVE' : 'inactive'} (${today}; ends ${OFFER.endDate || 'never'})${CHECK ? ' — check only' : ''}`);
