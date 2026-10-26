/* Shared inline icons (emoji replacement pass, October 2026; card blocks, October 27, 2026). Same drawing style as the
   header icons: 24-unit grid, 2px stroke that inherits currentColor. Every icon is decorative (aria-hidden); the text
   next to it carries the meaning. Sized by the .snz-ico rule in overrides/global.css (about 1.1em, aligned to the
   text) or by the badge that holds it. */
import type { ReactNode, SVGProps } from 'react';

const base = (props: SVGProps<SVGSVGElement>, extra?: string) => ({
  viewBox: '0 0 24 24',
  width: '1em',
  height: '1em',
  'aria-hidden': true as const,
  focusable: 'false' as const,
  ...props,
  className: `snz-ico${extra ? ' ' + extra : ''}${props.className ? ' ' + props.className : ''}`,
});

/* arrow -> (the header's "see all" arrow) */
export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props, 'snz-ico--arrow')} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

/* orange check-circle used beside list items (the builder's lost Font Awesome marker, drawn as SVG) */
export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props, 'snz-ico--check snz-li-ico')} fill="currentColor" stroke="none">
      <circle cx="12" cy="12" r="10" />
      <path d="m8.2 12.3 2.6 2.6 5.2-5.4" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* a check-icon list item: icon + text as flex (see .snz-check-list in overrides/global.css) */
export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li>
      <CheckCircleIcon />
      <span>{children}</span>
    </li>
  );
}

/* Line icons for the card blocks (the booking visit flow, the service-area and size/type cards, the content pages'
   icon cards and timelines). Stroke icons on the same 24-unit grid as the header's. */
export type IconName =
  | 'sensor-bed' | 'bed' | 'bed-wide' | 'bed-single' | 'clock' | 'user' | 'badge-check' | 'people' | 'map-pin'
  | 'layers' | 'spine' | 'snowflake' | 'shield' | 'truck' | 'credit-card' | 'phone' | 'clipboard' | 'pillow' | 'store' | 'check';

const PATHS: Record<Exclude<IconName, 'check'>, ReactNode> = {
  /* the Dream Mapping sensor bed: a bed with a reading arc above it */
  'sensor-bed': <><path d="M3 19v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M3 15h18M3 19h18M7 15v-2.5A1.5 1.5 0 0 1 8.5 11h2a1.5 1.5 0 0 1 1.5 1.5V15m0 0v-2.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V15" /><path d="M9 5.5a4.5 4.5 0 0 1 6 0M10.6 7.5a2.2 2.2 0 0 1 2.8 0" /></>,
  bed: <path d="M3 18V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10M3 13h18M3 18h18M7 13V9.5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 12 9.5V13m0 0V9.5A1.5 1.5 0 0 1 13.5 8h2A1.5 1.5 0 0 1 17 9.5V13" />,
  /* a king: full-width bed, two wide pillows */
  'bed-wide': <path d="M2 18V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v9M2 13h20M2 18h20M5 13V9.5A1.5 1.5 0 0 1 6.5 8h3A1.5 1.5 0 0 1 11 9.5V13m2 0V9.5A1.5 1.5 0 0 1 14.5 8h3A1.5 1.5 0 0 1 19 9.5V13" />,
  /* a twin or full: a narrower bed, one pillow */
  'bed-single': <path d="M6 18V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10M6 13h12M6 18h12M9.5 13V9.5A1.5 1.5 0 0 1 11 8h2a1.5 1.5 0 0 1 1.5 1.5V13" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  'badge-check': <><circle cx="12" cy="10" r="6" /><path d="m9.5 10 1.8 1.8 3.2-3.4M8.6 15.4 7 22l5-2.5 5 2.5-1.6-6.6" /></>,
  people: <><circle cx="9" cy="8" r="3.5" /><circle cx="17" cy="9" r="3" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M14.5 20a5 5 0 0 1 7-4.6" /></>,
  'map-pin': <><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2.3" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12.5 9 5 9-5M3 17l9 5 9-5" /></>,
  /* spine / support: a column of vertebrae */
  spine: <><path d="M12 3v18" /><rect x="8.5" y="5" width="7" height="3" rx="1.5" /><rect x="8.5" y="10.5" width="7" height="3" rx="1.5" /><rect x="8.5" y="16" width="7" height="3" rx="1.5" /></>,
  snowflake: <path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19M12 2l-2.5 2.5M12 2l2.5 2.5M12 22l-2.5-2.5M12 22l2.5-2.5M2 12l2.5-2.5M2 12l2.5 2.5M22 12l-2.5-2.5M22 12l-2.5 2.5" />,
  shield: <><path d="M12 2.5 4.5 5.5v6c0 5 3.2 8.4 7.5 10 4.3-1.6 7.5-5 7.5-10v-6L12 2.5Z" /><path d="m9 12 2 2 4-4.5" /></>,
  truck: <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  'credit-card': <><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19M6.5 15h4" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  /* the Sleep Fit Quiz: a clipboard with a check */
  clipboard: <><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4.5V3h6v1.5M9.5 13l2 2 3.5-3.8" /></>,
  pillow: <path d="M4 7.5C4 6 5 5 6.5 5c2 .8 3.7 1.2 5.5 1.2S15.5 5.8 17.5 5C19 5 20 6 20 7.5c-.8 1.5-1.2 3-1.2 4.5s.4 3 1.2 4.5c0 1.5-1 2.5-2.5 2.5-2-.8-3.7-1.2-5.5-1.2S8.5 18.2 6.5 19C5 19 4 18 4 16.5c.8-1.5 1.2-3 1.2-4.5S4.8 9 4 7.5Z" />,
  /* the showroom: a storefront */
  store: <path d="M3 9.5 4.5 4h15L21 9.5M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v8h14v-8M10 20v-5h4v5" />,
};

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  if (name === 'check') return <CheckCircleIcon {...props} />;
  return (
    <svg {...base(props, `snz-ico--${name}`)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </svg>
  );
}

/* The icon for a list item, chosen from what the item talks about (English and Spanish copy). First match wins;
   anything else gets the check-circle. */
const KEYWORDS: Array<[IconName, RegExp]> = [
  ['truck', /deliver|entrega/i],
  ['credit-card', /financ/i],
  ['shield', /guarantee|garant|protector/i],
  ['pillow', /pillow|almohada/i],
  ['layers', /sheets|sábana|foam|espuma/i],
  ['bed-wide', /adjustable base|base ajustable|\bking\b/i],
  ['bed-single', /\btwin\b/i],
  ['bed', /\bfull\b|mattress|colch/i],
  ['clock', /minute|minuto|\bhours?\b|horario/i],
  ['people', /couple|pareja/i],
  ['user', /coach/i],
  ['clipboard', /quiz/i],
  ['phone', /\bcall\b|llama/i],
  ['store', /walk in|walk-in|visit|tienda|llegar/i],
  ['snowflake', /cool|fresc/i],
  ['spine', /back pain|espalda|support|soporte/i],
  ['map-pin', /address|dirección|\bstreet\b/i],
];
export function iconFor(text: string): IconName {
  for (const [name, re] of KEYWORDS) if (re.test(text)) return name;
  return 'check';
}
