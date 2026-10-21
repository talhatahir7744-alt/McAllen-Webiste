/*
 * FAQ answers that lead with a direct sentence (SEO audit build pass, October 2026 — section C2).
 * The generated GoHighLevel pages carry the same 20 questions (English) / 20 (Spanish) in their FAQ accordions, each
 * section twice (desktop + mobile copies), in the static markup and again in the hydration payload (the accordion's
 * custom-code string, plus the builder's original FAQ element strings). This script rewrites each answer from the
 * table below wherever it occurs, keyed by the question text, so the accordion, the payload and the FAQPage schema
 * (regenerated afterwards by scripts/page-schema.mjs) all carry the same answer. Facts stay the ones already on the
 * site: no new prices, terms or claims. Idempotent.  node scripts/faq-direct.mjs  (npm run faq:direct)  [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');

/* question (as shown) -> answer HTML (one or more <p>), per locale */
const ANSWERS = {
  en: {
    'Why choose Snooze Mattress + Wellness in McAllen, TX?': '<p>Because you get the best mattress prices in town through our competitive sales and price matching, a one-of-a-kind Sleep Comfort Guarantee on your new mattress, and a family business that greets you with a smile in our Snooze Blues pajamas. We would be honored to serve you!</p>',
    'Why choose Snooze Mattress + Wellness in McAllen?': '<p>Because you get the best mattress prices in town through our competitive sales and price matching, a one-of-a-kind Sleep Comfort Guarantee on your new mattress, and a family business that greets you with a smile in our Snooze Blues pajamas. We would be honored to serve you!</p>',
    'What is Dream Mapping?': '<p>Dream Mapping is a free five-minute pressure-mapping fitting: it analyzes your pressure points and preferences to recommend the mattress that fits your body.</p>',
    'How long does it take to complete the Dream Mapping process?': '<p>About five minutes. Then our Sleep Coaches take you to only the mattresses that match your body.</p>',
    'Can couples use Dream Mapping?': '<p>Yes. We tailor mattress recommendations for both individuals and couples.</p>',
    'Is there any pressure to buy?': '<p>No. Our Dream Mapping technology takes all of the guesswork out of finding the perfect mattress for you: after you have completed the Dream Map, the technology essentially eliminates around 85% of our products, so you get a true custom-fit mattress for your body.</p>',
    'Do you offer financing?': '<p>Yes. We offer financing through Synchrony, Wells Fargo and Snap Finance (a lease-to-own option), so you can get the sleep you deserve.</p>',
    'What kind of mattresses do you carry?': '<p>All major mattress brands, plus custom-made mattresses available only at Snooze. With a wide variety to choose from, our Sleep Coaches will have no problem finding your perfect mattress.</p>',
    'Do you offer mattress delivery?': '<p>Yes. We deliver and set up your new mattress, free on orders over $999, and haul away your old mattress if you no longer need it.</p>',
    'What financing options do you offer?': '<p>Three: Synchrony Bank, Wells Fargo Bank, N.A., and Snap Finance (a lease-to-own option). This lets us provide solutions for a wide range of credit profiles.</p>',
    'Is financing available with 0% interest?': '<p>Yes, periodically. Our promotional financing options include No Interest If Paid in Full within a promotional period and Equal Monthly Payment plans.</p><p>Important: for deferred interest promotions, if the balance is not paid in full within the promotional period, interest may be charged from the original purchase date. Minimum monthly payments are required. Subject to credit approval. Ask in store for current promotional details.</p>',
    'What if I don’t qualify for traditional financing?': '<p>Snap Finance is the option: a lease-to-own agreement, not a loan, designed for customers who may not qualify for traditional credit. It offers a fast application process and flexible payment options, and early payoff options may be available.</p><p>Total cost of ownership may exceed the original purchase price if payments are made over the full term. Approval is determined directly by Snap Finance.</p>',
    'Does applying affect my credit?': '<p>It may. Applications through Synchrony or Wells Fargo may involve a credit inquiry as determined by the lender; Snap Finance uses its own approval criteria. Approval decisions are made solely by the financing provider.</p>',
    'How long does approval take?': '<p>Usually minutes. Applications are processed within minutes and many customers receive a decision the same day; timing depends on the financing provider and the application details.</p>',
    'Is there a minimum purchase required?': '<p>Sometimes. Some promotional financing offers require a minimum purchase amount; details vary by promotion and lender, so please see the store for current requirements.</p>',
    'Can I pay off my financing early?': '<p>Yes. With traditional financing you may pay off your balance early without penalty (check the lender’s terms). With Snap Finance, early purchase options may be available and can reduce the total cost. See the financing provider for full terms.</p>',
    'Who do I make payments to?': '<p>Directly to the financing provider: Synchrony, Wells Fargo or Snap Finance. Snooze Mattress + Wellness does not collect or service financing payments.</p>',
    'Why finance instead of paying cash?': '<p>Financing lets you upgrade your sleep now, protect your savings, spread payments over time and take advantage of promotional offers. Better sleep impacts your health, recovery and daily performance, and many customers prefer structured payments to delaying the improvement.</p>',
    'Is financing safe?': '<p>Yes. We work with established financing providers who follow industry standards for consumer financing. All approvals, terms and servicing are handled directly by the lender or lease provider; Snooze Mattress + Wellness does not make credit decisions.</p>',
    'How do I apply?': '<p>In store with a sleep specialist, online where the option is enabled, or by asking about financing during your visit. Our team will walk you through the best option for your needs.</p>',
  },
  es: {
    '¿Por qué elegir Snooze Mattress + Wellness en McAllen, TX?': '<p>Porque tienes los mejores precios de colchones de la ciudad gracias a nuestras ofertas competitivas y a que igualamos precios, una Garantía de Confort de Sueño única para tu colchón nuevo, y un negocio familiar que te recibe con una sonrisa en nuestras pijamas Snooze Blues. ¡Sería un honor atenderte!</p>',
    '¿Por qué elegir Snooze Mattress + Wellness en McAllen?': '<p>Porque tienes los mejores precios de colchones de la ciudad gracias a nuestras ofertas competitivas y a que igualamos precios, una Garantía de Confort de Sueño única para tu colchón nuevo, y un negocio familiar que te recibe con una sonrisa en nuestras pijamas Snooze Blues. ¡Sería un honor atenderte!</p>',
    '¿Qué es Dream Mapping?': '<p>Dream Mapping es un ajuste gratis de unos cinco minutos sobre una cama con sensores de presión: analiza tus puntos de presión y tus preferencias para recomendarte el colchón que va con tu cuerpo.</p>',
    '¿Cuánto tiempo toma completar el proceso de Dream Mapping?': '<p>Unos cinco minutos. Después, nuestros Sleep Coaches te llevan únicamente a los colchones que coinciden con tu cuerpo.</p>',
    '¿Las parejas pueden usar Dream Mapping?': '<p>Sí. Personalizamos las recomendaciones de colchón tanto para personas que duermen solas como para parejas.</p>',
    '¿Hay presión para comprar?': '<p>No. Nuestra tecnología Dream Mapping elimina las adivinanzas al buscar el colchón perfecto para ti: una vez que completas tu Dream Map, la tecnología descarta prácticamente el 85% de nuestros productos, así que obtienes un colchón verdaderamente a la medida de tu cuerpo.</p>',
    '¿Ofrecen financiamiento?': '<p>Sí. Ofrecemos financiamiento con Synchrony, Wells Fargo y Snap Finance (renta con opción a compra), para que consigas el sueño que mereces.</p>',
    '¿Qué tipo de colchones manejan?': '<p>Todas las principales marcas de colchones, además de colchones hechos a la medida disponibles únicamente en Snooze. Con una amplia variedad para elegir, nuestros Sleep Coaches no tendrán ningún problema en encontrar tu colchón perfecto.</p>',
    '¿Ofrecen entrega de colchones?': '<p>Sí. Entregamos e instalamos tu colchón nuevo, gratis en compras mayores de $999, y nos llevamos tu colchón viejo si ya no lo necesitas.</p>',
    '¿Qué opciones de financiamiento ofrecen?': '<p>Tres: Synchrony Bank, Wells Fargo Bank, N.A. y Snap Finance (renta con opción a compra). Esto nos permite ofrecer soluciones para una amplia variedad de perfiles de crédito.</p>',
    '¿Hay financiamiento disponible con 0% de interés?': '<p>Sí, por temporadas. Nuestras opciones de financiamiento promocional incluyen Sin Intereses Si se Paga en su Totalidad dentro del periodo promocional y Planes de Pagos Mensuales Iguales.</p><p>Importante: en las promociones con interés diferido, si el saldo no se paga en su totalidad dentro del periodo promocional, se podrán cobrar intereses desde la fecha original de compra. Se requieren pagos mínimos mensuales. Sujeto a aprobación de crédito. Pregunta en tienda por los detalles vigentes.</p>',
    '¿Qué pasa si no califico para el financiamiento tradicional?': '<p>Snap Finance es la opción: un contrato de renta con opción a compra, no un préstamo, diseñado para clientes que quizá no califiquen para un crédito tradicional. Ofrece un proceso de solicitud rápido y opciones de pago flexibles, y puede haber opciones de liquidación anticipada.</p><p>El costo total puede superar el precio original de compra si los pagos se realizan durante todo el plazo. La aprobación la determina directamente Snap Finance.</p>',
    '¿Solicitar financiamiento afecta mi crédito?': '<p>Puede ser. Las solicitudes a través de Synchrony o Wells Fargo pueden implicar una consulta de crédito, según lo determine el prestamista; Snap Finance utiliza sus propios criterios de aprobación. Las decisiones de aprobación las toma únicamente el proveedor de financiamiento.</p>',
    '¿Cuánto tarda la aprobación?': '<p>Normalmente minutos. Las solicitudes se procesan en minutos y muchos clientes reciben una respuesta el mismo día; el tiempo depende del proveedor de financiamiento y de los detalles de la solicitud.</p>',
    '¿Se requiere una compra mínima?': '<p>A veces. Algunas ofertas de financiamiento promocional requieren un monto mínimo de compra; los detalles varían según la promoción y el prestamista, así que visita la tienda para conocer los requisitos vigentes.</p>',
    '¿Puedo liquidar mi financiamiento antes de tiempo?': '<p>Sí. Con el financiamiento tradicional puedes liquidar tu saldo antes de tiempo sin penalización (consulta los términos del prestamista). Con Snap Finance puede haber opciones de compra anticipada que reducen el costo total. Consulta los términos completos con el proveedor de financiamiento.</p>',
    '¿A quién le hago los pagos?': '<p>Directamente al proveedor de financiamiento: Synchrony, Wells Fargo o Snap Finance. Snooze Mattress + Wellness no cobra ni administra los pagos de financiamiento.</p>',
    '¿Por qué financiar en lugar de pagar de contado?': '<p>El financiamiento te permite mejorar tu descanso hoy mismo, proteger tus ahorros, distribuir los pagos a lo largo del tiempo y aprovechar las ofertas promocionales. Dormir mejor impacta tu salud, tu recuperación y tu rendimiento diario, y muchos clientes prefieren pagos estructurados en lugar de posponer la mejora.</p>',
    '¿Es seguro el financiamiento?': '<p>Sí. Trabajamos con proveedores de financiamiento establecidos que siguen los estándares de la industria para el crédito al consumidor. Todas las aprobaciones, los términos y la administración los maneja directamente el prestamista o el proveedor de arrendamiento; Snooze Mattress + Wellness no toma decisiones de crédito.</p>',
    '¿Cómo solicito el financiamiento?': '<p>En tienda con un especialista en sueño, en línea cuando la opción está disponible, o preguntando por el financiamiento durante tu visita. Nuestro equipo te guiará hacia la mejor opción según tus necesidades.</p>',
  },
};

