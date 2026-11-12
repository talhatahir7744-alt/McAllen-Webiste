'use client';
import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { visibleClearanceCount } from './summary';
import styles from './ClearanceHomeLink.module.css';

/* The small home-page link to /clearance (under the promo banner slot, above the hero), shown only while the store
   has at least one visible clearance listing (/api/clearance-summary, read in the browser so the home page stays
   static). Nothing is rendered until the count is known. The Spanish home links to the same English page: there is
   no /es/clearance (vercel.json 308s it here). */
const T: Record<Locale, { text: string; cta: string }> = {
  en: { text: 'Floor models & clearance deals are in the showroom right now.', cta: 'See today’s list' },
  es: { text: 'Hay modelos de piso y liquidación en la sala de exhibición ahora mismo.', cta: 'Ver la lista de hoy' },
};

export function ClearanceHomeLink({ locale }: { locale: Locale }) {
  const [show, setShow] = useState(false);
  useEffect(() => { let on = true; visibleClearanceCount().then((n) => { if (on) setShow(n > 0); }); return () => { on = false; }; }, []);
  if (!show) return null;
  const t = T[locale] || T.en;
  return (
    <div className={styles.bar} data-clearance-home-link="">
      <a href="/clearance" className={styles.link}>
        <span>{t.text}</span>
        <strong>{t.cta} →</strong>
      </a>
    </div>
  );
}
