// Hand-written booking page (kept by scripts/convert.mjs): the calendar embed sits directly in the page body.
import type { Metadata } from 'next';
import { BookingPage } from '@/components/BookingPage';

export const metadata: Metadata = {
  title: 'Agenda tu Dream Mapping en McAllen | Snooze Mattress',
  description: 'Agenda tu Dream Mapping gratis en Snooze Mattress + Wellness, McAllen, TX: una sesión de 5 minutos que encuentra el colchón ideal para tu forma de dormir.',
  alternates: { canonical: '/es/booking', languages: { 'en-US': '/booking', 'es-US': '/es/booking', 'x-default': '/booking' } },
  openGraph: { title: 'Agenda tu Dream Mapping en McAllen | Snooze Mattress', description: 'Agenda tu Dream Mapping gratis en Snooze Mattress + Wellness, McAllen, TX: una sesión de 5 minutos que encuentra el colchón ideal para tu forma de dormir.', url: '/es/booking', type: 'website', locale: 'es_US', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a7c8daffe4291bd100eddea.png'] },
  twitter: { card: 'summary_large_image', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a7c8daffe4291bd100eddea.png'] },
  icons: { icon: '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png' },
};

export default function Page() {
  return <BookingPage locale='es' />;
}
