/*
 * Brooklyn Bedding replaces Englander on the generated pages (October 27, 2026). Englander was the store's exclusive
 * "Snooze® by Englander" line; the client now carries Brooklyn Bedding instead. On every content.ts (both locales):
 *   - the brand-logo marquee ("We Carry The Best Mattress Brands", home and /mattresses): the Englander logo <img> becomes
 *     the Brooklyn Bedding logo (public/assets/filesafe/ARD47WoZpqaZSQ9MSxLD/media/6adfbe1967528ab60776dea7.png, scrubbed
 *     like the other logos by scripts/scrub-logos.mjs), same attributes, lazy loading and strip position, alt
 *     "Brooklyn Bedding mattresses at Snooze <city>"; markup and the custom-code copies in the payload. The strip also
 *     ended with an older Brooklyn Bedding logo from the original export; that item is removed so the brand shows once;
 *   - the /mattresses brand block (desktop + mobile copies, the same element ids): heading "Brooklyn Bedding Sedona
 *     Mattress" with the brand name linked to brooklynbedding.com (new tab, noopener), the Sedona image
 *     (public/assets/lcimg/… r_320–r_1200 WebP variants of 6adfbd9d67528ab60776d13c.png) with its alt, the intro and the
 *     three check-icon features; the "Book Your Dream Mapping Appointment" button stays; the mobile copy's heading was
 *     two <h2> elements and is one;
 *   - brand lists in copy and alt text: "Englander" → "Brooklyn Bedding" (sales hero, brands banner alt on
 *     /mattress-sales and /mattress-financing); the About Us sentence about the exclusive Englander line keeps only
 *     "We price-match any competitor." (Brooklyn Bedding is not exclusive to the store, so the claim is dropped).
 * The city comes from lib/location.ts. The source side (overrides/logo-marquee.html, scripts/logo-marquee-patch.mjs,
 * scripts/brand-links.mjs, scripts/sales-hero.mjs, lib/pages/*, overrides/*.json) carries the same change, so a
 * re-convert needs only this step again. Idempotent.
 *   node scripts/brand-brooklyn.mjs   (npm run brand:brooklyn)   [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { listContentFiles, readPage, writePage, pageOf, strAt, isDict, esc } from './builder-section.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const CITY = (fs.readFileSync(path.join(ROOT, 'lib/location.ts'), 'utf8').match(/\bcity:\s*'([^']+)'/) || [, 'McAllen'])[1];

const OLD_LOGO_ID = '6a7f5039255b571c8e272951';
/* the strip already ended with an older Brooklyn Bedding logo from the original export; it goes, so the brand shows once, in Englander's slot */
const OLD_BB_ID = '6a7f502da6a03cda06a1aa99';
const OLD_BB_ITEM = new RegExp(`<div class="snz-logo-marquee__item">\\s*<img[^>]*${OLD_BB_ID}[^>]*>\\s*</div>\\s*`, 'g');
const LOGO = '/assets/filesafe/ARD47WoZpqaZSQ9MSxLD/media/6adfbe1967528ab60776dea7.png.scrub.webp';
const OLD_IMAGE_ID = 'e9c18929-46f8-41a8-be9c-48df84bd974c';
const IMAGE = '/assets/lcimg/image/f_webp/q_80/r_1200/u/filesafe/ARD47WoZpqaZSQ9MSxLD/media/6adfbd9d67528ab60776d13c.png';
const BRAND_LINK = '<a class="snz-brand-link" href="https://brooklynbedding.com/" target="_blank" rel="noopener noreferrer">Brooklyn Bedding</a>';
/* the "Trusted by Major Brands such as…" card on /mattress-financing and /mattress-sales: one composite image of the brand
   logos, which still showed Englander; the client's new composite (the same 13 brands with Brooklyn Bedding) takes its
   place in every size variant, with the alt the agency supplied */
