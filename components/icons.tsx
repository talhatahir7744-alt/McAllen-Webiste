/* Shared inline icons (emoji replacement pass, October 2026). Same drawing style as the header icons: 24-unit
   grid, stroke inherits currentColor. Every icon is decorative (aria-hidden); the text next to it carries the
   meaning. Sized by the .snz-ico rule in overrides/global.css (about 1.1em, aligned to the text). */
import type { SVGProps } from 'react';

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
export function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <CheckCircleIcon />
      <span>{children}</span>
    </li>
  );
}
