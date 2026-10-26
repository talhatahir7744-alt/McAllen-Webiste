import type { ContentPage } from './types';
import { LOCATION } from '@/lib/location';

const L = LOCATION;
export const PAGE: ContentPage = {
  slug: '/full-twin-mattresses',
  kind: 'product',
  copy: {
    en: {
      title: 'Full & Twin Mattresses in McAllen, TX | Snooze',
      description: 'Twin, twin XL and full mattresses in McAllen, TX for kids, guest rooms and smaller bedrooms, from the brands at Snooze, fitted with free Dream Mapping.',
      crumb: 'Full & Twin Mattresses',
      eyebrow: 'Mattresses by size',
      h1: 'Full and twin mattresses in McAllen, TX',
      intro: [
        'Twin, twin XL and full are the sizes for kids’ rooms, guest rooms, bunk beds, dorms and smaller bedrooms, and one of each makes up a split king. Snooze Mattress + Wellness in McAllen carries them from the same brands as the bigger sizes, and the same free Dream Mapping fitting applies: a child or a guest deserves a mattress that fits how they sleep too.',
      ],
      sections: [
        { h2: 'Twin, twin XL or full: the sizes', paragraphs: [
          'A twin is 38 inches wide and 75 inches long, the standard size for a child’s bed, a bunk bed or a daybed. A twin XL adds five inches of length (38 by 80 inches): the size of a dorm bed, the right call for a tall teenager, and the size that pairs up to form a split king on an adjustable base. A full, also called a double, is 54 inches wide and 75 inches long, a generous single bed and a workable size for a guest room where a queen will not fit.',
          'Two adults can share a full, but with only 27 inches each it suits occasional use rather than every night. Couples are usually better served by a queen or a king.',
        ] },
        { h2: 'Who buys which size', listStyle: 'cards', bullets: [
          'Twin: children moving out of a toddler bed, bunk beds, daybeds and trundles.',
          'Twin XL: tall teenagers, dorm rooms, and each half of a split king.',
          'Full: a teenager or an adult sleeping alone, a guest room, a smaller primary bedroom.',
        ] },
        { h2: 'Fitted like every other size', paragraphs: [
          'Smaller sizes get the same fitting as a king. Dream Mapping takes about five minutes on the sensor bed, costs nothing, and shows the Sleep Coach which comfort level and support the sleeper needs, which matters for a growing child as much as for an adult. The showroom carries Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, Helix, Puffy, King Koil, Brooklyn Bedding, Spring Air and Snooze-O-Pedic; ask which models are on the floor in twin, twin XL and full.',
          'Mattress protectors are a sensible addition for kids’ and guest beds: they guard the mattress against spills, stains and allergens while keeping the feel of the mattress.',
        ] },
        { h2: 'Delivery, financing and the guarantee', listStyle: 'facts', bullets: [
          'Free delivery and setup on orders over $999, with haul-away of the old mattress if you no longer need it.',
          'Financing through Synchrony and Wells Fargo, and a lease-to-own option through Snap Finance.',
          'Every purchase at Snooze Mattress + Wellness is backed by the Sleep Comfort Guarantee; ask a Sleep Coach for the details.',
          `Visit ${L.street}, ${L.city}, ${L.region} ${L.postalCode}, ${L.hours.en[0]}, ${L.hours.en[1]}.`,
        ] },
      ],
      faqTitle: 'Full and twin mattress questions',
      faqs: [
        { question: 'What is the difference between a twin and a twin XL?', answer: 'Length: a twin is 38 by 75 inches and a twin XL is 38 by 80 inches, the same length as a queen or king.' },
        { question: 'How big is a full mattress?', answer: 'A full (double) is 54 inches wide by 75 inches long.' },
        { question: 'Is a full mattress big enough for two adults?', answer: 'It works for occasional use, but at 27 inches per person most couples are better served by a queen or a king.' },
        { question: 'Can a child get a Dream Mapping fitting?', answer: 'Yes. The fitting takes about five minutes and shows which comfort and support level fits any sleeper.' },
        { question: 'Which size makes a split king?', answer: 'Two twin XL mattresses side by side in a king frame.' },
      ],
      cta: { title: 'Find the right twin or full in McAllen', text: 'Bring the sleeper in for a free five-minute Dream Mapping fitting and try the smaller sizes on the showroom floor.', button: 'Book a free fitting' },
    },
    es: {
      title: 'Colchones Full y Twin en McAllen, TX | Snooze',
      description: 'Colchones twin, twin XL y full en McAllen, TX para niños, cuartos de visitas y recámaras pequeñas, de las marcas de Snooze, con Dream Mapping gratis.',
      crumb: 'Colchones Full y Twin',
      eyebrow: 'Colchones por tamaño',
      h1: 'Colchones full y twin en McAllen, TX',
      intro: [
        'Twin, twin XL y full son los tamaños para cuartos de niños, cuartos de visitas, literas, dormitorios estudiantiles y recámaras pequeñas, y dos twin XL forman un split king. Snooze Mattress + Wellness en McAllen los tiene de las mismas marcas que los tamaños grandes, y aplica el mismo ajuste gratis de Dream Mapping: un niño o una visita también merece un colchón que vaya con su forma de dormir.',
      ],
      sections: [
        { h2: 'Twin, twin XL o full: los tamaños', paragraphs: [
          'Un twin mide 38 pulgadas de ancho por 75 de largo, el tamaño estándar para la cama de un niño, una litera o un sofá cama. Un twin XL agrega cinco pulgadas de largo (38 por 80): el tamaño de una cama de dormitorio estudiantil, la opción correcta para un adolescente alto y el tamaño que en pareja forma un split king sobre una base ajustable. Un full, también llamado matrimonial, mide 54 pulgadas de ancho por 75 de largo: una cama individual generosa y un tamaño práctico para un cuarto de visitas donde no cabe un queen.',
          'Dos adultos pueden compartir un full, pero con solo 27 pulgadas para cada uno sirve más para uso ocasional que para todas las noches. A las parejas casi siempre les conviene un queen o un king.',
        ] },
        { h2: 'Quién compra cada tamaño', listStyle: 'cards', bullets: [
          'Twin: niños que dejan la cuna, literas, sofás cama y camas nido.',
          'Twin XL: adolescentes altos, dormitorios estudiantiles y cada mitad de un split king.',
          'Full: un adolescente o un adulto que duerme solo, un cuarto de visitas, una recámara principal pequeña.',
        ] },
        { h2: 'Ajustados como cualquier otro tamaño', paragraphs: [
          'Los tamaños chicos reciben el mismo ajuste que un king. Dream Mapping tarda unos cinco minutos en la cama con sensores, no cuesta nada y le muestra al Sleep Coach qué nivel de comodidad y de soporte necesita quien va a dormir ahí, algo que importa tanto para un niño en crecimiento como para un adulto. La sala de exhibición tiene Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, Helix, Puffy, King Koil, Brooklyn Bedding, Spring Air y Snooze-O-Pedic; pregunta qué modelos están en piso en twin, twin XL y full.',
          'Un protector de colchón es una buena adición para camas de niños y de visitas: protege el colchón de derrames, manchas y alérgenos sin cambiar cómo se siente.',
        ] },
        { h2: 'Entrega, financiamiento y garantía', listStyle: 'facts', bullets: [
          'Entrega e instalación gratis en compras mayores de $999, y nos llevamos el colchón viejo si ya no lo necesitas.',
          'Financiamiento con Synchrony y Wells Fargo, y una opción de renta con opción a compra con Snap Finance.',
          'Toda compra en Snooze Mattress + Wellness está respaldada por la Sleep Comfort Guarantee; pide los detalles a un Sleep Coach.',
          `Visítanos en ${L.street}, ${L.city}, ${L.region} ${L.postalCode}, ${L.hours.es[0]}, ${L.hours.es[1]}.`,
        ] },
      ],
      faqTitle: 'Preguntas sobre colchones full y twin',
      faqs: [
        { question: '¿Cuál es la diferencia entre un twin y un twin XL?', answer: 'El largo: un twin mide 38 por 75 pulgadas y un twin XL mide 38 por 80, el mismo largo que un queen o un king.' },
        { question: '¿Cuánto mide un colchón full?', answer: 'Un full (matrimonial) mide 54 pulgadas de ancho por 75 de largo.' },
        { question: '¿Un full alcanza para dos adultos?', answer: 'Sirve para uso ocasional, pero con 27 pulgadas por persona a la mayoría de las parejas les conviene más un queen o un king.' },
        { question: '¿Un niño puede hacerse el ajuste de Dream Mapping?', answer: 'Sí. El ajuste tarda unos cinco minutos y muestra qué nivel de comodidad y soporte va con cualquier persona.' },
        { question: '¿Qué tamaño forma un split king?', answer: 'Dos colchones twin XL lado a lado en una base king.' },
      ],
      cta: { title: 'Encuentra el twin o full correcto en McAllen', text: 'Trae a quien va a dormir ahí a una sesión gratis de Dream Mapping de cinco minutos y prueben los tamaños chicos en la sala de exhibición.', button: 'Reservar ajuste gratis' },
    },
  },
};
