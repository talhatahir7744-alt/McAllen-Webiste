/*
 * SEO titles and meta descriptions for the audited pages (SEO audit, October 2026 — section 3a/3b), English + Spanish.
 * The generated page.tsx files carry the builder's titles, so this runs AFTER `npm run convert`:
 *   node scripts/seo-metadata.mjs        (npm run seo:meta)       idempotent
 * It also fixes the "Best Mattresses  in McAllen" double space (page title + page heading) and strips the meta keywords
 * block from the generated metadata (the converter no longer emits it). Titles are the client's audit titles verbatim
 * (one is 63 characters); descriptions are ≤155 characters and only restate what the page itself says.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

export const META = {
  '/': { en: ['Mattress Store in McAllen, TX | Free Dream Mapping | Snooze', 'McAllen, TX mattress store: free 5-minute Dream Mapping fitting, top brands and 0% financing options at 7913 N 10th St, Suite 130.'],
         es: ['Colchones en McAllen, TX | Dream Mapping Gratis | Snooze', 'Tienda de colchones en McAllen, TX: sesión gratis de Dream Mapping de 5 minutos, marcas líderes y financiamiento al 0% en 7913 N 10th St, Suite 130.'] },
  '/mattresses': { en: ['Mattresses in McAllen, TX — Tempur-Pedic, Sealy & More | Snooze', 'Mattresses in McAllen, TX: Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, Helix, King Koil and more, fitted to you in a free Dream Mapping session.'],
         es: ['Colchones en McAllen, TX: Tempur-Pedic, Sealy y Más | Snooze', 'Colchones en McAllen, TX: Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, Helix, King Koil y más, ajustados a ti en una sesión gratis de Dream Mapping.'] },
  '/mattress-sales': { en: ['Mattress Sales & Deals in McAllen, TX | Snooze', 'Mattress deals in McAllen, TX: Helix, Puffy, King Koil, Snooze-O-Pedic and adjustable base bundles at local prices. Visit the showroom or book a fitting.'],
         es: ['Ofertas de Colchones en McAllen, TX | Snooze', 'Ofertas de colchones en McAllen, TX: Helix, Puffy, King Koil, Snooze-O-Pedic y paquetes con base ajustable a precios locales. Agenda tu cita gratis.'] },
  '/about-us': { en: ['About Snooze McAllen — Locally Owned Mattress Store', 'Snooze Mattress + Wellness, McAllen, TX: science-backed Dream Mapping fittings, real Sleep Coaches and no commission pressure to find your right mattress.'],
         es: ['Snooze McAllen: Tienda de Colchones de Dueños Locales', 'Snooze Mattress + Wellness, McAllen, TX: Dream Mapping respaldado por la ciencia, Sleep Coaches reales y sin presión de comisiones para elegir tu colchón.'] },
  '/booking': { en: ['Book a Free Dream Mapping Fitting in McAllen | Snooze', 'Book your free Dream Mapping appointment at Snooze Mattress + Wellness in McAllen, TX: a 5-minute fitting that finds the mattress built for how you sleep.'],
         es: ['Agenda tu Dream Mapping Gratis en McAllen | Snooze', 'Agenda tu Dream Mapping gratis en Snooze Mattress + Wellness, McAllen, TX: una sesión de 5 minutos que encuentra el colchón ideal para tu forma de dormir.'] },
  '/mattress-financing': { en: ['Mattress Financing in McAllen, TX — 0% Options | Snooze', 'Mattress financing in McAllen, TX: 0% options through Synchrony and Wells Fargo plus Snap lease-to-own. Flexible monthly payments on your new sleep system.'],
         es: ['Financiamiento de Colchones en McAllen, TX: 0% | Snooze', 'Financiamiento de colchones en McAllen, TX: opciones al 0% con Synchrony y Wells Fargo, más Snap con renta con opción a compra. Pagos mensuales flexibles.'] },
  '/adjustable-mattress-bases': { en: ['Adjustable Beds & Bases in McAllen, TX | Snooze', 'Adjustable beds and bases in McAllen, TX from Snooze Mattress + Wellness: more comfort, support and pressure relief, less snoring. Try one in store.'],
         es: ['Camas y Bases Ajustables en McAllen, TX | Snooze', 'Camas y bases ajustables en McAllen, TX en Snooze Mattress + Wellness: más comodidad, soporte y alivio de presión, menos ronquidos. Pruébalas en la tienda.'] },
  '/massage-chairs': { en: ['Massage Chairs in McAllen, TX — Infinity | Snooze', 'Infinity massage chairs in McAllen, TX at Snooze Mattress + Wellness: advanced massage technology designed to help you relax and recover. Try one in store.'],
         es: ['Sillas de Masaje Infinity en McAllen, TX | Snooze', 'Sillas de masaje Infinity en McAllen, TX en Snooze Mattress + Wellness: tecnología de masaje avanzada para relajarte y recuperarte. Pruébalas en la tienda.'] },
  '/pillows': { en: ['Pillows in McAllen, TX — Fitted to How You Sleep | Snooze', 'Pillows in McAllen, TX fitted to how you sleep: side, back and stomach sleepers. Premium pillows at Snooze Mattress + Wellness for your sleep style.'],
         es: ['Almohadas en McAllen, TX para Tu Forma de Dormir | Snooze', 'Almohadas en McAllen, TX para tu forma de dormir: de lado, boca arriba o boca abajo. Almohadas premium en Snooze Mattress + Wellness para tu descanso.'] },
  '/mattress-protectors': { en: ['Mattress Protectors in McAllen, TX | Snooze', 'Mattress protectors in McAllen, TX from Snooze Mattress + Wellness: breathable, waterproof protection from spills and allergens for your mattress.'],
         es: ['Protectores de Colchón en McAllen, TX | Snooze', 'Protectores de colchón en McAllen, TX de Snooze Mattress + Wellness: protección transpirable e impermeable contra derrames y alérgenos para tu inversión.'] },
};

let problems = 0, changed = 0;
for (const [route, langs] of Object.entries(META)) for (const [lang, [title, desc]] of Object.entries(langs)) {
  if (title.length > 60 && lang !== 'en') { console.log(`LEN title ${lang} ${route}: ${title.length}`); problems++; }
  if (desc.length > 155) { console.log(`LEN desc ${lang} ${route}: ${desc.length}`); problems++; }
  const dir = path.join(ROOT, lang === 'en' ? 'app/(en)' : 'app/es', route === '/' ? '' : route.slice(1));
  const f = path.join(dir, 'page.tsx'); let s = fs.readFileSync(f, 'utf8'); const before = s;
  if (/"title": "/.test(s)) { // generated page: JSON-style metadata (title + openGraph.title, description + openGraph.description)
    s = s.replace(/"title": "(?:[^"\\]|\\.)*"/g, `"title": ${JSON.stringify(title)}`).replace(/"description": "(?:[^"\\]|\\.)*"/g, `"description": ${JSON.stringify(desc)}`);
    s = s.replace(/\r?\n  "keywords": \[[\s\S]*?\],(?=\r?\n)/, '');
  } else { // hand-written page (booking): single-quoted keys inside the metadata block only
    s = s.replace(/title: '(?:[^'\\]|\\.)*'/g, () => `title: '${title.replace(/'/g, "\\'")}'`);
    s = s.replace(/description: '(?:[^'\\]|\\.)*'/g, () => `description: '${desc.replace(/'/g, "\\'")}'`);
  }
  if (!CHECK && s !== before) { fs.writeFileSync(f, s); changed++; }
  console.log(`${lang} ${route.padEnd(28)} title(${title.length}) desc(${desc.length}) ${s !== before ? 'updated' : 'unchanged'}`);
}
// the double space in the mattresses page heading / title text
for (const f of ['app/(en)/mattresses/content.ts', 'app/(en)/mattresses/page.tsx', 'app/es/mattresses/page.tsx']) { const p = path.join(ROOT, f); const s = fs.readFileSync(p, 'utf8'); const n = s.split('Mattresses  in').length - 1; if (n) { if (!CHECK) fs.writeFileSync(p, s.split('Mattresses  in').join('Mattresses in')); console.log(`${f}: double space fixed x${n}`); changed++; } }
if (problems) { console.error(`${problems} length problem(s)`); process.exit(1); }
console.log(`${changed} file(s) ${CHECK ? 'would change' : 'changed'}`);
