/*
 * SEO titles and meta descriptions for the audited pages (SEO audit, October 2026 — section 3a/3b), English + Spanish.
 * The generated page.tsx files carry the builder's titles, so this runs AFTER `npm run convert`:
 *   node scripts/seo-metadata.mjs        (npm run seo:meta)       idempotent
 * It also fixes the "Best Mattresses  in McAllen" double space (page title + page heading) and strips the meta keywords
 * block from the generated metadata (the converter no longer emits it). Titles follow the agency's October 27, 2026 report: the given titles for Home, /mattresses,
 * /mattress-sales and /mattress-financing verbatim, every other title ending "| Snooze Mattress" (≤60 characters, trimmed where
 * needed; the builder-titled product and legal pages included); descriptions are ≤155 characters and only restate what the page itself says.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

export const META = {
  '/': { en: ['McAllen Mattress Store | Dream Mapping | Snooze Mattress', 'McAllen, TX mattress store with a free Dream Mapping fitting, top brands and financing options at 7913 N 10th St, Suite 130. Open Sundays 12–6.'],
         es: ['Colchones en McAllen | Dream Mapping | Snooze Mattress', 'Tienda de colchones en McAllen, TX con Dream Mapping gratis, marcas líderes y financiamiento en 7913 N 10th St, Suite 130. Abrimos domingos 12–6.'] },
  '/mattresses': { en: ['Mattresses in McAllen, TX: Top Brands | Snooze Mattress', 'Mattresses in McAllen, TX: Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, Helix, King Koil and more, fitted to you in a free Dream Mapping session.'],
         es: ['Colchones en McAllen, TX: Marcas Líderes | Snooze Mattress', 'Colchones en McAllen, TX: Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, Helix, King Koil y más, ajustados a ti en una sesión gratis de Dream Mapping.'] },
  '/mattress-sales': { en: ['Mattress Sales & Deals in McAllen, TX | Snooze Mattress', 'Current mattress deals at Snooze Mattress in McAllen, TX: brand savings, special financing and a free Dream Mapping fitting. See store for details.'],
         es: ['Ofertas de Colchones en McAllen, TX | Snooze Mattress', 'Ofertas de colchones en Snooze Mattress, McAllen, TX: ahorros por marca, financiamiento especial y Dream Mapping gratis. Detalles en tienda.'] },
  '/about-us': { en: ['About Us: Locally Owned in McAllen, TX | Snooze Mattress', 'Snooze Mattress + Wellness, McAllen, TX: science-backed Dream Mapping fittings, real Sleep Coaches and no commission pressure to find your right mattress.'],
         es: ['Nosotros: Tienda Local en McAllen, TX | Snooze Mattress', 'Snooze Mattress + Wellness, McAllen, TX: Dream Mapping respaldado por la ciencia, Sleep Coaches reales y sin presión de comisiones para elegir tu colchón.'] },
  /* the contact page (the builder's opt-in page, moved to /contact-us on October 29, 2026: indexable now) */
  '/contact-us': { en: ['Contact Snooze Mattress in McAllen, TX | Snooze Mattress', 'Contact Snooze Mattress + Wellness in McAllen: call (956) 586-5646, visit 7913 N 10th St, Suite 130 or send a message to book a free Dream Mapping fitting.'],
         es: ['Contacta a Snooze Mattress en McAllen, TX | Snooze Mattress', 'Contacta a Snooze Mattress + Wellness en McAllen: llama al (956) 586-5646, visita 7913 N 10th St, Suite 130 o escríbenos y agenda tu Dream Mapping gratis.'] },
  '/booking': { en: ['Book a Dream Mapping Fitting in McAllen | Snooze Mattress', 'Book your free Dream Mapping appointment at Snooze Mattress + Wellness in McAllen, TX: a 5-minute fitting that finds the mattress built for how you sleep.'],
         es: ['Agenda tu Dream Mapping en McAllen | Snooze Mattress', 'Agenda tu Dream Mapping gratis en Snooze Mattress + Wellness, McAllen, TX: una sesión de 5 minutos que encuentra el colchón ideal para tu forma de dormir.'] },
  '/mattress-financing': { en: ['Mattress Financing in McAllen, TX | Snooze Mattress', 'Special financing on mattresses in McAllen, TX. With approved credit; terms vary by promotion. See store for details or book a Dream Mapping visit.'],
         es: ['Financiamiento de Colchones en McAllen, TX | Snooze Mattress', 'Financiamiento especial de colchones en McAllen, TX. Con crédito aprobado; los términos varían según la promoción. Detalles en tienda o agenda tu visita.'] },
  '/adjustable-mattress-bases': { en: ['Adjustable Beds & Bases in McAllen, TX | Snooze Mattress', 'Adjustable beds and bases in McAllen, TX from Snooze Mattress + Wellness: more comfort, support and pressure relief, less snoring. Try one in store.'],
         es: ['Camas y Bases Ajustables en McAllen, TX | Snooze Mattress', 'Camas y bases ajustables en McAllen, TX en Snooze Mattress + Wellness: más comodidad, soporte y alivio de presión, menos ronquidos. Pruébalas en la tienda.'] },
  '/massage-chairs': { en: ['Massage Chairs in McAllen, TX — Infinity | Snooze Mattress', 'Infinity massage chairs in McAllen, TX at Snooze Mattress + Wellness: advanced massage technology designed to help you relax and recover. Try one in store.'],
         es: ['Sillas de Masaje Infinity en McAllen, TX | Snooze Mattress', 'Sillas de masaje Infinity en McAllen, TX en Snooze Mattress + Wellness: tecnología de masaje avanzada para relajarte y recuperarte. Pruébalas en la tienda.'] },
  '/pillows': { en: ['Pillows in McAllen, TX for How You Sleep | Snooze Mattress', 'Pillows in McAllen, TX fitted to how you sleep: side, back and stomach sleepers. Premium pillows at Snooze Mattress + Wellness for your sleep style.'],
         es: ['Almohadas en McAllen, TX para Tu Descanso | Snooze Mattress', 'Almohadas en McAllen, TX para tu forma de dormir: de lado, boca arriba o boca abajo. Almohadas premium en Snooze Mattress + Wellness para tu descanso.'] },
  '/mattress-protectors': { en: ['Mattress Protectors in McAllen, TX | Snooze Mattress', 'Mattress protectors in McAllen, TX from Snooze Mattress + Wellness: breathable, waterproof protection from spills and allergens for your mattress.'],
         es: ['Protectores de Colchón en McAllen, TX | Snooze Mattress', 'Protectores de colchón en McAllen, TX de Snooze Mattress + Wellness: protección transpirable e impermeable contra derrames y alérgenos para tu inversión.'] },
  '/premium-sheets': { en: ['Premium Sheets in McAllen, TX | Snooze Mattress', 'The right sheets can transform your sleep. The premium sheets at Snooze Mattress + Wellness in McAllen combine softness, breathability and durability.'],
         es: ['Sábanas Premium en McAllen, TX | Snooze Mattress', 'Las sábanas correctas pueden transformar tu descanso. Las sábanas premium de Snooze Mattress + Wellness en McAllen: suavidad, frescura y durabilidad.'] },
  '/sleep-recliner': { en: ['Sleep Recliner (Zcliner) in McAllen, TX | Snooze Mattress', 'The SleepRecliner (Zcliner®) by Flexsteel, available at Snooze Mattress + Wellness in McAllen: advanced comfort technology with therapeutic positioning.'],
         es: ['Sillón Reclinable Zcliner en McAllen, TX | Snooze Mattress', 'El SleepRecliner (Zcliner®) de Flexsteel, disponible en Snooze Mattress + Wellness en McAllen: tecnología de confort avanzada con posiciones terapéuticas.'] },
  '/at-home-sleep-test-kit-by-sleepcorner': { en: ['At-Home Sleep Test Kit in McAllen, TX | Snooze Mattress', 'The At-Home Sleep Test Kit by SleepCorner at Snooze Mattress + Wellness in McAllen: an FDA-cleared overnight test reviewed by licensed sleep professionals.'],
         es: ['Kit de Prueba de Sueño en Casa en McAllen | Snooze Mattress', 'El Kit de Prueba de Sueño en Casa de SleepCorner en Snooze Mattress + Wellness, McAllen: prueba nocturna aprobada por la FDA y revisada por profesionales.'] },
  '/privacy-policy-page': { en: ['Privacy Policy | Snooze Mattress', 'How Snooze Mattress + Wellness – McAllen collects, uses and shares your personal information when you visit our website, contact us or use our services.'],
         es: ['Política de Privacidad | Snooze Mattress', 'Cómo Snooze Mattress + Wellness – McAllen recopila, usa y comparte tu información personal cuando visitas nuestro sitio web o nos contactas.'] },
  '/terms-conditions-page': { en: ['Terms & Conditions | Snooze Mattress', 'The terms and conditions for using the Snooze Mattress + Wellness – McAllen website. By accessing or using the website, you agree to these terms.'],
         es: ['Términos y Condiciones | Snooze Mattress', 'Los términos y condiciones para usar el sitio web de Snooze Mattress + Wellness – McAllen. Al acceder o usar el sitio web, aceptas estos términos.'] },
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
