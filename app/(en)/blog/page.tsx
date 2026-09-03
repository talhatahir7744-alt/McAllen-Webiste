import { BlogIndexPage, blogIndexMetadata } from '@/components/blog/pages';

export const metadata = blogIndexMetadata('en');

export default function BlogIndex() {
  return <BlogIndexPage locale="en" />;
}
