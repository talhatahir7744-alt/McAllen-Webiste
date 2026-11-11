'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/* Renders its children on every page except the home pages (/ and /es), which render the same element themselves in
   a different place: the announcement ticker sits under the promo banner slot there (app/(en)/page.tsx,
   app/es/page.tsx) and directly under the header everywhere else (both root layouts). The pathname is known during
   the server render as well, so every page's HTML already carries the right outcome: nothing changes on the client,
   nothing moves. */
export function ExceptHome({ children }: { children: ReactNode }) {
  const path = (usePathname() || '/').replace(/\/+$/, '') || '/';
  return path === '/' || path === '/es' ? null : <>{children}</>;
}
