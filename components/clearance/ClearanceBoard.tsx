'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Listing, StoreInfo } from '@/lib/clearance';
import { money, perks, savePct } from '@/lib/clearance';
import RequestInfoModal from './RequestInfoModal';
import NotifyForm from './NotifyForm';
import styles from './clearance.module.css';

const CATEGORIES: [string, string][] = [
  ['all', 'All'], ['mattress', 'Mattresses'], ['base', 'Adjustable bases'], ['chair', 'Massage chairs'],
];
const SIZES: [string, string][] = [
  ['all', 'All sizes'], ['Twin', 'Twin'], ['Full', 'Full'], ['Queen', 'Queen'], ['King', 'King'], ['Cal King', 'Cal King'],
];
type Sort = 'savings' | 'low' | 'new';

const fmtDate = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function ClearanceBoard({ listings, store }: { listings: Listing[]; store: StoreInfo }) {
  const [cat, setCat] = useState('all');
  const [size, setSize] = useState('all');
  const [sort, setSort] = useState<Sort>('savings');
  const [selected, setSelected] = useState<Listing | null>(null);
  const [target, setTarget] = useState<string | null>(null);

  const shown = useMemo(() => {
    const list = listings.filter((l) => (cat === 'all' || l.category === cat) && (size === 'all' || l.size === size));
    return list.sort((a, b) => {
      if ((a.status === 'sold') !== (b.status === 'sold')) return a.status === 'sold' ? 1 : -1;
      if (sort === 'low') return a.sale - b.sale;
      if (sort === 'new') return b.listed.localeCompare(a.listed);
      return savePct(b) - savePct(a);
    });
  }, [listings, cat, size, sort]);

  const available = shown.filter((l) => l.status !== 'sold').length;

  // Jump links: /clearance#MCA-1101 scrolls to and highlights the card. Missing item = normal page.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTarget(id);
      const t = setTimeout(() => setTarget(null), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <>
      <section className={styles.filters} aria-label="Filter deals">
        <div className={`${styles.wrap} ${styles.filtersInner}`}>
          <ChipRow label="Category" options={CATEGORIES} value={cat} onChange={setCat} />
          <ChipRow label="Size" options={SIZES} value={size} onChange={setSize} />
        </div>
      </section>

      <main className={`${styles.wrap} ${styles.main}`}>
        <div className={styles.toolbar}>
          <div className={styles.count} aria-live="polite">
            {available === 1 ? '1 deal available' : `${available} deals available`}
          </div>
          <label className={styles.sortLabel}>
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={styles.select}>
              <option value="savings">Biggest savings</option>
              <option value="low">Price: low to high</option>
              <option value="new">Newest listed</option>
            </select>
          </label>
        </div>

        {shown.length === 0 ? (
          <div className={styles.empty}>
            <h3>Nothing here right now</h3>
            <p>New deals drop often. Sign up below and we&apos;ll text you when new floor models and clearance pieces arrive.</p>
            <button type="button" className={`${styles.pill} ${styles.pillOutline}`} onClick={() => { setCat('all'); setSize('all'); }}>
              See all deals
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {shown.map((l) => (
              <Card key={l.id} l={l} highlighted={target === l.id} onRequest={() => setSelected(l)} />
            ))}
          </div>
        )}
      </main>

      <NotifyForm store={store} />

      {selected && <RequestInfoModal listing={selected} store={store} onClose={() => setSelected(null)} />}
    </>
  );
}

function ChipRow({ label, options, value, onChange }: {
  label: string; options: [string, string][]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className={styles.chipRow}>
      <span className={styles.chipLabel}>{label}</span>
      {options.map(([v, text]) => (
        <button key={v} type="button" className={styles.chip} aria-pressed={value === v} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

function Card({ l, highlighted, onRequest }: { l: Listing; highlighted: boolean; onRequest: () => void }) {
  const [i, setI] = useState(0);
  const sold = l.status === 'sold';
  const n = l.photos.length;
  const step = (d: number) => setI((x) => (x + d + n) % n);
  const qty = sold ? 'Sold' : l.qty === 1 ? 'Only 1 left' : `${l.qty} available`;

  return (
    <article id={l.id} className={`${styles.card} ${sold ? styles.sold : ''} ${highlighted ? styles.target : ''}`}>
      <div className={styles.photo}>
        {n > 0 ? (
          // Plain <img> so photos can come from /public or any URL (e.g. GHL media library) without image config.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={l.photos[i]} alt={`${l.brand} ${l.model}, photo ${i + 1} of ${n}`} loading="lazy" />
        ) : (
          <div className={styles.photoPh}>Photo coming soon</div>
        )}
        <div className={styles.tag}>{l.condition}</div>
        <div className={styles.saveBadge}>Save {savePct(l)}%</div>
        {n > 1 && (
          <>
            <button type="button" className={`${styles.navBtn} ${styles.prev}`} aria-label="Previous photo" onClick={() => step(-1)}>
              <Chevron dir="left" />
            </button>
            <button type="button" className={`${styles.navBtn} ${styles.next}`} aria-label="Next photo" onClick={() => step(1)}>
              <Chevron dir="right" />
            </button>
            <div className={styles.dots} aria-hidden="true">
              {l.photos.map((_, k) => <span key={k} className={k === i ? styles.dotOn : undefined} />)}
            </div>
          </>
        )}
        {sold && <div className={styles.soldOver}><b>SOLD</b></div>}
      </div>

      <div className={styles.body}>
        <div>
          <div className={styles.brand}>{l.brand}</div>
          <h2 className={styles.model}>{l.model}</h2>
        </div>
        <div className={styles.specs}>
          {[l.size, l.comfort, l.construction].filter(Boolean).map((s) => <span key={s}>{s}</span>)}
        </div>
        <div className={styles.price}>
          <span className={styles.sale}>{money(l.sale)}</span>
          <span className={styles.retail}>Retail {money(l.retail)}</span>
          <span className={styles.youSave}>You save {money(l.retail - l.sale)}</span>
        </div>
        <div className={styles.meta}>
          <span className={styles.qty}>{qty}</span>
          <span>Listed {fmtDate(l.listed)}</span>
          <span>90 days same as cash financing*</span>
        </div>
        <p className={styles.desc}>{l.description}</p>
        <ul className={styles.perks}>
          {perks(l).map((p) => (
            <li key={p}><Check />{p}</li>
          ))}
        </ul>
        <div className={styles.actions}>
          {sold ? (
            <button type="button" className={styles.pill} disabled>Sold – check back soon</button>
          ) : (
            <button type="button" className={`${styles.pill} ${styles.pillOrange}`} onClick={onRequest}>Request info</button>
          )}
          <div className={styles.fine}>Listing {l.id} · In-store purchase only · Final sale</div>
        </div>
      </div>
    </article>
  );
}

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#001489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
  </svg>
);
const Check = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#001489" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
