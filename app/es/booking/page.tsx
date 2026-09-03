// Hand-written booking page (kept by scripts/convert.mjs): the calendar embed sits directly in the page body.
import type { Metadata } from 'next';
import { BookingPage } from '@/components/BookingPage';

export const metadata: Metadata = {
  title: '¡Da el Primer Paso Hacia un Sueño Profundo y Reparador!',
  description: 'Agenda tu cita personalizada de Dream Mapping y descubre tu colchón perfecto.',
  alternates: { canonical: '/es/booking', languages: { en: '/booking', es: '/es/booking', 'x-default': '/booking' } },
  openGraph: { title: '¡Da el Primer Paso Hacia un Sueño Profundo y Reparador!', description: 'Agenda tu cita personalizada de Dream Mapping y descubre tu colchón perfecto.', url: '/es/booking', type: 'website', locale: 'es_US', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a7c8daffe4291bd100eddea.png'] },
  twitter: { card: 'summary_large_image', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a7c8daffe4291bd100eddea.png'] },
  icons: { icon: '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png' },
};

export default function Page() {
  return <BookingPage locale='es' />;
}
