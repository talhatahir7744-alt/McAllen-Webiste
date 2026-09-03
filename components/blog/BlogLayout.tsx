import Image from 'next/image';
import type { ReactNode } from 'react';
import { SITE } from '@/components/site-config';
import type { BlogPost } from '@/lib/blog-posts';
import { localizeHref, ui, type Locale } from '@/lib/i18n';
import { Faq } from './Faq';
import { Rich } from './Rich';
import styles from './blog.module.css';

/* Orange brush-stroke divider used under the site's own headings (same SVG as the GHL pages). */
export function Divider({ className }: { className?: string }) {
  return (
    <svg className={`${styles.divider} ${className || ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430.89 17.62" aria-hidden="true" focusable="false">
      <path fill="#f58433" d="M427.53,6.47l-3.37-.21-6.73-.44C296.38-.75,175-1.39,53.88,2.07,36.2,2.67,17.6,3.39,0,4.47v.66c60.27.54,154.52,1,215.44,1.43,60.73.24,155.45.72,215.45.8V6.71l-3.36-.24" />
      <path fill="#f58433" d="M297.61,11c-23-.11-58.93.06-82.17.11s-59.28.4-82.16.74v.65l1.29.22,1.28.19c6,.92,12,1.58,18,2.16a671.21,671.21,0,0,0,123.25-.63c6.85-.74,13.73-1.57,20.52-2.8V11" />
    </svg>
  );
}

/* Shared page chrome for every blog page: local fonts and the continuous lavender background (the site footer comes from the root layout). */
export function BlogShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <link rel="stylesheet" precedence="default" href="/assets/gfonts-css/css2_family_Inter_3Awght_400..600_display_swap.css" />
      <link rel="stylesheet" precedence="default" href="/assets/gfonts-css/css2_family_Poppins_3Awght_400_500_600_700_display_swap.css" />
      <link rel="stylesheet" precedence="default" href="/assets/gfonts-css/css2_family_Montserrat_3Awght_400_500_600_700_800_900_display_swap.css" />
      {children}
    </div>
  );
}

function Meta({ post }: { post: BlogPost }) {
  return (
    <div className={styles.meta}>
      <span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
        <time dateTime={post.datePublished}>{post.dateDisplay}</time>
      </span>
      <span aria-hidden="true" className={styles.metaDot}>•</span>
      <span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        {post.readTime}
      </span>
    </div>
  );
}

export function PostCard({ post, headingLevel = 'h3', locale = 'en' }: { post: BlogPost; headingLevel?: 'h2' | 'h3'; locale?: Locale }) {
  const H = headingLevel;
  const t = ui(locale).blog;
  const href = localizeHref(`/blog/${post.slug}`, locale);
  return (
    <article className={styles.card}>
      <a href={href} className={styles.cardImg} tabIndex={-1} aria-hidden="true">
        <Image src={post.featured.src} alt="" width={post.featured.width} height={post.featured.height} sizes="(max-width: 720px) 100vw, 33vw" />
      </a>
      <div className={styles.cardBody}>
        <Meta post={post} />
        <H className={styles.cardTitle}>
          <a href={href}>{post.title}</a>
        </H>
        <p className={styles.cardExcerpt}>{post.excerpt}</p>
        <a href={href} className={styles.cardMore} aria-label={t.read(post.title)}>
          {t.readArticle} <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}

export function BlogCta({ locale = 'en' }: { locale?: Locale }) {
  const t = ui(locale).blog;
  return (
    <section className={styles.cta} aria-labelledby="blog-cta-title">
      <div className={styles.ctaGlow} aria-hidden="true" />
      <p className={styles.ctaEyebrow}>{t.ctaEyebrow}</p>
      <h2 id="blog-cta-title" className={styles.ctaTitle}>{t.ctaTitle}</h2>
      <p className={styles.ctaText}>{t.ctaText}</p>
      <div className={styles.ctaBtns}>
        <a href={localizeHref('/booking', locale)} className={styles.btn}>{t.ctaBook}</a>
        <a href={SITE.phoneHref} className={`${styles.btn} ${styles.btnGhost}`}>{t.ctaCall(SITE.phone)}</a>
      </div>
      <p className={styles.ctaAddr}>{t.ctaAddr}</p>
    </section>
  );
}

export function BlogArticle({ post, related, locale = 'en' }: { post: BlogPost; related: BlogPost[]; locale?: Locale }) {
  const t = ui(locale).blog;
  return (
    <BlogShell>
      <header className={styles.hero}>
        <div className={styles.container}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <a href={localizeHref('/', locale)}>{t.home}</a>
            <span aria-hidden="true">/</span>
            <a href={localizeHref('/blog', locale)}>{t.blogCrumb}</a>
          </nav>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h1 className={styles.title}>{post.title}</h1>
          <Meta post={post} />
          <Divider />
        </div>
      </header>

      <figure className={post.featuredFit === 'contain' ? `${styles.featured} ${styles.featuredContain}` : styles.featured}>
        <Image src={post.featured.src} alt={post.featured.alt} width={post.featured.width} height={post.featured.height} sizes="(max-width: 1100px) 100vw, 1040px" priority />
      </figure>

      <main className={styles.article} id="article">
        {post.sections.map((s, i) => (
          <section key={i} className={styles.section}>
            {s.heading && <h2 className={styles.h2}>{s.heading}</h2>}
            {s.paragraphs.map((p, j) => (
              <p key={j} className={styles.p}>
                <Rich text={p} />
              </p>
            ))}
            {s.image && (
              <figure className={styles.figure}>
                <Image src={s.image.src} alt={s.image.alt} width={s.image.width} height={s.image.height} sizes="(max-width: 820px) 100vw, 780px" loading="lazy" />
                {s.image.caption && <figcaption>{s.image.caption}</figcaption>}
              </figure>
            )}
          </section>
        ))}

        <section className={styles.faq} aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.h2}>{t.faq}</h2>
          <Faq items={post.faqs} />
        </section>
      </main>

      <div className={styles.container}>
        <BlogCta locale={locale} />
        <section className={styles.related} aria-labelledby="related-title">
          <h2 id="related-title" className={styles.h2Center}>{t.related}</h2>
          <div className={styles.cards}>
            {related.map((r) => (
              <PostCard key={r.slug} post={r} locale={locale} />
            ))}
          </div>
        </section>
      </div>
    </BlogShell>
  );
}
