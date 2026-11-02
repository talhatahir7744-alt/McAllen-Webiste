import type { ReactNode } from 'react';
import { CheckItem } from './icons';

/* The shared type & spacing system (November 3, 2026): one set of components for the site's own pages. They only put
   the shared classes on their elements; every value (sizes, weights, line-heights, colours, gaps, margins, the section
   rhythm) lives once, as tokens, in overrides/global.css ("Shared type & spacing system"), where the GoHighLevel pages'
   builder elements are mapped onto the same rules (scripts/type-roles.mjs). Used by components/ContentPage.tsx,
   components/BookingPage.tsx and components/blog/BlogLayout.tsx. Heroes, navigation, footer, offer banners and
   location cards stay outside it. */

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(' ');

/* a band with the section rhythm (72px top / bottom, 48px on phones); tone="dark" on navy grounds */
export function Section({ children, className, tone, id, labelledBy }: { children: ReactNode; className?: string; tone?: 'dark'; id?: string; labelledBy?: string }) {
  return <section id={id} className={cx('snz-ts-section', tone === 'dark' && 'snz-ts-section--dark', className)} aria-labelledby={labelledBy}>{children}</section>;
}

/* section H2: Poppins 800, black (white on dark), the key phrase in orange when the copy marks it (<u> / .snz-ts-accent) */
export function SectionHeading({ children, id, center, className }: { children: ReactNode; id?: string; center?: boolean; className?: string }) {
  return <h2 id={id} className={cx('snz-ts-h2', center && 'snz-ts-h2--center', className)}>{children}</h2>;
}

/* the line that introduces a list ("Qualified buyers may access:") */
export function LeadIn({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('snz-ts-lead', className)}>{children}</p>;
}

/* a body paragraph (between lists, or after a heading) */
export function BodyText({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('snz-ts-body', className)}>{children}</p>;
}

/* the check-icon list: one icon + text row per item, text wrapping under itself */
export function CheckList({ items, className }: { items: ReactNode[]; className?: string }) {
  return <ul className={cx('snz-check-list', className)}>{items.map((item, i) => <CheckItem key={i}>{item}</CheckItem>)}</ul>;
}

/* image + text, 45 / 55, vertically centred; on phones the image comes first */
export function TwoColumn({ media, children, className }: { media: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cx('snz-ts-twocol', className)}>
      <div className="snz-ts-twocol__media">{media}</div>
      <div className="snz-ts-twocol__text">{children}</div>
    </div>
  );
}

/* the CTA button: one or two lines (label, optional sub-line); variant="ghost" for the secondary button on dark cards */
export function CtaButton({ href, label, sub, variant, icon, center, className }: { href: string; label: ReactNode; sub?: ReactNode; variant?: 'ghost'; icon?: ReactNode; center?: boolean; className?: string }) {
  return (
    <a href={href} className={cx('snz-ts-cta', variant === 'ghost' && 'snz-ts-cta--ghost', center && 'snz-ts-cta--center', className)}>
      <span className="snz-ts-cta__main">{icon}{label}</span>
      {sub ? <span className="snz-ts-cta__sub">{sub}</span> : null}
    </a>
  );
}
