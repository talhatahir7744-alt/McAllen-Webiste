// Hand-written content page (lib/pages/how-to-choose-a-mattress.ts, rendered by components/ContentPage.tsx; kept by scripts/convert.mjs).
import type { Metadata } from 'next';
import { ContentPage } from '@/components/ContentPage';
import { PAGE } from '@/lib/pages/how-to-choose-a-mattress';

const c = PAGE.copy.es;
export const metadata: Metadata = {
  title: c.title,
  description: c.description,
  alternates: { canonical: '/es/how-to-choose-a-mattress', languages: { en: '/how-to-choose-a-mattress', es: '/es/how-to-choose-a-mattress', 'x-default': '/how-to-choose-a-mattress' } },
  openGraph: { title: c.title, description: c.description, url: '/es/how-to-choose-a-mattress', type: 'website', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a90ca4e747464c6b3a3be10.png.webp'], locale: 'es_US' },
  twitter: { card: 'summary_large_image', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a90ca4e747464c6b3a3be10.png.webp'] },
  icons: { icon: '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png' },
};

export default function Page() {
  return <ContentPage page={PAGE} locale="es" />;
}
