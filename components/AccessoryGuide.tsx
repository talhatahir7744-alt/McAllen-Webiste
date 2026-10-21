import { LOCATION } from '@/lib/location';
import { localizeHref, type Locale } from '@/lib/i18n';
import { CheckItem } from '@/components/icons';

/* Buying guides for the accessory pages (SEO audit build pass, October 2026 — D4): /pillows, /mattress-protectors and
   /premium-sheets each gain 300–500 words built only from the claims already on the page (materials, sleep positions,
   fit) and the store facts used site-wide (free Dream Mapping, Sleep Coaches, NAP). Rendered at the end of the
   generated page in both languages, server-side. Styles: overrides/global.css (.snz-guide). */
export type GuidePage = 'pillows' | 'mattress-protectors' | 'premium-sheets';
type Block = { h2: string } | { h3: string } | { p: string } | { ul: string[] };
type Guide = { title: string; blocks: Block[]; cta: string };

const L = LOCATION;
const ADDR = `${L.street}, ${L.city}, ${L.region} ${L.postalCode}`;

const GUIDES: Record<GuidePage, Record<Locale, Guide>> = {
  pillows: {
    en: {
      title: 'How to choose a pillow in McAllen',
      blocks: [
        { p: 'The right pillow does one job: it keeps your head and neck in line with the rest of your spine while the mattress does the same for your body. Which pillow does that depends mostly on how you sleep, so start with your sleep position and then pick the material.' },
        { h3: 'By sleep position' },
        { ul: [
          'Side sleepers need extra loft: a taller pillow that fills the gap between the ear and the shoulder so the neck stays straight.',
          'Back sleepers do best with balanced support, enough height to cradle the head without tipping the chin toward the chest.',
          'Stomach sleepers usually prefer a softer, lower profile so the neck is not bent back all night.',
        ] },
        { h3: 'By material' },
        { ul: [
          'Memory foam contours to your unique shape and holds it, a good match for sleepers who want steady support in one position.',
          'Cooling gel-infused designs are made for warm McAllen nights and pull heat away from the head.',
          'Natural latex is the option for eco-conscious sleepers who like a springier, more responsive feel.',
          'Adjustable-fill pillows let you add or remove filling until the height is exactly right, useful if you switch positions during the night.',
        ] },
        { h2: 'Try it at Snooze Mattress + Wellness' },
        { p: 'Pillows are personal, so the McAllen showroom lets you try them the way you will use them: lying down, on a mattress, in your usual position. If you come in for a free Dream Mapping fitting, the Sleep Coach already knows your sleep position and pressure points and can point you to the pillow that fits them. A pillow that cradles your head and supports your neck is the simplest upgrade to a night’s sleep, and the first thing to check if you are not waking up refreshed.' },
        { p: `Pillows, protectors and sheets are on the same floor as the mattresses at ${ADDR}, ${L.hours.en[0]}, ${L.hours.en[1]}.` },
      ],
      cta: 'Book a free Dream Mapping fitting',
    },
    es: {
      title: 'Cómo elegir una almohada en McAllen',
      blocks: [
        { p: 'La almohada correcta tiene una sola tarea: mantener tu cabeza y tu cuello alineados con el resto de la columna mientras el colchón hace lo mismo con tu cuerpo. Cuál almohada lo logra depende sobre todo de cómo duermes, así que empieza por tu posición al dormir y después elige el material.' },
        { h3: 'Según tu posición al dormir' },
        { ul: [
          'Quienes duermen de lado necesitan más altura: una almohada más alta que llene el espacio entre la oreja y el hombro para que el cuello quede derecho.',
          'Quienes duermen boca arriba van mejor con un soporte equilibrado, con la altura justa para acunar la cabeza sin inclinar la barbilla hacia el pecho.',
          'Quienes duermen boca abajo suelen preferir un perfil más suave y bajo para que el cuello no pase toda la noche doblado hacia atrás.',
        ] },
        { h3: 'Según el material' },
        { ul: [
          'El memory foam se amolda a tu forma y la mantiene, ideal para quienes quieren un soporte constante en una sola posición.',
          'Los diseños con gel refrescante están hechos para las noches cálidas de McAllen y alejan el calor de la cabeza.',
          'El látex natural es la opción para quienes buscan algo más ecológico y una sensación más elástica y con rebote.',
          'Las almohadas de relleno ajustable te dejan agregar o quitar relleno hasta dar con la altura exacta, útiles si cambias de posición durante la noche.',
        ] },
        { h2: 'Pruébala en Snooze Mattress + Wellness' },
        { p: 'Las almohadas son algo personal, por eso en la sala de exhibición de McAllen puedes probarlas como las vas a usar: acostado, sobre un colchón, en tu posición habitual. Si vienes a una sesión gratis de Dream Mapping, el Sleep Coach ya conoce tu posición al dormir y tus puntos de presión y puede indicarte la almohada que va con ellos. Una almohada que acune tu cabeza y sostenga tu cuello es la mejora más sencilla para una noche de sueño, y lo primero que hay que revisar si no despiertas descansado.' },
        { p: `Almohadas, protectores y sábanas están en el mismo piso que los colchones en ${ADDR}, ${L.hours.es[0]}, ${L.hours.es[1]}.` },
      ],
      cta: 'Reserva tu Dream Mapping gratis',
    },
  },
  'mattress-protectors': {
    en: {
      title: 'Why a mattress protector, and which one',
      blocks: [
        { p: 'You spend about a third of your life on your mattress, and a protector is what keeps spills, stains, allergens and everyday wear from reaching it. It is the simplest way to make a quality mattress last, and it should not change the comfort and feel you chose the mattress for.' },
        { h3: 'What to look for' },
        { p: 'The protectors on the McAllen floor are chosen for five things, and a good one has all of them:' },
        { ul: [
          'A waterproof barrier that blocks spills and accidents without the crinkle of older plastic-backed covers.',
          'Breathable fabric that lets air move, so the protector does not make the bed sleep warmer.',
          'Cooling technology on top of that breathability, made for hot McAllen nights.',
          'Hypoallergenic protection against dust mites, allergens and bacteria, which matters for allergy sufferers and for children’s beds.',
          'A quiet, stretch-fit design that fits memory foam, hybrid and innerspring mattresses without changing how the mattress feels.',
        ] },
        { h2: 'A protector for every bed in the house' },
        { p: 'A protector earns its place on every bed: the primary bedroom, a child’s twin, the guest-room full. For memory foam and for mattresses on adjustable bases, choose a stretch-fit protector that moves with the mattress instead of pulling at the corners. Put it on the day the new mattress arrives, so the mattress stays clean from the first night.' },
        { p: `At Snooze Mattress + Wellness the protector is matched to the mattress you choose: tell the Sleep Coach the model and the size, including each half of a split king, and they will fit the protector to it, in the breathable or cooling fabric you prefer. The protectors are on the showroom floor next to the mattresses at ${ADDR}, ${L.hours.en[0]}, ${L.hours.en[1]}.` },
      ],
      cta: 'Book a free Dream Mapping fitting',
    },
    es: {
      title: 'Por qué usar un protector de colchón, y cuál elegir',
      blocks: [
        { p: 'Pasas cerca de un tercio de tu vida sobre tu colchón, y el protector es lo que evita que derrames, manchas, alérgenos y el desgaste diario lleguen hasta él. Es la forma más sencilla de hacer que un colchón de calidad dure, y no debe cambiar la comodidad ni la sensación por las que elegiste ese colchón.' },
        { h3: 'Qué buscar' },
        { ul: [
          'Una barrera impermeable que detenga derrames y accidentes sin el ruido de las fundas antiguas con respaldo de plástico.',
          'Una tela transpirable que deje circular el aire, para que el protector no haga que la cama dé más calor.',
          'Tecnología de enfriamiento además de esa transpirabilidad, pensada para las noches calurosas de McAllen.',
          'Protección hipoalergénica contra ácaros, alérgenos y bacterias, importante para quienes sufren alergias y para las camas de los niños.',
          'Un diseño elástico y silencioso que se ajusta a colchones de memory foam, híbridos y de resortes sin cambiar cómo se siente el colchón.',
        ] },
        { h2: 'Un protector para cada cama de la casa' },
        { p: 'El protector se gana su lugar en cada cama: la recámara principal, el twin de un niño, el full del cuarto de visitas. Para memory foam y para colchones sobre bases ajustables, elige un protector elástico que se mueva con el colchón en lugar de jalar de las esquinas. Ponlo el mismo día que llega el colchón nuevo, para que se mantenga limpio desde la primera noche.' },
        { p: `En Snooze Mattress + Wellness el protector se ajusta al colchón que elijas: dile al Sleep Coach el modelo y el tamaño, incluyendo cada mitad de un split king, y te lo dejará a la medida. Los protectores están en el piso de la sala de exhibición junto a los colchones en ${ADDR}, ${L.hours.es[0]}, ${L.hours.es[1]}.` },
      ],
      cta: 'Reserva tu Dream Mapping gratis',
    },
  },
  'premium-sheets': {
    en: {
      title: 'How to choose sheets that sleep cool',
      blocks: [
        { p: 'Thread count is the number everyone quotes, but it is not what decides how sheets feel on a warm night. The fabric and its features do: how it breathes, whether it wicks moisture, and whether it fits the mattress you actually own. Here is how the premium sheets at Snooze Mattress + Wellness in McAllen break down.' },
        { h3: 'By fabric' },
        { p: 'Four fabric families are on the McAllen floor. Pick by how you sleep, not by the number on the package:' },
        { ul: [
          'Cooling performance fabrics are engineered for breathability, the first choice for hot sleepers and summer nights.',
          'Moisture-wicking blends pull sweat away from the skin and keep you dry the whole night.',
          'High-quality cotton gives the timeless softness and durability of a classic sheet.',
          'Temperature-regulating materials even out warm and cool stretches through the night, a good match for McAllen heat.',
        ] },
        { h3: 'Fit matters as much as fabric' },
        { p: 'Deep-pocket sheets are made for today’s taller mattresses: memory foam, hybrids and beds on adjustable bases, where a standard fitted sheet pulls off the corners as soon as the base moves. Check the depth of your mattress before you buy, and if you sleep on a split king, remember that each side takes a twin XL fitted sheet.' },
        { h2: 'Finish the bed in one visit' },
        { p: 'Sheets, pillows and protectors are on the McAllen showroom floor next to the mattresses, so you can feel the fabrics, check the fit against the mattress you are choosing and leave with the whole bed. If you come in for a free Dream Mapping fitting, ask the Sleep Coach which fabric suits the way you sleep: a hot sleeper and a cold one on the same mattress will usually leave with different sheets.' },
        { p: `Visit ${ADDR}, ${L.hours.en[0]}, ${L.hours.en[1]}.` },
      ],
      cta: 'Book a free Dream Mapping fitting',
    },
    es: {
      title: 'Cómo elegir sábanas que duermen frescas',
      blocks: [
        { p: 'El número de hilos es la cifra que todos mencionan, pero no es lo que decide cómo se sienten las sábanas en una noche calurosa. Lo deciden la tela y sus características: cómo respira, si aleja la humedad y si le queda al colchón que realmente tienes. Así se dividen las sábanas premium de Snooze Mattress + Wellness en McAllen.' },
        { h3: 'Según la tela' },
        { ul: [
          'Las telas frescas de alto rendimiento están diseñadas para respirar, la primera opción para quienes duermen con calor y para las noches de verano.',
          'Las mezclas que alejan la humedad retiran el sudor de la piel y te mantienen seco toda la noche.',
          'El algodón de alta calidad da la suavidad y la durabilidad clásicas de una buena sábana.',
          'Los materiales que regulan la temperatura equilibran los momentos de calor y de frío durante la noche, ideales para el calor de McAllen.',
        ] },
        { h3: 'El ajuste importa tanto como la tela' },
        { p: 'Las sábanas de bolsillo profundo están hechas para los colchones altos de hoy: memory foam, híbridos y camas sobre bases ajustables, donde una sábana ajustable estándar se sale de las esquinas en cuanto la base se mueve. Revisa la altura de tu colchón antes de comprar, y si duermes en un split king, recuerda que cada lado usa una sábana ajustable twin XL.' },
        { h2: 'Completa la cama en una sola visita' },
        { p: 'Sábanas, almohadas y protectores están en el piso de la sala de exhibición de McAllen junto a los colchones, así que puedes tocar las telas, comprobar el ajuste con el colchón que estás eligiendo y llevarte la cama completa. Si vienes a una sesión gratis de Dream Mapping, pregúntale al Sleep Coach qué tela va con tu forma de dormir: una persona calurosa y una friolenta en el mismo colchón casi siempre se llevan sábanas distintas.' },
        { p: `Visítanos en ${ADDR}, ${L.hours.es[0]}, ${L.hours.es[1]}.` },
      ],
      cta: 'Reserva tu Dream Mapping gratis',
    },
  },
};

export function AccessoryGuide({ page, locale }: { page: GuidePage; locale: Locale }) {
  const g = GUIDES[page][locale];
  const id = `snz-guide-${page}`;
  return (
    <section className="snz-guide" aria-labelledby={id}>
      <div className="snz-guide__inner">
        <h2 id={id} className="snz-guide__title">{g.title}</h2>
        {g.blocks.map((b, i) => {
          if ('h2' in b) return <h2 key={i} className="snz-guide__h2">{b.h2}</h2>;
          if ('h3' in b) return <h3 key={i} className="snz-guide__h3">{b.h3}</h3>;
          if ('ul' in b) return <ul key={i} className="snz-guide__list snz-check-list">{b.ul.map((li, j) => <CheckItem key={j}>{li}</CheckItem>)}</ul>;
          return <p key={i} className="snz-guide__p">{b.p}</p>;
        })}
        <a className="snz-guide__cta" href={localizeHref('/booking', locale)}>{g.cta}</a>
      </div>
    </section>
  );
}
