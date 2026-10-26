import type { ContentPage } from './types';
import { LOCATION } from '@/lib/location';

const L = LOCATION;
export const PAGE: ContentPage = {
  slug: '/mattresses-for-back-pain',
  kind: 'guide',
  copy: {
    en: {
      title: 'Mattresses for Back Pain & Side Sleepers in McAllen | Snooze',
      description: 'Mattresses for back pain and side sleepers in McAllen, TX: a free Dream Mapping scan finds your pressure points and the Sleep Coach finds the support.',
      crumb: 'Back Pain & Side Sleepers',
      eyebrow: 'Mattresses by need',
      h1: 'Mattresses for back pain and side sleepers in McAllen',
      intro: [
        'If you wake up stiff, or your shoulder and hip ache after a night on your side, the mattress is the first thing to check. Snooze Mattress + Wellness in McAllen does not guess at the answer: a free Dream Mapping fitting shows where your body is carrying pressure and where it is losing support, and the Sleep Coach walks you to the mattresses built for that pattern.',
      ],
      sections: [
        { h2: 'What the pressure map shows about back pain', paragraphs: [
          'Lie on the Dream Mapping bed and the sensors draw your pressure points on screen: red for high pressure, yellow for medium, blue for light. Two patterns matter most. A gap or a sag through the lower back means the mattress you are used to is not holding your spine level, so the muscles work all night. Heavy red at the shoulders and hips, especially on your side, means those joints are taking the load instead of sinking into the surface.',
          'Steady, even support that keeps the spine in line is what helps reduce lower-back pressure and morning stiffness; pressure-relieving comfort layers that let shoulders and hips sink in just enough are what stop pressure points waking you. Most back-pain shoppers need a measured balance of both, which is exactly what the map is for.',
        ] },
        { h2: 'Side sleepers', paragraphs: [
          'On your side, the body’s weight concentrates on a shoulder and a hip. A surface that is too firm pushes back on them; one that is too soft lets the hips drop and bends the spine. The fitting usually puts side sleepers in the plush to medium range with zoned support underneath, and a pillow that fills the gap between ear and shoulder finishes the job. The pillows on the McAllen floor are chosen for the sleeper’s position too.',
        ] },
        { h2: 'Back and stomach sleepers', paragraphs: [
          'Back sleepers do best when the lower back is supported without the hips sinking; stomach sleepers need the firmest support of all so the midsection does not sag. The map shows whether your current mattress is letting you sink, and the Sleep Coach can take you straight to the medium-firm and firm models from Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, King Koil, Brooklyn Bedding, Spring Air, Helix and Snooze-O-Pedic.',
        ] },
        { h2: 'Adjustable bases for back pain', paragraphs: [
          'An adjustable base with customizable head and foot positioning helps relieve pressure, supports a healthier sleep posture and lets you raise your knees slightly, a position many back-pain sufferers find easier for falling asleep. Couples can set each side of a split king differently.',
        ] },
        { h2: 'What to expect at the fitting', listStyle: 'steps', bullets: [
          'About five minutes on the sensor bed, lying in the position you usually sleep in; free, with no obligation to buy.',
          'A walk-through of your map with a Sleep Coach, then only the mattresses that match it.',
          'Couples are mapped individually.',
          `Walk in or book a time at ${L.street}, ${L.city}, ${L.region} ${L.postalCode}, ${L.hours.en[0]}, ${L.hours.en[1]}.`,
        ] },
      ],
      faqTitle: 'Back pain and side sleeping questions',
      faqs: [
        { question: 'Is a firm mattress better for back pain?', answer: 'Not automatically. Back pain needs even support that keeps the spine level, and the right firmness depends on your weight, position and pressure points, which is what the Dream Mapping fitting measures.' },
        { question: 'What mattress is best for a side sleeper with shoulder pain?', answer: 'One with pressure-relieving comfort layers that let the shoulder and hip sink in while zoned support keeps the spine straight; most side sleepers map into the plush to medium range.' },
        { question: 'Can a mattress fitting really find the cause of my morning stiffness?', answer: 'It shows where your body loses support and where it carries too much pressure, which are the two mattress causes of stiffness; the Sleep Coach matches the mattress to that map.' },
        { question: 'Does an adjustable base help with back pain?', answer: 'Raising the head and feet relieves pressure and supports a healthier sleep posture; try one on the showroom floor with your mattress choice.' },
        { question: 'Is the fitting free?', answer: 'Yes, and there is no obligation to buy.' },
      ],
      cta: { title: 'Map your pressure points, free', text: 'Five minutes on the Dream Mapping bed in McAllen shows what your back needs from a mattress.', button: 'Book a free fitting' },
    },
    es: {
      title: 'Colchones para Dolor de Espalda en McAllen | Snooze',
      description: 'Colchones para dolor de espalda y dormir de lado en McAllen, TX: un escaneo gratis de Dream Mapping encuentra tus puntos de presión y el soporte.',
      crumb: 'Dolor de Espalda y Dormir de Lado',
      eyebrow: 'Colchones por necesidad',
      h1: 'Colchones para dolor de espalda y para dormir de lado en McAllen',
      intro: [
        'Si despiertas con rigidez, o te duelen el hombro y la cadera después de una noche de lado, el colchón es lo primero que hay que revisar. Snooze Mattress + Wellness en McAllen no adivina la respuesta: una sesión gratis de Dream Mapping muestra dónde tu cuerpo carga presión y dónde pierde soporte, y el Sleep Coach te lleva a los colchones hechos para ese patrón.',
      ],
      sections: [
        { h2: 'Qué muestra el mapa de presión sobre el dolor de espalda', paragraphs: [
          'Recuéstate en la cama de Dream Mapping y los sensores dibujan tus puntos de presión en pantalla: rojo para presión alta, amarillo para media, azul para ligera. Dos patrones son los que más importan. Un hueco o un hundimiento en la zona lumbar significa que el colchón al que estás acostumbrado no mantiene tu columna nivelada, así que los músculos trabajan toda la noche. Mucho rojo en hombros y caderas, sobre todo de lado, significa que esas articulaciones cargan el peso en lugar de hundirse en la superficie.',
          'Un soporte firme y parejo que mantenga la columna alineada es lo que ayuda a reducir la presión lumbar y la rigidez matutina; unas capas de confort que alivien la presión y dejen que hombros y caderas se hundan lo justo son las que evitan que los puntos de presión te despierten. La mayoría de quienes compran por dolor de espalda necesitan un balance medido de ambas cosas, y para eso es el mapa.',
        ] },
        { h2: 'Si duermes de lado', paragraphs: [
          'De lado, el peso del cuerpo se concentra en un hombro y una cadera. Una superficie demasiado firme los empuja; una demasiado suave deja caer las caderas y dobla la columna. El ajuste suele poner a quienes duermen de lado entre plush y medio con soporte por zonas debajo, y una almohada que llene el espacio entre la oreja y el hombro completa el trabajo. Las almohadas del piso de McAllen también se eligen según la posición al dormir.',
        ] },
        { h2: 'Si duermes boca arriba o boca abajo', paragraphs: [
          'Boca arriba lo mejor es que la zona lumbar tenga soporte sin que las caderas se hundan; boca abajo se necesita el soporte más firme de todos para que la parte media no se hunda. El mapa muestra si tu colchón actual te deja hundirte, y el Sleep Coach puede llevarte directo a los modelos medio-firmes y firmes de Tempur-Pedic, Sealy, Stearns & Foster, Beautyrest, King Koil, Brooklyn Bedding, Spring Air, Helix y Snooze-O-Pedic.',
        ] },
        { h2: 'Bases ajustables para el dolor de espalda', paragraphs: [
          'Una base ajustable con posición de cabeza y pies personalizable ayuda a aliviar la presión, favorece una postura más sana al dormir y te permite elevar un poco las rodillas, una posición que a muchas personas con dolor de espalda les facilita conciliar el sueño. Las parejas pueden configurar cada lado de un split king por separado.',
        ] },
        { h2: 'Qué esperar en el ajuste', listStyle: 'steps', bullets: [
          'Unos cinco minutos en la cama con sensores, recostado en la posición en la que sueles dormir; gratis y sin obligación de comprar.',
          'Una explicación de tu mapa con un Sleep Coach, y después solo los colchones que coinciden con él.',
          'Las parejas se mapean por separado.',
          `Llega sin cita o reserva en ${L.street}, ${L.city}, ${L.region} ${L.postalCode}, ${L.hours.es[0]}, ${L.hours.es[1]}.`,
        ] },
      ],
      faqTitle: 'Preguntas sobre dolor de espalda y dormir de lado',
      faqs: [
        { question: '¿Un colchón firme es mejor para el dolor de espalda?', answer: 'No automáticamente. El dolor de espalda necesita un soporte parejo que mantenga la columna nivelada, y la firmeza correcta depende de tu peso, tu posición y tus puntos de presión, que es lo que mide el ajuste de Dream Mapping.' },
        { question: '¿Qué colchón es mejor para dormir de lado con dolor de hombro?', answer: 'Uno con capas de confort que alivien la presión y dejen que el hombro y la cadera se hundan mientras el soporte por zonas mantiene la columna recta; la mayoría de quienes duermen de lado quedan entre plush y medio.' },
        { question: '¿Un ajuste de colchón de verdad puede encontrar la causa de mi rigidez matutina?', answer: 'Muestra dónde tu cuerpo pierde soporte y dónde carga demasiada presión, que son las dos causas de rigidez que dependen del colchón; el Sleep Coach ajusta el colchón a ese mapa.' },
        { question: '¿Una base ajustable ayuda con el dolor de espalda?', answer: 'Elevar la cabeza y los pies alivia la presión y favorece una postura más sana al dormir; pruébala en la sala de exhibición con el colchón que elijas.' },
        { question: '¿El ajuste es gratis?', answer: 'Sí, y no hay obligación de comprar.' },
      ],
      cta: { title: 'Mapea tus puntos de presión, gratis', text: 'Cinco minutos en la cama de Dream Mapping en McAllen muestran qué necesita tu espalda de un colchón.', button: 'Reservar ajuste gratis' },
    },
  },
};
