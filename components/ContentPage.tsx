import { Faq } from '@/components/blog/Faq';
import { PageSchema } from '@/components/PageSchema';
import { LOCATION } from '@/lib/location';
import { localizeHref, ui, type Locale } from '@/lib/i18n';
import type { ContentPage as ContentPageData } from '@/lib/pages/types';
import styles from './ContentPage.module.css';

/* Renders a hand-written content page (lib/pages/*) in one locale: breadcrumb, H1, copy, optional table, FAQ
   accordion (the blog's), CTA to /booking, plus FAQPage + BreadcrumbList JSON-LD (and any extra schema the page
   defines). Server-rendered; the FAQ accordion is the same client component the blog uses. */
const SITE_URL = 'https://mcallen.snoozemattresscompany.com';

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
              {s.bullets ? <ul className={styles.list}>{s.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul> : null}
              {(s.h3s || []).map((sub, j) => (
                <div key={j} className={styles.sub}>
                  <h3 className={styles.h3}>{sub.h3}</h3>
                  {(sub.paragraphs || []).map((p, k) => <p key={k} className={styles.p}>{p}</p>)}
                  {sub.bullets ? <ul className={styles.list}>{sub.bullets.map((b, k) => <li key={k}>{b}</li>)}</ul> : null}
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
