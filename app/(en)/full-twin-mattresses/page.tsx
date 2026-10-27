// Hand-written content page (lib/pages/full-twin-mattresses.ts, rendered by components/ContentPage.tsx; kept by scripts/convert.mjs).
import type { Metadata } from 'next';
import { ContentPage } from '@/components/ContentPage';
import { PAGE } from '@/lib/pages/full-twin-mattresses';

const c = PAGE.copy.en;
export const metadata: Metadata = {
  title: c.title,
  description: c.description,
  alternates: { canonical: '/full-twin-mattresses', languages: { 'en-US': '/full-twin-mattresses', 'es-US': '/es/full-twin-mattresses', 'x-default': '/full-twin-mattresses' } },
  openGraph: { title: c.title, description: c.description, url: '/full-twin-mattresses', type: 'website', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a90ca4e747464c6b3a3be10.png.webp'], locale: 'en_US' },
  twitter: { card: 'summary_large_image', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a90ca4e747464c6b3a3be10.png.webp'] },
  icons: { icon: '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png' },
};

export default function Page() {
  return <ContentPage page={PAGE} locale="en" />;
}
