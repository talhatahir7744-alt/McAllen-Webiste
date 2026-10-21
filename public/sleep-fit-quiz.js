/* =================================================================================
   SNOOZE SLEEP FIT QUIZ — McAllen site build (mcallen.snoozemattresscompany.com)
   =================================================================================
   The single-store quiz (sleep-fit-quiz.html) as the site's /sleep-quiz and /es/sleep-quiz pages. Rendered by
   components/SleepQuiz.tsx (markup + scoped stylesheet); this file is loaded after hydration and boots on the
   #snz-quiz element, whose data-lang attribute picks the language. Scoring, screens, lead form, validation,
   kiosk mode (?kiosk=1) and the shareable results URL (?r=...) are the original logic, unchanged. What moved:
   every human-readable string lives in the I18N table below (option keys/values, tags and webhook field names
   stay English so the GoHighLevel workflow sees the same payload; the payload carries a `lang` field), the
   quiz's own top bar / © line are gone (site header and footer), and the step-change scroll lands below the
   sticky site header.
   ================================================================================= */
(function () {
  const root = document.getElementById("snz-quiz");
  if (!root || root.dataset.booted) return;
  root.dataset.booted = "1";
  const LANG = root.getAttribute("data-lang") === "es" ? "es" : "en";
  const SITE_URL = "https://mcallen.snoozemattresscompany.com";
  const PREFIX = LANG === "es" ? "/es" : "";

/* =================================================================================
   CONFIG — McAllen store
   ================================================================================= */
const CONFIG = {
  brand: "Snooze Mattress + Wellness",

  store: {
    id: "mcallen",
    name: "Snooze Mattress + Wellness – McAllen",
    phone: "(956) 586-5646",
    address: "7913 N 10th St, Suite 130, McAllen, TX 78504",
    bookingUrl: SITE_URL + PREFIX + "/booking",      // Dream Mapping booking page
    shopUrl: SITE_URL + PREFIX + "/mattresses",      // mattresses page
    // McAllen sub-account Inbound Webhook URL (Automation -> Workflows -> trigger)
    webhookUrl: "https://services.leadconnectorhq.com/hooks/ARD47WoZpqaZSQ9MSxLD/webhook-trigger/00b3cdec-7a6f-4184-95ec-81210f1e7bc8"
  }
};

/* =================================================================================
   I18N — every human-readable string, per language. Keys/values/tags are not translated.
   ================================================================================= */
const I18N = {
  en: {
    questions: {
      problem:  { title:"What is your primary sleep problem?", hint:"Pick the one that bothers you most.",
                  options:{ back_pain:{label:"Back pain"}, sleep_hot:{label:"Sleeping hot"}, tossing:{label:"Tossing & turning"}, partner:{label:"Partner disturbance"}, upgrading:{label:"Just upgrading"} } },
      position: { title:"What is your primary sleep position?", hint:"How you usually fall asleep.",
                  options:{ side:{label:"Side"}, back:{label:"Back"}, stomach:{label:"Stomach"}, combo:{label:"Combination", sub:"I switch positions during the night"} } },
      body:     { title:"Describe your body type", hint:"This helps us dial in firmness and support.",
                  options:{ light:{label:"Light", sub:"Under ~130 lbs"}, average:{label:"Average", sub:"~130–230 lbs"}, heavy:{label:"Heavy", sub:"Over ~230 lbs"} } },
      temp:     { title:"How is your temperature when sleeping?",
                  options:{ hot:{label:"I sleep hot"}, sometimes:{label:"Sometimes I get hot"}, no:{label:"No, sleeping hot is not an issue"} } },
      partner:  { title:"Do you share your bed with a partner?",
                  options:{ yes:{label:"Yes"}, no:{label:"No"} } }
    },
    profiles: {
      support:  { name:"Support & Alignment", short:"support",
                  blurb:"Your body needs steady, even support that keeps your spine in line — especially through your lower back.",
                  phrase:"strong, even support to keep your spine aligned",
                  why:["Supports natural spinal alignment","Helps reduce lower-back pressure and morning stiffness","Keeps hips from sinking too deep"] },
      pressure: { name:"Pressure Relief", short:"pressure relief",
                  blurb:"You need a surface that cushions your shoulders and hips so you're not waking up sore or numb.",
                  phrase:"pressure relief at your shoulders and hips",
                  why:["Cushions shoulders and hips where side sleepers carry weight","Reduces tossing caused by pressure points","Contours without trapping you"] },
      cooling:  { name:"Cooling Focus", short:"cooling",
                  blurb:"Heat is costing you sleep. You need breathable materials that move heat away instead of holding it.",
                  phrase:"cooling materials that pull heat away from your body",
                  why:["Improves airflow through the mattress","Cooling cover materials feel cool to the touch","Less waking up overheated or sweaty"] },
      motion:   { name:"Motion Isolation", short:"motion isolation",
                  blurb:"Every movement on the bed is waking someone up. You need a mattress that keeps motion on one side.",
                  phrase:"motion isolation so movement doesn't wake you",
                  why:["Absorbs a partner's movement before it reaches you","Quiet — no squeaks or bounce-back","Fewer middle-of-the-night wake-ups"] },
      balanced: { name:"Balanced Comfort", short:"balanced comfort",
                  blurb:"You move around and want a mattress that does a little of everything well — easy to turn on, never too soft or too firm.",
                  phrase:"a balanced, responsive feel that moves with you",
                  why:["Responsive enough to change positions easily","Medium feel that works on your side, back or stomach","All-around comfort without trade-offs"] }
    },
    firmLabel: { soft:"Soft / Plush", medium:"Medium", firm:"Firm" },
    comfortLabels: ["Plush","Medium-Soft","Medium","Medium-Firm","Firm"],
    features: {
      support:  { title:"Zoned, reinforced support core", why:"Firmer support under your hips and lower back keeps your spine level all night." },
      pressure: { title:"Pressure-relieving comfort layers", why:"Softer top layers let shoulders and hips sink in just enough so pressure points don't wake you." },
      cooling:  { title:"Cooling, breathable materials", why:"Cooling covers, airflow coils or open-cell foams move heat away instead of trapping it." },
      motion:   { title:"Motion-isolating construction", why:"Individually wrapped coils or dense foam absorb movement so a partner's tossing stays on their side." },
      balanced: { title:"Responsive, easy-to-move surface", why:"A buoyant feel lets you change positions easily without feeling stuck in the mattress." }
    },
    supportLevels: {
      high:   { label:"High", detail:"Look for a reinforced or zoned coil core with firmer support through the center third." },
      medhigh:{ label:"Medium-High", detail:"Look for a supportive coil or hybrid core with a little extra firmness at the hips." },
      medium: { label:"Medium", detail:"A standard supportive core is plenty; put your attention on the comfort layers." }
    },
    meterName: { support:"Support", pressure:"Pressure relief", cooling:"Cooling", motion:"Motion control" },
    summary: (a, b, comfort) => `Based on your answers, you need a mattress with ${a}${b ? `, plus ${b}` : ""} — in a ${comfort} comfort level.`,
    progress: { question: (cur, total) => `Question ${cur} of ${total}`, last: "Last step — unlock your results" },
    intro: {
      eyebrow: "Free Sleep Fit Quiz · 60 seconds",
      h1: "Find the comfort + support your body needs.",
      lede: "Answer 5 quick questions about how you sleep. We'll match you to the right comfort level, support level and features — so you know exactly what to try.",
      chips: ["5 questions", "Personal Sleep Profile", "Results sent to your inbox"],
      start: "Start my Sleep Fit Quiz",
      steps: [["1. Answer", "Sleep position, body type, heat and more."], ["2. Get your fit", "Your comfort level and support level."], ["3. Try it", (store) => `Feel your fit side by side at ${store}.`]]
    },
    back: "Back",
    lead: {
      h2: "Your Sleep Fit results are ready.",
      hint: "Tell us where to send them — you'll see them instantly on the next screen, and we'll email you a copy.",
      teaser: (name) => `Your Sleep Profile: <b>${name}</b><br>Your comfort + support match is ready.`,
      firstName: "First name", lastName: "Last name", email: "Email", phone: "Mobile phone", phonePlaceholder: "(555) 555-5555",
      errFn: "Please enter your first name", errLn: "Please enter your last name", errEm: "Please enter a valid email", errPh: "Please enter a valid 10-digit phone number",
      submit: "Show my Sleep Fit results", building: "Building your Sleep Fit…",
      lock: "We'll never sell your info. Unsubscribe anytime."
    },
    results: {
      eyebrow: "Your Perfect Sleep Fit",
      h1: (first) => `${first ? esc(first) + ", here's" : "Here's"} your Sleep Fit.`,
      emailed: (email) => `${ICONS.check} A copy of your results is on its way to ${esc(email)}`,
      profileEyebrow: "Your Sleep Profile",
      match: "Your comfort + support match",
      comfortLabel: "Comfort level", supportLabel: "Support level",
      comfortAria: (c) => `Comfort scale: ${c}`, plush: "Plush", firm: "Firm",
      comfortHelp: "How the top of the mattress should feel when you lie down.",
      lookFor: "What to look for", why: "Why this fits you",
      ctaTitle: "Feel your Sleep Fit in person",
      ctaText: "Book a Dream Mapping visit and we'll line up the mattresses that match your comfort and support so you can try them side by side.",
      book: "Book Dream Mapping", shop: "Shop Your Match",
      retake: "Retake the quiz",
      shareLabel: "View my Sleep Fit results"
    },
    trust: { guarantee: "365 Night Sleep Guarantee", guaranteeSub: "Love it or exchange it", warranty: "10-yr+ warranties", financing: "0% financing available", warrantyLabel: "Warranty", financingLabel: "Financing" },
    smsConsentText: "By checking this box, I agree to receive recurring text messages from Snooze Mattress + Wellness about my results, appointments and offers at the number provided. Consent is not a condition of purchase. Msg & data rates may apply. Msg frequency varies. Reply STOP to opt out, HELP for help."
  },
  es: {
    questions: {
      problem:  { title:"¿Cuál es tu principal problema para dormir?", hint:"Elige el que más te molesta.",
                  options:{ back_pain:{label:"Dolor de espalda"}, sleep_hot:{label:"Duermo con calor"}, tossing:{label:"Doy muchas vueltas"}, partner:{label:"Mi pareja me despierta"}, upgrading:{label:"Solo quiero un colchón mejor"} } },
      position: { title:"¿En qué posición duermes principalmente?", hint:"Cómo sueles quedarte dormido.",
                  options:{ side:{label:"De lado"}, back:{label:"Boca arriba"}, stomach:{label:"Boca abajo"}, combo:{label:"Combinada", sub:"Cambio de posición durante la noche"} } },
      body:     { title:"Describe tu tipo de cuerpo", hint:"Esto nos ayuda a afinar la firmeza y el soporte.",
                  options:{ light:{label:"Ligero", sub:"Menos de ~130 lb (59 kg)"}, average:{label:"Promedio", sub:"~130–230 lb (59–104 kg)"}, heavy:{label:"Robusto", sub:"Más de ~230 lb (104 kg)"} } },
      temp:     { title:"¿Cómo es tu temperatura al dormir?",
                  options:{ hot:{label:"Duermo con calor"}, sometimes:{label:"A veces me da calor"}, no:{label:"No, el calor no es un problema"} } },
      partner:  { title:"¿Compartes la cama con tu pareja?",
                  options:{ yes:{label:"Sí"}, no:{label:"No"} } }
    },
    profiles: {
      support:  { name:"Soporte y Alineación", short:"soporte",
                  blurb:"Tu cuerpo necesita un soporte firme y parejo que mantenga tu columna alineada, sobre todo en la zona lumbar.",
                  phrase:"un soporte firme y parejo que mantenga tu columna alineada",
                  why:["Favorece la alineación natural de la columna","Ayuda a reducir la presión lumbar y la rigidez al despertar","Evita que las caderas se hundan de más"] },
      pressure: { name:"Alivio de Presión", short:"alivio de presión",
                  blurb:"Necesitas una superficie que amortigüe tus hombros y caderas para que no despiertes adolorido o entumecido.",
                  phrase:"alivio de presión en hombros y caderas",
                  why:["Amortigua hombros y caderas, donde quienes duermen de lado cargan el peso","Reduce las vueltas causadas por los puntos de presión","Se adapta a tu cuerpo sin atraparte"] },
      cooling:  { name:"Enfoque en Frescura", short:"frescura",
                  blurb:"El calor te está robando sueño. Necesitas materiales transpirables que alejen el calor en vez de retenerlo.",
                  phrase:"materiales frescos que alejen el calor de tu cuerpo",
                  why:["Mejora el flujo de aire a través del colchón","Las fundas con tecnología de enfriamiento se sienten frescas al tacto","Menos despertares acalorado o sudando"] },
      motion:   { name:"Aislamiento de Movimiento", short:"aislamiento de movimiento",
                  blurb:"Cada movimiento en la cama despierta a alguien. Necesitas un colchón que mantenga el movimiento de un solo lado.",
                  phrase:"aislamiento de movimiento para que los movimientos no te despierten",
                  why:["Absorbe los movimientos de tu pareja antes de que lleguen a ti","Silencioso: sin rechinidos ni rebotes","Menos despertares a mitad de la noche"] },
      balanced: { name:"Comodidad Equilibrada", short:"comodidad equilibrada",
                  blurb:"Te mueves mucho y quieres un colchón que haga un poco de todo bien: fácil para cambiar de posición, nunca demasiado suave ni demasiado firme.",
                  phrase:"una sensación equilibrada y receptiva que se mueva contigo",
                  why:["Lo bastante receptivo para cambiar de posición con facilidad","Sensación media que funciona de lado, boca arriba o boca abajo","Comodidad integral sin sacrificios"] }
    },
    firmLabel: { soft:"Suave / Mullido", medium:"Medio", firm:"Firme" },
    comfortLabels: ["Mullido","Medio-Suave","Medio","Medio-Firme","Firme"],
    features: {
      support:  { title:"Núcleo de soporte reforzado por zonas", why:"Un soporte más firme bajo las caderas y la zona lumbar mantiene tu columna nivelada toda la noche." },
      pressure: { title:"Capas de confort que alivian la presión", why:"Las capas superiores más suaves dejan que hombros y caderas se hundan lo justo para que los puntos de presión no te despierten." },
      cooling:  { title:"Materiales frescos y transpirables", why:"Las fundas frescas, los resortes con flujo de aire o las espumas de celda abierta alejan el calor en lugar de atraparlo." },
      motion:   { title:"Construcción que aísla el movimiento", why:"Los resortes ensacados individualmente o la espuma densa absorben el movimiento para que las vueltas de tu pareja se queden de su lado." },
      balanced: { title:"Superficie receptiva y fácil para moverse", why:"Una sensación con rebote te permite cambiar de posición con facilidad sin sentirte atrapado en el colchón." }
    },
    supportLevels: {
      high:   { label:"Alto", detail:"Busca un núcleo de resortes reforzado o por zonas, con soporte más firme en el tercio central." },
      medhigh:{ label:"Medio-Alto", detail:"Busca un núcleo de resortes o híbrido con un poco más de firmeza en las caderas." },
      medium: { label:"Medio", detail:"Un núcleo de soporte estándar es suficiente; pon tu atención en las capas de confort." }
    },
    meterName: { support:"Soporte", pressure:"Alivio de presión", cooling:"Frescura", motion:"Control de movimiento" },
    summary: (a, b, comfort) => `Según tus respuestas, necesitas un colchón con ${a}${b ? `, además de ${b}` : ""}, con un nivel de comodidad ${comfort}.`,
    progress: { question: (cur, total) => `Pregunta ${cur} de ${total}`, last: "Último paso: desbloquea tus resultados" },
    intro: {
      eyebrow: "Quiz Sleep Fit gratis · 60 segundos",
      h1: "Encuentra la comodidad y el soporte que tu cuerpo necesita.",
      lede: "Responde 5 preguntas rápidas sobre cómo duermes. Te indicaremos el nivel de comodidad, el nivel de soporte y las características ideales para ti, para que sepas exactamente qué probar.",
      chips: ["5 preguntas", "Perfil de Sueño personal", "Resultados a tu correo"],
      start: "Empezar mi Quiz Sleep Fit",
      steps: [["1. Responde", "Posición al dormir, tipo de cuerpo, calor y más."], ["2. Recibe tu ajuste", "Tu nivel de comodidad y tu nivel de soporte."], ["3. Pruébalo", (store) => `Siente tu ajuste lado a lado en ${store}.`]]
    },
    back: "Atrás",
    lead: {
      h2: "Tus resultados Sleep Fit están listos.",
      hint: "Dinos a dónde enviarlos: los verás al instante en la siguiente pantalla y te mandaremos una copia por correo.",
      teaser: (name) => `Tu Perfil de Sueño: <b>${name}</b><br>Tu combinación de comodidad y soporte está lista.`,
      firstName: "Nombre", lastName: "Apellido", email: "Correo electrónico", phone: "Celular", phonePlaceholder: "(555) 555-5555",
      errFn: "Escribe tu nombre", errLn: "Escribe tu apellido", errEm: "Escribe un correo válido", errPh: "Escribe un número de teléfono válido de 10 dígitos",
      submit: "Ver mis resultados Sleep Fit", building: "Preparando tu Sleep Fit…",
      lock: "Nunca venderemos tu información. Cancela cuando quieras."
    },
    results: {
      eyebrow: "Tu Sleep Fit perfecto",
      h1: (first) => `${first ? esc(first) + ", este es" : "Este es"} tu Sleep Fit.`,
      emailed: (email) => `${ICONS.check} Una copia de tus resultados va en camino a ${esc(email)}`,
      profileEyebrow: "Tu Perfil de Sueño",
      match: "Tu combinación de comodidad + soporte",
      comfortLabel: "Nivel de comodidad", supportLabel: "Nivel de soporte",
      comfortAria: (c) => `Escala de comodidad: ${c}`, plush: "Mullido", firm: "Firme",
      comfortHelp: "Cómo debe sentirse la parte superior del colchón al acostarte.",
      lookFor: "Qué buscar", why: "Por qué te queda",
      ctaTitle: "Siente tu Sleep Fit en persona",
      ctaText: "Agenda una visita de Dream Mapping y te mostraremos los colchones que coinciden con tu comodidad y soporte para que los pruebes lado a lado.",
      book: "Agendar Dream Mapping", shop: "Compra tu Colchón Ideal",
      retake: "Volver a hacer el quiz",
      shareLabel: "Ver mis resultados Sleep Fit"
    },
    trust: { guarantee: "Garantía de 365 Noches de Sueño", guaranteeSub: "Ámalo o cámbialo", warranty: "Garantías de 10+ años", financing: "Financiamiento al 0% disponible", warrantyLabel: "Garantía", financingLabel: "Financiamiento" },
    smsConsentText: "Al marcar esta casilla, acepto recibir mensajes de texto recurrentes de Snooze Mattress + Wellness sobre mis resultados, citas y ofertas en el número proporcionado. El consentimiento no es condición de compra. Pueden aplicar tarifas de mensajes y datos. La frecuencia de mensajes varía. Responde STOP para cancelar o HELP para ayuda."
  }
};
const T = I18N[LANG];
/* results-screen trust strip (three cards): the site's own claims, per language; the strip renders from these values */
CONFIG.trust = { guarantee: T.trust.guarantee, warranty: T.trust.warranty, financing: T.trust.financing };
CONFIG.smsConsentText = T.smsConsentText;

/* =================================================================================
   QUIZ DEFINITION + SCORING (mirrors the original handoff spec; labels come from I18N)
   ================================================================================= */
const Q_DEF = [
  { key:"problem",
    options:[
      { v:"back_pain",   s:{support:3,pressure:1}, firm:2, tags:["backpain_optimized"] },
      { v:"sleep_hot",   s:{cooling:4} },
      { v:"tossing",     s:{motion:2,pressure:2} },
      { v:"partner",     s:{motion:3} },
      { v:"upgrading",   s:{balanced:3,support:1,pressure:1,cooling:1,motion:1} }
    ]},
  { key:"position",
    options:[
      { v:"side",     s:{pressure:3}, firm:1.5, tags:["position_side","side_sleeper_best"] },
      { v:"back",     s:{support:3},  firm:2.25, tags:["position_back"] },
      { v:"stomach",  s:{support:2},  firm:3, tags:["position_stomach"] },
      { v:"combo",    s:{balanced:3,motion:1}, firm:2, tags:["position_combo"] }
    ]},
  { key:"body",
    options:[
      { v:"light",   s:{pressure:1}, firm:1 },
      { v:"average", s:{},           firm:2 },
      { v:"heavy",   s:{support:3},  firm:3 }
    ]},
  { key:"temp",
    options:[
      { v:"hot",       s:{cooling:4}, tags:["cooling_top"] },
      { v:"sometimes", s:{cooling:2} },
      { v:"no",        s:{} }
    ]},
  { key:"partner",
    options:[
      { v:"yes", s:{motion:3} },
      { v:"no",  s:{} }
    ]}
];
const QUESTIONS = Q_DEF.map(q => {
  const tq = T.questions[q.key];
  return { key:q.key, title:tq.title, hint:tq.hint, options:q.options.map(o => Object.assign({}, o, { label:tq.options[o.v].label, sub:tq.options[o.v].sub })) };
});

const ATTRS = ["support","pressure","cooling","motion"];
const PROFILES = T.profiles;
const FIRM_LABEL = T.firmLabel;
const COMFORT_LABELS = T.comfortLabels;

function scoreAnswers(ans){
  const s = {support:0,pressure:0,cooling:0,motion:0,balanced:0};
  const firmVals = []; const extraTags = [];
  QUESTIONS.forEach(q=>{
    const o = q.options.find(x=>x.v===ans[q.key]); if(!o) return;
    Object.entries(o.s||{}).forEach(([k,v])=> s[k]+=v);
    if(o.firm!=null) firmVals.push(o.firm);
    (o.tags||[]).forEach(t=>extraTags.push(t));
  });
  // firmness: average of position/body/problem leanings
  const f = firmVals.length ? firmVals.reduce((a,b)=>a+b,0)/firmVals.length : 2;
  const firmness = f < 1.67 ? "soft" : f > 2.4 ? "firm" : "medium";
  const comfortIdx = f < 1.4 ? 0 : f < 1.8 ? 1 : f <= 2.2 ? 2 : f <= 2.6 ? 3 : 4;

  // the shopper's stated #1 problem gets a bonus and wins ties
  const probAttr = {back_pain:"support",sleep_hot:"cooling",tossing:"pressure",partner:"motion"}[ans.problem];
  if(probAttr) s[probAttr] += 2;
  const order = [...ATTRS].sort((a,b)=> (s[b]-s[a]) || ((b===probAttr)-(a===probAttr)) || (ATTRS.indexOf(a)-ATTRS.indexOf(b)));
  let primary = order[0], secondary = order[1];
  if (s.balanced >= s[primary]) { secondary = primary; primary = "balanced"; }

  const level = v => v>=4 ? "high" : v>=2 ? "medium" : "low";
  const tags = new Set(extraTags);
  ATTRS.forEach(a=> tags.add(`${a}_${level(s[a])}`));
  tags.add(`firmness_${firmness}`);
  if(primary==="support" && ans.problem==="back_pain") tags.add("backpain_optimized");
  return { scores:s, primary, secondary, firmness, comfortIdx, tags:[...tags] };
}

const FEATURES = T.features;
const SUPPORT_LEVELS = T.supportLevels;

// Comfort + support recommendation (replaces product matching)
function buildRecommendation(result){
  const sup = result.scores.support;
  const support = sup >= 6 ? "high" : sup >= 2 ? "medhigh" : "medium";
  const ranked = [...ATTRS].filter(a=>result.scores[a] >= 3).sort((a,b)=>result.scores[b]-result.scores[a]);
  const keys = (result.primary==="balanced" ? ["balanced", ...ranked] : ranked).slice(0,3);
  // always give at least 2 features: next-strongest attribute, else a responsive all-around feel
  const next = [...ATTRS].sort((a,b)=>result.scores[b]-result.scores[a]).find(a=>!keys.includes(a) && result.scores[a] > 0);
  if(keys.length < 2) keys.push(next || (keys.includes("balanced") ? "support" : "balanced"));
  return {
    comfort: COMFORT_LABELS[result.comfortIdx], comfortIdx: result.comfortIdx,
    support: SUPPORT_LEVELS[support].label, supportDetail: SUPPORT_LEVELS[support].detail,
    features: keys.map(k=>({key:k, ...FEATURES[k]}))
  };
}

/* =================================================================================
   ICONS (line icons, inherit the brand color via currentColor)
   ================================================================================= */
const CLOCK = `<svg width="100%" height="100%" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="75 150 458 467"> <path fill-rule="nonzero" fill="currentColor" d="M 304.484375 523.910156 C 277.894531 523.910156 253.492188 517.570312 231.261719 504.898438 C 209.027344 492.222656 191.382812 474.238281 178.320312 450.949219 C 165.257812 427.652344 158.726562 402.53125 158.726562 375.585938 C 158.726562 333.792969 173.050781 298.167969 201.699219 268.707031 C 230.339844 239.25 264.609375 224.519531 304.484375 224.519531 C 344.125 224.519531 378.324219 239.25 407.089844 268.707031 C 435.855469 298.167969 450.238281 333.792969 450.238281 375.585938 C 450.238281 402.53125 443.699219 427.652344 430.640625 450.949219 C 417.578125 474.238281 399.929688 492.222656 377.703125 504.898438 C 355.46875 517.570312 331.0625 523.910156 304.484375 523.910156 M 498.882812 374.558594 C 498.882812 322.722656 481.722656 277.84375 447.40625 239.933594 C 409.65625 198.375 362.074219 177.59375 304.652344 177.59375 C 247 177.59375 199.300781 198.488281 161.554688 240.277344 C 127.238281 278.1875 110.082031 322.949219 110.082031 374.558594 C 110.082031 426.625 128.210938 472.128906 164.476562 511.066406 C 166.566406 513.308594 168.695312 515.46875 170.855469 517.582031 L 120.363281 577.753906 C 116.695312 582.125 117.265625 588.648438 121.640625 592.316406 L 143.0625 610.292969 C 147.4375 613.964844 153.957031 613.394531 157.628906 609.019531 L 209.875 546.753906 C 237.398438 561.894531 268.988281 569.46875 304.652344 569.46875 C 340.160156 569.46875 371.640625 561.898438 399.105469 546.769531 L 451.339844 609.019531 C 455.007812 613.394531 461.527344 613.964844 465.902344 610.292969 L 487.328125 592.316406 C 491.703125 588.648438 492.273438 582.125 488.601562 577.753906 L 438.113281 517.582031 C 440.269531 515.46875 442.398438 513.308594 444.488281 511.066406 C 480.75 472.128906 498.882812 426.625 498.882812 374.558594 "/> <path fill-rule="nonzero" fill="currentColor" d="M 230.507812 166.476562 C 216.011719 158.566406 199.390625 154.066406 181.714844 154.066406 C 125.355469 154.066406 79.671875 199.753906 79.671875 256.113281 C 79.671875 276.242188 85.578125 294.957031 95.640625 310.769531 C 104.789062 279.222656 121.015625 250.421875 144.28125 224.722656 C 169.042969 197.304688 197.910156 177.886719 230.507812 166.476562 "/> <path fill-rule="nonzero" fill="currentColor" d="M 427.25 154.066406 C 409.617188 154.066406 393.027344 158.542969 378.558594 166.417969 C 411.058594 177.765625 439.875 197.082031 464.648438 224.355469 C 487.96875 250.117188 504.21875 279.015625 513.363281 310.703125 C 523.402344 294.90625 529.296875 276.214844 529.296875 256.113281 C 529.296875 199.753906 483.609375 154.066406 427.25 154.066406 "/> <path fill-rule="nonzero" fill="currentColor" d="M 371.25 320.023438 L 304.484375 368.113281 L 237.714844 320.023438 C 230.640625 314.929688 220.785156 316.539062 215.699219 323.601562 C 210.609375 330.667969 212.210938 340.527344 219.28125 345.617188 L 295.265625 400.347656 C 295.324219 400.390625 295.390625 400.417969 295.449219 400.457031 C 296.085938 400.902344 296.742188 401.316406 297.425781 401.65625 C 297.441406 401.664062 297.453125 401.667969 297.464844 401.671875 C 298.109375 401.992188 298.773438 402.25 299.449219 402.480469 C 299.6875 402.558594 299.929688 402.625 300.171875 402.695312 C 300.648438 402.828125 301.128906 402.941406 301.613281 403.03125 C 301.859375 403.078125 302.105469 403.125 302.351562 403.160156 C 303.023438 403.253906 303.699219 403.308594 304.382812 403.316406 C 304.410156 403.316406 304.441406 403.320312 304.46875 403.320312 C 304.472656 403.320312 304.480469 403.320312 304.484375 403.320312 C 304.488281 403.320312 304.492188 403.320312 304.496094 403.320312 C 304.527344 403.320312 304.554688 403.316406 304.585938 403.316406 C 305.265625 403.308594 305.945312 403.253906 306.617188 403.160156 C 306.863281 403.125 307.109375 403.078125 307.355469 403.03125 C 307.839844 402.941406 308.320312 402.828125 308.792969 402.695312 C 309.035156 402.625 309.277344 402.558594 309.519531 402.480469 C 310.195312 402.25 310.859375 401.992188 311.503906 401.671875 C 311.515625 401.667969 311.527344 401.664062 311.539062 401.65625 C 312.226562 401.316406 312.878906 400.902344 313.515625 400.457031 C 313.578125 400.417969 313.640625 400.390625 313.699219 400.347656 L 389.6875 345.617188 C 396.753906 340.527344 398.355469 330.667969 393.265625 323.601562 C 388.179688 316.539062 378.328125 314.929688 371.25 320.023438 "/> </svg> `;
const sv = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONS = {
  back_pain: sv('<rect x="9" y="2.5" width="6" height="4" rx="1.5"/><rect x="9" y="8.5" width="6" height="4" rx="1.5"/><rect x="9" y="14.5" width="6" height="4" rx="1.5"/><path d="M12 19.5v2"/>'),
  sleep_hot: sv('<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 2 1.2 3 2.5 3.5C12 9 11 6 12 3z"/>'),
  tossing:   sv('<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5"/><path d="M20 3.5v5h-5"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5"/><path d="M4 20.5v-5h5"/>'),
  partner:   sv('<circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="8.5" r="2.6"/><path d="M2.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><path d="M14 14.6c.8-.4 1.6-.6 2.5-.6 2.8 0 5 2 5 5"/>'),
  upgrading: sv('<path d="M12 3l2.2 5.3L19.5 10l-5.3 1.9L12 17l-2.2-5.1L4.5 10l5.3-1.7z"/><path d="M19 16l.8 2 2 .8-2 .8L19 21.5l-.8-1.9-2-.8 2-.8z"/>'),
  side:      sv('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  back:      sv('<path d="M3 18V8"/><path d="M3 14h18v4"/><path d="M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="6.5" cy="11" r="1.8"/>'),
  stomach:   sv('<path d="M3 18V8"/><path d="M3 14h18v4"/><path d="M8 11.5h12"/><circle cx="6" cy="11.3" r="1.8"/><path d="M14 8.5l3 3-3 3"/>'),
  combo:     sv('<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5"/><path d="M20 3.5v5h-5"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5"/><path d="M4 20.5v-5h5"/>'),
  light:     sv('<rect x="4" y="15" width="4" height="5" rx="1"/><rect x="10" y="10" width="4" height="10" rx="1" opacity=".3"/><rect x="16" y="5" width="4" height="15" rx="1" opacity=".3"/>'),
  average:   sv('<rect x="4" y="15" width="4" height="5" rx="1"/><rect x="10" y="10" width="4" height="10" rx="1"/><rect x="16" y="5" width="4" height="15" rx="1" opacity=".3"/>'),
  heavy:     sv('<rect x="4" y="15" width="4" height="5" rx="1"/><rect x="10" y="10" width="4" height="10" rx="1"/><rect x="16" y="5" width="4" height="15" rx="1"/>'),
  hot:       sv('<path d="M14 14.8V4.5a2 2 0 0 0-4 0v10.3a4 4 0 1 0 4 0z"/><path d="M12 9v8"/>'),
  sometimes: sv('<path d="M14 14.8V4.5a2 2 0 0 0-4 0v10.3a4 4 0 1 0 4 0z"/><path d="M12 13v4"/>'),
  no:        sv('<path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11"/><path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5"/>'),
  yes:       sv('<circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="8.5" r="2.6"/><path d="M2.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><path d="M14 14.6c.8-.4 1.6-.6 2.5-.6 2.8 0 5 2 5 5"/>'),
  single:    sv('<circle cx="12" cy="8" r="3.5"/><path d="M5 20.5c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5"/>'),
  check:     sv('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  arrow:     sv('<path d="M5 12h14m-6-6 6 6-6 6"/>'),
  arrowLeft: sv('<path d="M19 12H5m6-6-6 6 6 6"/>')
};
const iconFor = (q,o) => q.key==="partner" && o.v==="no" ? ICONS.single : (ICONS[o.v] || "");

/* =================================================================================
   STATE + HELPERS
   ================================================================================= */
const qs = new URLSearchParams(location.search);
const KIOSK = qs.get("kiosk")==="1";
const STORE = CONFIG.store;
const state = { step:-1, answers:{}, lead:null, result:null, rec:null };
const $view = document.getElementById("view");
function esc(s){ return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
const track = (event, data={}) => { try{ (window.dataLayer=window.dataLayer||[]).push({event, ...data}); }catch(e){} try{ window.fbq && fbq('trackCustom', event, data);}catch(e){} };
function setProgress(){
  const wrap = document.getElementById("progressWrap");
  if(state.step<0 || state.step>QUESTIONS.length){ wrap.hidden = true; return; }
  wrap.hidden = false;
  const total = QUESTIONS.length + 1; const cur = Math.min(state.step+1,total);
  document.getElementById("progressBar").style.width = (cur/total*100)+"%";
  document.getElementById("progressLabel").textContent = state.step<QUESTIONS.length ? T.progress.question(cur, QUESTIONS.length) : T.progress.last;
}
function encodeAnswers(a){ return btoa(QUESTIONS.map(q=>a[q.key]||"").join("|")).replace(/=+$/,""); }
function decodeAnswers(str){
  try{ const parts = atob(str).split("|"); const a = {};
    QUESTIONS.forEach((q,i)=>{ if(q.options.some(o=>o.v===parts[i])) a[q.key]=parts[i]; });
    return Object.keys(a).length===QUESTIONS.length ? a : null; }catch(e){ return null; }
}
/* shareable results link: always the production page (not the host the quiz happens to run on: kiosk tablet, preview
   deployment, local build), so the link in the lead's email and in GoHighLevel is the public one */
function resultsUrl(){ const u = new URL(SITE_URL + location.pathname.replace(/\.html$/, "")); u.searchParams.set("r", encodeAnswers(state.answers)); return u.toString(); }
function summaryText(){
  const r = state.result; const a = PROFILES[r.primary], b = PROFILES[r.secondary];
  return T.summary(a.phrase, r.secondary&&r.secondary!==r.primary ? b.phrase : null, COMFORT_LABELS[r.comfortIdx].toLowerCase());
}
/* step change: scroll to the top of the quiz, landing below the site's sticky header (not to page top 0) */
function scrollToQuiz(){
  try{
    const header = document.querySelector("[data-site-header]");
    const h = header ? header.getBoundingClientRect().height : 0;
    const top = root.getBoundingClientRect().top + window.scrollY - h - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }catch(e){}
}

/* =================================================================================
   SCREENS
   ================================================================================= */
let booted = false;
function render(){
  setProgress(); if(booted) scrollToQuiz(); booted = true;
  if(state.step<0) return renderIntro();
  if(state.step<QUESTIONS.length) return renderQuestion();
  if(state.step===QUESTIONS.length) return renderLeadForm();
  return renderResults();
}

function renderIntro(){
  const steps = T.intro.steps.map(([b, t]) => `<div><b>${esc(b)}</b>${esc(typeof t === "function" ? t(STORE.name) : t)}</div>`).join("");
  $view.innerHTML = `<section class="screen">
    <div class="hero">
      <div class="hero-clock" aria-hidden="true">${CLOCK}</div>
      <div class="eyebrow">${esc(T.intro.eyebrow)}</div>
      <h1>${esc(T.intro.h1)}</h1>
      <p class="lede">${esc(T.intro.lede)}</p>
      <div class="hero-badges">${T.intro.chips.map(c=>`<span class="chip"><i></i>${esc(c)}</span>`).join("")}</div>
      <button class="btn btn-orange btn-block" id="start">${esc(T.intro.start)} ${ICONS.arrow}</button>
    </div>
    <div class="steps">${steps}</div>
  </section>`;
  document.getElementById("start").onclick = ()=>{ track("quiz_start",{kiosk:KIOSK, store:STORE.id, lang:LANG}); state.step=0; render(); };
}

function renderQuestion(){
  const q = QUESTIONS[state.step];
  $view.innerHTML = `<section class="screen">
    <h2>${esc(q.title)}</h2><p class="hint">${q.hint?esc(q.hint):"&nbsp;"}</p>
    <div class="answers" role="radiogroup" aria-label="${esc(q.title)}">
      ${q.options.map(o=>`<button class="answer ${state.answers[q.key]===o.v?'selected':''}" role="radio" aria-checked="${state.answers[q.key]===o.v}" data-v="${o.v}">
        <span class="ico">${iconFor(q,o)}</span><span>${esc(o.label)}${o.sub?`<small>${esc(o.sub)}</small>`:""}</span></button>`).join("")}
    </div>
    <div class="nav">${state.step>0?`<button class="link-btn" id="back">${ICONS.arrowLeft} ${esc(T.back)}</button>`:"<span></span>"}</div>
  </section>`;
  $view.querySelectorAll(".answer").forEach(b=> b.onclick = ()=>{
    state.answers[q.key] = b.dataset.v;
    $view.querySelectorAll(".answer").forEach(x=>x.classList.toggle("selected", x===b));
    track("quiz_answer",{question:q.key, answer:b.dataset.v, step:state.step+1});
    setTimeout(()=>{ state.step++; render(); }, 180);
  });
  const back = document.getElementById("back"); if(back) back.onclick = ()=>{ state.step--; render(); };
}

function renderLeadForm(){
  state.result = scoreAnswers(state.answers);
  const prof = PROFILES[state.result.primary];
  const L = T.lead;
  $view.innerHTML = `<section class="screen">
    <h2>${esc(L.h2)}</h2>
    <p class="hint">${esc(L.hint)}</p>
    <div class="teaser">${CLOCK}<span>${L.teaser(esc(prof.name))}</span></div>
    <form class="card form" id="leadForm" novalidate>
      <div class="row2">
        <div><label class="f" for="fn">${esc(L.firstName)}</label><input class="input" id="fn" autocomplete="given-name" required><div class="errmsg">${esc(L.errFn)}</div></div>
        <div><label class="f" for="ln">${esc(L.lastName)}</label><input class="input" id="ln" autocomplete="family-name" required><div class="errmsg">${esc(L.errLn)}</div></div>
      </div>
      <div><label class="f" for="em">${esc(L.email)}</label><input class="input" id="em" type="email" autocomplete="email" inputmode="email" required><div class="errmsg">${esc(L.errEm)}</div></div>
      <div><label class="f" for="ph">${esc(L.phone)}</label><input class="input" id="ph" type="tel" autocomplete="tel" inputmode="tel" placeholder="${esc(L.phonePlaceholder)}" required><div class="errmsg">${esc(L.errPh)}</div></div>
      <label class="consent"><input type="checkbox" id="sms"> <span>${esc(CONFIG.smsConsentText)}</span></label>
      <button class="btn btn-orange btn-block" id="submitBtn" type="submit">${esc(L.submit)} ${ICONS.arrow}</button>
      <p class="lock">${esc(L.lock)}</p>
    </form>
    <div class="nav"><button class="link-btn" id="back">${ICONS.arrowLeft} ${esc(T.back)}</button></div>
  </section>`;
  document.getElementById("back").onclick = ()=>{ state.step--; render(); };
  document.getElementById("leadForm").onsubmit = onLeadSubmit;
  track("quiz_lead_form_view",{profile:prof.name, store:STORE.id});
}

function fieldOk(id, ok){ const el=document.getElementById(id); el.classList.toggle("err",!ok); const m=el.parentElement.querySelector(".errmsg"); if(m) m.style.display = ok?"none":"block"; return ok; }

async function onLeadSubmit(e){
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  const phoneDigits = v("ph").replace(/\D/g,"").replace(/^1(?=\d{10}$)/,"");
  const ok = [
    fieldOk("fn", v("fn").length>0),
    fieldOk("ln", v("ln").length>0),
    fieldOk("em", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("em"))),
    fieldOk("ph", phoneDigits.length===10)
  ].every(Boolean);
  if(!ok) return;
  const btn = document.getElementById("submitBtn"); btn.disabled = true; btn.textContent = T.lead.building;
  state.lead = { firstName:v("fn"), lastName:v("ln"), email:v("em"), phone:"+1"+phoneDigits, smsConsent:document.getElementById("sms").checked };
  state.rec = buildRecommendation(state.result);
  await sendLead();
  track("quiz_completed",{profile:PROFILES[state.result.primary].name, store:STORE.id, lang:LANG});
  state.step = QUESTIONS.length+1; render();
}

function buildPayload(){
  const r = state.result, prof = PROFILES[r.primary], sec = PROFILES[r.secondary], rec = state.rec;
  const label = key => { const q=QUESTIONS.find(x=>x.key===key); const o=q.options.find(x=>x.v===state.answers[key]); return o?o.label:""; };
  const p = {
    first_name:state.lead.firstName, last_name:state.lead.lastName, email:state.lead.email, phone:state.lead.phone,
    sms_consent: state.lead.smsConsent ? "yes" : "no",
    lang: LANG,
    store_id: STORE.id, store_name: STORE.name, store_phone: STORE.phone, store_address: STORE.address,
    store_booking_url: STORE.bookingUrl, store_shop_url: STORE.shopUrl,
    sleep_profile: prof.name, sleep_profile_secondary: sec.name, profile_key: r.primary,
    profile_summary: summaryText(),
    comfort_level: rec.comfort, support_level: rec.support, support_detail: rec.supportDetail,
    quiz_tags: r.tags.join(","),
    q1_problem: label("problem"), q2_position: label("position"), q3_body_type: label("body"), q4_temperature: label("temp"), q5_partner: label("partner"),
    results_url: resultsUrl(),
    results_url_short_label: T.results.shareLabel, // link text for GoHighLevel emails / SMS
    lead_source: KIOSK ? "Sleep Fit Quiz - In Store" : "Sleep Fit Quiz - Landing Page",
    page_url: location.href.split("?")[0],
    utm_source: qs.get("utm_source")||"", utm_medium: qs.get("utm_medium")||"", utm_campaign: qs.get("utm_campaign")||"",
    submitted_at: new Date().toISOString(),
    event: "quiz_completed"
  };
  [0,1,2].forEach(i=>{ const f = rec.features[i]; p[`feature${i+1}`] = f ? f.title : ""; p[`feature${i+1}_why`] = f ? f.why : ""; });
  return p;
}

async function sendLead(){
  const payload = buildPayload();
  window.__sleepFitLastPayload = payload;
  const url = STORE.webhookUrl;
  if(!url || url.includes("REPLACE")){ console.warn("[Sleep Fit Quiz] No GHL webhook configured — payload would be:", payload); return; }
  const body = new URLSearchParams(payload); // form-encoded = no CORS preflight
  const post = fetch(url,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/x-www-form-urlencoded"},body,keepalive:true}).catch(err=>console.warn("Lead post failed",err));
  await Promise.race([post, new Promise(r=>setTimeout(r,2500))]);
}

function renderResults(){
  if(!state.result) state.result = scoreAnswers(state.answers);
  if(!state.rec) state.rec = buildRecommendation(state.result);
  const r = state.result, rec = state.rec, prof = PROFILES[r.primary];
  const R = T.results;
  const max = Math.max(1,...ATTRS.map(a=>r.scores[a]));
  const meterName = T.meterName;
  const why = [...new Set([...prof.why, ...(r.secondary!==r.primary?PROFILES[r.secondary].why.slice(0,1):[])])];
  const tel = STORE.phone.replace(/[^\d+]/g,"");
  $view.innerHTML = `<section class="screen">
    <div class="res-head"><div class="eyebrow">${esc(R.eyebrow)}</div><h1>${R.h1(state.lead ? state.lead.firstName : "")}</h1></div>
    ${state.lead?`<p class="emailed">${R.emailed(state.lead.email)}</p>`:""}
    <div class="profile">
      <div class="hero-clock" aria-hidden="true">${CLOCK}</div>
      <div class="eyebrow">${esc(R.profileEyebrow)}</div>
      <h2>${esc(prof.name)}</h2>
      <p>${esc(summaryText())}</p>
      <div class="meters">${ATTRS.map(a=>`<div class="meter"><span>${esc(meterName[a])}</span><div class="bar"><span style="width:${Math.round(r.scores[a]/max*100)}%"></span></div></div>`).join("")}</div>
    </div>
    <div class="section-title">${esc(R.match)}</div>
    <div class="fit-grid">
      <div class="fit-card"><div class="plabel">${esc(R.comfortLabel)}</div><div class="fit-val">${esc(rec.comfort)}</div>
        <div class="scale" role="img" aria-label="${esc(R.comfortAria(rec.comfort))}">${COMFORT_LABELS.map((c,i)=>`<span class="${i===rec.comfortIdx?'on':''}"></span>`).join("")}</div>
        <div class="scale-ends"><span>${esc(R.plush)}</span><span>${esc(R.firm)}</span></div>
        <div class="pbenefit">${esc(R.comfortHelp)}</div></div>
      <div class="fit-card support"><div class="plabel">${esc(R.supportLabel)}</div><div class="fit-val">${esc(rec.support)}</div>
        <div class="pbenefit">${esc(rec.supportDetail)}</div></div>
    </div>
    <div class="section-title">${esc(R.lookFor)}</div>
    <div class="list">${rec.features.map((f,i)=>`<article class="feat"><span class="num">${i+1}</span><div><div class="t">${esc(f.title)}</div><div class="pbenefit">${esc(f.why)}</div></div></article>`).join("")}</div>
    <div class="section-title">${esc(R.why)}</div>
    <ul class="why">${why.map(w=>`<li><span class="ck">${ICONS.check}</span><span>${esc(w)}</span></li>`).join("")}</ul>
    <div class="cta-box">
      <h3>${esc(R.ctaTitle)}</h3>
      <p>${esc(R.ctaText)}</p>
      <div class="ctas">
        <a class="btn btn-orange" href="${esc(STORE.bookingUrl)}" data-track="visit_store">${esc(R.book)}</a>
        <a class="btn btn-ghost" href="${esc(STORE.shopUrl)}" data-track="shop_your_match">${esc(R.shop)}</a>
      </div>
      <p class="store-line">${esc(STORE.name)} · ${esc(STORE.address)} · <a href="tel:${esc(tel)}">${esc(STORE.phone)}</a></p>
    </div>
    <div class="trust"><div><b>${esc(CONFIG.trust.guarantee)}</b>${esc(T.trust.guaranteeSub)}</div><div><b>${esc(T.trust.warrantyLabel)}</b>${esc(CONFIG.trust.warranty)}</div><div><b>${esc(T.trust.financingLabel)}</b>${esc(CONFIG.trust.financing)}</div></div>
    <div class="nav" style="justify-content:center"><button class="link-btn" id="retake">${esc(R.retake)}</button></div>
  </section>`;
  $view.querySelectorAll("[data-track]").forEach(a=> a.addEventListener("click",()=>track(a.dataset.track,{profile:prof.name, store:STORE.id})));
  document.getElementById("retake").onclick = reset;
  if(KIOSK){ clearTimeout(state.kioskTimer); state.kioskTimer = setTimeout(reset, 90000); }
}

function reset(){
  clearTimeout(state.kioskTimer);
  Object.assign(state,{step:-1,answers:{},lead:null,result:null,rec:null});
  if(qs.has("r")){ const u=new URL(location.href); u.searchParams.delete("r"); history.replaceState(null,"",u); }
  render();
}

/* ---------- boot ---------- */
(function boot(){
  const shared = qs.get("r") && decodeAnswers(qs.get("r"));
  if(shared){ state.answers = shared; state.step = QUESTIONS.length+1; track("quiz_results_revisit",{store:STORE.id, lang:LANG}); }
  render();
})();

// exposed for testing
window.SleepFit = { CONFIG, QUESTIONS, lang: LANG, scoreAnswers, buildRecommendation, encodeAnswers, decodeAnswers };
})();
