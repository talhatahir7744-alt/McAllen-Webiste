'use client';

import { useEffect, useRef, useState } from 'react';
import type { Listing, StoreInfo } from '@/lib/clearance';
import { money } from '@/lib/clearance';
import styles from './clearance.module.css';

type Phase = 'form' | 'sending' | 'done' | 'error';

export default function RequestInfoModal({ listing: l, store, onClose }: {
  listing: Listing; store: StoreInfo; onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('form');
  const [firstName, setFirstName] = useState('');
  const [err, setErr] = useState('');
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries()) as Record<string, string>;
    if (!payload.first_name?.trim() || !payload.phone?.trim() || payload.sms_consent !== 'yes') {
      setErr('Please add your first name and mobile phone, and check the text message box.');
      return;
    }
    setErr('');
    setPhase('sending');
    try {
      const res = await fetch('/api/clearance-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, type: 'request', listing_id: l.id, page_url: `${window.location.origin}/clearance#${l.id}` }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setFirstName(payload.first_name.trim());
      setPhase('done');
      // Analytics (GTM is already on the site):
      (window as unknown as { dataLayer?: object[] }).dataLayer?.push({ event: 'clearance_request_submit', listing_id: l.id, hold: payload.hold_request === 'yes' });
    } catch {
      setPhase('error');
    }
  }

  return (
    <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="req-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.dialog}>
        <div className={styles.dialogHead}>
          <h2 id="req-title">Request info</h2>
          <button type="button" className={styles.x} aria-label="Close" onClick={onClose}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#001489" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className={styles.summary}>
          <div className={styles.thumb}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {l.photos[0] && <img src={l.photos[0]} alt="" />}
          </div>
          <div>
            <div className={styles.sumL1}>{l.brand} · {l.condition}</div>
            <div className={styles.sumL2}>{l.model} – {l.size}</div>
            <div className={styles.sumL3}><strong>{money(l.sale)}</strong> <s>{money(l.retail)}</s> · Listing {l.id}</div>
          </div>
        </div>

        {phase === 'done' ? (
          <div className={styles.success}>
            <div className={styles.ok}>
              <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h3>You&apos;re all set, <b>{firstName}</b>!</h3>
            <p>A Sleep Coach from {store.name} will call you shortly about the {l.brand} {l.model} ({l.size}). We&apos;ve also sent you a text to confirm.</p>
            <button type="button" className={`${styles.pill} ${styles.pillOutline}`} onClick={onClose}>Back to deals</button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={submit} noValidate>
            {/* Honeypot: real people never see or fill this */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className={styles.hp} aria-hidden="true" />
            <p className={styles.formIntro}>Leave your info and a Sleep Coach from {store.name} will call you about this item.</p>
            <div className={styles.two}>
              <label className={styles.field}>First name<input ref={firstField} name="first_name" autoComplete="given-name" required /></label>
              <label className={styles.field}>Last name<input name="last_name" autoComplete="family-name" /></label>
              <label className={styles.field}>Mobile phone<input name="phone" type="tel" autoComplete="tel" required placeholder="(956) 555-0123" /></label>
              <label className={styles.field}>Email (optional)<input name="email" type="email" autoComplete="email" /></label>
            </div>
            <label className={styles.field}>Best time to call
              <select name="best_time" defaultValue="As soon as possible">
                <option>As soon as possible</option>
                <option>Morning (10 AM–12 PM)</option>
                <option>Afternoon (12–4 PM)</option>
                <option>Evening (4–7 PM)</option>
              </select>
            </label>
            <label className={styles.hold}>
              <input type="checkbox" name="hold_request" value="yes" />
              <span><strong>Hold it for me</strong><span>Ask us to set this item aside for 24 hours while you plan your visit.</span></span>
            </label>
            <label className={styles.field}>Questions for your Sleep Coach (optional)<textarea name="message" rows={3} /></label>
            <label className={styles.consent}>
              <input type="checkbox" name="sms_consent" value="yes" required />
              <span>I agree to receive text messages from {store.name} about my request. Message and data rates may apply. Reply STOP to opt out.</span>
            </label>
            {err && <div className={styles.error} role="alert">{err}</div>}
            {phase === 'error' && (
              <div className={styles.error} role="alert">
                Something went wrong sending your request. Please try again or call us at <a href={`tel:${store.phone.replace(/\D/g, '')}`}>{store.phone}</a>.
              </div>
            )}
            <button type="submit" className={`${styles.pill} ${styles.pillOrange} ${styles.submit}`} disabled={phase === 'sending'}>
              {phase === 'sending' ? 'Sending…' : 'Send my request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
