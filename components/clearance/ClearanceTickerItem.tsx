'use client';
import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { visibleClearanceCount } from './summary';

/* The "Floor Model & Clearance Deals" item of the announcement ticker (components/AnnouncementTicker.tsx renders one
   per marquee set). It exists only while the store has at least one visible clearance listing: the count comes
   from /api/clearance-summary in the browser (the ticker is on every page, and those pages stay static). Same
   markup as the other items (the strip's CSS sets the capitals); until the count is known, nothing is rendered —
   the marquee simply has one item fewer, so nothing moves vertically. */
const LABEL: Record<Locale, string> = { en: 'Floor Model & Clearance Deals', es: 'Modelos de Piso y Liquidación' };

export function ClearanceTickerItem({ locale, hidden }: { locale: Locale; hidden: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => { let on = true; visibleClearanceCount().then((n) => { if (on) setShow(n > 0); }); return () => { on = false; }; }, []);
  if (!show) return null;
  return (
    <div className="snooze-ticker-item" aria-hidden={hidden ? 'true' : undefined}>
      <span className="snooze-ticker-text">{LABEL[locale] || LABEL.en}</span>
      <span className="snooze-ticker-sep" aria-hidden="true">
        <svg className="snz-ico snz-ico--sparkle" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M12 2.5 14.3 9.7 21.5 12l-7.2 2.3L12 21.5l-2.3-7.2L2.5 12l7.2-2.3z" />
        </svg>
      </span>
    </div>
  );
}
