// Hand-written booking page (kept by scripts/convert.mjs): the calendar embed sits directly in the page body.
import type { Metadata } from 'next';
import { BookingPage } from '@/components/BookingPage';

export const metadata: Metadata = {
  title: 'Book a Free Dream Mapping Fitting in McAllen | Snooze',
  description: 'Book your free Dream Mapping appointment at Snooze Mattress + Wellness in McAllen, TX: a 5-minute fitting that finds the mattress built for how you sleep.',
  alternates: { canonical: '/booking', languages: { 'en-US': '/booking', 'es-US': '/es/booking', 'x-default': '/booking' } },
  openGraph: { title: 'Book a Free Dream Mapping Fitting in McAllen | Snooze', description: 'Book your free Dream Mapping appointment at Snooze Mattress + Wellness in McAllen, TX: a 5-minute fitting that finds the mattress built for how you sleep.', url: '/booking', type: 'website', locale: 'en_US', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a7c8daffe4291bd100eddea.png'] },
  twitter: { card: 'summary_large_image', images: ['/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media/6a7c8daffe4291bd100eddea.png'] },
  icons: { icon: '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png' },
};

export default function Page() {
  return <BookingPage locale='en' />;
}
