'use client';
/* One browser-side read of /api/clearance-summary per page view, shared by the ticker item (rendered twice, one per
   marquee set) and the home-page link. Any failure counts as "no listings", so nothing shows. */
let pending: Promise<number> | undefined;
export function visibleClearanceCount(): Promise<number> {
  if (!pending) {
    pending = fetch('/api/clearance-summary')
      .then((r) => (r.ok ? r.json() : { visible: 0 }))
      .then((j: { visible?: unknown }) => (typeof j.visible === 'number' && j.visible > 0 ? j.visible : 0))
      .catch(() => 0);
  }
  return pending;
}
