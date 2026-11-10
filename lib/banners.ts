/* The shared promo banner feed (November 2026). One JSON for every Snooze store, published by the banner service at
   process.env.BANNERS_URL (set in the Vercel project's environment):
     { generatedAt, banners: [{ id, name, always, priority, rotateSeconds, href, start, end, stores,
                               slides: [{ desktop, desktopW, desktopH, mobile, mobileW, mobileH, alt, href }] }] }
   start/end are inclusive calendar days (YYYY-MM-DD) in the store's time zone; stores is ["*"] or store slugs; W/H
   are each image's natural pixel size (any ratio). A slide needs a desktop image with its size; a phone image without
   a usable size is replaced by the desktop image, so every image on the page has its true dimensions.

   This site is a static export (next.config.ts, output: 'export'): the feed is read when the site is BUILT, so a
   banner added to the feed, or a start/end date passing, shows on the next build (.github/workflows/
   rebuild-banners.yml triggers one every night just after midnight Central). The fetch keeps `revalidate: 3600` so
   the same code caches for an hour if the site ever serves pages on demand again.

   Everything fails closed: no URL, a non-200, bad JSON, a malformed banner or slide, or an unsafe URL means that item
   (or the whole feed) is skipped and the page renders no banner, never an error. No imports, so the unit checks can
   load it in plain Node. */

export type BannerSlide = {
  desktop?: unknown; desktopW?: unknown; desktopH?: unknown; mobile?: unknown; mobileW?: unknown; mobileH?: unknown;
  alt?: unknown; href?: unknown;
};
export type Banner = {
  id?: unknown; name?: unknown; always?: unknown; priority?: unknown; rotateSeconds?: unknown; href?: unknown;
  start?: unknown; end?: unknown; stores?: unknown; slides?: unknown;
};
export type ActiveSlide = {
  bannerId: string; desktop: string; desktopW: number; desktopH: number; mobile: string; mobileW: number; mobileH: number;
  alt: string; href: string;
};
export type ActiveSlides = { slides: ActiveSlide[]; interval: number };

const MAX_SLIDES = 8;
const DEFAULT_INTERVAL = 5;
const MIN_INTERVAL = 2; // a typo in the feed must not flash slides faster than people can read them
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export async function fetchBanners(): Promise<Banner[]> {
  const url = process.env.BANNERS_URL;
  if (!url) return [];
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    const list = data && typeof data === 'object' ? (data as { banners?: unknown }).banners : null;
    return Array.isArray(list) ? (list as Banner[]) : [];
  } catch {
    return [];
  }
}

/* today's calendar day where the store is ("en-CA" formats as YYYY-MM-DD) */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/* images and links from the feed: https URLs or site-relative paths only (no javascript:, data: or protocol-relative) */
const safeUrl = (v: unknown): string => {
  if (typeof v !== 'string') return '';
  const s = v.trim();
  return /^https:\/\/[^\s"'<>]+$/i.test(s) || /^\/(?!\/)[^\s"'<>]*$/.test(s) ? s : '';
};
const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
/* a natural pixel size: a positive number (or digit string), rounded; 0 = unusable */
const px = (v: unknown): number => {
  const n = typeof v === 'string' && /^\s*\d+(\.\d+)?\s*$/.test(v) ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) && n >= 1 ? Math.round(n) : 0;
};

export function activeSlides(list: Banner[], slug: string, timeZone: string, now: Date = new Date()): ActiveSlides {
  const today = todayIn(timeZone, now);
  const eligible = (Array.isArray(list) ? list : []).filter((b) => {
    if (!b || typeof b !== 'object') return false;
    if (typeof b.id !== 'number' && text(b.id) === '') return false; // every slide carries its banner's id
    const stores = Array.isArray(b.stores) ? b.stores : [];
    if (!stores.includes('*') && !stores.includes(slug)) return false;
    if (b.always === true) return true;
    const start = text(b.start), end = text(b.end);
    return DAY.test(start) && DAY.test(end) && start <= today && today <= end;
  });
  // promos (dated) first, highest priority first; the always-on banners follow them, or stand alone when no promo runs
  const byPriority = (a: Banner, b: Banner) => num(b.priority, 0) - num(a.priority, 0);
  const promos = eligible.filter((b) => b.always !== true).sort(byPriority);
  const always = eligible.filter((b) => b.always === true).sort(byPriority);
  const ordered = promos.length ? [...promos, ...always] : always;

  const slides: ActiveSlide[] = [];
  for (const b of ordered) {
    for (const s of Array.isArray(b.slides) ? (b.slides as BannerSlide[]) : []) {
      if (!s || typeof s !== 'object') continue;
      const desktop = safeUrl(s.desktop), desktopW = px(s.desktopW), desktopH = px(s.desktopH);
      if (!desktop || !desktopW || !desktopH) continue;
      let mobile = safeUrl(s.mobile), mobileW = px(s.mobileW), mobileH = px(s.mobileH);
      if (!mobile || !mobileW || !mobileH) { mobile = desktop; mobileW = desktopW; mobileH = desktopH; }
      slides.push({ bannerId: String(b.id), desktop, desktopW, desktopH, mobile, mobileW, mobileH, alt: text(s.alt), href: safeUrl(s.href) || safeUrl(b.href) });
      if (slides.length === MAX_SLIDES) break;
    }
    if (slides.length === MAX_SLIDES) break;
  }
  if (!slides.length) return { slides: [], interval: DEFAULT_INTERVAL };
  const first = ordered.find((b) => String(b.id) === slides[0].bannerId);
  return { slides, interval: Math.max(MIN_INTERVAL, num(first && first.rotateSeconds, DEFAULT_INTERVAL)) };
}
