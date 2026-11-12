// POST /api/clearance-request  (the client's clearance kit, November 2026; docs/clearance-README.md)
// Receives "Request info" and "Text me new deals" submissions and forwards them to the store's
// Go High Level sub-account through a workflow Inbound Webhook. The webhook URL stays server-side.
//
// Env vars (Vercel > Project > Settings > Environment Variables; names in .env.example):
//   GHL_CLEARANCE_WEBHOOK_URL   Inbound Webhook URL from the store's GHL workflow (required)
//   CLEARANCE_URL               the published Google Sheet CSV (lib/clearance.ts): the item is looked up there, read fresh
import { NextResponse } from 'next/server';
import { getClearance } from '@/lib/clearance';

const clean = (v: unknown, max = 500) => String(v ?? '').trim().slice(0, max);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  // Bots fill the hidden honeypot field. Pretend success so they don't retry.
  if (clean(body.company)) return NextResponse.json({ ok: true });

  const type = body.type === 'alerts' ? 'alerts' : 'request';
  const phone = clean(body.phone, 40);
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || body.sms_consent !== 'yes') {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 422 });
  }

  // McAllen: the listings live in the published Google Sheet; read it fresh so a just-sold item is not requested.
  const clearance = await getClearance({ noStore: true });
  const { store } = clearance;
  const payload: Record<string, unknown> = {
    type,
    store: store.slug,
    store_name: store.name,
    phone,
    sms_consent: 'yes',
    page_url: clean(body.page_url, 300),
    submitted_at: new Date().toISOString(),
    tags: type === 'alerts' ? ['clearance-alerts'] : ['clearance-lead'],
  };

  if (type === 'request') {
    const firstName = clean(body.first_name, 80);
    if (!firstName) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 422 });

    // Look the item up server-side so price/model can't be altered in the browser.
    const listing = clearance.listings.find((l) => l.id === clean(body.listing_id, 40));
    if (!listing) return NextResponse.json({ ok: false, error: 'unknown_listing' }, { status: 404 });

    const hold = body.hold_request === 'yes';
    Object.assign(payload, {
      first_name: firstName,
      last_name: clean(body.last_name, 80),
      email: clean(body.email, 120),
      best_time: clean(body.best_time, 60),
      message: clean(body.message, 1000),
      hold_request: hold ? 'yes' : 'no',
      listing_id: listing.id,
      brand: listing.brand,
      model: listing.model,
      size: listing.size,
      condition: listing.condition,
      sale_price: listing.sale,
      retail_price: listing.retail,
      item_summary: `${listing.brand} ${listing.model} (${listing.size}) – ${listing.condition} – $${listing.sale}`,
      tags: ['clearance-lead', `listing-${listing.id.toLowerCase()}`, ...(hold ? ['hold-request'] : [])],
    });
  }

  const url = process.env.GHL_CLEARANCE_WEBHOOK_URL;
  if (!url) {
    console.error('GHL_CLEARANCE_WEBHOOK_URL is not set');
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`GHL responded ${res.status}`);
  } catch (err) {
    console.error('clearance-request forward failed', err);
    return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
