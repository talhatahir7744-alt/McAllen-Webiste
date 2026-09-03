import type { Metadata } from 'next';
import { PostPage, postMetadata } from '@/components/blog/pages';
import { POSTS } from '@/lib/blog-posts';

export const dynamicParams = false;
export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return postMetadata(slug, 'en');
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostPage slug={slug} locale="en" />;
}
