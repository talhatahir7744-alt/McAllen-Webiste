// Hand-written Sleep Fit Quiz page (kept by scripts/convert.mjs): the quiz runs inside the site's header and footer.
import type { Metadata } from 'next';
import { SleepQuiz, sleepQuizMetadata } from '@/components/SleepQuiz';

export const metadata: Metadata = sleepQuizMetadata('en');

export default function Page() {
  return <SleepQuiz locale="en" />;
}
