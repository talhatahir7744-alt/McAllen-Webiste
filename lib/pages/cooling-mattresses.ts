import type { ContentPage } from './types';
import { LOCATION } from '@/lib/location';

const L = LOCATION;
export const PAGE: ContentPage = {
  slug: '/cooling-mattresses',
  kind: 'product',
  copy: {
    en: {
      title: 'Cooling Mattresses for the RGV — McAllen, TX | Snooze',
      description: 'Cooling mattresses in McAllen, TX for Rio Grande Valley nights: Tempur-Pedic cooling models and the Spring Air Copper Collection, fitted free at Snooze.',
      crumb: 'Cooling Mattresses',
      eyebrow: 'Mattresses by type',
      h1: 'Cooling mattresses for Rio Grande Valley nights',
      intro: [
        'Sleeping warm is a year-round subject in McAllen. If you kick the covers off at 2 a.m. or wake up damp, the mattress is often the reason: a dense surface that traps heat against your body. Snooze Mattress + Wellness carries mattresses designed to move heat away from the sleeper, and the free Dream Mapping fitting makes sure the cooling model you choose also fits your pressure points.',
      ],
      sections: [
        { h2: 'Why a mattress sleeps hot', paragraphs: [
          'Foam that hugs the body also holds the warmth the body gives off, and the deeper you sink the more surface is in contact with you. Cooling designs work on that problem in different ways: open or breathable foams, covers and layers that pull heat away, and coil or hybrid cores that let air move. The feel you want decides which approach fits you.',
        ] },
        { h2: 'Cooling models on the McAllen floor', h3s: [
          { h3: 'Tempur-Pedic', paragraphs: ['Tempur-Pedic’s cooling models bring the brand’s all-night cooling technology to its contouring foam, for sleepers who want the Tempur feel without the warmth.'] },
          { h3: 'Spring Air Copper Collection', paragraphs: ['The Copper Collection by Spring Air pairs copper-infused comfort layers with a supportive core; copper is used in bedding for its ability to conduct heat away from the body.'] },
          { h3: 'Hybrids and innersprings', paragraphs: ['Hybrids from Sealy, Stearns & Foster, Beautyrest, Helix and King Koil put comfort layers over pocketed coils, so air circulates through the core instead of being trapped under you.'] },
        ] },
        { h2: 'Cooling is only half the fitting', paragraphs: [
          'A cool mattress that does not support you is still the wrong mattress. The Dream Mapping bed records your pressure points in about five minutes, and the Sleep Coach shows you the cooling models that also match your map, in the comfort level the map calls for. Pair the mattress with breathable sheets and a pillow chosen for your sleep position, both on the McAllen floor, and the whole bed sleeps cooler.',
        ] },
        { h2: 'Delivery, financing and the guarantee', listStyle: 'facts', bullets: [
          'Free delivery and setup on orders over $999, with haul-away of your old mattress if you no longer need it.',
          'Financing through Synchrony and Wells Fargo, and a lease-to-own option through Snap Finance.',
          'Every purchase at Snooze Mattress + Wellness is backed by the Sleep Comfort Guarantee; ask a Sleep Coach for the details.',
          `Visit ${L.street}, ${L.city}, ${L.region} ${L.postalCode}, ${L.hours.en[0]}, ${L.hours.en[1]}.`,
        ] },
      ],
      faqTitle: 'Cooling mattress questions',
      faqs: [
        { question: 'Which cooling mattresses does Snooze carry?', answer: 'Tempur-Pedic cooling models and the Spring Air Copper Collection, plus hybrids from Sealy, Stearns & Foster, Beautyrest, Helix and King Koil whose coil cores let air move.' },
        { question: 'Does memory foam always sleep hot?', answer: 'Dense foam holds more warmth than coils, which is why cooling versions exist; a Tempur-Pedic cooling model gives the foam feel with less heat.' },
        { question: 'Is a hybrid cooler than an all-foam mattress?', answer: 'Usually, because air circulates through the coil core instead of being trapped under you; the fitting tells you whether a hybrid also suits your pressure points.' },
        { question: 'Can I try the cooling models before buying?', answer: 'Yes. They are on the McAllen showroom floor, and the free Dream Mapping fitting narrows them to the ones that fit how you sleep.' },
        { question: 'Do sheets and pillows matter for sleeping cool?', answer: 'Yes. Breathable sheets and a pillow chosen for your position keep heat from building around you; both are available in store.' },
      ],
      cta: { title: 'Sleep cooler in McAllen', text: 'A free five-minute Dream Mapping fitting shows which cooling mattress also fits your body.', button: 'Book a free fitting' },
    },
    es: {
      title: 'Colchones Frescos para el Valle en McAllen, TX | Snooze',
      description: 'Colchones frescos en McAllen, TX para las noches del Valle: modelos Tempur-Pedic con enfriamiento y la Copper Collection de Spring Air, ajustados gratis.',
      crumb: 'Colchones Frescos',
      eyebrow: 'Colchones por tipo',
      h1: 'Colchones frescos para las noches del Valle del Río Grande',
      intro: [
        'Dormir con calor es tema de todo el año en McAllen. Si pateas las cobijas a las 2 de la mañana o despiertas sudando, muchas veces la causa es el colchón: una superficie densa que atrapa el calor contra tu cuerpo. Snooze Mattress + Wellness tiene colchones diseñados para alejar el calor de quien duerme, y la sesión gratis de Dream Mapping se asegura de que el modelo fresco que elijas también vaya con tus puntos de presión.',
      ],
      sections: [
        { h2: 'Por qué un colchón da calor', paragraphs: [
          'La espuma que abraza el cuerpo también guarda el calor que el cuerpo desprende, y entre más te hundes, más superficie está en contacto contigo. Los diseños frescos atacan ese problema de distintas maneras: espumas abiertas o transpirables, fundas y capas que alejan el calor, y núcleos de resortes o híbridos que dejan circular el aire. La sensación que buscas decide cuál enfoque es para ti.',
        ] },
        { h2: 'Modelos frescos en el piso de McAllen', h3s: [
          { h3: 'Tempur-Pedic', paragraphs: ['Los modelos frescos de Tempur-Pedic traen la tecnología de enfriamiento para toda la noche de la marca a su espuma que se amolda, para quienes quieren la sensación Tempur sin el calor.'] },
          { h3: 'Spring Air Copper Collection', paragraphs: ['La Copper Collection de Spring Air combina capas de confort con cobre y un núcleo de soporte; el cobre se usa en ropa de cama por su capacidad de conducir el calor lejos del cuerpo.'] },
          { h3: 'Híbridos y de resortes', paragraphs: ['Los híbridos de Sealy, Stearns & Foster, Beautyrest, Helix y King Koil ponen capas de confort sobre resortes ensacados, así que el aire circula por el núcleo en lugar de quedar atrapado debajo de ti.'] },
        ] },
        { h2: 'La frescura es solo la mitad del ajuste', paragraphs: [
          'Un colchón fresco que no te da soporte sigue siendo el colchón equivocado. La cama de Dream Mapping registra tus puntos de presión en unos cinco minutos, y el Sleep Coach te muestra los modelos frescos que además coinciden con tu mapa, en el nivel de comodidad que el mapa pide. Combina el colchón con sábanas transpirables y una almohada elegida para tu posición, ambas en el piso de McAllen, y toda la cama duerme más fresca.',
        ] },
        { h2: 'Entrega, financiamiento y garantía', listStyle: 'facts', bullets: [
          'Entrega e instalación gratis en compras mayores de $999, y nos llevamos tu colchón viejo si ya no lo necesitas.',
          'Financiamiento con Synchrony y Wells Fargo, y una opción de renta con opción a compra con Snap Finance.',
          'Toda compra en Snooze Mattress + Wellness está respaldada por la Sleep Comfort Guarantee; pide los detalles a un Sleep Coach.',
          `Visítanos en ${L.street}, ${L.city}, ${L.region} ${L.postalCode}, ${L.hours.es[0]}, ${L.hours.es[1]}.`,
        ] },
      ],
      faqTitle: 'Preguntas sobre colchones frescos',
      faqs: [
        { question: '¿Qué colchones frescos tiene Snooze?', answer: 'Modelos Tempur-Pedic con enfriamiento y la Copper Collection de Spring Air, además de híbridos de Sealy, Stearns & Foster, Beautyrest, Helix y King Koil cuyos núcleos de resortes dejan circular el aire.' },
        { question: '¿El memory foam siempre da calor?', answer: 'La espuma densa guarda más calor que los resortes, por eso existen las versiones frescas; un Tempur-Pedic con enfriamiento da la sensación de espuma con menos calor.' },
        { question: '¿Un híbrido es más fresco que uno de pura espuma?', answer: 'Normalmente sí, porque el aire circula por el núcleo de resortes en lugar de quedar atrapado debajo de ti; el ajuste te dice si un híbrido también va con tus puntos de presión.' },
        { question: '¿Puedo probar los modelos frescos antes de comprar?', answer: 'Sí. Están en la sala de exhibición de McAllen, y la sesión gratis de Dream Mapping los reduce a los que van con tu forma de dormir.' },
        { question: '¿Las sábanas y la almohada importan para dormir fresco?', answer: 'Sí. Unas sábanas transpirables y una almohada elegida para tu posición evitan que el calor se acumule a tu alrededor; ambas están disponibles en tienda.' },
      ],
      cta: { title: 'Duerme más fresco en McAllen', text: 'Una sesión gratis de Dream Mapping de cinco minutos muestra qué colchón fresco también va con tu cuerpo.', button: 'Reservar ajuste gratis' },
    },
  },
};