const OLD_BANNER_ID = '80d3f6fe-5f3c-43ea-97c2-104bb74a7f69';
const OLD_BANNER_PATH = `qR8peonBlnjGI3ZuLHQP/media/${OLD_BANNER_ID}.png`;
const BANNER_PATH = 'ARD47WoZpqaZSQ9MSxLD/media/6adfc5b336aa4a07e8efaab0.webp';
const BANNER = `/assets/lcimg/image/f_webp/q_80/r_1200/u/filesafe/${BANNER_PATH}`;
const BANNER_IDS = ['vy3csFO5NT', 'pPrmy32EsW', 'qb2gUzQNgin', 'dreuIkARcM'];
const OLD_BANNER_ALT = {
  en: 'Mattress brands at Snooze: Tempur-Pedic, Stearns & Foster, Sealy, Spring Air, King Koil, Puffy, Beautyrest, Brooklyn Bedding, Bedgear, Serta, DreamFit, Helix and BedTech',
  es: 'Marcas de colchones en Snooze: Tempur-Pedic, Stearns & Foster, Sealy, Spring Air, King Koil, Puffy, Beautyrest, Brooklyn Bedding, Bedgear, Serta, DreamFit, Helix y BedTech',
};
/* the block's element ids on /mattresses: the desktop copy, then the mobile copy */
const BLOCKS = [
  { heading: 'heading-GHn5gHcXmM', intro: 'sub-heading-LH2pAtpA4z', bullets: ['bulletList-tzXRqRtT5Q', 'bulletList-qgGwZGcn_j', 'bulletList-uUC2QYROD2'], image: 'image-2psf4j47kF' },
  { heading: 'heading-orQ7VV-upe', intro: 'sub-heading-mNZjsecHWh', bullets: ['bulletList-PiAjeb9x8b', 'bulletList-p5RWQ6xk-m', 'bulletList-lngyXINUW5'], image: 'image-JIiIi6_nfg' },
];
const T = {
  en: {
    logoAlt: `Brooklyn Bedding mattresses at Snooze ${CITY}`,
    imageAlt: `Brooklyn Bedding Sedona hybrid mattress at Snooze ${CITY}`,
    bannerAlt: `Mattress brands at Snooze Mattress + Wellness ${CITY} including Tempur-Pedic, Stearns & Foster, Sealy, Brooklyn Bedding, and more`,
    heading: `${BRAND_LINK} Sedona Mattress`,
    intro: 'The Brooklyn Bedding Sedona combines cooling comfort, pressure relief, and responsive support in a premium hybrid design. Thoughtful comfort layers and a dual-coil system help create a comfortable, supportive night\'s sleep.',
    features: [
      ['Airflow-Engineered Cooling', 'A GlacioTex™ cooling cover and perimeter airflow channel help move heat and moisture away.'],
      ['Pressure-Relieving Hybrid Support', 'Layered comfort foams and individually wrapped coils contour to your body while helping reduce motion transfer.'],
      ['Your Comfort, Your Way', 'Choose soft, medium, or firm to match your preferred feel and sleep style.'],
    ],
    sweep: [
      [`We price-match any competitor and carry exclusive Snooze by Englander mattresses you can't find anywhere else in ${CITY}..`, 'We price-match any competitor.'],
      [`We price-match any competitor and carry exclusive Snooze by Englander mattresses you can't find anywhere else in ${CITY}.`, 'We price-match any competitor.'],
      ['Beautyrest, Englander, Bedgear', 'Beautyrest, Brooklyn Bedding, Bedgear'],
      ['King Koil, Englander, Spring Air', 'King Koil, Brooklyn Bedding, Spring Air'],
    ],
  },
  es: {
    logoAlt: `Colchones Brooklyn Bedding en Snooze ${CITY}`,
    imageAlt: `Colchón híbrido Brooklyn Bedding Sedona en Snooze ${CITY}`,
    bannerAlt: `Marcas de colchones en Snooze Mattress + Wellness ${CITY}, incluyendo Tempur-Pedic, Stearns & Foster, Sealy, Brooklyn Bedding y más`,
    heading: `Colchón Sedona de ${BRAND_LINK}`,
    intro: 'El Brooklyn Bedding Sedona combina confort fresco, alivio de presión y soporte con respuesta en un diseño híbrido premium. Sus capas de confort bien pensadas y su sistema de doble resorte ayudan a lograr una noche de sueño cómoda y con buen soporte.',
    features: [
      ['Frescura con flujo de aire', 'Una funda refrescante GlacioTex™ y un canal de ventilación perimetral ayudan a alejar el calor y la humedad.'],
      ['Soporte híbrido que alivia la presión', 'Capas de espuma de confort y resortes envueltos individualmente se amoldan a tu cuerpo y ayudan a reducir la transferencia de movimiento.'],
      ['Tu confort, a tu manera', 'Elige suave, medio o firme según la sensación y el estilo de sueño que prefieras.'],
    ],
    sweep: [
      [`Igualamos el precio de cualquier competidor y tenemos los colchones exclusivos Snooze by Englander que no encontrarás en ningún otro lugar de ${CITY}..`, 'Igualamos el precio de cualquier competidor.'],
      [`Igualamos el precio de cualquier competidor y tenemos los colchones exclusivos Snooze by Englander que no encontrarás en ningún otro lugar de ${CITY}.`, 'Igualamos el precio de cualquier competidor.'],
      ['Beautyrest, Englander, Bedgear', 'Beautyrest, Brooklyn Bedding, Bedgear'],
      ['King Koil, Englander, Spring Air', 'King Koil, Brooklyn Bedding, Spring Air'],
    ],
  },
};

