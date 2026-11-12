// GET /api/clearance-summary → { visible: n }: how many clearance listings are showing right now. Read by the
// client pieces that must appear ONLY when there is at least one (the ticker item on every page and the small
// home-page link, components/clearance/ClearanceTickerItem.tsx and ClearanceHomeLink.tsx). Those read it in the
// browser so the 74 prerendered pages stay static; this route and the feed read behind it are cached for 60 s.
import { NextResponse } from 'next/server';
import { getClearance, isVisible } from '@/lib/clearance';

export const revalidate = 60;

export async function GET() {
  const data = await getClearance();
  const now = Date.now();
  const visible = data.listings.filter((l) => isVisible(l, now, data.settings)).length;
  return NextResponse.json({ visible }, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300' } });
}
