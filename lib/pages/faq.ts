import type { ContentPage, Faq } from './types';
import { LOCATION } from '@/lib/location';

/* The dedicated FAQ page: every question the site already answers (the shared store FAQ and the financing FAQ),
   grouped by topic, each answer leading with a direct sentence; the facts are the site's own. The FAQPage JSON-LD
   is generated from these items by components/ContentPage.tsx. */
const L = LOCATION;
type Group = { h2: string; faqs: Faq[] };
const EN: Group[] = [
  { h2: 'Dream Mapping', faqs: [
    { question: 'What is Dream Mapping?', answer: 'Dream Mapping is a free in-store fitting that reads your pressure points on a sensor bed and recommends the mattresses that fit your body.' },
    { question: 'How long does it take to complete the Dream Mapping process?', answer: 'About five minutes. Afterwards a Sleep Coach takes you only to the mattresses that match your body.' },
    { question: 'Can couples use Dream Mapping?', answer: 'Yes. Each of you is mapped individually, and the recommendation accounts for both profiles.' },
    { question: 'Is there any pressure to buy?', answer: 'No. The Sleep Coaches are not on commission, and you can leave with your results and come back another day.' },
    { question: 'Do I need an appointment?', answer: 'No. Walk-ins are welcome during store hours, but booking online guarantees a Sleep Coach is ready when you arrive.' },
    { question: 'What is the difference between Dream Mapping and the Sleep Fit Quiz?', answer: 'The quiz is a 60-second online questionnaire; Dream Mapping is the in-store measurement on the sensor bed. The quiz is a first step, the map is the fitting.' },
  ] },
  { h2: 'The store', faqs: [
    { question: 'Where is Snooze Mattress + Wellness?', answer: `At ${L.street}, ${L.city}, ${L.region} ${L.postalCode}, open ${L.hours.en[0]} and ${L.hours.en[1]}; call ${L.phone}.` },
    { question: 'Why choose Snooze Mattress + Wellness in McAllen, TX?', answer: 'Because the fitting is measured, not guessed: a free Dream Mapping scan, Sleep Coaches who are not on commission, competitive sales, the Sleep Comfort Guarantee on your new mattress, and a family business that will be honored to serve you.' },
    { question: 'What kind of mattresses do you carry?', answer: 'All the major brands, including Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, Helix, Puffy, King Koil, Brooklyn Bedding and Spring Air, plus the Snooze-O-Pedic line available only at Snooze.' },
    { question: 'Do you sell adjustable bases, pillows, protectors and sheets?', answer: 'Yes. Adjustable bases, pillows, mattress protectors, premium sheets, massage chairs and the Zcliner sleep recliner are all in the McAllen showroom.' },
    { question: 'Do you offer mattress delivery?', answer: 'Yes. We deliver and set up your new mattress, free on orders over $999, and haul away your old mattress if you no longer need it.' },
  ] },
  { h2: 'Financing', faqs: [
    { question: 'Do you offer financing?', answer: 'Yes. Financing is available through Synchrony and Wells Fargo, and Snap Finance offers a lease-to-own option.' },
    { question: 'What financing options do you offer?', answer: 'Synchrony Bank, Wells Fargo Bank, N.A., and Snap Finance (a lease-to-own option), which together cover a wide range of credit profiles.' },
    { question: 'Is financing available with 0% interest?', answer: 'Promotional financing is offered periodically, including no interest if paid in full within a promotional period and equal-monthly-payment plans. For deferred-interest promotions, if the balance is not paid in full within the period, interest may be charged from the original purchase date; minimum monthly payments are required and approval is subject to credit. Ask in store for current details.' },
    { question: 'What if I don’t qualify for traditional financing?', answer: 'Snap Finance offers a lease-to-own option. It is not a loan but a lease-to-own agreement for customers who may not qualify for traditional credit, with a fast application, flexible payments and possible early-payoff options; the total cost may exceed the purchase price over the full term, and approval is determined by Snap Finance.' },
    { question: 'Does applying affect my credit?', answer: 'It may. Applications through Synchrony or Wells Fargo can involve a credit inquiry as determined by the lender; Snap Finance uses its own approval criteria. Approval decisions are made solely by the financing provider.' },
    { question: 'How long does approval take?', answer: 'Usually minutes. Applications are processed within minutes in most cases and many customers receive a decision the same day; timing depends on the provider and the application.' },
    { question: 'Is there a minimum purchase required?', answer: 'Sometimes. Some promotional financing offers require a minimum purchase; details vary by promotion and lender, so ask in store for current requirements.' },
    { question: 'Can I pay off my financing early?', answer: 'Yes. Traditional financing can be paid off early without penalty (check the lender’s terms), and Snap Finance may offer early purchase options that reduce the total cost; see the provider for full terms.' },
    { question: 'Who do I make payments to?', answer: 'Directly to the financing provider, Synchrony, Wells Fargo or Snap Finance; Snooze Mattress + Wellness does not collect or service financing payments.' },
    { question: 'Why finance instead of paying cash?', answer: 'Financing lets you upgrade your sleep now, protect your savings, spread payments over time and take advantage of promotional offers; many customers prefer structured payments to delaying a better night’s sleep.' },
    { question: 'Is financing safe?', answer: 'Yes. The providers are established companies that follow industry standards for consumer financing, and all approvals, terms and servicing are handled directly by the lender or lease provider; Snooze Mattress + Wellness does not make credit decisions.' },
    { question: 'How do I apply?', answer: 'In store with a sleep specialist, during your visit, or online where the provider offers it; the team walks you through the best option for your needs.' },
  ] },
];
const ES: Group[] = [
  { h2: 'Dream Mapping', faqs: [
    { question: '¿Qué es Dream Mapping?', answer: 'Dream Mapping es un ajuste gratis en tienda que lee tus puntos de presión en una cama con sensores y recomienda los colchones que van con tu cuerpo.' },
    { question: '¿Cuánto tiempo toma completar el proceso de Dream Mapping?', answer: 'Unos cinco minutos. Después, un Sleep Coach te lleva únicamente a los colchones que coinciden con tu cuerpo.' },
    { question: '¿Las parejas pueden usar Dream Mapping?', answer: 'Sí. Cada uno se mapea por separado y la recomendación toma en cuenta los dos perfiles.' },
    { question: '¿Hay presión para comprar?', answer: 'No. Los Sleep Coaches no trabajan por comisión, y puedes irte con tus resultados y volver otro día.' },
    { question: '¿Necesito cita?', answer: 'No. Puedes llegar sin cita en horario de tienda, pero reservar en línea garantiza que un Sleep Coach esté listo cuando llegues.' },
    { question: '¿Cuál es la diferencia entre Dream Mapping y el Sleep Fit Quiz?', answer: 'El quiz es un cuestionario en línea de 60 segundos; Dream Mapping es la medición en tienda sobre la cama con sensores. El quiz es un primer paso, el mapa es el ajuste.' },
  ] },
  { h2: 'La tienda', faqs: [
    { question: '¿Dónde está Snooze Mattress + Wellness?', answer: `En ${L.street}, ${L.city}, ${L.region} ${L.postalCode}, abierto ${L.hours.es[0]} y ${L.hours.es[1]}; llama al ${L.phone}.` },
    { question: '¿Por qué elegir Snooze Mattress + Wellness en McAllen, TX?', answer: 'Porque el ajuste se mide, no se adivina: un escaneo gratis de Dream Mapping, Sleep Coaches que no trabajan por comisión, ofertas competitivas, la Sleep Comfort Guarantee en tu colchón nuevo, y un negocio familiar al que le honraría atenderte.' },
    { question: '¿Qué tipo de colchones manejan?', answer: 'Todas las principales marcas, incluidas Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, Helix, Puffy, King Koil, Brooklyn Bedding y Spring Air, además de la línea Snooze-O-Pedic, disponible únicamente en Snooze.' },
    { question: '¿Venden bases ajustables, almohadas, protectores y sábanas?', answer: 'Sí. Bases ajustables, almohadas, protectores de colchón, sábanas premium, sillas de masaje y el sillón reclinable Zcliner están en la sala de exhibición de McAllen.' },
    { question: '¿Ofrecen entrega de colchones?', answer: 'Sí. Entregamos e instalamos tu colchón nuevo, gratis en compras mayores de $999, y nos llevamos tu colchón viejo si ya no lo necesitas.' },
  ] },
  { h2: 'Financiamiento', faqs: [
    { question: '¿Ofrecen financiamiento?', answer: 'Sí. Hay financiamiento con Synchrony y Wells Fargo, y Snap Finance ofrece una opción de renta con opción a compra.' },
    { question: '¿Qué opciones de financiamiento ofrecen?', answer: 'Synchrony Bank, Wells Fargo Bank, N.A. y Snap Finance (renta con opción a compra), que en conjunto cubren una amplia variedad de perfiles de crédito.' },
    { question: '¿Hay financiamiento disponible con 0% de interés?', answer: 'Periódicamente hay financiamiento promocional, que incluye sin intereses si se paga en su totalidad dentro del periodo promocional y planes de pagos mensuales iguales. En las promociones con interés diferido, si el saldo no se paga en su totalidad dentro del periodo, se pueden cobrar intereses desde la fecha original de compra; se requieren pagos mínimos mensuales y la aprobación está sujeta a crédito. Pregunta en tienda por los detalles vigentes.' },
    { question: '¿Qué pasa si no califico para el financiamiento tradicional?', answer: 'Snap Finance ofrece una opción de renta con opción a compra. No es un préstamo sino un contrato de renta con opción a compra para clientes que quizá no califiquen para un crédito tradicional, con solicitud rápida, pagos flexibles y posibles opciones de liquidación anticipada; el costo total puede superar el precio de compra si se paga durante todo el plazo, y la aprobación la determina Snap Finance.' },
    { question: '¿Solicitar financiamiento afecta mi crédito?', answer: 'Puede. Las solicitudes a través de Synchrony o Wells Fargo pueden implicar una consulta de crédito, según lo determine el prestamista; Snap Finance usa sus propios criterios. Las decisiones de aprobación las toma únicamente el proveedor de financiamiento.' },
    { question: '¿Cuánto tarda la aprobación?', answer: 'Normalmente minutos. En la mayoría de los casos las solicitudes se procesan en minutos y muchos clientes reciben respuesta el mismo día; el tiempo depende del proveedor y de la solicitud.' },
    { question: '¿Se requiere una compra mínima?', answer: 'A veces. Algunas ofertas de financiamiento promocional requieren un monto mínimo de compra; los detalles varían según la promoción y el prestamista, así que pregunta en tienda por los requisitos vigentes.' },
    { question: '¿Puedo liquidar mi financiamiento antes de tiempo?', answer: 'Sí. El financiamiento tradicional se puede liquidar antes de tiempo sin penalización (consulta los términos del prestamista), y Snap Finance puede ofrecer opciones de compra anticipada que reducen el costo total; consulta los términos completos con el proveedor.' },
    { question: '¿A quién le hago los pagos?', answer: 'Directamente al proveedor de financiamiento, Synchrony, Wells Fargo o Snap Finance; Snooze Mattress + Wellness no cobra ni administra los pagos de financiamiento.' },
    { question: '¿Por qué financiar en lugar de pagar de contado?', answer: 'El financiamiento te permite mejorar tu descanso hoy, proteger tus ahorros, distribuir los pagos en el tiempo y aprovechar las ofertas promocionales; muchos clientes prefieren pagos estructurados a posponer dormir mejor.' },
    { question: '¿Es seguro el financiamiento?', answer: 'Sí. Los proveedores son empresas establecidas que siguen los estándares de la industria para el crédito al consumidor, y todas las aprobaciones, términos y administración los maneja directamente el prestamista o el proveedor de arrendamiento; Snooze Mattress + Wellness no toma decisiones de crédito.' },
    { question: '¿Cómo solicito el financiamiento?', answer: 'En tienda con un especialista en sueño, durante tu visita, o en línea donde el proveedor lo permita; el equipo te guía hacia la mejor opción según tus necesidades.' },
  ] },
];
const flat = (g: Group[]) => g.flatMap((x) => x.faqs);
export const PAGE: ContentPage = {
  slug: '/faq',
  kind: 'faq',
  copy: {
    en: {
      title: 'FAQ — Snooze Mattress + Wellness, McAllen, TX',
      description: 'Answers to what McAllen shoppers ask Snooze: Dream Mapping, the store and its brands, delivery, and financing with Synchrony, Wells Fargo and Snap.',
      crumb: 'FAQ',
      eyebrow: 'Questions and answers',
      h1: 'Frequently asked questions',
      intro: ['Everything shoppers ask before and during a visit to Snooze Mattress + Wellness in McAllen, grouped by topic. Each answer starts with the short version; the pages linked from the footer have the detail.'],
      sections: [],
      faqTitle: 'All questions',
      faqs: flat(EN),
      faqGroups: EN,
      cta: { title: 'Still have a question?', text: `Call ${L.phone} or come by ${L.street}, ${L.city}; a Sleep Coach will answer it in person, and a free Dream Mapping fitting takes about five minutes.`, button: 'Book a free fitting' },
    },
    es: {
      title: 'Preguntas Frecuentes | Snooze Mattress + Wellness McAllen',
      description: 'Respuestas a lo que preguntan los clientes de McAllen a Snooze: Dream Mapping, la tienda y sus marcas, la entrega y el financiamiento.',
      crumb: 'Preguntas frecuentes',
      eyebrow: 'Preguntas y respuestas',
      h1: 'Preguntas frecuentes',
      intro: ['Todo lo que los clientes preguntan antes y durante una visita a Snooze Mattress + Wellness en McAllen, agrupado por tema. Cada respuesta empieza con la versión corta; las páginas enlazadas en el pie tienen el detalle.'],
      sections: [],
      faqTitle: 'Todas las preguntas',
      faqs: flat(ES),
      faqGroups: ES,
      cta: { title: '¿Te queda alguna duda?', text: `Llama al ${L.phone} o pasa por ${L.street}, ${L.city}; un Sleep Coach te la responde en persona, y una sesión gratis de Dream Mapping tarda unos cinco minutos.`, button: 'Reservar ajuste gratis' },
    },
  },
};
export const FAQ_GROUPS = { en: EN, es: ES };
