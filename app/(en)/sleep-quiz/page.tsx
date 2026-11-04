// Hand-written Sleep Fit Quiz page (kept by scripts/convert.mjs): the quiz runs inside the site's header and footer.
import type { Metadata } from 'next';
import { PageSchema } from '@/components/PageSchema';
import { SleepQuiz, sleepQuizMetadata } from '@/components/SleepQuiz';

export const metadata: Metadata = sleepQuizMetadata('en');

export default function Page() {
  return (
    <>
      {/* the site's structured data (one graph per page, components/PageSchema.tsx) */}
      <PageSchema items={[]} locale="en" />
      <SleepQuiz locale="en" />
    </>
  );
}
