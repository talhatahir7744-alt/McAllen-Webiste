// Clearance & Floor Models – types and helpers (the client's drop-in kit, November 2026; docs/clearance-README.md).
// McAllen change: the listings are NOT a JSON file in this repo. They come from a published Google Sheet
// (File → Share → Publish to web → CSV), process.env.CLEARANCE_URL. getClearance() reads it with Next's data cache
// (revalidate 60 s; the request route asks for a fresh read), parses the CSV here (quoted fields, commas and newlines
// inside quotes; no package), keeps the rows whose `location` is McAllen and maps them to the kit's Listing type.
// Rows without id / brand / model / sale / retail are skipped and logged. No env or any failure → no listings, so
// the page always renders (its empty state) and the build never depends on the sheet.
//
// Sheet columns (header row first; names matched case-insensitively, order free):
//   location,id,category,brand,model,size,comfort,construction,condition,new_in_box,retail,sale,qty,listed,photos,
//   description,status,sold_date
//   new_in_box yes/no · retail/sale/qty numbers ($ and , allowed) · listed/sold_date YYYY-MM-DD or MM/DD/YYYY ·
//   photos: https URLs separated by | or whitespace (Google Drive share links are converted) · status
//   available | sold | hidden (blank = available). Empty photos → the kit's "Photo coming soon" placeholder.

export type Category = 'mattress' | 'base' | 'chair' | 'other';
export type Status = 'available' | 'sold' | 'hidden';

export interface Listing {
  id: string;              // e.g. MCA-1101 (store prefix + number). Also the jump-link anchor.
  category: Category;
  brand: string;
  model: string;
  size: string;            // Twin | Twin XL | Full | Queen | King | Cal King | Split King
  comfort?: string;        // Firm | Medium | Plush (blank for non-mattress)
  construction?: string;   // Hybrid | Memory foam | Innerspring | feature line for bases/chairs
  condition: string;       // Floor model | Clearance – new in box | Discontinued | Open box
  newInBox: boolean;       // true => "Full manufacturer warranty", false => "Warranty available"
  retail: number;
  sale: number;
  qty: number;
  listed: string;          // YYYY-MM-DD
  photos: string[];        // absolute https URLs. First photo = cover. Empty → the kit's placeholder.
  description: string;
  status: Status;
  soldDate?: string;       // YYYY-MM-DD, set when status becomes "sold"
}

export interface StoreInfo { slug: string; name: string; city: string; phone: string; }
export interface ClearanceSettings { soldVisibleDays: number; autoExpireDays: number }
export interface ClearanceData {
  store: StoreInfo;
  settings: ClearanceSettings;
  listings: Listing[];
}

export const STORE: StoreInfo = { slug: 'mcallen', name: 'Snooze Mattress in McAllen', city: 'McAllen', phone: '(956) 586-5646' };
export const SETTINGS: ClearanceSettings = { soldVisibleDays: 5, autoExpireDays: 30 };
export const LOCATION = 'McAllen'; // the sheet's `location` value for this store (compared trimmed, case-insensitively)

/* ---- CSV ---------------------------------------------------------------------------------------------------- */

/** RFC 4180-style parse: fields split on commas, quoted fields may hold commas, newlines and doubled quotes;
    CRLF or LF rows; a leading BOM and empty lines are ignored. Returns rows of raw strings. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false;
  const s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') { if (s[i + 1] === '"') { field += '"'; i++; } else quoted = false; }
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(field); field = ''; if (row.some((f) => f.trim() !== '')) rows.push(row); row = []; }
    else field += c;
  }
  row.push(field); if (row.some((f) => f.trim() !== '')) rows.push(row);
  return rows;
}

/* ---- cell conversions -------------------------------------------------------------------------------------- */

