import type { ContentPage } from './types';
import { LOCATION } from '@/lib/location';

const SITE_URL = 'https://mcallen.snoozemattresscompany.com';
const service = (locale: 'en' | 'es') => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}/dream-mapping#service`,
  name: 'Dream Mapping',
  serviceType: locale === 'es' ? 'Ajuste de colchón por mapeo de presión' : 'Mattress fitting by pressure mapping',
  description: locale === 'es'
    ? 'Sesión gratuita de Dream Mapping en la tienda de McAllen: en unos 5 minutos, el mapeo de presión identifica el colchón que se ajusta a tu forma de dormir.'
    : 'Free in-store Dream Mapping fitting at the McAllen store: in about 5 minutes, pressure mapping identifies the mattress that fits the way you sleep.',
  url: `${SITE_URL}${locale === 'es' ? '/es' : ''}/dream-mapping`,
  provider: { '@type': 'LocalBusiness', '@id': `${SITE_URL}/#store`, name: LOCATION.name },
  areaServed: LOCATION.areaServed.map((city) => ({ '@type': 'City', name: city })),
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStoreOnly', url: `${SITE_URL}${locale === 'es' ? '/es' : ''}/booking` },
  hoursAvailable: LOCATION.openingHours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map((d) => `https://schema.org/${d}`), opens: h.opens, closes: h.closes })),
});