const norm = (q) => q.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
const TABLE = { en: new Map(), es: new Map() };
for (const loc of ['en', 'es']) for (const [q, a] of Object.entries(ANSWERS[loc])) TABLE[loc].set(norm(q), a);
const toText = (html) => html.replace(/<p><\/p>/g, '').replace(/<\/p>\s*<p>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/* accordion markup (overrides/faq-accordion.html via scripts/convert.mjs): question in the button's <span>, answer in .snz-faq__a */
const ITEM = /(<button type="button" class="snz-faq__btn[^"]*"[^>]*><span>)([^<]*)(<\/span>[\s\S]*?<div class="snz-faq__a">)([\s\S]*?)(<\/div>)/g;
function rewriteAccordion(html, table, seen, unknown) {
  return html.replace(ITEM, (m, pre, q, mid, oldA, post) => {
    const next = table.get(norm(q));
    if (!next) { unknown.add(q); return m; }
    if (/<div/.test(oldA)) throw new Error('unexpected nested markup in answer for: ' + q);
    seen.set(oldA, next);
    return pre + q + mid + next + post;
  });
}

const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts') files.push(p); } })(path.join(ROOT, 'app'));
let changedFiles = 0; const unknown = new Set(); let totalItems = 0, totalOrphans = 0;
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/'); const loc = rel.startsWith('app/es/') ? 'es' : 'en';
  const s = fs.readFileSync(file, 'utf8'); const bodyM = s.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) continue;
  const body = JSON.parse(bodyM[1]); if (!body.includes('snz-faq__a')) continue;
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  const markup = pm ? body.replace(pm[0], '\u0000PAYLOAD\u0000') : body;
  const seen = new Map(); // old answer HTML -> new answer HTML (for the builder's orphaned FAQ element strings)
  const newMarkup = rewriteAccordion(markup, TABLE[loc], seen, unknown);
  const items = (newMarkup.match(ITEM) || []).length; totalItems += items;
  let payload = pm ? pm[0] : ''; let orphans = 0;
  if (pm) {
    const nodes = JSON.parse(pm[2]); let touched = false;
    const oldText = new Map(); for (const [o, n] of seen) oldText.set(toText(o), toText(n));
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]; if (typeof n !== 'string') continue;
      if (n.includes('snz-faq__a')) { const v = rewriteAccordion(n, TABLE[loc], seen, unknown); if (v !== n) { nodes[i] = v; touched = true; } continue; }
      // the builder's original FAQ element answer (HTML) and its plain-text copy: whole-string matches only, so a
      // string shared with anything else is never touched (devalue deduplicates strings)
      if (seen.has(n)) { nodes[i] = seen.get(n); touched = true; orphans++; continue; }
      const t = n.replace(/\s+/g, ' ').trim(); if (oldText.has(t)) { nodes[i] = oldText.get(t); touched = true; orphans++; }
    }
    // the builder's FAQ schema data (Question -> acceptedAnswer -> text), disconnected from the page by
    // scripts/page-schema.mjs but still in the payload: matched structurally by the question text
    for (const n of nodes) {
      if (!n || typeof n !== 'object' || Array.isArray(n) || typeof n.name !== 'number' || typeof n.acceptedAnswer !== 'number') continue;
      const next = typeof nodes[n.name] === 'string' && TABLE[loc].get(norm(nodes[n.name])); const ans = nodes[n.acceptedAnswer];
      if (!next || !ans || typeof ans !== 'object' || typeof ans.text !== 'number' || typeof nodes[ans.text] !== 'string') continue;
      const v = toText(next); if (nodes[ans.text] !== v) { nodes[ans.text] = v; touched = true; orphans++; }
    }
    if (touched) payload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3];
  }
  totalOrphans += orphans;
  const next = pm ? newMarkup.replace('\u0000PAYLOAD\u0000', () => payload) : newMarkup;
  if (next !== body) { changedFiles++; if (!CHECK) fs.writeFileSync(file, s.replace(bodyM[1], () => JSON.stringify(next))); }
  console.log(`  ${rel.padEnd(52)} ${String(items).padStart(2)} accordion items, ${orphans} builder strings${next !== body ? '' : ' (no change)'}`);
}
if (unknown.size) console.log('questions without a rewrite:', [...unknown]);
console.log(`${files.length} pages, ${totalItems} accordion items, ${totalOrphans} builder strings; ${changedFiles} files ${CHECK ? 'would change' : 'changed'}`);