const DRIVE = /drive\.google\.com\/(?:file\/d\/([\w-]+)|(?:open|uc)\?(?:[^#]*&)?id=([\w-]+))/i;
/** A Google Drive share link becomes a direct image URL; other https URLs pass through; anything else is dropped. */
export function photoUrl(raw: string): string | null {
  const v = raw.trim(); if (!v) return null;
  const m = v.match(DRIVE); if (m) return `https://lh3.googleusercontent.com/d/${m[1] || m[2]}`;
  return /^https:\/\/\S+$/i.test(v) ? v : null;
}
export const parsePhotos = (cell: string): string[] => cell.split(/[|\s]+/).map(photoUrl).filter((u): u is string => !!u);

/** "YYYY-MM-DD" stays; "MM/DD/YYYY" (or M/D/YYYY) is converted; anything else → null. */
export function parseDate(cell: string): string | null {
  const v = cell.trim(); let m;
  if ((m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  if ((m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  return null;
}
/** "$1,299.00" → 1299; blank or not a number → null. */
export function parseNumber(cell: string): number | null {
  const v = cell.replace(/[$,\s]/g, ''); if (!v) return null;
  const n = Number(v); return Number.isFinite(n) ? n : null;
}
const yes = (cell: string) => /^(yes|y|true|1)$/i.test(cell.trim());
const CATEGORIES: Category[] = ['mattress', 'base', 'chair', 'other'];
const STATUSES: Status[] = ['available', 'sold', 'hidden'];

/* ---- rows → listings --------------------------------------------------------------------------------------- */

export type SkippedRow = { line: number; id: string; reason: string };
export const today = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

/** Maps parsed CSV rows (header row first) to listings for one store. `skipped` lists the rows left out and why. */
export function rowsToListings(rows: string[][], location = LOCATION, now = Date.now()): { listings: Listing[]; skipped: SkippedRow[] } {
  const listings: Listing[] = []; const skipped: SkippedRow[] = [];
  if (!rows.length) return { listings, skipped };
  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const col = (row: string[], name: string) => { const i = header.indexOf(name); return i >= 0 && i < row.length ? row[i].trim() : ''; };
  const want = location.trim().toLowerCase();
  rows.slice(1).forEach((row, k) => {
    const line = k + 2; // 1-based, after the header
    if (col(row, 'location').toLowerCase() !== want) return; // another store's row: not an error
    const id = col(row, 'id'), brand = col(row, 'brand'), model = col(row, 'model');
    const retail = parseNumber(col(row, 'retail')), sale = parseNumber(col(row, 'sale'));
    const missing = [!id && 'id', !brand && 'brand', !model && 'model', sale === null && 'sale', retail === null && 'retail'].filter(Boolean);
    if (missing.length) { skipped.push({ line, id, reason: `missing ${missing.join(', ')}` }); return; }
    const rawStatus = col(row, 'status').toLowerCase(); const status: Status = !rawStatus ? 'available' : (STATUSES as string[]).includes(rawStatus) ? (rawStatus as Status) : 'hidden';
    if (rawStatus && status === 'hidden' && rawStatus !== 'hidden') skipped.push({ line, id, reason: `unknown status "${rawStatus}" (treated as hidden)` });
    const rawCat = col(row, 'category').toLowerCase(); const category: Category = (CATEGORIES as string[]).includes(rawCat) ? (rawCat as Category) : 'other';
    const listed = parseDate(col(row, 'listed')) || today(now);
    const soldDate = parseDate(col(row, 'sold_date'));
    const qty = parseNumber(col(row, 'qty'));
    listings.push({
      id, category, brand, model, size: col(row, 'size'), comfort: col(row, 'comfort') || undefined, construction: col(row, 'construction') || undefined,
      condition: col(row, 'condition'), newInBox: yes(col(row, 'new_in_box')), retail: retail as number, sale: sale as number,
      qty: qty === null ? 1 : Math.max(0, Math.round(qty)), listed, photos: parsePhotos(col(row, 'photos')), description: col(row, 'description'), status,
      ...(soldDate ? { soldDate } : {}),
    });
  });
  return { listings, skipped };
}

/* ---- the feed ---------------------------------------------------------------------------------------------- */

/** The store's clearance data from the published sheet. `noStore` reads it fresh (the request route); otherwise
    Next's data cache serves it and refreshes it in the background every 60 s. Never throws: no env or any failure
    → no listings. */
export async function getClearance(opts: { noStore?: boolean } = {}): Promise<ClearanceData> {
  const base: ClearanceData = { store: STORE, settings: SETTINGS, listings: [] };
  const url = process.env.CLEARANCE_URL;
  if (!url) return base;
  try {
    const res = await fetch(url, opts.noStore ? { cache: 'no-store' } : { next: { revalidate: 60 } });
    if (!res.ok) { console.warn(`[clearance] feed responded ${res.status}`); return base; }
    const { listings, skipped } = rowsToListings(parseCsv(await res.text()));
    for (const s of skipped) console.warn(`[clearance] sheet row ${s.line}${s.id ? ` (${s.id})` : ''} skipped: ${s.reason}`);
    return { ...base, listings };
  } catch (err) {
    console.warn('[clearance] feed unavailable:', err instanceof Error ? err.message : err);
    return base;
  }
}

/* ---- the kit's rules (unchanged) --------------------------------------------------------------------------- */

const DAY = 86_400_000;
const daysSince = (d: string, now: number) => (now - new Date(`${d}T12:00:00`).getTime()) / DAY;

/** Sold items show with a SOLD ribbon for a few days; stale items auto-hide. */
export function isVisible(l: Listing, now = Date.now(), s: ClearanceSettings = SETTINGS): boolean {
  if (l.status === 'hidden') return false;
  if (l.status === 'sold') return !l.soldDate || daysSince(l.soldDate, now) <= s.soldVisibleDays;
  if (s.autoExpireDays > 0 && daysSince(l.listed, now) > s.autoExpireDays) return false;
  return true;
}

export function perks(l: Listing): string[] {
  const p = [l.newInBox ? 'Full manufacturer warranty' : 'Warranty available', 'Delivery & setup available'];
  if (l.category === 'mattress') p.push('Old mattress haul-away available');
  return p;
}

export const money = (n: number) => '$' + n.toLocaleString('en-US');
export const savePct = (l: Listing) => Math.round(((l.retail - l.sale) / l.retail) * 100);