for (const f of [LOGO, IMAGE, BANNER]) if (!fs.existsSync(path.join(ROOT, 'public', f))) throw new Error('missing asset public' + f);
const logoMeta = await sharp(path.join(ROOT, 'public', LOGO)).metadata();
const imageMeta = await sharp(path.join(ROOT, 'public', IMAGE)).metadata();
const bannerMeta = await sharp(path.join(ROOT, 'public', BANNER)).metadata();

/* an <img> tag string for the marquee: same tag, new src / size / alt */
const retagLogo = (tag, alt) => tag.replace(/src="[^"]*"/, `src="${LOGO}"`).replace(/width="\d+"/, `width="${logoMeta.width}"`).replace(/height="\d+"/, `height="${logoMeta.height}"`).replace(/alt="[^"]*"/, `alt="${esc(alt)}"`);

let filesChanged = 0; const report = [];
for (const file of listContentFiles(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/'); const locale = rel.startsWith('app/es/') ? 'es' : 'en'; const t = T[locale];
  const page = readPage(file); if (!page) continue;
  const { $, nodes } = page; const str = strAt(nodes); const { elements } = pageOf(nodes); const notes = [];
  const byId = new Map(); for (const i of elements || []) { const n = nodes[i]; if (isDict(n) && str(n.id)) byId.set(str(n.id), i); }
  /* a record's field chain: record.extra.<key>.value → the string node index */
  const field = (dictIdx, key) => { const d = nodes[dictIdx]; if (!isDict(d) || !(key in d)) throw new Error(`${rel}: payload field ${key} missing on node ${dictIdx}`); return d[key]; };
  const textIdx = (id) => { const k = byId.get(id); if (k === undefined) throw new Error(`${rel}: ${id} not in the elements list`); const v = field(field(field(k, 'extra'), 'text'), 'value'); if (typeof nodes[v] !== 'string') throw new Error(`${rel}: ${id} text is not a string node`); return v; };
  const setText = (id, html) => { const v = textIdx(id); if (nodes[v] !== html) { nodes[v] = html; return true; } return false; };

  // 1. marquee logo (markup + payload copies)
  const logos = $(`img[src*="${OLD_LOGO_ID}"]`);
  if (logos.length) { logos.each((_, el) => { $(el).attr('src', LOGO); $(el).attr('width', String(logoMeta.width)); $(el).attr('height', String(logoMeta.height)); $(el).attr('alt', t.logoAlt); }); notes.push(`marquee logo ×${logos.length} (markup)`); }
  let payloadLogos = 0;
  for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string' && nodes[i].includes(OLD_LOGO_ID)) { nodes[i] = nodes[i].replace(new RegExp(`<img[^>]*${OLD_LOGO_ID}[^>]*>`, 'g'), (tag) => { payloadLogos++; return retagLogo(tag, t.logoAlt); }); }
  if (payloadLogos) notes.push(`marquee logo ×${payloadLogos} (payload)`);
  const dup = $(`img[src*="${OLD_BB_ID}"]`);
  if (dup.length) { dup.each((_, el) => { const item = $(el).closest('.snz-logo-marquee__item'); if (item.length) item.remove(); else $(el).remove(); }); notes.push(`old Brooklyn Bedding item ×${dup.length} removed (markup)`); }
  let dupPayload = 0;
  for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string' && nodes[i].includes(OLD_BB_ID)) nodes[i] = nodes[i].replace(OLD_BB_ITEM, () => { dupPayload++; return ''; });
  if (dupPayload) notes.push(`old Brooklyn Bedding item ×${dupPayload} removed (payload)`);

  // 1c. the brands composite in the "Trusted by Major Brands" card: new file (same path form, every size variant), the
  // agency's alt, and width/height so the box is reserved before it loads
  const banners = $(`img[src*="${OLD_BANNER_ID}"]`);
  if (banners.length) { banners.each((_, el) => { $(el).attr('src', String($(el).attr('src')).split(OLD_BANNER_PATH).join(BANNER_PATH)); $(el).attr('alt', t.bannerAlt); $(el).attr('width', String(bannerMeta.width)); $(el).attr('height', String(bannerMeta.height)); }); notes.push(`brands banner ×${banners.length} (markup)`); }
  let bannerPayload = 0;
  for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string') { if (nodes[i].includes(OLD_BANNER_PATH)) { nodes[i] = nodes[i].split(OLD_BANNER_PATH).join(BANNER_PATH); bannerPayload++; } else if (nodes[i] === OLD_BANNER_ALT[locale]) { nodes[i] = t.bannerAlt; bannerPayload++; } }
  if (bannerPayload) notes.push(`brands banner ×${bannerPayload} (payload)`);

  // 2. the /mattresses block
  if (byId.has(BLOCKS[0].heading)) {
    for (const b of BLOCKS) {
      // heading: one <h2> with the brand link; the span keeps the builder's style
      const hv = textIdx(b.heading); const style = (nodes[hv].match(/<span style="([^"]*)">/) || [, "color: var(--black); font-family: 'customhl-6a7218f28a84cd95ca4e22e1-Visby Extrabold'"])[1];
      const headingHtml = `<h2 class="snz-h"><span style="${style}">${t.heading}</span></h2>`;
      if (setText(b.heading, headingHtml)) notes.push(`${b.heading} text`);
      const hEl = $(`#${b.heading} .text-output > div`); if (hEl.length && hEl.html() !== headingHtml) { hEl.html(headingHtml); notes.push(`${b.heading} markup`); }
      // intro
      const introHtml = `<p class="snz-h" style="font-weight:400"><span style="font-family: Montserrat">${t.intro}</span></p>`;
      if (setText(b.intro, introHtml)) notes.push(`${b.intro} text`);
      const iEl = $(`#${b.intro} .text-output > div`); if (iEl.length && iEl.html() !== introHtml) { iEl.html(introHtml); notes.push(`${b.intro} markup`); }
      // features: the <p> inside the check-icon list item
      b.bullets.forEach((id, j) => {
        const [title, text] = t.features[j]; const pHtml = `<strong><span style="color: var(--black)">${title}</span></strong><span style="color: var(--black)"> – ${text}</span>`;
        const v = textIdx(id); const next = nodes[v].replace(/<p>[\s\S]*?<\/p>/, `<p>${pHtml}</p>`); if (next !== nodes[v]) { nodes[v] = next; notes.push(`${id} text`); }
        const pEl = $(`#${id} li > p`); if (pEl.length && pEl.html() !== pHtml) { pEl.html(pHtml); notes.push(`${id} markup`); }
      });
      // image: payload url + alt, markup src / alt / natural size (as scripts/image-hydration-match.mjs renders it)
      const k = byId.get(b.image); const ip = field(field(field(k, 'extra'), 'imageProperties'), 'value'); const u = field(ip, 'url'), a = field(ip, 'altText');
      if (nodes[u] !== IMAGE) { nodes[u] = IMAGE; notes.push(`${b.image} url`); } if (nodes[a] !== t.imageAlt) { nodes[a] = t.imageAlt; notes.push(`${b.image} alt`); }
      const img = $(`#${b.image} img`); if (img.length && img.attr('src') !== IMAGE) { img.attr('src', IMAGE); img.attr('alt', t.imageAlt); img.attr('width', String(imageMeta.width)); img.attr('height', String(imageMeta.height)); img.attr('style', `width:min(100%, ${imageMeta.width}px)`); notes.push(`${b.image} markup`); }
    }
    for (let i = 0; i < nodes.length; i++) if (nodes[i] === `Snooze by Englander pillow-top mattress in a bedroom` || nodes[i] === 'Colchón pillow-top Snooze by Englander en una recámara') { nodes[i] = t.imageAlt; notes.push(`alt node ${i}`); }
  }

  let r = writePage(page, { check: CHECK }); let out = r.out;
  // 3. copy and alt-text sweep (markup and payload share the same raw text form for these phrases)
  const s = fs.readFileSync(file, 'utf8'); let next = s.replace(page.bodyM[1], () => JSON.stringify(out));
  // the block images' reserved-size rules in HEAD_HTML (`#image-… .image-container img{aspect-ratio:W/H}`, written for the
  // old image's proportions) follow the Sedona image, or its box would stretch it
  if (byId.has(BLOCKS[0].heading)) { const ratioRe = new RegExp(`(#image-(?:${BLOCKS.map((b) => b.image.replace('image-', '')).join('|')}) \\.image-container img\\{aspect-ratio:)\\d+\\/\\d+(\\})`, 'g'); let fixed = 0; next = next.replace(ratioRe, (m, a, z) => { const v = `${a}${imageMeta.width}/${imageMeta.height}${z}`; if (v !== m) fixed++; return v; }); if (fixed) notes.push(`reserved-size ratio ×${fixed}`); }
  { const ratioRe = new RegExp(`(#image-(?:${BANNER_IDS.join('|')}) \\.image-container img\\{aspect-ratio:)\\d+\\/\\d+(\\})`, 'g'); let fixed = 0; next = next.replace(ratioRe, (m, a, z) => { const v = `${a}${bannerMeta.width}/${bannerMeta.height}${z}`; if (v !== m) fixed++; return v; }); if (fixed) notes.push(`banner reserved-size ratio ×${fixed}`); }
  for (const [from, to] of t.sweep) { const n = next.split(from).length - 1; if (n) { next = next.split(from).join(to); notes.push(`sweep "${from.slice(0, 40)}…" ×${n}`); } }
  if (next !== s) { filesChanged++; if (!CHECK) fs.writeFileSync(file, next); }
  const left = (next.match(/Englander/g) || []).length;
  if (notes.length || left) report.push(`${rel}: ${notes.join('; ') || 'nothing to do'}${left ? ` — ${left} "Englander" LEFT` : ''}`);
}
console.log(report.join('\n') || 'nothing to do');
console.log(`${filesChanged} page file(s) ${CHECK ? 'would change' : 'written'}; city "${CITY}"; logo ${logoMeta.width}×${logoMeta.height}, image ${imageMeta.width}×${imageMeta.height}`);
