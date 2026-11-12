// Clearance & Floor Models (the client's drop-in kit, November 2026; docs/clearance-README.md). Hand-written page,
// kept by scripts/convert.mjs. It lives in the (en) route group for the English header, ticker and footer; the URL
// is /clearance. The listings come from a published Google Sheet CSV (lib/clearance.ts, getClearance), regenerated
// every 60 s; with no sheet the page shows its empty state. There is no Spanish page: /es/clearance 308s here
// (vercel.json).
import type { Metadata } from 'next';
import { getClearance, isVisible, STORE } from '@/lib/clearance';
import ClearanceBoard from '@/components/clearance/ClearanceBoard';
import styles from '@/components/clearance/clearance.module.css';
import { PageSchema } from '@/components/PageSchema';
import { SITE_URL, pageNode } from '@/lib/schema';

// Re-check the feed and visibility (sold window, auto-expire) every minute without a redeploy.
export const revalidate = 60;

const URL_ = `${SITE_URL}/clearance`;

export const metadata: Metadata = {
  title: `Clearance & Floor Models | ${STORE.name}`,
  description: `In-stock floor model and clearance mattresses, adjustable bases and more at ${STORE.name}. Limited quantities. Request info and a Sleep Coach will call you.`,
  alternates: { canonical: '/clearance' },
  // Same tab icon as every other page (the converted pages carry it in their head); without it the browser asks for
  // /favicon.ico, which 404s and logs a console error.
  icons: { icon: '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png' },
};

export default async function ClearancePage() {
  const clearance = await getClearance();
  const { store } = clearance;
  const now = Date.now();
  const listings = clearance.listings.filter((l) => isVisible(l, now, clearance.settings));
  const title = `Clearance & Floor Models | ${store.name}`;

  return (
    <div className={styles.page}>
      {/* the site's structured data (one graph per page, components/PageSchema.tsx): WebPage + BreadcrumbList Home › Clearance */}
      <PageSchema
        locale="en"
        items={[
          pageNode('WebPage', URL_, title, 'en', { description: `Floor model and clearance deals in stock at ${store.name}.` }),
          { '@type': 'BreadcrumbList', '@id': `${URL_}#breadcrumb`, itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Clearance', item: URL_ },
          ] },
        ]}
      />
      <section className={styles.hero}>
        <div className={`${styles.wrap} ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrowLight}>{store.city} store · Limited quantities</div>
            <div className={styles.rule} />
            <h1 className={styles.h1}>
              Floor model &amp; clearance <span>deals</span>
            </h1>
            <p className={styles.heroSub}>
              Great sleep for less. Every piece below is in our {store.city} showroom right now, so come lie
              down on it, and ask for a free Dream Mapping to see if it&apos;s the right fit for your body.
            </p>
          </div>
          <div className={styles.how}>
            <div className={styles.eyebrow}>How it works</div>
            {[
              ['Find your deal', "Browse what's in stock. Quantities are limited and change often."],
              ['Request info', 'A Sleep Coach calls you back to answer questions and can hold the piece for you.'],
              ['Try it, then take it home', 'Visit the store to see it in person and complete your purchase.'],
            ].map(([t, d], i) => (
              <div className={styles.step} key={t}>
                <b className={styles.stepNum}>{i + 1}</b>
                <div>
                  <strong>{t}</strong>
                  <span>{d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ClearanceBoard listings={listings} store={store} />

      <div className={styles.wrap}>
        <p className={styles.disclaimer}>
          In-store purchase only. Items are available at {store.name} while supplies last and may sell before
          the page is updated. All clearance and floor model sales are final. Prices are valid at this location
          only and can&apos;t be combined with other offers. Holds last 24 hours. Photos are of the actual item.
          Warranty, delivery and haul-away details are listed on each item. *90 days same as cash financing
          with approved credit. See store for details.
        </p>
      </div>
    </div>
  );
}
