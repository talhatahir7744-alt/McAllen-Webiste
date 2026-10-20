// Página del Sleep Fit Quiz, escrita a mano (scripts/convert.mjs la conserva): el quiz corre dentro del header y footer del sitio.
import type { Metadata } from 'next';
import { SleepQuiz, sleepQuizMetadata } from '@/components/SleepQuiz';

export const metadata: Metadata = sleepQuizMetadata('es');

export default function Page() {
  return <SleepQuiz locale="es" />;
}
