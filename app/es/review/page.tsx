// Hand-written "Déjanos una Reseña" page (kept by scripts/convert.mjs; SEO audit, October 2026 — section 6c).
// noindex,follow and not in the sitemap: it exists for customers who follow the store's review link, not for search.
import type { Metadata } from 'next';
import { ReviewPage } from '@/components/ReviewPage';

export const metadata: Metadata = {
  title: 'Déjanos una Reseña | Snooze Mattress + Wellness',
  description: 'Deja una reseña en Google para Snooze Mattress + Wellness en McAllen, TX.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/es/review', languages: { en: '/review', es: '/es/review', 'x-default': '/review' } },
  icons: { icon: '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png' },
};

export default function Page() {
  return <ReviewPage locale="es" />;
}
