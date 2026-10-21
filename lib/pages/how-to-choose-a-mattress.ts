import type { ContentPage } from './types';
import { LOCATION } from '@/lib/location';

/* The size and comfort tables use standard US mattress dimensions and the five comfort levels the Sleep Fit Quiz
   already uses on the site (Plush, Medium-Soft, Medium, Medium-Firm, Firm) — no prices, no brand comparisons. */
const L = LOCATION;
export const PAGE: ContentPage = {
  slug: '/how-to-choose-a-mattress',
  kind: 'guide',
  copy: {
    en: {
      title: 'How to Choose a Mattress — Sizes, Comfort Levels | Snooze',
      description: 'How to choose a mattress in McAllen: standard sizes, the five comfort levels, sleep position, what to try in the showroom, and free Dream Mapping.',
      crumb: 'How to Choose a Mattress',
      eyebrow: 'Buying guide',
      h1: 'How to choose a mattress',
      intro: [
        'Most people replace a mattress every ten years or so, which means most of us are out of practice when the time comes. This guide covers the four decisions in order: the size, the comfort level, the type of construction, and the extras, and it ends with the shortcut Snooze Mattress + Wellness in McAllen offers for the hardest one: a free Dream Mapping fitting that measures your pressure points instead of guessing.',
      ],
      sections: [
        { h2: '1. Pick the size for the room and the sleepers', paragraphs: [
          'Size is the easy decision, so settle it first. Measure the bedroom, leave room to walk around the bed and open drawers, and check the doorway and stairs the mattress has to pass through. Two adults are comfortable on a queen; couples who want more space, or who sleep very differently, choose a king or a split king. The table below lists the standard sizes.',
        ] },
        { h2: '2. Match the comfort level to how you sleep', paragraphs: [
          'Comfort level is how soft or firm the surface feels. It is not the same as support: a plush mattress can support a spine perfectly well, and a firm one can leave a side sleeper’s shoulder aching. The Sleep Fit Quiz and the Dream Mapping fitting both use five levels, from Plush to Firm.',
          'As a rule of thumb, side sleepers need shoulders and hips to sink in, so they map toward Plush and Medium-Soft; back sleepers sit in the middle; stomach sleepers need the firmest support so the hips do not sag. Weight and age move the answer too, which is why a measurement beats a rule of thumb.',
        ] },
        { h2: '3. Choose the construction', h3s: [
          { h3: 'Memory foam', paragraphs: ['Contours closely, relieves pressure points and absorbs a partner’s movement; dense foam can hold warmth, so cooling versions exist. Tempur-Pedic, Puffy and Snooze-O-Pedic are the foam names on the McAllen floor.'] },
          { h3: 'Hybrid', paragraphs: ['Comfort layers over pocketed coils: a cushioned top with the airflow and bounce of a coil core. Most of the Sealy, Stearns & Foster, Beautyrest, Helix and King Koil models in the showroom are hybrids.'] },
          { h3: 'Innerspring', paragraphs: ['A coil core with a thinner comfort layer: the firmest, most breathable feel, and usually the most budget-friendly.'] },
        ] },
        { h2: '4. Decide on the extras', bullets: [
          'An adjustable base raises the head and feet, helps relieve pressure, reduces snoring and supports a healthier sleep posture; a split king lets each side be set separately.',
          'A mattress protector guards against spills, stains and allergens without changing the feel.',
          'A pillow chosen for your sleep position keeps the neck in line with the spine the mattress is now supporting.',
          'Breathable sheets matter in the Valley: the whole bed sleeps cooler.',
        ] },
        { h2: '5. Try it the measured way', paragraphs: [
          'Lying on a few beds for thirty seconds each tells you which one feels nice in the moment, not which one will hold your spine level for eight hours. The Dream Mapping bed records your pressure points in about five minutes; a Sleep Coach reads the map with you and walks you only to the mattresses that match it. It is free, there is no obligation, and nobody at Snooze is on commission.',
          `Snooze Mattress + Wellness is at ${L.street}, ${L.city}, ${L.region} ${L.postalCode}, open ${L.hours.en[0]} and ${L.hours.en[1]}. Delivery and setup are free on orders over $999, financing is available through Synchrony, Wells Fargo and Snap, and every purchase is backed by the Sleep Comfort Guarantee.`,
        ] },
      ],
      table: {
        caption: 'Standard mattress sizes and who they suit',
        head: ['Size', 'Dimensions', 'Typically for'],
        rows: [
          ['Twin', '38 × 75 in', 'Children, bunk beds, daybeds'],
          ['Twin XL', '38 × 80 in', 'Tall teens, dorms, each half of a split king'],
          ['Full', '54 × 75 in', 'One adult, guest rooms, smaller bedrooms'],
          ['Queen', '60 × 80 in', 'Couples in a standard bedroom; the most common size'],
          ['King', '76 × 80 in', 'Couples who want the width of a twin each'],
          ['California King', '72 × 84 in', 'Taller sleepers who trade width for length'],
          ['Comfort levels', 'Plush · Medium-Soft · Medium · Medium-Firm · Firm', 'Side sleepers lean plush, back sleepers medium, stomach sleepers firm; the fitting decides'],
        ],
      },
      faqTitle: 'Mattress buying questions',
      faqs: [
        { question: 'How often should a mattress be replaced?', answer: 'Most mattresses are replaced after seven to ten years, or sooner if you wake up stiff or can feel the springs or a body impression.' },
        { question: 'What is the most popular mattress size?', answer: 'Queen, 60 by 80 inches: wide enough for two adults in a standard bedroom.' },
        { question: 'Soft or firm, which is better?', answer: 'Neither on its own. The right comfort level depends on your sleep position, weight and pressure points, which the free Dream Mapping fitting measures.' },
        { question: 'What is the difference between a hybrid and memory foam?', answer: 'A hybrid puts comfort layers over pocketed coils for airflow and bounce; memory foam contours more closely and absorbs movement.' },
        { question: 'Can I try before I buy?', answer: 'Yes. Every brand on this page is on the McAllen showroom floor, and the Dream Mapping fitting narrows them to the ones that fit how you sleep.' },
        { question: 'Is the fitting really free?', answer: 'Yes, about five minutes on the sensor bed, with no obligation to buy.' },
      ],
      cta: { title: 'Skip the guesswork', text: 'Book a free Dream Mapping fitting in McAllen and let the pressure map choose the comfort level for you.', button: 'Book a free fitting' },
    },
    es: {
      title: 'Cómo Elegir un Colchón: Tamaños y Comodidad | Snooze',
      description: 'Cómo elegir colchón en McAllen: tamaños estándar, los cinco niveles de comodidad, la posición al dormir y el ajuste gratis de Dream Mapping.',
      crumb: 'Cómo Elegir un Colchón',
      eyebrow: 'Guía de compra',
      h1: 'Cómo elegir un colchón',
      intro: [
        'La mayoría de las personas cambia de colchón cada diez años más o menos, así que casi todos estamos fuera de práctica cuando llega el momento. Esta guía cubre las cuatro decisiones en orden: el tamaño, el nivel de comodidad, el tipo de construcción y los extras, y termina con el atajo que Snooze Mattress + Wellness en McAllen ofrece para la más difícil: una sesión gratis de Dream Mapping que mide tus puntos de presión en lugar de adivinar.',
      ],
      sections: [
        { h2: '1. Elige el tamaño según la recámara y quiénes duermen', paragraphs: [
          'El tamaño es la decisión fácil, así que resuélvela primero. Mide la recámara, deja espacio para caminar alrededor de la cama y abrir cajones, y revisa la puerta y la escalera por donde tiene que pasar el colchón. Dos adultos están cómodos en un queen; las parejas que quieren más espacio, o que duermen de forma muy distinta, eligen un king o un split king. La tabla de abajo muestra los tamaños estándar.',
        ] },
        { h2: '2. Ajusta el nivel de comodidad a tu forma de dormir', paragraphs: [
          'El nivel de comodidad es qué tan suave o firme se siente la superficie. No es lo mismo que el soporte: un colchón plush puede sostener una columna perfectamente, y uno firme puede dejar adolorido el hombro de quien duerme de lado. El Sleep Fit Quiz y la sesión de Dream Mapping usan los mismos cinco niveles, de Plush a Firme.',
          'Como regla general, quienes duermen de lado necesitan que hombros y caderas se hundan, así que quedan hacia Plush y Medio-Suave; quienes duermen boca arriba quedan en medio; quienes duermen boca abajo necesitan el soporte más firme para que las caderas no se hundan. El peso y la edad también mueven la respuesta, por eso una medición le gana a una regla general.',
        ] },
        { h2: '3. Elige la construcción', h3s: [
          { h3: 'Memory foam', paragraphs: ['Se amolda de cerca, alivia los puntos de presión y absorbe el movimiento de la pareja; la espuma densa puede guardar calor, por eso existen versiones frescas. Tempur-Pedic, Puffy y Snooze-O-Pedic son los nombres de espuma en el piso de McAllen.'] },
          { h3: 'Híbrido', paragraphs: ['Capas de confort sobre resortes ensacados: una superficie acolchada con la ventilación y el rebote de un núcleo de resortes. La mayoría de los modelos de Sealy, Stearns & Foster, Beautyrest, Helix y King Koil en la sala de exhibición son híbridos.'] },
          { h3: 'De resortes', paragraphs: ['Un núcleo de resortes con una capa de confort más delgada: la sensación más firme y más fresca, y normalmente la más económica.'] },
        ] },
        { h2: '4. Decide los extras', bullets: [
          'Una base ajustable eleva la cabeza y los pies, ayuda a aliviar la presión, reduce los ronquidos y favorece una postura más sana al dormir; un split king permite configurar cada lado por separado.',
          'Un protector de colchón protege de derrames, manchas y alérgenos sin cambiar cómo se siente.',
          'Una almohada elegida para tu posición mantiene el cuello alineado con la columna que ahora sostiene el colchón.',
          'Las sábanas transpirables importan en el Valle: toda la cama duerme más fresca.',
        ] },
        { h2: '5. Pruébalo con una medición', paragraphs: [
          'Acostarse treinta segundos en varias camas te dice cuál se siente rica en el momento, no cuál mantendrá tu columna nivelada ocho horas. La cama de Dream Mapping registra tus puntos de presión en unos cinco minutos; un Sleep Coach lee el mapa contigo y te lleva solo a los colchones que coinciden. Es gratis, no hay obligación y nadie en Snooze trabaja por comisión.',
          `Snooze Mattress + Wellness está en ${L.street}, ${L.city}, ${L.region} ${L.postalCode}, abierto ${L.hours.es[0]} y ${L.hours.es[1]}. La entrega e instalación son gratis en compras mayores de $999, hay financiamiento con Synchrony, Wells Fargo y Snap, y toda compra está respaldada por la Sleep Comfort Guarantee.`,
        ] },
      ],
      table: {
        caption: 'Tamaños estándar de colchón y para quién son',
        head: ['Tamaño', 'Medidas', 'Normalmente para'],
        rows: [
          ['Twin', '38 × 75 pulg', 'Niños, literas, sofás cama'],
          ['Twin XL', '38 × 80 pulg', 'Adolescentes altos, dormitorios estudiantiles, cada mitad de un split king'],
          ['Full', '54 × 75 pulg', 'Un adulto, cuartos de visitas, recámaras pequeñas'],
          ['Queen', '60 × 80 pulg', 'Parejas en una recámara estándar; el tamaño más común'],
          ['King', '76 × 80 pulg', 'Parejas que quieren el ancho de un twin cada uno'],
          ['California King', '72 × 84 pulg', 'Personas altas que cambian ancho por largo'],
          ['Niveles de comodidad', 'Plush · Medio-Suave · Medio · Medio-Firme · Firme', 'De lado tiende a plush, boca arriba a medio, boca abajo a firme; el ajuste decide'],
        ],
      },
      faqTitle: 'Preguntas al comprar colchón',
      faqs: [
        { question: '¿Cada cuánto se debe cambiar un colchón?', answer: 'La mayoría se cambia a los siete a diez años, o antes si despiertas con rigidez o sientes los resortes o una huella del cuerpo.' },
        { question: '¿Cuál es el tamaño de colchón más popular?', answer: 'Queen, de 60 por 80 pulgadas: lo bastante ancho para dos adultos en una recámara estándar.' },
        { question: '¿Suave o firme, cuál es mejor?', answer: 'Ninguno por sí solo. El nivel de comodidad correcto depende de tu posición al dormir, tu peso y tus puntos de presión, que es lo que mide la sesión gratis de Dream Mapping.' },
        { question: '¿Cuál es la diferencia entre un híbrido y el memory foam?', answer: 'Un híbrido pone capas de confort sobre resortes ensacados para ventilación y rebote; el memory foam se amolda más de cerca y absorbe el movimiento.' },
        { question: '¿Puedo probar antes de comprar?', answer: 'Sí. Todas las marcas de esta página están en la sala de exhibición de McAllen, y la sesión de Dream Mapping las reduce a las que van con tu forma de dormir.' },
        { question: '¿El ajuste es realmente gratis?', answer: 'Sí, unos cinco minutos en la cama con sensores, sin obligación de comprar.' },
      ],
      cta: { title: 'Déjate de adivinar', text: 'Reserva una sesión gratis de Dream Mapping en McAllen y deja que el mapa de presión elija el nivel de comodidad por ti.', button: 'Reservar ajuste gratis' },
    },
  },
};
