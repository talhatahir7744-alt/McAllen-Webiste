/* Blog route bodies shared by the English (/blog) and Spanish (/es/blog) routes. */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogArticle, BlogCta, BlogShell, Divider, PostCard } from '@/components/blog/BlogLayout';
import { plain } from '@/components/blog/Rich';
import { SITE } from '@/components/site-config';
import styles from '@/components/blog/blog.module.css';
import { getPost, postsFor, relatedPosts } from '@/lib/blog-posts';
import { localizeHref, ui, type Locale } from '@/lib/i18n';

const SITE_URL = 'https://mcallen.snoozemattresscompany.com';
const FAVICON = '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png';
const OG_LOCALE: Record<Locale, string> = { en: 'en_US', es: 'es_US' };
const LANG: Record<Locale, string> = { en: 'en-US', es: 'es-US' };

const alternates = (path: string, locale: Locale) => ({
  canonical: localizeHref(path, locale),
  languages: { en: localizeHref(path, 'en'), es: localizeHref(path, 'es'), 'x-default': localizeHref(path, 'en') },
});

export function blogIndexMetadata(locale: Locale): Metadata {
  const t = ui(locale).blog;
  const posts = postsFor(locale);
  return {
    title: t.indexMetaTitle,
    description: t.indexMetaDesc,
    alternates: alternates('/blog', locale),
    openGraph: { type: 'website', title: t.indexMetaTitle, description: t.ogDesc, url: localizeHref('/blog', locale), locale: OG_LOCALE[locale], images: [posts[0].featured.src] },
    twitter: { card: 'summary_large_image', images: [posts[0].featured.src] },
    icons: { icon: FAVICON },
  };
}

export function BlogIndexPage({ locale }: { locale: Locale }) {
  const t = ui(locale).blog;
  const posts = [...postsFor(locale)].sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1));
  return (
    <BlogShell>
      <header className={styles.indexHero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h1 className={styles.title}>{t.indexTitle}</h1>
          <p className={styles.indexIntro}>{t.indexIntro}</p>
          <Divider />
        </div>
      </header>
      <main className={`${styles.container} ${styles.indexGrid}`}>
        <div className={styles.cards}>
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} headingLevel="h2" locale={locale} />
          ))}
        </div>
        <BlogCta locale={locale} />
        <div style={{ height: 'clamp(48px, 6vw, 80px)' }} />
      </main>
    </BlogShell>
  );
}

export function postMetadata(slug: string, locale: Locale): Metadata {
  const post = getPost(slug, locale);
  if (!post) return {};
  const t = ui(locale).blog;
  const path = `/blog/${post.slug}`;
  const url = localizeHref(path, locale);
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: alternates(path, locale),
    openGraph: {
      type: 'article',
      title: post.metaTitle,
      description: post.metaDescription,
      url,
      locale: OG_LOCALE[locale],
      siteName: 'Snooze Mattress Company',
      publishedTime: post.datePublished,
      modifiedTime: post.datePublished,
      authors: [t.org],
      images: [{ url: post.featured.src, width: post.featured.width, height: post.featured.height, alt: post.featured.alt }],
    },
    twitter: { card: 'summary_large_image', title: post.metaTitle, description: post.metaDescription, images: [post.featured.src] },
    icons: { icon: FAVICON },
  };
}

export function PostPage({ slug, locale }: { slug: string; locale: Locale }) {
  const post = getPost(slug, locale);
  if (!post) notFound();
  const t = ui(locale).blog;
  const related = relatedPosts(post.slug, locale);
  const url = `${SITE_URL}${localizeHref(`/blog/${post.slug}`, locale)}`;
  const home = `${SITE_URL}${localizeHref('/', locale)}`;
  const wordCount = post.sections.flatMap((s) => s.paragraphs).map(plain).join(' ').split(/\s+/).length;

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#post`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        url,
        headline: post.title,
        description: post.metaDescription,
        image: { '@type': 'ImageObject', url: `${SITE_URL}${post.featured.src}`, width: post.featured.width, height: post.featured.height },
        datePublished: post.datePublished,
        dateModified: post.datePublished,
        author: { '@type': 'Organization', name: t.org, url: SITE_URL },
        publisher: { '@type': 'Organization', name: t.org, url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}${SITE.logo}` } },
        keywords: post.keywords.join(', '),
        wordCount,
        articleSection: t.section,
        inLanguage: LANG[locale],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage: LANG[locale],
        mainEntity: post.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.home, item: home },
          { '@type': 'ListItem', position: 2, name: t.blogCrumb, item: `${SITE_URL}${localizeHref('/blog', locale)}` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }} />
      <BlogArticle post={post} related={related} locale={locale} />
    </>
  );
}
