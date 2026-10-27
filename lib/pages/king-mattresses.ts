import type { ContentPage } from './types';
import { LOCATION } from '@/lib/location';

const L = LOCATION;
export const PAGE: ContentPage = {
  slug: '/king-mattresses',
  kind: 'product',
  copy: {
    en: {
      title: 'King Mattresses in McAllen: Room for Two | Snooze Mattress',
      description: 'King and split king mattresses in McAllen, TX from Tempur-Pedic, Sealy, Beautyrest, King Koil and more, fitted to both of you with free Dream Mapping.',
      crumb: 'King Mattresses',
      eyebrow: 'Mattresses by size',
      h1: 'King mattresses in McAllen, TX',
      intro: [
        'A standard king mattress is 76 inches wide and 80 inches long: sixteen inches wider than a queen, so each of two sleepers gets the width of a twin to themselves. At Snooze Mattress + Wellness in McAllen you can compare king models from the brands on the showroom floor and let a free Dream Mapping fitting match the mattress to both of your bodies.',
      ],
      sections: [
        { h2: 'King, California king and split king', paragraphs: [
          'A king (76 by 80 inches) is the widest standard size. A California king trades four inches of width for four inches of length (72 by 84 inches), which taller sleepers prefer. A split king is two twin XL mattresses (38 by 80 inches each) side by side in a king frame, so each side can be a different comfort level and, on an adjustable base, a different position.',
          'A king needs a bedroom of roughly 12 by 12 feet to leave walking room and space for nightstands. Measure the doorway and the stairs as well: a one-piece king mattress is the hardest size to move, which is one more reason couples choose a split king.',
          'For every size side by side, with room sizes and tips for couples and guests, see our [mattress size guide](/blog/mattress-size-guide-mcallen).',
        ] },
        { h2: 'Why couples choose a king at Snooze', paragraphs: [
          'Two people rarely need the same mattress. Dream Mapping maps each of you individually, and the Sleep Coach uses both profiles to find a king that works for both, or a split king where each side is fitted separately. Adjustable bases with customizable head and foot positioning are available for king and split king setups, which couples with different reading or snoring habits appreciate.',
          'The showroom carries Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, Helix, Puffy, King Koil, Brooklyn Bedding, Spring Air and Snooze-O-Pedic. Ask a Sleep Coach which models are on the floor in king and split king.',
        ] },
        { h2: 'The fitting takes five minutes', paragraphs: [
          'Lie down on the Dream Mapping bed in your usual position, let the sensors read your pressure points, and walk with the Sleep Coach to the king mattresses that fit the map. The fitting is free, there is no obligation to buy, and the Sleep Coaches are not on commission.',
        ] },
        { h2: 'Delivery, financing and the guarantee', listStyle: 'facts', bullets: [
          'Free delivery and setup on orders over $999, with haul-away of your old mattress if you no longer need it.',
          'Financing through Synchrony and Wells Fargo, and a lease-to-own option through Snap Finance.',
          'Every purchase at Snooze Mattress + Wellness is backed by the Sleep Comfort Guarantee; ask a Sleep Coach for the details.',
          `Visit ${L.street}, ${L.city}, ${L.region} ${L.postalCode}, ${L.hours.en[0]}, ${L.hours.en[1]}.`,
        ] },
      ],
      faqTitle: 'King mattress questions',
      faqs: [
        { question: 'How big is a king mattress?', answer: 'A standard king is 76 inches wide by 80 inches long; a California king is 72 by 84 inches.' },
        { question: 'What is a split king?', answer: 'Two twin XL mattresses (38 by 80 inches each) placed side by side in a king frame, so each side can have its own comfort level and, on an adjustable base, its own position.' },
        { question: 'Will a king fit in my bedroom?', answer: 'A king suits a room of about 12 by 12 feet or larger once you allow for nightstands and walking space; measure the doorway and stairs too, or choose a split king, which moves in two pieces.' },
        { question: 'Can two people with different needs share a king?', answer: 'Yes. Dream Mapping maps each of you individually, and a split king lets each side be fitted separately.' },
        { question: 'Do you deliver and set up king mattresses?', answer: 'Yes. Delivery and setup are free on orders over $999, and we can haul away your old mattress.' },
      ],
      cta: { title: 'Try king mattresses in McAllen', text: 'A free Dream Mapping fitting for both of you shows which king or split king fits the way each of you sleeps.', button: 'Book a free fitting' },
    },
    es: {
      title: 'Colchones King en McAllen, TX | Snooze Mattress',
      description: 'Colchones king y split king en McAllen, TX de Tempur-Pedic, Sealy, Beautyrest, King Koil y más, ajustados a los dos con Dream Mapping gratis.',
      crumb: 'Colchones King',
      eyebrow: 'Colchones por tamaño',
      h1: 'Colchones king en McAllen, TX',
      intro: [
        'Un colchón king estándar mide 76 pulgadas de ancho por 80 de largo: dieciséis pulgadas más ancho que un queen, así que cada uno de los dos tiene para sí el ancho de un twin. En Snooze Mattress + Wellness en McAllen puedes comparar modelos king de las marcas de la sala de exhibición y dejar que una sesión gratis de Dream Mapping ajuste el colchón a los cuerpos de los dos.',
      ],
      sections: [
        { h2: 'King, California king y split king', paragraphs: [
          'Un king (76 por 80 pulgadas) es el tamaño estándar más ancho. Un California king cambia cuatro pulgadas de ancho por cuatro de largo (72 por 84 pulgadas), que las personas altas prefieren. Un split king son dos colchones twin XL (38 por 80 pulgadas cada uno) lado a lado en una base king, así que cada lado puede tener un nivel de comodidad distinto y, sobre una base ajustable, una posición distinta.',
          'Un king necesita una recámara de unos 12 por 12 pies para dejar paso y lugar para los burós. Mide también la puerta y la escalera: un colchón king de una pieza es el tamaño más difícil de mover, una razón más por la que las parejas eligen un split king.',
          'Para ver todos los tamaños lado a lado, con medidas de recámara y consejos para parejas y visitas, lee nuestra [guía de tamaños de colchón](/es/blog/guia-tamanos-de-colchon-mcallen).',
        ] },
        { h2: 'Por qué las parejas eligen un king en Snooze', paragraphs: [
          'Dos personas rara vez necesitan el mismo colchón. Dream Mapping mapea a cada uno por separado, y el Sleep Coach usa los dos perfiles para encontrar un king que funcione para ambos, o un split king en el que cada lado se ajusta aparte. Hay bases ajustables con posición de cabeza y pies personalizable para king y split king, algo que agradecen las parejas con distintos hábitos de lectura o de ronquidos.',
          'La sala de exhibición tiene Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, Helix, Puffy, King Koil, Brooklyn Bedding, Spring Air y Snooze-O-Pedic. Pregunta a un Sleep Coach qué modelos están en piso en king y split king.',
        ] },
        { h2: 'El ajuste tarda cinco minutos', paragraphs: [
          'Recuéstate en la cama de Dream Mapping en tu posición habitual, deja que los sensores lean tus puntos de presión y camina con el Sleep Coach hacia los colchones king que van con el mapa. El ajuste es gratis, no hay obligación de comprar y los Sleep Coaches no trabajan por comisión.',
        ] },
        { h2: 'Entrega, financiamiento y garantía', listStyle: 'facts', bullets: [
          'Entrega e instalación gratis en compras mayores de $999, y nos llevamos tu colchón viejo si ya no lo necesitas.',
          'Financiamiento con Synchrony y Wells Fargo, y una opción de renta con opción a compra con Snap Finance.',
          'Toda compra en Snooze Mattress + Wellness está respaldada por la Sleep Comfort Guarantee; pide los detalles a un Sleep Coach.',
          `Visítanos en ${L.street}, ${L.city}, ${L.region} ${L.postalCode}, ${L.hours.es[0]}, ${L.hours.es[1]}.`,
        ] },
      ],
      faqTitle: 'Preguntas sobre colchones king',
      faqs: [
        { question: '¿Cuánto mide un colchón king?', answer: 'Un king estándar mide 76 pulgadas de ancho por 80 de largo; un California king mide 72 por 84 pulgadas.' },
        { question: '¿Qué es un split king?', answer: 'Dos colchones twin XL (38 por 80 pulgadas cada uno) colocados lado a lado en una base king, de modo que cada lado puede tener su propio nivel de comodidad y, sobre una base ajustable, su propia posición.' },
        { question: '¿Un king cabe en mi recámara?', answer: 'Un king va bien en una recámara de unos 12 por 12 pies o más, contando burós y espacio para caminar; mide también la puerta y la escalera, o elige un split king, que se mueve en dos piezas.' },
        { question: '¿Dos personas con necesidades distintas pueden compartir un king?', answer: 'Sí. Dream Mapping mapea a cada uno por separado, y un split king permite ajustar cada lado aparte.' },
        { question: '¿Entregan e instalan colchones king?', answer: 'Sí. La entrega e instalación son gratis en compras mayores de $999, y podemos llevarnos tu colchón viejo.' },
      ],
      cta: { title: 'Prueba colchones king en McAllen', text: 'Una sesión gratis de Dream Mapping para los dos muestra qué king o split king va con la forma de dormir de cada uno.', button: 'Reservar ajuste gratis' },
    },
  },
};
