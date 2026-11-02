import { Faq } from '@/components/blog/Faq';
import { Rich, plain } from '@/components/blog/Rich';
import { Icon, iconFor } from '@/components/icons';
import { PageSchema } from '@/components/PageSchema';
import { SizeTypeGrid } from '@/components/SizeTypeGrid';
import { BodyText, CheckList, CtaButton, LeadIn, SectionHeading } from '@/components/TypeSystem';
import { LOCATION } from '@/lib/location';
import { localizeHref, ui, type Locale } from '@/lib/i18n';
import type { ContentPage as ContentPageData, ListStyle, PageCopy } from '@/lib/pages/types';
import styles from './ContentPage.module.css';

/* Copy strings may carry inline [text](href) links (components/blog/Rich.tsx; SEO report, October 27, 2026 — internal
   links). The first "Dream Mapping" mention in the page body links to /dream-mapping (localized), unless the page is
   /dream-mapping itself or the mention already sits inside a link; everything else in the copy is rendered as written. */
function withDreamMappingLink(c: PageCopy, slug: string, locale: Locale): PageCopy {
  if (slug === '/dream-mapping') return c;
  const href = localizeHref('/dream-mapping', locale);
  let done = false;
  const link = (t: string) => {
    if (done || !t.includes('Dream Mapping')) return t;
    return t.split(/(\[[^\]]+\]\([^)]+\))/).map((seg) => {
      if (done || /^\[[^\]]+\]\([^)]+\)$/.test(seg) || !seg.includes('Dream Mapping')) return seg;
      done = true;
      return seg.replace('Dream Mapping', `[Dream Mapping](${href})`);
    }).join('');
  };
  const intro = c.intro.map(link);
  const sections = c.sections.map((s) => ({
    ...s,
    paragraphs: s.paragraphs?.map(link),
    bullets: s.bullets?.map(link),
    h3s: s.h3s?.map((h) => ({ ...h, paragraphs: h.paragraphs?.map(link), bullets: h.bullets?.map(link) })),
  }));
  return { ...c, intro, sections };
}

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
        <CheckList items={items.map((b, j) => <Rich key={j} text={b} />)} />
      </div>
    );
  }
  if (style === 'steps') {
    return (
      <ol className="snz-steps">
        {items.map((b, j) => (
          <li key={j}>
            <span className="snz-badge snz-badge--num" aria-hidden="true">{String(j + 1).padStart(2, '0')}</span>
            <p className="snz-steps__text"><Rich text={b} /></p>
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
                  <span className="snz-card__title"><Rich text={parts[j]![1]} /></span>
                  <span className="snz-card__text"><Rich text={parts[j]![2]} /></span>
                </>
              ) : (
                <span className="snz-card__text"><Rich text={b} /></span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }
  return <CheckList items={items.map((b, j) => <Rich key={j} text={b} />)} />;
}

/* a paragraph is the list's lead-in when it is the last one before a list and ends with a colon; otherwise body copy */
function Paragraphs({ items, list }: { items: string[]; list: boolean }) {
  return (
    <>
      {items.map((p, j) => (list && j === items.length - 1 && /:\s*$/.test(plain(p))
        ? <LeadIn key={j}><Rich text={p} /></LeadIn>
        : <BodyText key={j}><Rich text={p} /></BodyText>))}
    </>
  );
}

export function ContentPage({ page, locale }: { page: ContentPageData; locale: Locale }) {
  const c = withDreamMappingLink(page.copy[locale] || page.copy.en, page.slug, locale);
  const t = ui(locale);
  const home = locale === 'es' ? `${SITE_URL}/es` : SITE_URL;
  const url = `${SITE_URL}${localizeHref(page.slug, locale)}`;
  const schema: Record<string, unknown>[] = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.blog.home, item: home },
      { '@type': 'ListItem', position: 2, name: c.crumb, item: url },
    ] },
    ...(c.faqs.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: c.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: plain(f.answer) } })) }] : []),
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
          {c.intro.map((p, i) => <p key={i} className={styles.lede}><Rich text={p} /></p>)}
        </header>
        <article className={`${styles.article} snz-ts-stack`}>
          {c.sections.map((s, i) => (
            <section key={i} className={styles.section}>
              <SectionHeading>{s.h2}</SectionHeading>
              <Paragraphs items={s.paragraphs || []} list={!!s.bullets} />
              {s.bullets ? <ListBlock items={s.bullets} style={s.listStyle} /> : null}
              {(s.h3s || []).map((sub, j) => (
                <div key={j} className={styles.sub}>
                  <h3 className={styles.h3}>{sub.h3}</h3>
                  <Paragraphs items={sub.paragraphs || []} list={!!sub.bullets} />
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
              <SectionHeading id={`content-faq-${i}`}>{g.h2}</SectionHeading>
              <Faq items={g.faqs} />
            </section>
          )) : c.faqs.length ? (
            <section className={styles.faq} aria-labelledby="content-faq-title">
              <SectionHeading id="content-faq-title">{c.faqTitle}</SectionHeading>
              <Faq items={c.faqs} />
            </section>
          ) : null}
          {sizeGrid ? <SizeTypeGrid locale={locale} current={page.slug} inline /> : null}
        </article>
        <section className={`${styles.cta} snz-ts-section--dark`} aria-labelledby="content-cta-title">
          <SectionHeading id="content-cta-title" center>{c.cta.title}</SectionHeading>
          <LeadIn className={styles.ctaText}>{c.cta.text}</LeadIn>
          <div className={styles.ctaBtns}>
            <CtaButton href={localizeHref('/booking', locale)} label={c.cta.button} center />
            <CtaButton href={L.phoneHref} label={t.menu.call(L.phone)} variant="ghost" center />
          </div>
          <p className={styles.ctaAddr}>{L.street}, {L.city}, {L.region} {L.postalCode} · {(L.hours[locale] || L.hours.en).join(', ')}</p>
        </section>
      </div>
    </main>
  );
}
