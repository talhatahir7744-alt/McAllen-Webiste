'use client';

import { useId, useState } from 'react';
import type { BlogFaq } from '@/lib/blog-posts';
import styles from './blog.module.css';

/* Accessible accordion: one <h3> per question, button with aria-expanded/aria-controls, the panel
   animates open through grid-template-rows and the chevron rotates. */
export function Faq({ items }: { items: BlogFaq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <div className={styles.faqList}>
      {items.map((f, i) => {
        const isOpen = open === i;
        const panelId = `${base}-panel-${i}`;
        const btnId = `${base}-btn-${i}`;
        return (
          <div key={i} className={`${styles.faqItem} ${isOpen ? styles.faqOpen : ''}`}>
            <h3 className={styles.faqQ}>
              <button id={btnId} type="button" className={styles.faqBtn} aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : i)}>
                <span>{f.question}</span>
                <svg className={styles.faqChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className={styles.faqPanel}>
              <div className={styles.faqPanelInner}>
                <p>{f.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
