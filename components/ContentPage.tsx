import { Faq } from '@/components/blog/Faq';
import { CheckItem, Icon, iconFor } from '@/components/icons';
import { PageSchema } from '@/components/PageSchema';
import { SizeTypeGrid } from '@/components/SizeTypeGrid';
import { LOCATION } from '@/lib/location';
import { localizeHref, ui, type Locale } from '@/lib/i18n';
import type { ContentPage as ContentPageData, ListStyle } from '@/lib/pages/types';
import styles from './ContentPage.module.css';

/* Renders a hand-written content page (lib/pages/*) in one locale: breadcrumb, H1, copy, optional table, FAQ
   accordion (the blog's), CTA to /booking, plus FAQPage + BreadcrumbList JSON-LD (and any extra schema the page
   defines). Server-rendered; the FAQ accordion is the same client component the blog uses. */
const SITE_URL = 'https://mcallen.snoozemattresscompany.com';

/* A bullet list in the style its data asks for (lib/pages/types.ts listStyle; October 27, 2026): icon cards for
   benefits and features (an item written "Label: text" gets the label as its title), a numbered timeline for steps,
   the check list in a navy card for key facts; otherwise the plain check list. The copy is the list's own. */
function ListBlock({ items, style }: { items: string[]; style?: ListStyle }) {
  if (style === 'facts') {
    return (
      <div className="snz-facts">
        <ul className={`${styles.list} snz-check-list`}>{items.map((b, j) => <CheckItem key={j}>{b}</CheckItem>)}</ul>
      </div>
    );
  }
  if (style === 'steps') {
    return (
      <ol className="snz-steps">
        {items.map((b, j) => (
          <li key={j}>
            <span className="snz-badge snz-badge--num" aria-hidden="true">{String(j + 1).padStart(2, '0')}</span>
            <p className="snz-steps__text">{b}</p>
          </li>
        ))}
      </ol>
    );
  }
  if (style === 'cards') {
    const parts = items.map((b) => b.match(/^([^:]{2,40}):\s+(.+)$/));
    const titled = parts.every(Boolean);
    const twoUp = items.length % 3 !== 0 && items.length % 2 === 0;
    return (
      <ul className={`snz-cards${twoUp ? ' snz-cards--2' : ''}`}>
        {items.map((b, j) => (
          <li key={j}>
            <div className="snz-card">
              <span className="snz-badge snz-badge--soft"><Icon name={iconFor(b)} /></span>
              {titled ? (
                <>
                  <span className="snz-card__title">{parts[j]![1]}</span>
                  <span className="snz-card__text">{parts[j]![2]}</span>
                </>
              ) : (
                <span className="snz-card__text">{b}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }
  return <ul className={`${styles.list} snz-check-list`}>{items.map((b, j) => <CheckItem key={j}>{b}</CheckItem>)}</ul>;
}

export function ContentPage({ page, locale }: { page: ContentPageData; locale: Locale }) {
  const c = page.copy[locale] || page.copy.en;
  const t = ui(locale);
  const home = locale === 'es' ? `${SITE_URL}/es` : SITE_URL;
  const url = `${SITE_URL}${localizeHref(page.slug, locale)}`;
  const schema: Record<string, unknown>[] = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.blog.home, item: home },
      { '@type': 'ListItem', position: 2, name: c.crumb, item: url },
    ] },
    ...(c.faqs.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: c.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }] : []),
    ...(page.extraSchema ? page.extraSchema(locale) : []),
  ];
  const L = LOCATION;
  /* the size/type cards on the size/type pages and the buying guide, without the page's own card */
  const sizeGrid = page.kind === 'product' || page.slug === '/how-to-choose-a-mattress';
  return (
    <main className={styles.page} data-content-page={page.slug}>
      <PageSchema items={schema} />
      <div className={styles.container}>
        <nav className={styles.crumbs} aria-label={locale === 'es' ? 'Ruta de navegación' : 'Breadcrumb'}>
          <a href={localizeHref('/', locale)}>{t.blog.home}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{c.crumb}</span>
        </nav>
        <header className={styles.hero}>
          {c.eyebrow ? <p className={styles.eyebrow}>{c.eyebrow}</p> : null}
          <h1 className={styles.title}>{c.h1}</h1>
          {c.intro.map((p, i) => <p key={i} className={styles.lede}>{p}</p>)}
        </header>
        <article className={styles.article}>
          {c.sections.map((s, i) => (
            <section key={i} className={styles.section}>
              <h2 className={styles.h2}>{s.h2}</h2>
              {(s.paragraphs || []).map((p, j) => <p key={j} className={styles.p}>{p}</p>)}
              {s.bullets ? <ListBlock items={s.bullets} style={s.listStyle} /> : null}
              {(s.h3s || []).map((sub, j) => (
                <div key={j} className={styles.sub}>
                  <h3 className={styles.h3}>{sub.h3}</h3>
                  {(sub.paragraphs || []).map((p, k) => <p key={k} className={styles.p}>{p}</p>)}
                  {sub.bullets ? <ListBlock items={sub.bullets} style={sub.listStyle} /> : null}
                </div>
              ))}
            </section>
          ))}
          {c.table ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.caption}>{c.table.caption}</caption>
                <thead><tr>{c.table.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
                <tbody>{c.table.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}</tr>)}</tbody>
              </table>
            </div>
          ) : null}
          {c.faqGroups ? c.faqGroups.map((g, i) => (
            <section key={i} className={styles.faq} aria-labelledby={`content-faq-${i}`}>
              <h2 id={`content-faq-${i}`} className={styles.h2}>{g.h2}</h2>
              <Faq items={g.faqs} />
            </section>
          )) : c.faqs.length ? (
            <section className={styles.faq} aria-labelledby="content-faq-title">
              <h2 id="content-faq-title" className={styles.h2}>{c.faqTitle}</h2>
              <Faq items={c.faqs} />
            </section>
          ) : null}
          {sizeGrid ? <SizeTypeGrid locale={locale} current={page.slug} inline /> : null}
        </article>
        <section className={styles.cta} aria-labelledby="content-cta-title">
          <h2 id="content-cta-title" className={styles.ctaTitle}>{c.cta.title}</h2>
          <p className={styles.ctaText}>{c.cta.text}</p>
          <div className={styles.ctaBtns}>
            <a className={styles.btn} href={localizeHref('/booking', locale)}>{c.cta.button}</a>
            <a className={`${styles.btn} ${styles.btnGhost}`} href={L.phoneHref}>{t.menu.call(L.phone)}</a>
          </div>
          <p className={styles.ctaAddr}>{L.street}, {L.city}, {L.region} {L.postalCode} · {(L.hours[locale] || L.hours.en).join(', ')}</p>
        </section>
      </div>
    </main>
  );
}
