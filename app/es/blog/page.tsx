import { BlogIndexPage, blogIndexMetadata } from '@/components/blog/pages';

export const metadata = blogIndexMetadata('es');

export default function BlogIndex() {
  return <BlogIndexPage locale="es" />;
}
