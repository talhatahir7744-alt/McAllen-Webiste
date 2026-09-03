/*
 * Per-page hero background ("heroBackgrounds" in overrides.json: { "<page>.html": "<image url>" }).
 * GoHighLevel renders a desktop-only and a mobile-only copy of the hero; the first section of each kind
 * that carries a background image (skipping removed sections such as the old header) gets the new image
 * in both places the renderer reads it from: the per-section `.bg-section-<id>` CSS rules (all responsive
 * variants) and the payload node's extra.bgImage.value.url. The regular URL rewriting then maps the image
 * to its local copy.
 */
const isDict = (v) => v && typeof v === 'object' && !Array.isArray(v);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function applyHeroBackground($, json, imageUrl, skipIds) {
  const out = { json: null, desktop: null, mobile: null };
  const styles = $('style').toArray();
  const css = styles.map((s) => $(s).html() || '').join('\n');
  const hasBg = (id) => new RegExp(`\\.bg-${escapeRe(id)}\\s*\\{\\s*background:\\s*url\\(`).test(css);

  // Desktop only: the client's mobile hero copies keep their own (mobile-specific) images. A section without
  // a visibility class shows on every width and is used only when the page has no desktop-only hero.
  let anyWidth = null;
  $('body .c-section').each((_, el) => {
    if (out.desktop && out.mobile) return;
    const id = $(el).attr('id'); if (!id || skipIds.has(id) || !hasBg(id)) return;
    const cls = $(el).attr('class') || '';
    if (/\bdesktop-only\b/.test(cls)) { if (!out.desktop) out.desktop = id; }
    else if (/\bmobile-only\b/.test(cls)) { if (!out.mobile) out.mobile = id; }
    else if (!anyWidth) anyWidth = id;
  });
  if (!out.desktop && anyWidth) out.desktop = anyWidth;
  // both the desktop-only and the mobile-only hero get the image, so the section looks the same on every width
  // imageUrl: one URL for every width, or { desktop, mobile } (either may be null to leave that copy alone)
  const urlFor = (which) => (typeof imageUrl === 'string' ? imageUrl : imageUrl && imageUrl[which]) || null;
  const plan = [['desktop', out.desktop], ['mobile', out.mobile]].filter(([w, id]) => id && urlFor(w));
  out.desktop = plan.some(([w]) => w === 'desktop') ? out.desktop : null; out.mobile = plan.some(([w]) => w === 'mobile') ? out.mobile : null;
  const ids = plan.map(([, id]) => id);
  if (!ids.length) return out;
  const imageFor = Object.fromEntries(plan.map(([w, id]) => [id, urlFor(w)]));

  // 1. CSS rules (every responsive variant)
  for (const s of styles) {
    let html = $(s).html() || ''; let changed = false;
    for (const id of ids) {
      const re = new RegExp(`(\\.bg-${escapeRe(id)}\\s*\\{\\s*background:\\s*url\\()([^)]*)(\\))`, 'g');
      if (re.test(html)) { html = html.replace(re, `$1${imageFor[id]}$3`); changed = true; }
    }
    if (changed) $(s).html(html);
  }

  // 2. payload nodes
  const nodes = JSON.parse(json || '[]');
  const str = (i) => (typeof i === 'number' && i >= 0 && typeof nodes[i] === 'string' ? nodes[i] : null);
  const dict = (i) => (typeof i === 'number' && i >= 0 && isDict(nodes[i]) ? nodes[i] : null);
  let touched = false;
  for (const n of nodes) {
    if (!isDict(n) || !ids.includes(str(n.id))) continue;
    const extra = dict(n.extra); const bg = extra && dict(extra.bgImage); const val = bg && dict(bg.value);
    if (!val) continue;
    val.url = nodes.push(imageFor[str(n.id)]) - 1;
    if ('servingUrl' in val) val.servingUrl = nodes.push('') - 1;
    touched = true;
  }
  if (touched) out.json = JSON.stringify(nodes).replace(/</g, '\\u003C');
  return out;
}