export const PAGE: ContentPage = {
  slug: '/dream-mapping',
  kind: 'guide',
  extraSchema: (locale) => [service(locale)],
  copy: {
    en: {
      title: 'Dream Mapping Fitting in McAllen, TX | Snooze Mattress',
      description: 'What Dream Mapping measures, how long it takes and how it finds your mattress: a free 5-minute fitting at Snooze Mattress + Wellness in McAllen, TX.',
      crumb: 'Dream Mapping',
      eyebrow: 'Free in-store fitting',
      h1: 'Dream Mapping: the 5-minute mattress fitting in McAllen',
      intro: [
        'Dream Mapping is how Snooze Mattress + Wellness takes the guesswork out of choosing a mattress. You lie down on a sensor bed in the McAllen showroom, the system reads your pressure points, and a Sleep Coach walks you straight to the mattresses that match your body. It is free, it takes about five minutes, and there is no obligation to buy.',
        'This page explains what the map measures, what you see on the screen, how it differs from the online Sleep Fit Quiz, and what to expect when you visit.',
      ],
      sections: [
        { h2: 'What Dream Mapping measures', paragraphs: [
          'The Dream Mapping bed is covered in pressure sensors. When you lie on it in the position you usually sleep in, the sensors record where your body presses hardest and where it barely touches the surface: shoulders, hips, lower back, knees. Those readings are the pressure points that decide whether a mattress will feel supportive or leave you tossing and turning.',
          'Your weight distribution, your sleep position and your individual shape all show up in the reading, so two people of the same height can get very different maps.',
        ] },
        { h2: 'What the map shows', paragraphs: [
          'The screen shows an outline of your body with a colour scale. Red marks high pressure, yellow marks medium pressure and blue or green marks light pressure. A Sleep Coach reads the pattern with you: a lot of red at the hips and shoulders points to a mattress that relieves pressure; a sag through the lower back points to one with firmer support.',
          'From that pattern the system narrows the showroom down to the mattresses that fit your profile, so instead of trying every bed on the floor you try only the ones built for how you sleep.',
        ] },
        { h2: 'How long it takes and what it costs', paragraphs: [
          'The scan itself takes about five minutes. Including the walk-through of your results and the first mattresses to try, most visits take well under half an hour. Dream Mapping is free, and there is never any pressure to buy: the Sleep Coaches at Snooze are not on commission.',
        ] },
        { h2: 'Dream Mapping or the Sleep Fit Quiz?', paragraphs: [
          'The Sleep Fit Quiz is the online version: five quick questions about how you sleep that match you to a comfort level, a support level and the features worth trying. It takes about 60 seconds and you can do it from home.',
          'Dream Mapping is the in-store measurement. It uses the sensor bed rather than your answers, so it catches the pressure points you cannot feel yourself. The quiz is a good first step; the map is the fitting. Many shoppers do both: take the quiz at home, then confirm the result on the bed.',
        ] },
        { h2: 'Couples', paragraphs: [
          'Couples are mapped individually, and the recommendation accounts for both profiles. If one of you needs more pressure relief and the other more support, the Sleep Coach will show you the mattresses that work for both, and the adjustable bases that let each side be set differently.',
        ] },
        { h2: 'What to bring and how to book', paragraphs: [
          'Nothing special: wear whatever is comfortable and plan to lie down for a few minutes in your usual sleep position. Walk-ins are welcome during store hours, or book a time online so a Sleep Coach is ready for you.',
          `Snooze Mattress + Wellness is at ${LOCATION.street}, ${LOCATION.city}, ${LOCATION.region} ${LOCATION.postalCode}, open ${LOCATION.hours.en[0]} and ${LOCATION.hours.en[1]}. Call ${LOCATION.phone} with any question.`,
        ] },
      ],
      faqTitle: 'Dream Mapping questions',
      faqs: [
        { question: 'Is Dream Mapping really free?', answer: 'Yes. The fitting is free and there is no obligation to buy anything afterwards.' },
        { question: 'How long does Dream Mapping take?', answer: 'About five minutes for the scan, then a short walk-through of your results with a Sleep Coach.' },
        { question: 'Do I need an appointment?', answer: 'No. Walk-ins are welcome during store hours, but booking online guarantees a Sleep Coach is ready when you arrive.' },
        { question: 'Can my partner and I be mapped together?', answer: 'Yes. Each of you is mapped individually and the recommendation accounts for both profiles.' },
        { question: 'What is the difference between Dream Mapping and the Sleep Fit Quiz?', answer: 'The quiz is a 60-second online questionnaire; Dream Mapping is the in-store pressure measurement on the sensor bed. The quiz is a first step, the map is the fitting.' },
        { question: 'Is there any pressure to buy?', answer: 'No. The Sleep Coaches are not on commission, and you can leave with your results and come back another day.' },
      ],
      cta: { title: 'Book your free Dream Mapping fitting', text: 'Five minutes on the sensor bed in McAllen, and you will know which mattresses fit the way you sleep.', button: 'Book a free fitting' },
    },
    es: {
      title: 'Dream Mapping Gratis en McAllen, TX | Snooze Mattress',
      description: 'Qué mide Dream Mapping, cuánto tarda y cómo encuentra tu colchón: un ajuste gratis de 5 minutos en Snooze Mattress + Wellness, McAllen, TX.',
      crumb: 'Dream Mapping',
      eyebrow: 'Ajuste gratis en tienda',
      h1: 'Dream Mapping: el ajuste de colchón de 5 minutos en McAllen',
      intro: [
        'Dream Mapping es la manera en que Snooze Mattress + Wellness le quita las adivinanzas a la compra de un colchón. Te recuestas en una cama con sensores en la sala de exhibición de McAllen, el sistema lee tus puntos de presión y un Sleep Coach te lleva directo a los colchones que van con tu cuerpo. Es gratis, tarda unos cinco minutos y no hay obligación de comprar.',
        'En esta página te explicamos qué mide el mapa, qué ves en la pantalla, en qué se diferencia del Sleep Fit Quiz en línea y qué esperar cuando nos visites.',
      ],
      sections: [
        { h2: 'Qué mide Dream Mapping', paragraphs: [
          'La cama de Dream Mapping está cubierta de sensores de presión. Cuando te recuestas en la posición en la que sueles dormir, los sensores registran dónde tu cuerpo presiona más y dónde apenas toca la superficie: hombros, caderas, zona lumbar, rodillas. Esas lecturas son los puntos de presión que deciden si un colchón se va a sentir con buen soporte o te va a tener dando vueltas.',
          'La distribución de tu peso, tu posición al dormir y tu forma individual aparecen en la lectura, así que dos personas de la misma estatura pueden tener mapas muy distintos.',
        ] },
        { h2: 'Qué muestra el mapa', paragraphs: [
          'La pantalla muestra la silueta de tu cuerpo con una escala de colores. El rojo marca presión alta, el amarillo presión media y el azul o verde presión ligera. Un Sleep Coach interpreta el patrón contigo: mucho rojo en caderas y hombros apunta a un colchón que alivie la presión; un hundimiento en la zona lumbar apunta a uno con soporte más firme.',
          'A partir de ese patrón, el sistema reduce la sala de exhibición a los colchones que van con tu perfil, así que en lugar de probar todas las camas del piso, pruebas solo las hechas para tu forma de dormir.',
        ] },
        { h2: 'Cuánto tarda y cuánto cuesta', paragraphs: [
          'El escaneo tarda unos cinco minutos. Contando la explicación de tus resultados y los primeros colchones para probar, la mayoría de las visitas toman bastante menos de media hora. Dream Mapping es gratis y nunca hay presión para comprar: los Sleep Coaches de Snooze no trabajan por comisión.',
        ] },
        { h2: '¿Dream Mapping o el Sleep Fit Quiz?', paragraphs: [
          'El Sleep Fit Quiz es la versión en línea: cinco preguntas rápidas sobre cómo duermes que te relacionan con un nivel de comodidad, un nivel de soporte y las características que vale la pena probar. Tarda unos 60 segundos y lo puedes hacer desde casa.',
          'Dream Mapping es la medición en tienda. Usa la cama con sensores en lugar de tus respuestas, así que detecta los puntos de presión que tú no puedes sentir. El quiz es un buen primer paso; el mapa es el ajuste. Muchos clientes hacen los dos: el quiz en casa y luego confirman el resultado en la cama.',
        ] },
        { h2: 'Parejas', paragraphs: [
          'Las parejas se mapean por separado y la recomendación toma en cuenta los dos perfiles. Si uno necesita más alivio de presión y el otro más soporte, el Sleep Coach les mostrará los colchones que funcionan para ambos y las bases ajustables que permiten configurar cada lado por separado.',
        ] },
        { h2: 'Qué traer y cómo reservar', paragraphs: [
          'Nada en especial: ven con ropa cómoda y prepárate para recostarte unos minutos en tu posición habitual. Puedes llegar sin cita en horario de tienda, o reservar en línea para que un Sleep Coach te esté esperando.',
          `Snooze Mattress + Wellness está en ${LOCATION.street}, ${LOCATION.city}, ${LOCATION.region} ${LOCATION.postalCode}, abierto ${LOCATION.hours.es[0]} y ${LOCATION.hours.es[1]}. Llama al ${LOCATION.phone} si tienes cualquier pregunta.`,
        ] },
      ],
      faqTitle: 'Preguntas sobre Dream Mapping',
      faqs: [
        { question: '¿Dream Mapping es realmente gratis?', answer: 'Sí. El ajuste es gratis y no hay obligación de comprar nada después.' },
        { question: '¿Cuánto tarda Dream Mapping?', answer: 'Unos cinco minutos para el escaneo, y después una breve explicación de tus resultados con un Sleep Coach.' },
        { question: '¿Necesito cita?', answer: 'No. Puedes llegar sin cita en horario de tienda, pero reservar en línea garantiza que un Sleep Coach esté listo cuando llegues.' },
        { question: '¿Mi pareja y yo podemos mapearnos juntos?', answer: 'Sí. Cada uno se mapea por separado y la recomendación toma en cuenta los dos perfiles.' },
        { question: '¿Cuál es la diferencia entre Dream Mapping y el Sleep Fit Quiz?', answer: 'El quiz es un cuestionario en línea de 60 segundos; Dream Mapping es la medición de presión en tienda sobre la cama con sensores. El quiz es un primer paso, el mapa es el ajuste.' },
        { question: '¿Hay presión para comprar?', answer: 'No. Los Sleep Coaches no trabajan por comisión, y puedes irte con tus resultados y volver otro día.' },
      ],
      cta: { title: 'Reserva tu Dream Mapping gratis', text: 'Cinco minutos en la cama con sensores en McAllen y sabrás qué colchones van con tu forma de dormir.', button: 'Reservar ajuste gratis' },
    },
  },
};
