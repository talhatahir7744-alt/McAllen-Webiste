'use client';

import { useState } from 'react';
import type { StoreInfo } from '@/lib/clearance';
import styles from './clearance.module.css';

export default function NotifyForm({ store }: { store: StoreInfo }) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!String(fd.get('phone') || '').trim() || fd.get('sms_consent') !== 'yes') return;
    setBusy(true);
    const res = await fetch('/api/clearance-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...Object.fromEntries(fd.entries()), type: 'alerts', page_url: `${window.location.origin}/clearance` }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) setDone(true);
  }

  return (
    <section className={styles.notify}>
      <div className={`${styles.wrap} ${styles.notifyInner}`}>
        <div className={styles.notifyCopy}>
          <h2>New deals drop <b>often</b></h2>
          <p>Get a text when new floor models and clearance pieces arrive at {store.name}.</p>
        </div>
        {done ? (
          <p className={styles.notifyDone}>You&apos;re on the list. Watch for a text when new deals arrive.</p>
        ) : (
          <form className={styles.notifyForm} onSubmit={submit}>
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className={styles.hp} aria-hidden="true" />
            <label className={`${styles.field} ${styles.grow}`}>Mobile phone
              <input name="phone" type="tel" autoComplete="tel" required placeholder="(956) 555-0123" />
            </label>
            <button type="submit" className={`${styles.pill} ${styles.pillBlue}`} disabled={busy}>Text me new deals</button>
            <label className={styles.consent}>
              <input type="checkbox" name="sms_consent" value="yes" required />
              <span>I agree to receive text messages from {store.name} about new deals. Message and data rates may apply. Reply STOP to opt out.</span>
            </label>
          </form>
        )}
      </div>
    </section>
  );
}
