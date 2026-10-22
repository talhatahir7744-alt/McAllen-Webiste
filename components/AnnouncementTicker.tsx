import { TICKER_ITEMS } from '@/lib/announcements';
import type { Locale } from '@/lib/i18n';

/* The orange announcement ticker directly under the sticky header on every page (both root layouts render it, and
   scripts/convert.mjs writes it into the layout template). It is the client's original custom-code marquee from the
   home page's builder section (styles in overrides/global.css, .snooze-ticker-*: orange strip, edge fade, shimmer,
   spinning sparkle separators, 32 s pure-CSS loop), rebuilt as a component so every page carries it and the items
   come from one config array (lib/announcements.ts). Two identical item sets make the loop seamless; the second set
   is hidden from assistive tech. The original block imported a local Nunito stylesheet that is an empty file, so the
   strip has always rendered in the generic sans-serif fallback; the CSS keeps that font stack. No headings, no emoji. */
const LABEL: Record<Locale, string> = { en: 'Promotions', es: 'Promociones' };

function Sparkle() {
  return (
    <span className="snooze-ticker-sep" aria-hidden="true">
      <svg className="snz-ico snz-ico--sparkle" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M12 2.5 14.3 9.7 21.5 12l-7.2 2.3L12 21.5l-2.3-7.2L2.5 12l7.2-2.3z" />
      </svg>
    </span>
  );
}

export function AnnouncementTicker({ locale }: { locale: Locale }) {
  const items = TICKER_ITEMS[locale] || TICKER_ITEMS.en;
  const set = (key: string, hidden: boolean) =>
    items.map((text, i) => (
      <div className="snooze-ticker-item" key={`${key}-${i}`} aria-hidden={hidden ? 'true' : undefined}>
        <span className="snooze-ticker-text">{text}</span>
        <Sparkle />
      </div>
    ));
  return (
    <div className="snooze-ticker-wrap" role="marquee" aria-label={LABEL[locale] || LABEL.en} data-snz-ticker={locale}>
      <div className="snooze-ticker-track">
        {set('a', false)}
        {set('b', true)}
      </div>
    </div>
  );
}
