// Hand-written booking page (kept by scripts/convert.mjs): the calendar embed sits directly in the page body.
import type { Metadata } from 'next';
import { BookingPage } from '@/components/BookingPage';

export const metadata: Metadata = {
  title: 'Take the First Step Towards Deep Restorative Sleep!',
  description: 'Book your personalized Dream Mapping Appointment to discover your perfect mattress.',
  alternates: { canonical: '/booking', languages: { en: '/booking', es: '/es/booking', 'x-default': '/booking' } },
  openGraph: { title: 'Take the First Step Towards Deep Restorative Sleep!', description: 'Book your personalized Dream Mapping Appointment to discover your perfect mattress.', url: '/booking', type: 'website', locale: 'en_US', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a7c8daffe4291bd100eddea.png'] },
  twitter: { card: 'summary_large_image', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a7c8daffe4291bd100eddea.png'] },
  icons: { icon: '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png' },
};

export default function Page() {
  return <BookingPage locale='en' />;
}
