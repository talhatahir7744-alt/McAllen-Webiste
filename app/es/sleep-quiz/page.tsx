// Página del Sleep Fit Quiz, escrita a mano (scripts/convert.mjs la conserva): el quiz corre dentro del header y footer del sitio.
import type { Metadata } from 'next';
import { PageSchema } from '@/components/PageSchema';
import { SleepQuiz, sleepQuizMetadata } from '@/components/SleepQuiz';

export const metadata: Metadata = sleepQuizMetadata('es');

export default function Page() {
  return (
    <>
      {/* the site's structured data (one graph per page, components/PageSchema.tsx) */}
      <PageSchema items={[]} locale="es" />
      <SleepQuiz locale="es" />
    </>
  );
}
