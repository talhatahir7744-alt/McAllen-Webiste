// Hand-written content page (lib/pages/mattresses-for-back-pain.ts, rendered by components/ContentPage.tsx; kept by scripts/convert.mjs).
import type { Metadata } from 'next';
import { ContentPage } from '@/components/ContentPage';
import { PAGE } from '@/lib/pages/mattresses-for-back-pain';

const c = PAGE.copy.en;
export const metadata: Metadata = {
  title: c.title,
  description: c.description,
  alternates: { canonical: '/mattresses-for-back-pain', languages: { 'en-US': '/mattresses-for-back-pain', 'es-US': '/es/mattresses-for-back-pain', 'x-default': '/mattresses-for-back-pain' } },
  openGraph: { title: c.title, description: c.description, url: '/mattresses-for-back-pain', type: 'website', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a90ca4e747464c6b3a3be10.png.webp'], locale: 'en_US' },
  twitter: { card: 'summary_large_image', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a90ca4e747464c6b3a3be10.png.webp'] },
  icons: { icon: '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png' },
};

export default function Page() {
  return <ContentPage page={PAGE} locale="en" />;
}
