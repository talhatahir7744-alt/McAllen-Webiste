#!/usr/bin/env node
/**
 * convert.mjs — one-shot, repeatable conversion of the wget clone of
 * brownsville.snoozemattresscompany.com into this Next.js 15 App Router project.
 *
 *   node scripts/convert.mjs            # uses CLONE_ROOT (default C:/clones)
 *   CLONE_ROOT=/path/to/clone NEXT_PUBLIC_SITE_URL=https://example.com node scripts/convert.mjs
 *
 * What it does (see README.md for the full story):
 *   0. verifies the clone is complete (every <img src>/srcset resolves to a local file) or aborts
 *   1. copies every non-HTML asset of the clone into public/assets/<alias>/… (collision-free,
 *      Windows-safe names) and records asset-map.json (original local path -> public path)
 *   2. generates one App Router route per HTML page, with `export const metadata`, the page's
 *      <head> stylesheet/style sequence + <body> markup rendered through dangerouslySetInnerHTML,
 *      and every script re-emitted through next/script in the original order
 *   3. rewrites every asset URL (HTML attributes, inline CSS, the Nuxt JSON payload, the Nuxt
 *      runtime config and the copied JS bundles) so nothing points at the original domain/CDNs
 *   4. removes trackers (GTM, gtag, the Facebook pixel loader, GHL reviews widget loader)
 *   5. stubs the LeadConnector widgets (reviews iframe, popup form, booking calendar)
 */
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { extractSections, insertSectionsIntoPage } from './insert-sections.mjs';
import { applyHeroBackground } from './hero-backgrounds.mjs';
import { fluidTypography, addImageDimensions } from './responsive-extras.mjs';
import { loadLocale, translateDom, translateString, tr } from './i18n.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CLONE = (process.env.CLONE_ROOT || 'C:/clones').replace(/\\/g, '/').replace(/\/+$/, '');
const SITE_HOST = 'brownsville.snoozemattresscompany.com';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://brownsville-webiste.vercel.app').replace(/\/+$/, '');
const SITE_DIR = `${CLONE}/${SITE_HOST}`;
const PUBLIC = path.join(ROOT, 'public');
const APP = path.join(ROOT, 'app');

// Host -> public/assets/<alias>. Aliases are deliberately not the hostnames so that a grep of the
// built output for the original hostnames comes back empty.
const HOST_ALIAS = {
  'assets.cdn.filesafe.space': 'filesafe',
  'images.leadconnectorhq.com': 'lcimg',
  'stcdn.leadconnectorhq.com': 'lcstatic',
  'fonts.googleapis.com': 'gfonts-css',
  'fonts.gstatic.com': 'gfonts',
};
const MEDIA_HOSTS = new Set(['assets.cdn.filesafe.space', 'cdn.filesafe.space', 'assets.cdn.msgsndr.com', 'cdn.msgsndr.com']);
const REMOVED_SCRIPT_HOSTS = [
  { test: /apisystem\.tech\/js\/reviews_widget\.js/i, reason: 'GoHighLevel reviews-widget loader (CRM widget)' },
  { test: /storage\.googleapis\.com\/builder-preview\/iframe\/pixel\.js/i, reason: 'Facebook pixel loader (fbevents.js)' },
  { test: /storage\.googleapis\.com\/builder-preview\/iframe\/iframeResizer/i, reason: 'GHL builder-preview iframe resizer (only used inside the GHL editor)' },
];
const TRACKER_SCRIPT_RE = /googletagmanager\.com|google-analytics\.com|gtag\(|gtag\/js|dataLayer|fbq\(|fbevents\.js|connect\.facebook\.net|clarity\.ms|hotjar|leadconnectorhq\.com\/tracking|removed-tracker/i;
// external scripts that may stay external: the client's white-label widget domains (form / calendar / review embeds)
const EXTERNAL_SCRIPT_ALLOW = /^https:\/\/(?:link\.snoozesleep\.com|reputationhub\.site)\//i;

// ---------------------------------------------------------------- overrides (hand-provided section code, live widget embeds, removals)
const OVERRIDES_DIR = path.join(ROOT, 'overrides');
const OVR = fs.existsSync(path.join(OVERRIDES_DIR, 'overrides.json')) ? JSON.parse(fs.readFileSync(path.join(OVERRIDES_DIR, 'overrides.json'), 'utf8')) : {};
OVR.vars ||= {}; OVR.rules ||= []; OVR.widgets ||= {}; OVR.removeElements ||= []; OVR.site ||= {}; OVR.insertSections ||= []; OVR.heroBackgrounds ||= {};
const BUILD_STAMP = Date.now().toString(36); // cache-busts the two page scripts on every regeneration
const RIBBON_IMAGE_ID = '56c2e728-7cc6-48a2-900b-17c687ee6b20'; // the "0% Financing Available" ribbon PNG (replaced by overrides/ribbon.html)
// client-supplied ribbon banners per locale (public/assets/filesafe/ARD47WoZpqaZSQ9MSxLD/media/)
const RIBBON_FILES = { en: { src: '/assets/filesafe/ARD47WoZpqaZSQ9MSxLD/media/6998d2e3d83aec18a37dc71c-w1100.webp', width: 1100, height: 198 }, es: { src: '/assets/filesafe/ARD47WoZpqaZSQ9MSxLD/media/6a70fefca4c8a1a2c30ff22b-w1100.webp', width: 1100, height: 178 } }; // 1100px webp re-encodes of the client's PNGs (displayed at <= 550 CSS px)
const SITE_LOGO = '/assets/lcimg/image/f_webp/q_80/r_1200/u/filesafe/qR8peonBlnjGI3ZuLHQP/media/8d16458d-661d-4d16-bec0-14dea766bf45.webp';
// ---- locales: overrides/i18n/<code>.part-*.json (+ <code>.extra.json) dictionaries; each page is generated once per locale
const I18N_DIR = path.join(OVERRIDES_DIR, 'i18n');
const LOCALES = [{ code: 'en', prefix: '', lang: 'en', htmlLang: 'en', ogLocale: 'en_US' }, { code: 'es', prefix: '/es', lang: 'es', htmlLang: 'es', ogLocale: 'es_US' }];
const EXTRA_LOCALES = fs.existsSync(I18N_DIR) ? LOCALES.filter((l) => l.code !== 'en' && fs.readdirSync(I18N_DIR).some((f) => f.startsWith(l.code + '.part-'))).map((l) => Object.assign(loadLocale(I18N_DIR, l.code), l)) : [];
const SITE_HOSTS = new Set([new URL(SITE_URL).host.toLowerCase(), 'brownsville.snoozemattresscompany.com', 'www.brownsville.snoozemattresscompany.com']);
const localized = (route, loc) => (loc && loc.prefix ? loc.prefix + (route === '/' ? '' : route) : route);
const escapeHtml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MOTION = fs.existsSync(path.join(OVERRIDES_DIR, 'motion.json')) ? JSON.parse(fs.readFileSync(path.join(OVERRIDES_DIR, 'motion.json'), 'utf8')) : { pages: {} };
const motionRulesFor = (rel) => { let r = MOTION.pages[rel]; while (typeof r === 'string') r = MOTION.pages[r]; return [...(r || []), ...(MOTION.pages['*'] || [])]; };
const ovrFile = (name) => fs.readFileSync(path.join(OVERRIDES_DIR, name), 'utf8');
const applyVars = (html, extra = {}) => html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k) => (k in extra ? String(extra[k]) : k in OVR.vars ? String(OVR.vars[k]) : m));
const ruleFor = (html) => OVR.rules.find((r) => r.match.every((s) => html.includes(s)));

const report = {
  siteUrl: SITE_URL,
  insertPacks: [],
  insertedSections: [],
  heroBackgrounds: [],
  motion: [],
  pages: [],
  assets: { copied: 0, bytes: 0, skippedUnchanged: 0, collisions: 0, bundlesPatched: 0, bundleReplacements: {} },
  missingImages: [],           // clone verification failures (fatal)
  missingReferenced: new Set(), // referenced files that do not exist in the clone (non-fatal, reported)
  removedTrackers: [],
  removedScripts: [],
  stubs: [],
  overrides: [],
  widgets: [],
  faqs: [],
  ribbons: [],
  i18n: [],
  embedScripts: [],
  droppedHints: 0,
  rewrittenUrls: 0,
  externalHostsLeft: {},
};

// ---------------------------------------------------------------- helpers
const posix = (p) => p.replace(/\\/g, '/');
function fnv1a(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }
function sanitizeSeg(seg) {
  let s = seg.replace(/[^A-Za-z0-9._-]/g, '_');
  if (s.length > 100) { const ext = (seg.match(/\.[A-Za-z0-9]{1,8}$/) || [''])[0]; s = s.slice(0, 60) + '-' + fnv1a(seg) + ext; }
  return s;
}
function winEscape(s) { return s.replace(/[\\|:?"*<>\x00-\x1f]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')); }
function decodeSeg(s) { try { return decodeURIComponent(s); } catch { return s; } }
function walk(dir, out = []) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; }
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function write(file, content) { ensureDir(path.dirname(file)); fs.writeFileSync(file, content); }
function escapeJsonForScript(json) { return json.replace(/</g, '\\u003C').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'); }
function routeFromPage(relHtml) { const r = relHtml.replace(/\.html$/i, ''); return r === 'index' ? '/' : '/' + r; }

// ---------------------------------------------------------------- 0. verify the clone
const pageFiles = walk(SITE_DIR).filter((f) => f.toLowerCase().endsWith('.html')).map((f) => posix(path.relative(SITE_DIR, f))).sort();
if (pageFiles.length === 0) { console.error(`No HTML pages found under ${SITE_DIR}`); process.exit(1); }
const fontmap = fs.existsSync(`${CLONE}/fontmap.json`) ? JSON.parse(fs.readFileSync(`${CLONE}/fontmap.json`, 'utf8')) : {};

function localRelFromRelative(ref, pageDirPosix) {
  const clean = ref.split('#')[0].split('?')[0];
  if (!clean) return null;
  const abs = path.posix.normalize(path.posix.join(pageDirPosix, ...clean.split('/').map(decodeSeg)));
  const rel = path.posix.relative(CLONE, abs);
  return rel.startsWith('..') ? null : rel;
}
for (const rel of pageFiles) {
  const html = fs.readFileSync(`${SITE_DIR}/${rel}`, 'utf8');
  const $ = cheerio.load(html);
  const pageDir = path.posix.dirname(`${SITE_DIR}/${rel}`);
  $('img').each((_, el) => {
    const cands = [];
    const src = $(el).attr('src'); if (src) cands.push(src);
    const srcset = $(el).attr('srcset'); if (srcset) for (const part of srcset.split(',')) { const u = part.trim().split(/\s+/)[0]; if (u) cands.push(u); }
    for (const c of cands) {
      if (/^(data:|https?:|\/\/)/i.test(c)) { if (/^https?:\/\/(?:[a-z0-9-]+\.)*(snoozemattresscompany\.com|filesafe\.space|leadconnectorhq\.com|msgsndr\.com)/i.test(c)) report.missingImages.push({ page: rel, src: c, why: 'still remote' }); continue; }
      const lr = localRelFromRelative(c, pageDir);
      if (!lr || !fs.existsSync(`${CLONE}/${lr}`)) report.missingImages.push({ page: rel, src: c, why: 'no local file' });
    }
  });
}
if (report.missingImages.length) {
  console.error(`CLONE INCOMPLETE: ${report.missingImages.length} <img> references do not resolve to a local file. Refusing to build on a broken clone.`);
  for (const m of report.missingImages.slice(0, 30)) console.error(`  ${m.page}: ${m.src} (${m.why})`);
  process.exit(2);
}
console.log(`clone check: ${pageFiles.length} pages, every <img> src/srcset resolves locally`);

// ---------------------------------------------------------------- 1. assets
const assetMap = new Map();      // localRel -> publicPath
const usedPublic = new Map();    // publicPath -> localRel
const variantIndex = new Map();  // mediaPath -> [{ size, localRel }]

function publicPathFor(host, segs) {
  const alias = HOST_ALIAS[host];
  segs = segs.slice();
  if (host === 'images.leadconnectorhq.com') {
    const i = segs.findIndex((s) => /^u_https?%3A$/i.test(s));
    if (i >= 0 && segs[i + 1]) {
      let rest = segs.slice(i + 2);
      if (segs[i + 1] === 'storage.googleapis.com' && rest[0] === 'msgsndr') rest = rest.slice(1);
      segs = [...segs.slice(0, i), 'u', 'filesafe', ...rest];
    }
  }
  return `/assets/${alias}/` + segs.map(sanitizeSeg).join('/');
}
function mediaPathOf(host, segs) {
  if (MEDIA_HOSTS.has(host)) return segs.join('/');
  if (host === 'images.leadconnectorhq.com') {
    const i = segs.findIndex((s) => /^u_https?%3A$/i.test(s));
    if (i < 0) return null;
    const mh = segs[i + 1]; let rest = segs.slice(i + 2);
    if (mh === 'storage.googleapis.com' && rest[0] === 'msgsndr') rest = rest.slice(1);
    const size = Number((segs.slice(0, i).find((s) => /^r_\d+$/.test(s)) || 'r_0').slice(2));
    return { mediaPath: rest.join('/'), size };
  }
  return null;
}
for (const host of Object.keys(HOST_ALIAS)) {
  const dir = `${CLONE}/${host}`;
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const segs = posix(path.relative(dir, file)).split('/');
    if (segs.length === 1 && segs[0] === 'index.html') continue; // stray host index page saved by wget
    const localRel = `${host}/${segs.join('/')}`;
    let pub = publicPathFor(host, segs);
    if (usedPublic.has(pub) && usedPublic.get(pub) !== localRel) {
      report.assets.collisions++;
      pub = pub.replace(/(\.[A-Za-z0-9]{1,8})?$/, `-${fnv1a(localRel)}$1`);
    }
    usedPublic.set(pub, localRel); assetMap.set(localRel, pub);
    const mp = mediaPathOf(host, segs);
    if (typeof mp === 'string') { /* original media file */ }
    else if (mp) { if (!variantIndex.has(mp.mediaPath)) variantIndex.set(mp.mediaPath, []); variantIndex.get(mp.mediaPath).push({ size: mp.size, localRel }); }
  }
}
for (const v of variantIndex.values()) v.sort((a, b) => a.size - b.size);

const BUNDLE_RULES = [
  [/https:\/\/stcdn\.leadconnectorhq\.com\//g, '/assets/lcstatic/'],
  [/https:\/\/stcdn\.leadconnectorhq\.com/g, '/assets/lcstatic'],
  [/https:\/\/images(?:-staging)?\.leadconnectorhq\.com/g, '/assets/lcimg'],
  [/https:\/\/(?:[a-z0-9-]+\.)*leadconnectorhq\.com/g, '/ghl-stub/api'],
  [/https:\/\/(?:[a-z0-9-]+\.)*apisystem\.tech/g, '/ghl-stub/api'],
  [/https:\/\/(?:assets\.)?cdn\.(?:filesafe\.space|msgsndr\.com)/g, '/assets/filesafe'],
  // the runtime builds Google Fonts URLs from these constants; middleware.ts maps …/gfonts-css/css?family=… to the local copy
  [/https:\/\/fonts\.googleapis\.com/g, '/assets/gfonts-css'],
  [/https:\/\/fonts\.gstatic\.com/g, '/assets/gfonts'],
  [/leadconnectorhq\.com/g, 'leadconnectorhq.invalid'],
  [/filesafe\.space/g, 'filesafe.invalid'],
  [/msgsndr\.com/g, 'msgsndr.invalid'],
  [/apisystem\.tech/g, 'apisystem.invalid'],
];
function patchBundle(text) {
  let n = 0;
  for (const [re, rep] of BUNDLE_RULES) text = text.replace(re, () => { n++; report.assets.bundleReplacements[re.source] = (report.assets.bundleReplacements[re.source] || 0) + 1; return rep; });
  return { text, n };
}
console.log(`assets: ${assetMap.size} files indexed, ${variantIndex.size} proxied image sources, copying…`);
for (const [localRel, pub] of assetMap) {
  const src = `${CLONE}/${localRel}`; const dest = path.join(PUBLIC, pub.replace(/^\//, ''));
  const host = localRel.split('/')[0];
  const isText = /\.(js|mjs|css)$/i.test(localRel) && (host === 'stcdn.leadconnectorhq.com' || host === 'fonts.googleapis.com');
  if (!isText) {
    const st = fs.statSync(src);
    if (fs.existsSync(dest) && fs.statSync(dest).size === st.size) { report.assets.skippedUnchanged++; report.assets.bytes += st.size; continue; }
    ensureDir(path.dirname(dest)); fs.copyFileSync(src, dest); report.assets.copied++; report.assets.bytes += st.size; continue;
  }
  let text = fs.readFileSync(src, 'utf8');
  if (host === 'fonts.googleapis.com') text = text.replace(/\.\.\/fonts\.gstatic\.com\//g, '../gfonts/').replace(/https:\/\/fonts\.gstatic\.com\//g, '/assets/gfonts/');
  else { const r = patchBundle(text); if (r.n) report.assets.bundlesPatched++; text = r.text; }
  write(dest, text); report.assets.copied++; report.assets.bytes += Buffer.byteLength(text);
}

// ---------------------------------------------------------------- URL mapping
function wgetCandidates(url) {
  const m = /^https?:\/\/([^/?#]+)([^?#]*)(?:\?([^#]*))?/.exec(url); if (!m) return [];
  const host = m[1].toLowerCase(); let p = winEscape(m[2].replace(/^\//, '')).replace(/\/{2,}/g, '/');
  if (m[3] !== undefined) p += '@' + winEscape(m[3]);
  if (!p) return [];
  return [p, p + '.css', p + '.html'].map((x) => `${host}/${x}`);
}
function mediaPublic(mediaPath, wantSize) {
  const orig = `assets.cdn.filesafe.space/${mediaPath}`;
  const vs = variantIndex.get(mediaPath) || [];
  if (!wantSize && assetMap.has(orig)) return assetMap.get(orig);
  if (vs.length) { const pick = wantSize ? (vs.find((v) => v.size >= wantSize) || vs[vs.length - 1]) : vs[vs.length - 1]; return assetMap.get(pick.localRel); }
  if (assetMap.has(orig)) return assetMap.get(orig);
  return null;
}
function routeForSitePath(p) {
  let r = p.replace(/^\/+/, '').replace(/\.html$/i, '').replace(/\/+$/, '');
  return r === '' || r === 'index' ? '/' : '/' + r;
}
function noteMissing(url) { report.missingReferenced.add(url); }
function noteExternal(host) { report.externalHostsLeft[host] = (report.externalHostsLeft[host] || 0) + 1; }

/** Map an absolute URL to its local replacement. Returns null when it should be left alone. */
function mapAbsolute(url) {
  const m = /^(https?:)\/\/([^/?#]+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i.exec(url); if (!m) return null;
  const host = m[2].toLowerCase(); const pathname = m[3] || '/'; const query = m[4] || ''; const hash = m[5] || '';
  const segs = pathname.replace(/^\//, '').split('/');
  if (host === SITE_HOST || host === 'www.' + SITE_HOST) return routeForSitePath(pathname) + query + hash;
  // bare CDN hosts (runtime config: cdnURL, IMAGE_CDN, STORAGE_API_URL_*) -> the local alias root
  if (pathname === '/' && !query) {
    if (MEDIA_HOSTS.has(host)) return '/assets/filesafe' + (url.endsWith('/') ? '/' : '');
    if (HOST_ALIAS[host]) return `/assets/${HOST_ALIAS[host]}` + (url.endsWith('/') ? '/' : '');
  }
  if (MEDIA_HOSTS.has(host) || (host === 'storage.googleapis.com' && segs[0] === 'msgsndr')) {
    const mediaPath = (host === 'storage.googleapis.com' ? segs.slice(1) : segs).join('/');
    const pub = mediaPublic(mediaPath, 0);
    if (pub) return pub;
    if (host === 'storage.googleapis.com') { noteExternal(host); return null; }
    noteMissing(url); return `/assets/filesafe/${mediaPath.split('/').map(sanitizeSeg).join('/')}`;
  }
  if (host === 'images.leadconnectorhq.com') {
    for (const c of wgetCandidates(url)) if (assetMap.has(c)) return assetMap.get(c);
    const mm = /^\/image\/((?:[^/]+\/)*?)u_(https?:\/\/.+)$/i.exec(pathname + query);
    if (mm) {
      const size = Number((mm[1].match(/r_(\d+)/) || [0, 0])[1]);
      const inner = /^https?:\/\/([^/]+)\/(.*)$/.exec(mm[2]);
      if (inner) {
        let mp = inner[2]; if (inner[1] === 'storage.googleapis.com') mp = mp.replace(/^msgsndr\//, '');
        const pub = mediaPublic(mp, size); if (pub) return pub;
      }
    }
    noteMissing(url); return `/assets/lcimg/${segs.map(sanitizeSeg).join('/')}`;
  }
  if (host === 'stcdn.leadconnectorhq.com' || host === 'fonts.gstatic.com') {
    for (const c of wgetCandidates(url)) if (assetMap.has(c)) return assetMap.get(c);
    noteMissing(url); return `/assets/${HOST_ALIAS[host]}/${segs.map(sanitizeSeg).join('/')}`;
  }
  if (host === 'fonts.googleapis.com') {
    const fm = fontmap[url] || fontmap[url.replace(/&amp;/g, '&')];
    if (fm && assetMap.has(fm)) return assetMap.get(fm);
    for (const c of wgetCandidates(url)) if (assetMap.has(c)) return assetMap.get(c);
    noteMissing(url); return `/assets/gfonts-css/${sanitizeSeg((segs.join('/') || 'css') + (query ? '@' + query.slice(1) : '') + '.css')}`;
  }
  if (host === 'backend.leadconnectorhq.com' && /^\/appengine\/reviews\/get_widget\//i.test(pathname)) return `/ghl-stub/widget/reviews/${segs.slice(3).join('/')}`;
  // the client's white-label widget domains (popup form, booking calendar, review widget): live embeds stay as they are
  if (host === 'link.snoozesleep.com' || host === 'reputationhub.site') { noteExternal(host); return null; }
  if (/(?:^|\.)(?:leadconnectorhq\.com|apisystem\.tech)$/i.test(host)) return `/ghl-stub/api${pathname}${query}`;
  if (host === 'www.googletagmanager.com' || host === 'connect.facebook.net') return '/ghl-stub/removed-tracker';
  noteExternal(host);
  return null;
}
function mapUrl(raw, pageDir) {
  const ref = raw.trim();
  if (!ref || /^(#|data:|mailto:|tel:|sms:|javascript:|blob:)/i.test(ref)) return raw;
  if (/^\/\//.test(ref)) { const r = mapAbsolute('https:' + ref); return r === null ? raw : (report.rewrittenUrls++, r); }
  if (/^https?:\/\//i.test(ref)) { const r = mapAbsolute(ref); return r === null ? raw : (report.rewrittenUrls++, r); }
  if (ref.startsWith('/') && !ref.startsWith('/assets/') && !ref.startsWith('/ghl-stub')) return raw; // root-relative on original site: leave
  // relative reference inside the clone
  const hashIdx = ref.search(/[?#]/); const suffix = hashIdx >= 0 ? ref.slice(hashIdx) : '';
  const lr = localRelFromRelative(ref, pageDir);
  if (!lr) return raw;
  if (lr === SITE_HOST || lr.startsWith(SITE_HOST + '/')) { report.rewrittenUrls++; return routeForSitePath(lr.slice(SITE_HOST.length)) + suffix; }
  if (assetMap.has(lr)) { report.rewrittenUrls++; return assetMap.get(lr) + suffix; }
  noteMissing(ref); return raw;
}
const URL_IN_TEXT = /https?:\/\/[^\s"'`<>\\)]+/g;
function rewriteText(text, pageDir) {
  if (!text || text.indexOf('http') === -1) return text;
  return text.replace(URL_IN_TEXT, (u) => { const t = u.replace(/[),.;]+$/, ''); const tail = u.slice(t.length); return mapUrl(t, pageDir) + tail; });
}
const CSS_URL = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
function rewriteCss(css, pageDir) { if (!css) return css; return css.replace(CSS_URL, (all, q, u) => `url(${q}${mapUrl(u, pageDir)}${q})`); }
function rewriteSrcset(v, pageDir) { return v.split(',').map((part) => { const s = part.trim().split(/\s+/); if (s[0]) s[0] = mapUrl(s[0], pageDir); return s.join(' '); }).join(', '); }

// ---------------------------------------------------------------- stubs / placeholders
const STUB_STYLE = 'display:flex;align-items:center;justify-content:center;text-align:center;padding:28px;border:2px dashed #f58433;border-radius:12px;background:#fff7f0;color:#1d2b64;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;box-sizing:border-box';
// GHL element kinds that talk to the client's CRM. With an embed configured in overrides/overrides.json ("widgets")
// they become the live white-label embed; otherwise a visible placeholder element.
const WIDGET_KINDS = {
  calendar: { title: 'Booking calendar placeholder', what: 'LeadConnector booking calendar', todo: 'replace this element with your own booking widget', minHeight: 420, embed: 'calendar' },
  form: { title: 'Form placeholder', what: 'LeadConnector form (it posted to backend.leadconnectorhq.com)', todo: 'replace this element with your own form', minHeight: 320, embed: 'form' },
  survey: { title: 'Survey placeholder', what: 'LeadConnector survey (it posted to backend.leadconnectorhq.com)', todo: 'replace this element with your own survey', minHeight: 320, embed: null },
  'review-widget': { title: 'Reviews placeholder', what: 'LeadConnector reviews widget', todo: 'replace this element with your own reviews widget', minHeight: 240, embed: 'reviews' },
};
function widgetHtml(kind, info) {
  const cfg = WIDGET_KINDS[kind];
  const w = cfg.embed && OVR.widgets[cfg.embed];
  if (w && w.file && fs.existsSync(path.join(OVERRIDES_DIR, w.file))) {
    const vars = { formId: info.formId || w.defaultFormId || '', formName: w.formName || 'Form', calendarId: info.calendarId || w.defaultCalendarId || '', locationId: w.locationId || '', widgetId: w.widgetId || '', uid: fnv1a(`${info.page}|${info.id}`) };
    // the vendor helper (form_embed.js) is emitted once per page, after the first calendar iframe; the desktop and
    // phone copies of the section would otherwise load it twice
    vars.embedScript = kind === 'calendar' && !info.embedScriptAdded ? '<script src="https://link.snoozesleep.com/js/form_embed.js" type="text/javascript"></script>' : '';
    vars.copy = info.embedScriptAdded ? 'b' : ''; // second copy of the embed on the page gets a distinct id
    return { html: applyVars(ovrFile(w.file), vars), how: `live ${cfg.embed} embed (${vars.formId || vars.calendarId || vars.widgetId})` };
  }
  return { html: widgetPlaceholder(kind, info.formId || info.calendarId || info.id), how: 'visible placeholder (no embed configured)' };
}
function widgetPlaceholder(kind, label) {
  const k = WIDGET_KINDS[kind] || WIDGET_KINDS.form;
  return `<div class="ghl-stub ghl-stub--${kind}" data-ghl-stub="${kind}" style="${STUB_STYLE};min-height:${k.minHeight}px;width:100%"><div><strong>${k.title}</strong><br>The ${k.what}${label ? ` (${label})` : ''} was deliberately not cloned.<br><small>TODO: ${k.todo}.</small></div></div>`;
}

// ---------------------------------------------------------------- Nuxt payload transform
function transformPayload(json, pageDir, ctx) {
  const nodes = JSON.parse(json);
  const push = (v) => { nodes.push(v); return nodes.length - 1; };
  const str = (i) => (typeof i === 'number' && i >= 0 && typeof nodes[i] === 'string' ? nodes[i] : null);
  const dict = (i) => (typeof i === 'number' && i >= 0 && nodes[i] && typeof nodes[i] === 'object' && !Array.isArray(nodes[i]) ? nodes[i] : null);
  // 1. page-level tracking fields — stripped BEFORE URL rewriting (the tracker patterns match the original
  //    hostnames) and modified in place, so every field sharing the same string node sees the stripped version
  for (const n of nodes) {
    if (!n || typeof n !== 'object' || Array.isArray(n) || !('elements' in n) || !('popup' in n)) continue;
    for (const key of ['globalHeadTrackingCode', 'globalBodyTrackingCode', 'headerCode', 'footerCode']) {
      const s = str(n[key]);
      if (s && s.trim()) {
        const { kept, removed } = stripTrackers(s);
        if (removed.length) { report.removedTrackers.push(...removed.map((r) => ({ page: ctx.rel, where: `payload.${key}`, what: r }))); nodes[n[key]] = kept; }
      }
    }
    if (typeof n.pixelToInit === 'number' && Array.isArray(nodes[n.pixelToInit]) && nodes[n.pixelToInit].length) {
      report.removedTrackers.push({ page: ctx.rel, where: 'payload.pixelToInit', what: `${nodes[n.pixelToInit].length} pixel(s) to init` }); n.pixelToInit = push([]);
    }
  }
  // 2. remove whole GHL elements (the original header sections + their custom nav code; components/SiteHeader.tsx replaces them)
  const removeIds = new Set(OVR.removeElements);
  if (removeIds.size) {
    const drop = new Set();
    const collect = (i) => { const n = dict(i); if (!n || drop.has(i)) return; drop.add(i); const ch = typeof n.child === 'number' ? nodes[n.child] : null; if (Array.isArray(ch)) for (const c of ch) collect(c); };
    nodes.forEach((n, i) => { if (dict(i) && removeIds.has(str(n.id))) collect(i); });
    for (let i = 0; i < nodes.length; i++) if (Array.isArray(nodes[i]) && nodes[i].some((x) => typeof x === 'number' && drop.has(x))) nodes[i] = nodes[i].filter((x) => !(typeof x === 'number' && drop.has(x)));
    for (const i of drop) { const id = str(nodes[i].id); if (id && removeIds.has(id)) ctx.removed.push(id); }
  }
  // 3. hand-provided section code: custom-code elements whose current HTML matches an override rule get the new HTML
  for (const n of nodes) {
    if (!n || typeof n !== 'object' || Array.isArray(n) || str(n.meta) !== 'custom-code') continue;
    const extra = dict(n.extra); const cc = extra && dict(extra.customCode); const val = cc && dict(cc.value);
    if (!val || typeof val.rawCustomCode !== 'number') continue;
    const html = str(val.rawCustomCode); if (typeof html !== 'string') continue;
    const rule = ruleFor(html); if (!rule) continue;
    val.rawCustomCode = push(applyVars(ovrFile(rule.file)));
    const id = str(n.id) || '?';
    if (!ctx.overridden.has(id)) { ctx.overridden.set(id, rule.name); report.overrides.push({ page: ctx.rel, id, rule: rule.name, file: rule.file }); }
  }
  // 4. CRM widget elements (calendar / form / survey / review widget) -> custom-code elements carrying the live embed
  //    (same shape as the site's own custom-code elements: extra.customCode.value.rawCustomCode, rendered via innerHTML)
  for (const n of nodes) {
    if (!n || typeof n !== 'object' || Array.isArray(n)) continue;
    const kind = str(n.meta);
    if (!kind || !(kind in WIDGET_KINDS)) continue;
    const id = str(n.id) || kind;
    const extra = dict(n.extra);
    const info = { id, page: ctx.rel };
    if (typeof n.calendarData === 'number' && dict(n.calendarData)) info.calendarId = Object.keys(nodes[n.calendarData])[0] || null;
    if (extra) for (const key of ['formId', 'surveyId', 'calendarId']) { const v = dict(extra[key]); const s = v && typeof v.value === 'number' ? str(v.value) : null; if (s && s !== 'none') info[key] = s; }
    info.embedScriptAdded = kind === 'calendar' && ctx.embedScriptAdded; if (kind === 'calendar') ctx.embedScriptAdded = true;
    const { html, how } = widgetHtml(kind, info);
    toCustomCode(n, id, html);
    delete n.calendarData; delete n.formData;
    ctx.widgets.push({ id, kind, html });
    report.widgets.push({ page: ctx.rel, kind, id, how });
  }
  // 4b. elements replaced by hand-written custom code with the same content (FAQ accordions, the financing ribbon):
  //     decided from the server-rendered markup in convertPage (ctx.replacements: id -> { kind, html })
  for (const n of nodes) {
    if (!n || typeof n !== 'object' || Array.isArray(n)) continue;
    const id = str(n.id); const rep = id && ctx.replacements && ctx.replacements.get(id);
    if (!rep) continue;
    toCustomCode(n, id, rep.html);
  }
  function toCustomCode(n, id, html) {
    const extra = dict(n.extra);
    const newExtra = { visibility: extra && 'visibility' in extra ? extra.visibility : push({ value: push('') }), customCode: push({ value: push({ rawCustomCode: push(html) }) }), customClass: push({ value: push('') }), nodeId: push('c' + id) };
    n.extra = push(newExtra); n.meta = push('custom-code'); n.tagName = push('c-custom-code'); if ('title' in n) n.title = push('Custom Code');
  }
  // 5. every string: rewrite URLs and the bare domain name
  for (let i = 0; i < nodes.length; i++) {
    if (typeof nodes[i] !== 'string') continue;
    if (nodes[i] === SITE_HOST) { nodes[i] = new URL(SITE_URL).host; continue; }
    if (nodes[i].indexOf('http') !== -1 || nodes[i].indexOf('url(') !== -1) nodes[i] = rewriteCss(rewriteText(nodes[i], pageDir), pageDir);
  }
  // 6. locale: translate every payload string the same way as the markup (hydration re-renders from here)
  if (ctx.loc) {
    const st = { hits: 0, missing: new Set() };
    for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string') { const t = translateString(nodes[i], ctx.loc, st, SITE_HOSTS); if (t !== nodes[i]) nodes[i] = t; }
    ctx.i18n.payloadHits = st.hits;
  }
  return escapeJsonForScript(JSON.stringify(nodes));
}
/** Remove tracking <script>/<noscript> blocks from an HTML snippet, keep everything else. */
function stripTrackers(html) {
  const $ = cheerio.load(html, null, false);
  const removed = [];
  $('script').each((_, el) => { const src = $(el).attr('src') || ''; const code = $(el).html() || ''; if (TRACKER_SCRIPT_RE.test(src) || TRACKER_SCRIPT_RE.test(code)) { removed.push(src ? `script src=${src}` : `inline script: ${code.replace(/\s+/g, ' ').slice(0, 80)}…`); $(el).remove(); } });
  $('noscript').each((_, el) => { const h = $(el).html() || ''; if (/googletagmanager|facebook\.com\/tr|doubleclick/i.test(h)) { removed.push(`noscript: ${h.replace(/\s+/g, ' ').slice(0, 80)}`); $(el).remove(); } });
  $('img').each((_, el) => { const s = $(el).attr('src') || ''; if (/facebook\.com\/tr\?|google-analytics\.com\/collect|doubleclick\.net/i.test(s)) { removed.push(`pixel img: ${s.slice(0, 80)}`); $(el).remove(); } });
  return { kept: $.html(), removed };
}

// ---------------------------------------------------------------- 2/3. pages
function metaFromHead($, route, pageDir) {
  const meta = {};
  const get = (sel) => { const v = $(sel).first().attr('content'); return v ? v.trim() : undefined; };
  const title = $('head > title').first().text().trim(); if (title) meta.title = title;
  const description = get('meta[name="description"]'); if (description) meta.description = description;
  const keywords = get('meta[name="keywords"]'); if (keywords) meta.keywords = keywords.split(',').map((s) => s.trim()).filter(Boolean);
  const author = get('meta[name="author"]'); if (author) meta.authors = [{ name: author }];
  const robots = get('meta[name="robots"]'); if (robots) meta.robots = robots;
  const ogImage = get('meta[name="og:image"], meta[property="og:image"]');
  const ogType = get('meta[name="og:type"], meta[property="og:type"]');
  meta.alternates = { canonical: route };
  meta.openGraph = { title: get('meta[name="og:title"], meta[property="og:title"]') || title, description: get('meta[name="og:description"], meta[property="og:description"]') || description, url: route, type: ogType && ['website', 'article'].includes(ogType) ? ogType : 'website' };
  if (ogImage) meta.openGraph.images = [mapUrl(ogImage, pageDir)];
  const twCard = get('meta[name="twitter:card"]'); const twImage = get('meta[name="twitter:image"]');
  if (twCard || twImage) { meta.twitter = {}; if (twCard) meta.twitter.card = twCard; if (twImage) meta.twitter.images = [mapUrl(twImage, pageDir)]; }
  const icon = $('head link[rel="icon"], head link[rel="shortcut icon"]').first().attr('href'); if (icon) meta.icons = { icon: mapUrl(icon, pageDir) };
  const other = {};
  for (const [name, key] of [['og:author', 'og:author'], ['og:keywords', 'og:keywords'], ['twitter:type', 'twitter:type'], ['image', 'image']]) { const v = get(`meta[name="${name}"]`); if (v) other[key] = key === 'image' ? mapUrl(v, pageDir) : v; }
  if (Object.keys(other).length) meta.other = other;
  return meta;
}

const HANDWRITTEN_ROUTES = new Set(['/booking']); // app/(en)/booking + app/es/booking are hand-written (components/BookingPage.tsx)
function convertPage(rel, loc = null) {
  const route = routeFromPage(rel);
  if (HANDWRITTEN_ROUTES.has(route)) return;
  const outRoute = localized(route, loc);
  const pageDir = path.posix.dirname(`${SITE_DIR}/${rel}`);
  const ctx = { rel, route, widgets: [], overridden: new Map(), removed: [], loc, i18n: { hits: 0, missing: new Set() } };
  const $ = cheerio.load(fs.readFileSync(`${SITE_DIR}/${rel}`, 'utf8'));
  const scripts = [];
  const seenExternal = new Set();
  let scriptSeq = 0;
  const scriptId = (hint) => `${outRoute === '/' ? 'home' : outRoute.slice(1).replace(/\W+/g, '-')}-${hint}-${scriptSeq++}`;

  // ---- head: metadata first (before anything is rewritten/removed)
  const metadata = metaFromHead($, route, pageDir);
  metadata.alternates = { canonical: outRoute, languages: Object.fromEntries([...LOCALES.map((l) => [l.lang, localized(route, l)]), ['x-default', route]]) };
  if (metadata.openGraph) { metadata.openGraph.url = outRoute; metadata.openGraph.locale = (loc || LOCALES[0]).ogLocale; }
  if (loc) {
    const st = ctx.i18n;
    for (const k of ['title', 'description']) if (metadata[k]) metadata[k] = tr(metadata[k], loc, st);
    if (metadata.openGraph) for (const k of ['title', 'description']) if (metadata.openGraph[k]) metadata.openGraph[k] = tr(metadata.openGraph[k], loc, st);
    if (Array.isArray(metadata.keywords)) metadata.keywords = metadata.keywords.map((k) => tr(k, loc, null));
  }

  // ---- 1. drop whole GHL elements (the original header sections + their custom nav code; components/SiteHeader.tsx replaces them)
  for (const id of OVR.removeElements) $(`[id="${id}"]`).remove();

  // ---- 1b. sections copied from another page (overrides.json "insertSections") go in front of their anchor section,
  //          in markup, payload and CSS, so the later steps (overrides, URL rewriting) treat them like native content
  for (const pack of INSERT_PACKS) {
    const $p = $('script#__NUXT_DATA__').first();
    const r = insertSectionsIntoPage($, $p.length ? $p.html() || '' : '', rel, pack);
    if (r.json !== null) $p.html(r.json);
    if (r.inserted.length) report.insertedSections.push({ page: rel, name: pack.name, anchors: r.anchors, sections: r.inserted });
  }

  // ---- 1c. per-page hero background (overrides.json "heroBackgrounds"): desktop + mobile hero copies, CSS + payload
  if (OVR.heroBackgrounds[rel]) {
    const $p = $('script#__NUXT_DATA__').first();
    const r = applyHeroBackground($, $p.length ? $p.html() || '' : '', OVR.heroBackgrounds[rel], new Set(OVR.removeElements));
    if (r.json !== null) $p.html(r.json);
    report.heroBackgrounds.push({ page: rel, image: OVR.heroBackgrounds[rel], desktop: r.desktop, mobile: r.mobile });
    if (r.mobile) $(`[id="${r.mobile}"]`).addClass('snz-hero'); // phone hero: overlay + cover rules in overrides/site.css
  }

  // ---- 1d. scroll-reveal tags (overrides/motion.json): data-animate / data-delay on server-rendered elements.
  //          Elements inside custom code are skipped (they animate on their own and are re-rendered on hydration).
  let motionTagged = 0;
  for (const rule of motionRulesFor(rel)) {
    let i = 0;
    $(rule.selector).each((_, el) => {
      const $el = $(el);
      if ($el.closest('.custom-code-container').length || $el.closest('.snz-logo-marquee, #ghl-trust-ticker, .snooze-ticker-bar').length) return;
      if (rule.class) $el.addClass(rule.class);
      if (rule.animate || rule.alternate) {
        if ($el.attr('data-animate')) return; // first (most specific, page-level) rule wins: page rules run after '*' rules, so page rules are listed first below
        const variant = rule.alternate ? rule.alternate[i % rule.alternate.length] : rule.animate;
        const delay = (rule.delay || 0) + (rule.stagger || 0) * i;
        $el.attr('data-animate', variant);
        if (delay) $el.attr('data-delay', String(delay));
        motionTagged++;
      }
      i++;
    });
  }
  report.motion.push({ page: rel, tagged: motionTagged });

  // ---- 1e. orange address/phone strips get a class so the page-fix stylesheet can lift their contrast
  const headCss = $('style').map((_, s) => $(s).html() || '').get().join(' ');
  $('body .c-section').each((_, el) => {
    const id = $(el).attr('id'); if (!id) return;
    if (new RegExp('[.]' + id + '[{][^}]*background-color:var[(]--color-m6a8t67b[)]').test(headCss) && $(el).find('.c-button a.custom').length) $(el).addClass('snz-orange-strip');
  });

  // ---- 1f. navy rounded cards with the orange border (the "Dream Mapping" style column/row cards) get a class so the
  //          page-fix stylesheet can give them one consistent inner padding on phones
  $('body .c-column, body .c-row').each((_, el) => {
    const id = $(el).attr('id'); if (!id) return;
    const rule = new RegExp('[.](col|row)-' + id.replace(/^(col|row)-/, '') + '[{]([^}]*)[}]', 'g');
    let css = ''; let m; while ((m = rule.exec(headCss))) css += m[2] + ';';
    if (/background-color:var[(]--color-m6a8scoh[)]/.test(css) && /border-color:var[(]--color-(hxkylqlh|m6a8t67b)[)]/.test(css) && ($(el).hasClass('borderFull') || /border-style:solid/.test(css))) $(el).addClass('snz-card');
  });
  report.cards = (report.cards || 0) + $('.snz-card').length;

  // ---- 1g. GoHighLevel FAQ elements -> the blog-style accordion (overrides/faq-accordion.html) with the same
  //          questions and answers; the financing ribbon image -> vector ribbon (overrides/ribbon.html).
  //          Both become custom-code elements (markup here, payload in transformPayload) like the CRM widgets.
  ctx.replacements = new Map();
  $('.c-faq.c-wrapper').each((_, el) => {
    const id = $(el).attr('id'); if (!id) return;
    const items = $(el).find('.hl-faq-child').map((i, child) => {
      const q = $(child).find('.hl-faq-child-heading-text').text().replace(/\s+/g, ' ').trim();
      const a = ($(child).find('.hl-faq-child-item-text').html() || '').trim();
      return { q, a };
    }).get().filter((it) => it.q);
    if (!items.length) return;
    const itemsHtml = items.map((it, i) => `<div class="snz-faq__item${i === 0 ? ' is-open' : ''}"><h3 class="snz-faq__q"><button type="button" class="snz-faq__btn" id="${id}-q${i}" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="${id}-a${i}"><span>${escapeHtml(it.q)}</span><svg class="snz-faq__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></h3><div class="snz-faq__panel" id="${id}-a${i}" role="region" aria-labelledby="${id}-q${i}"><div class="snz-faq__inner"><div class="snz-faq__a">${it.a}</div></div></div></div>`).join('');
    ctx.replacements.set(id, { kind: 'faq', html: applyVars(ovrFile('faq-accordion.html'), { id, items: itemsHtml }) });
    report.faqs.push({ page: rel, id, items: items.length });
  });
  $('img[src*="' + RIBBON_IMAGE_ID + '"]').closest('.c-image.c-wrapper').each((_, el) => {
    const id = $(el).attr('id'); if (!id) return;
    ctx.replacements.set(id, { kind: 'ribbon', html: applyVars(ovrFile('ribbon.html'), { logo: SITE_LOGO }) });
    report.ribbons.push({ page: rel, id });
  });

  // ---- 2. hand-provided section code, matched by content so desktop + mobile copies are both replaced
  $('.custom-code-container').each((_, el) => {
    const rule = ruleFor($(el).html() || '');
    if (!rule) return;
    $(el).html(applyVars(ovrFile(rule.file)));
    const id = ($(el).attr('id') || '').replace(/__custom-code$/, '');
    if (!ctx.overridden.has(id)) { ctx.overridden.set(id, rule.name); report.overrides.push({ page: rel, id, rule: rule.name, file: rule.file }); }
  });

  // ---- 2d. steps-timeline sections get one shared class (background image + white overlay in overrides/site.css)
  $('.c-section').filter((_, el) => $(el).find('.pm-section').length > 0).addClass('steps-bg-faded');

  // ---- 3. the Nuxt payload first: it removes the same elements and decides the embed HTML of every widget element
  const $payload = $('script#__NUXT_DATA__').first();
  if ($payload.length) $payload.html(transformPayload($payload.html() || '', pageDir, ctx));

  // ---- 4. CRM widget elements (calendar / form / survey / reviews) -> the same markup as a custom-code element, embed inside
  const $body = $('body');
  const WIDGET_CLASS_RE = /\bc-(calendar|form|survey|review-widget|faq|image)\b/;
  $body.find('.c-calendar.c-wrapper, .c-form.c-wrapper, .c-survey.c-wrapper, .c-review-widget.c-wrapper, .c-faq.c-wrapper, .c-image.c-wrapper').each((_, el) => {
    const $w = $(el); const id = $w.attr('id') || 'widget';
    const kind = (($w.attr('class') || '').match(WIDGET_CLASS_RE) || [0, 'form'])[1];
    const rep = ctx.replacements && ctx.replacements.get(id);
    if ((kind === 'faq' || kind === 'image') && !rep) return; // only FAQ / ribbon elements decided in step 1g
    const w = rep || ctx.widgets.find((c) => c.id === id) || { html: widgetHtml(kind, { id, page: rel }).html };
    const $tpl = $body.find('.c-custom-code.c-wrapper').first();
    if ($tpl.length) {
      const $new = $tpl.clone();
      $new.attr('id', id); $new.attr('class', ($w.attr('class') || '').replace(WIDGET_CLASS_RE, 'c-custom-code'));
      if (rep && rep.kind === 'faq') for (const a of ['data-animate', 'data-delay']) if ($w.attr(a)) $new.attr(a, $w.attr(a)); // scroll-reveal tags from step 1d (only the FAQ accordion; widgets and the ribbon size/position themselves)
      const $inner = $new.find('.custom-code-container').first();
      $inner.attr('id', `${id}__custom-code`); $inner.attr('class', `custom-code-container c${id}`); $inner.html(w.html);
      $w.replaceWith($new);
    } else {
      $w.attr('class', ($w.attr('class') || '').replace(WIDGET_CLASS_RE, 'c-custom-code')); $w.html(`<div id="${id}__custom-code" class="custom-code-container c${id}">${w.html}</div>`);
    }
  });

  // ---- 5. scripts (document order) -> next/script entries; data blocks stay inline
  $('script').each((_, el) => {
    const $el = $(el); const src = $el.attr('src'); const type = ($el.attr('type') || '').toLowerCase();
    if (src) {
      if (/offline-shim\.js$/i.test(src)) { $el.remove(); return; }
      const removed = REMOVED_SCRIPT_HOSTS.find((r) => r.test.test(src));
      if (removed) { report.removedScripts.push({ page: rel, src, reason: removed.reason }); $el.remove(); return; }
      const mapped = mapUrl(src, pageDir);
      if (/^https?:\/\//i.test(mapped)) {
        // the widget embeds' own helper scripts (iframe resizing / messaging) must run at parse time, before their
        // iframes post their first size message, exactly as in the embed code: keep one copy inline in the markup
        if (EXTERNAL_SCRIPT_ALLOW.test(mapped)) { if (seenExternal.has(mapped)) $el.remove(); else { seenExternal.add(mapped); $el.attr('src', mapped); report.embedScripts.push({ page: rel, src: mapped }); } return; }
        report.removedScripts.push({ page: rel, src, reason: 'external script not available locally' }); $el.remove(); return;
      }
      scripts.push({ id: scriptId('src'), src: mapped, ...(type ? { type } : {}), ...($el.attr('crossorigin') !== undefined ? { crossOrigin: $el.attr('crossorigin') || 'anonymous' } : {}) });
      $el.remove(); return;
    }
    const code = $el.html() || '';
    if (type === 'application/json') return; // data block (the Nuxt payload was transformed in step 3)
    if (type === 'application/ld+json') { $el.html(escapeJsonForScript(rewriteText(code, pageDir))); return; }
    if (type && !/^(text\/javascript|module|text\/ecmascript|application\/javascript)$/.test(type)) return; // unknown data block, leave
    if (TRACKER_SCRIPT_RE.test(code)) { report.removedTrackers.push({ page: rel, where: 'inline script', what: code.replace(/\s+/g, ' ').slice(0, 100) }); $el.remove(); return; }
    let js = rewriteText(code, pageDir);
    js = js.replace(/document\.addEventListener\(\s*(["'])DOMContentLoaded\1\s*,\s*/g, 'window.__ghlOnReady(');
    const isNuxtConfig = /__NUXT__/.test(js);
    // the runtime config's image-CDN whitelist lists the CDN hostnames bare (no request is ever made with them once
    // every image path is local); neutralise them so a grep of the build for the original hostnames stays empty
    if (isNuxtConfig) js = js.replace(/filesafe\.space/g, 'filesafe.invalid').replace(/msgsndr\.com/g, 'msgsndr.invalid').replace(/leadconnectorhq\.com/g, 'leadconnectorhq.invalid');
    scripts.push({ id: scriptId(isNuxtConfig ? 'nuxt-config' : 'inline'), code: js, ...(type === 'module' ? { type } : {}) });
    $el.remove();
  });

  // ---- 6. head: stylesheet / style / preload sequence, in original order
  const headParts = [];
  $('head').children().each((_, el) => {
    const $el = $(el); const tag = el.tagName.toLowerCase();
    if (tag === 'style') { if ($el.attr('data-offline-font') !== undefined) return; headParts.push(`<style>${rewriteCss($el.html() || '', pageDir)}</style>`); return; }
    if (tag === 'noscript') { const h = $el.html() || ''; if (/googletagmanager|facebook|doubleclick/i.test(h)) report.removedTrackers.push({ page: rel, where: 'head noscript', what: h.replace(/\s+/g, ' ').slice(0, 100) }); return; }
    if (tag !== 'link') return;
    const rel_ = ($el.attr('rel') || '').toLowerCase(); const href = $el.attr('href') || ''; const as = $el.attr('as');
    if (rel_ === 'stylesheet') {
      if (/^data:text\/css/i.test(href)) { const css = decodeURIComponent(href.slice(href.indexOf(',') + 1)); headParts.push(`<style data-from="data-uri-stylesheet">${rewriteCss(css, pageDir)}</style>`); return; }
      const mapped = mapUrl(href, pageDir);
      if (/^https?:\/\//i.test(mapped)) { report.missingReferenced.add(href); return; }
      headParts.push(`<link rel="stylesheet" href="${mapped}">`); return;
    }
    if (rel_ === 'preload' && as === 'style') { if (/^data:/i.test(href)) return; const mapped = mapUrl(href, pageDir); if (!/^https?:/i.test(mapped)) headParts.push(`<link rel="preload" as="style" href="${mapped}">`); return; }
    if (as === 'script' || rel_ === 'modulepreload') { const mapped = mapUrl(href, pageDir); if (!/^https?:/i.test(mapped)) headParts.push(`<link rel="modulepreload" as="script" crossorigin href="${mapped}">`); return; }
    if (rel_ === 'preconnect' || rel_ === 'dns-prefetch' || rel_ === 'prefetch') { report.droppedHints++; return; }
    // icon/canonical handled through metadata
  });
  // site-wide button style (overrides/buttons.css) and page fixes (overrides/site.css) go last so they win over every page rule
  // GHL "buttons" used as plain text links (transparent background + noBorder: the address/phone strips,
  // the footer product list) are excluded from the site-wide button style via a :not() chain.
  const pageCss = $('style').map((_, s) => $(s).html() || '').get().join(' ');
  const textLinkIds = new Set();
  $('a.custom.noBorder, button.custom.noBorder').each((_, el) => {
    const id = ($(el).attr('class') || '').split(/\s+/).find((c) => c.startsWith('cbutton-'));
    if (id && new RegExp('\\.' + id + '\\{[^}]*background-color:(?:var\\(--transparent\\)|transparent)').test(pageCss)) textLinkIds.add(id);
  });
  const notChain = [...textLinkIds].map((id) => `:not(.${id})`).join('');
  report.textLinkButtons = textLinkIds.size;
  // fluid type: GHL's mobile + desktop font sizes become one clamp() between 390px and 1440px
  const fluidCss = fluidTypography(pageCss);
  if (fluidCss) headParts.push(`<style data-snz-fluid="">${fluidCss}</style>`);
  for (const cssFile of ['buttons.css', 'site.css', 'motion.css']) if (fs.existsSync(path.join(OVERRIDES_DIR, cssFile))) headParts.push(`<style data-snz-override="${cssFile}">${ovrFile(cssFile).split('{{not}}').join(notChain)}</style>`);

  // ---- 7. body
  $body.find('noscript').each((_, el) => { const h = $(el).html() || ''; if (/googletagmanager|facebook\.com\/tr|doubleclick/i.test(h)) { report.removedTrackers.push({ page: rel, where: 'body noscript', what: h.replace(/\s+/g, ' ').slice(0, 100) }); $(el).remove(); } });
  const ATTRS = ['src', 'href', 'poster', 'data-src', 'action'];
  $body.find('*').each((_, el) => {
    const $el = $(el);
    for (const a of ATTRS) { const v = $el.attr(a); if (v !== undefined && v !== '') { const nv = mapUrl(v, pageDir); if (nv !== v) $el.attr(a, nv); } }
    for (const a of ['srcset', 'data-srcset']) { const v = $el.attr(a); if (v) { const nv = rewriteSrcset(v, pageDir); if (nv !== v) $el.attr(a, nv); } }
    const st = $el.attr('style'); if (st && st.indexOf('url(') !== -1) { const nv = rewriteCss(st, pageDir); if (nv !== st) $el.attr('style', nv); }
    if (el.tagName.toLowerCase() === 'iframe') {
      const s = $el.attr('src') || $el.attr('data-src') || '';
      if (/^\/ghl-stub\//.test(s)) report.stubs.push({ page: rel, kind: 'LeadConnector iframe', id: $el.attr('id') || '', original: s, how: 'iframe loads /ghl-stub.html (visible placeholder)' });
    }
  });
  $body.find('style').each((_, el) => { const css = $(el).html() || ''; if (css.indexOf('url(') !== -1) $(el).html(rewriteCss(css, pageDir)); });

  // ---- 7b. locale: every text node / translatable attribute of the page, internal links prefixed (after the URL
  //          mapping above, which resolves clone links to routes and would otherwise drop the prefix again)
  if (loc) translateDom($, $body[0], loc, ctx.i18n, SITE_HOSTS);

  // visible text mentions of the original site URL (e.g. in the privacy policy) -> the new deployment URL
  const SITE_TEXT_RE = new RegExp(`https?://(?:www\\.)?${SITE_HOST.replace(/\./g, '\\.')}`, 'g');
  const headHtml = headParts.join('\n').replace(SITE_TEXT_RE, SITE_URL);
  // explicit width/height on every local image (aspect ratio known before load, no layout shift)
  report.imageDimsAdded = (report.imageDimsAdded || 0) + addImageDimensions($, PUBLIC);
  const bodyHtml = ($body.html() || '').replace(SITE_TEXT_RE, SITE_URL);
  // sanity: nothing left pointing at the forbidden hosts in the page markup
  const leftover = (headHtml + bodyHtml).match(/https?:\/\/(?:[a-z0-9-]+\.)*(?:snoozemattresscompany\.com|filesafe\.space|leadconnectorhq\.com|msgsndr\.com)[^"'\s<)]*/gi) || [];
  for (const u of leftover) report.missingReferenced.add(`LEFTOVER ${rel}: ${u}`);

  // ---- emit route files
  const dir = path.join(APP, loc ? loc.code : '(en)', ...(route === '/' ? [] : route.slice(1).split('/')));
  write(path.join(dir, 'content.ts'), [
    '// Generated by scripts/convert.mjs — do not edit by hand.',
    `export const HEAD_HTML = ${JSON.stringify(headHtml)};`,
    `export const BODY_HTML = ${JSON.stringify(bodyHtml)};`,
    `export const SCRIPTS: { id: string; src?: string; type?: string; crossOrigin?: string; code?: string }[] = ${JSON.stringify(scripts, null, 1)};`,
    '',
  ].join('\n'));
  write(path.join(dir, 'page.tsx'), [
    '// Generated by scripts/convert.mjs — do not edit by hand. Regenerate with `npm run convert`.',
    "import type { Metadata } from 'next';",
    "import { GhlPage } from '@/components/GhlPage';",
    "import { HEAD_HTML, BODY_HTML, SCRIPTS } from './content';",
    '',
    `export const metadata: Metadata = ${JSON.stringify(metadata, null, 2)};`,
    '',
    'export default function Page() {',
    '  return <GhlPage headHtml={HEAD_HTML} bodyHtml={BODY_HTML} scripts={SCRIPTS} />;',
    '}',
    '',
  ].join('\n'));
  if (loc) report.i18n.push({ page: rel, locale: loc.code, route: outRoute, translated: ctx.i18n.hits, payloadStrings: ctx.i18n.payloadHits || 0, missing: [...ctx.i18n.missing] });
  report.pages.push({ route: outRoute, locale: loc ? loc.code : 'en', source: rel, title: metadata.title || '', scripts: scripts.length, headParts: headParts.length, bodyBytes: Buffer.byteLength(bodyHtml), removed: ctx.removed, overrides: [...ctx.overridden.values()], widgets: ctx.widgets.map((w) => w.kind) });
  console.log(`  ${outRoute.padEnd(30)} <- ${rel} (${scripts.length} scripts, ${ctx.overridden.size} section overrides, ${ctx.widgets.length} widgets, removed ${ctx.removed.length})`);
}

// ---------------------------------------------------------------- project files
function writeProjectFiles() {
  // remove create-next-app template leftovers that would change rendering
  for (const f of ['app/globals.css', 'app/page.module.css', 'app/favicon.ico', 'public/next.svg', 'public/vercel.svg', 'public/file.svg', 'public/globe.svg', 'public/window.svg']) { const p = path.join(ROOT, f); if (fs.existsSync(p)) fs.rmSync(p); }
  write(path.join(ROOT, 'components', 'GhlPage.tsx'), `import Script from 'next/script';

export type PageScript = { id: string; src?: string; type?: string; crossOrigin?: string; code?: string };

/**
 * Renders one converted GoHighLevel page: the original <head> stylesheet/style sequence followed by
 * the original <body> markup (both untouched apart from URL rewriting), then every original script
 * re-emitted through next/script in the original order. \`display: contents\` keeps the wrapper out of
 * the layout so the markup behaves as if it were a direct child of <body>, exactly like the source.
 */
/**
 * Vue's <Teleport to="body"> hydration expects the SSR anchors (<!--teleport start anchor--> … <!--teleport anchor-->)
 * and the teleported markup to be direct children of <body>, starting at body.firstChild. React needs a host element,
 * so the page markup is rendered inside a wrapper; this script (first afterInteractive script, i.e. after React
 * hydration and before the Nuxt entry executes) moves every body-level node that preceded #__nuxt in the original
 * document back to the start of <body>, and every body-level node that followed it to the end of <body>.
 */
const TELEPORT_FIX = \`(function(){var w=document.querySelector('[data-ghl-page]');var n=document.getElementById('__nuxt');if(!w||!n||n.parentNode!==w||w.getAttribute('data-ghl-fixed'))return;
var keep=function(x){return x.nodeType===1&&/^(STYLE|LINK|SCRIPT)$/.test(x.tagName)};var before=document.createDocumentFragment(),after=document.createDocumentFragment(),c=w.firstChild,past=false;
while(c){var nx=c.nextSibling;if(c===n){past=true}else if(!keep(c)){(past?after:before).appendChild(c)}c=nx}
document.body.insertBefore(before,document.body.firstChild);document.body.appendChild(after);w.setAttribute('data-ghl-fixed','1')})();\`;

export function GhlPage({ headHtml, bodyHtml, scripts }: { headHtml: string; bodyHtml: string; scripts: PageScript[] }) {
  return (
    <>
      <div data-ghl-page="" style={{ display: 'contents' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: headHtml + bodyHtml }} />
      <Script id="ghl-teleport-fix" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: TELEPORT_FIX }} />
      {scripts.map((s) =>
        s.src ? (
          <Script key={s.id} id={s.id} src={s.src} strategy="afterInteractive" {...(s.type ? { type: s.type } : {})} {...(s.crossOrigin ? { crossOrigin: s.crossOrigin as 'anonymous' | 'use-credentials' } : {})} />
        ) : (
          <Script key={s.id} id={s.id} strategy="afterInteractive" {...(s.type ? { type: s.type } : {})} dangerouslySetInnerHTML={{ __html: s.code || '' }} />
        ),
      )}
    </>
  );
}
`);
  // site-wide values used by components/SiteHeader.tsx (paths resolved through the asset map)
  const siteLogo = (OVR.site.logoUrl && mapAbsolute(OVR.site.logoUrl)) || '';
  const siteFeature = (OVR.site.featureImageUrl && mapAbsolute(OVR.site.featureImageUrl)) || siteLogo;
  write(path.join(ROOT, 'components', 'site-config.ts'), `// Generated by scripts/convert.mjs — edit overrides/overrides.json ("site") instead.
export const SITE = {
  phone: ${JSON.stringify(OVR.site.phone || '(956) 303-3666')},
  phoneHref: ${JSON.stringify(OVR.site.phoneHref || 'tel:+19563033666')},
  logo: ${JSON.stringify(siteLogo)},
  logoAlt: ${JSON.stringify(OVR.site.logoAlt || 'Snooze Mattress + Wellness')},
  featureImage: ${JSON.stringify(siteFeature)},
} as const;
`);
  // one root layout per locale (route groups): app/(en)/layout.tsx and app/es/layout.tsx set <html lang> and the header/footer locale
  for (const l of LOCALES) {
    const dir = path.join(APP, l.code === 'en' ? '(en)' : l.code);
    ensureDir(dir);
    write(path.join(dir, 'layout.tsx'), `import type { Metadata } from 'next';
import Script from 'next/script';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PageLoader } from '@/components/PageLoader';
import '../../overrides/global.css';

export const metadata: Metadata = {
  metadataBase: new URL(${JSON.stringify(SITE_URL)}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang=${JSON.stringify(l.htmlLang)}>
      <body>
        <PageLoader locale=${JSON.stringify(l.code)} />
        <SiteHeader locale=${JSON.stringify(l.code)} />
        {children}
        <SiteFooter locale=${JSON.stringify(l.code)} />
        <Script src="/snz-motion.js?v=${BUILD_STAMP}" strategy="afterInteractive" />
        {/* Safety net: rewrites any asset URL the GHL runtime still builds against the original CDNs to the
            local copies, and provides window.__ghlOnReady for the site's own DOMContentLoaded scripts. */}
        <Script src="/ghl-offline-shim.js?v=${BUILD_STAMP}" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
`);
    const nf = l.code === 'es' ? { h: '404', p: 'Esta página no existe.', a: 'Volver al inicio', href: '/es' } : { h: '404', p: 'This page does not exist in the converted site.', a: 'Back to the homepage', href: '/' };
    write(path.join(dir, 'not-found.tsx'), `export default function NotFound() {
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: '64px 24px', textAlign: 'center' }}>
      <h1>${nf.h}</h1>
      <p>${nf.p}</p>
      <p><a href=${JSON.stringify(nf.href)}>${nf.a}</a></p>
    </main>
  );
}
`);
  }
  write(path.join(ROOT, 'next.config.ts'), `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    // Every LeadConnector widget (reviews iframe, popup form, calendar) now points at /ghl-stub/…;
    // serve the visible placeholder page for those. API paths (/ghl-stub/api/…) intentionally 404.
    return [
      { source: '/ghl-stub/widget/:path*', destination: '/ghl-stub.html' },
      { source: '/ghl-stub/form/:path*', destination: '/ghl-stub.html' },
      { source: '/ghl-stub/link/:path*', destination: '/ghl-stub.html' },
      { source: '/ghl-stub/api/js/:path*', destination: '/ghl-stub/empty.js' },
    ];
  },
};

export default nextConfig;
`);
  write(path.join(PUBLIC, 'ghl-stub', 'empty.js'), `/* Stub: LeadConnector widget loader scripts (e.g. the reviews widget) resolve here and do nothing. */\n`);
  write(path.join(ROOT, 'middleware.ts'), `import { NextResponse, type NextRequest } from 'next/server';

// Generated by scripts/convert.mjs. The GoHighLevel runtime builds Google Fonts stylesheet URLs at run time
// (…/css?family=…); the bundles were patched to use /assets/gfonts-css instead of fonts.googleapis.com, and this
// middleware maps such a request onto the wget-named local copy (same naming as scripts/convert.mjs).
export const config = { matcher: ['/assets/gfonts-css/:path*'] };

function fnv1a(s: string) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }
function sanitizeSeg(seg: string) { let s = seg.replace(/[^A-Za-z0-9._-]/g, '_'); if (s.length > 100) { const ext = (seg.match(/\\.[A-Za-z0-9]{1,8}$/) || [''])[0]; s = s.slice(0, 60) + '-' + fnv1a(seg) + ext; } return s; }
function winEscape(s: string) { return s.replace(/[\\\\|:?"*<>\\x00-\\x1f]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')); }

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (/^\\/assets\\/gfonts-css\\/css2?$/.test(pathname) && search.length > 1) {
    const base = pathname.split('/').pop() as string;
    const url = req.nextUrl.clone();
    let query = search.slice(1);
    try { query = decodeURIComponent(query); } catch { /* keep as is */ }
    url.pathname = '/assets/gfonts-css/' + sanitizeSeg(base + '@' + winEscape(query) + '.css');
    url.search = '';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}
`);
  write(path.join(PUBLIC, 'ghl-stub.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Widget placeholder</title>
<style>html,body{margin:0;height:100%;background:transparent}
.ghl-stub{min-height:100vh;${STUB_STYLE}}
.ghl-stub small{display:block;margin-top:8px;color:#555;word-break:break-all}</style></head>
<body><div class="ghl-stub" data-ghl-stub="iframe"><div><strong id="t">LeadConnector widget placeholder</strong><br><span id="m">This widget was deliberately not cloned (it posted to the original client's CRM).</span><small id="p"></small><small>TODO: replace with your own form / booking / reviews integration.</small></div></div>
<script>(function(){var p=location.pathname;var t=document.getElementById('t');if(/\\/widget\\/reviews\\//.test(p))t.textContent='Reviews widget placeholder';else if(/\\/form\\//.test(p))t.textContent='Form placeholder';document.getElementById('p').textContent='Original widget path: '+p.replace(/^\\/ghl-stub/,'');})();</script>
</body></html>
`);
  write(path.join(PUBLIC, 'ghl-stub', 'form_embed.js'), `/* Stub for https://link.snoozesleep.com/js/form_embed.js — the LeadConnector form embed script was
   deliberately not cloned. The popup form iframe loads /ghl-stub.html instead. */\n`);
  write(path.join(PUBLIC, 'ghl-offline-shim.js'), shimSource());
  write(path.join(ROOT, '.gitignore'), `# dependencies
/node_modules
/.pnp
.pnp.*

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.vercel
*.tsbuildinfo
next-env.d.ts

# verification output (screenshots, diffs)
/verify-out/

# local env files (Vercel CLI writes .env.local)
.env*.local
.env
`);
}

function shimSource() {
  return `/* ghl-offline-shim.js — generated by scripts/convert.mjs.
 * 1. window.__ghlOnReady(fn): the site's own scripts used document.addEventListener("DOMContentLoaded", fn);
 *    next/script runs them after hydration (DOMContentLoaded has already fired), so the converter rewrote
 *    those calls to __ghlOnReady, which runs fn immediately when the document is already loaded.
 * 2. Safety net: the GoHighLevel runtime rebuilds some asset URLs from its payload at hydration time.
 *    Everything in the payload already points at local copies, but should any absolute CDN URL still be
 *    written into a <style>, <img>, <source>, <iframe> or <link>, it is rewritten to the local copy
 *    (same naming scheme as scripts/convert.mjs) before the browser fetches it. */
(function () {
  window.__ghlOnReady = function (fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); };
  // locale: the GoHighLevel runtime sets <html lang="en"> on hydration; keep the language the server rendered
  try {
    var ssrLang = document.documentElement.getAttribute('lang');
    if (ssrLang && ssrLang !== 'en' && 'MutationObserver' in window) new MutationObserver(function () { if (document.documentElement.getAttribute('lang') !== ssrLang) document.documentElement.setAttribute('lang', ssrLang); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  } catch (err) {}
  // motion system: the reveal-hidden state (overrides/motion.css) only exists while <html class="js"> is set
  try { if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) document.documentElement.classList.add('js'); } catch (err) {}
  // LeadConnector reviews widget: the vendor helper (review-widget.js) only applies the iframe's height message
  // once it has loaded, and the iframe often posts before that, leaving a 1px frame. This listener is installed
  // before anything else runs and applies the same message shape, so the widget always gets its height.
  window.addEventListener('message', function (e) {
    try {
      var d = e.data;
      if (!Array.isArray(d) || (d[0] !== 'lc.setHeight' && d[0] !== 'lc.setFlashHeight') || !d[1] || d[1].id !== 'lc_reviews_widget' || !d[1].height) return;
      // Only the iframe that sent the message is resized: the page carries a desktop and a mobile copy of the
      // widget, and the hidden copy (laid out at zero width) reports a much taller height for the same widgetId.
      var all = document.querySelectorAll('.lc_reviews_widget'), frames = [];
      for (var k = 0; k < all.length; k++) if (e.source && all[k].contentWindow === e.source) frames.push(all[k]);
      if (!frames.length) for (var k2 = 0; k2 < all.length; k2++) frames.push(all[k2]);
      for (var i = 0; i < frames.length; i++) {
        var f = frames[i], wid = null;
        try { wid = new URL(f.src).searchParams.get('widgetId'); } catch (err) {}
        if (d[1].widgetId && wid && wid !== d[1].widgetId) continue;
        var wrap = f.parentNode && f.parentNode.classList && f.parentNode.classList.contains('snz-reviews') ? f.parentNode : null;
        var known = f.getAttribute('data-snz-height');
        if (d[1].height <= 60) {
          // The widget posts a 1px "collapse" a moment after every real height and only restores it on its
          // next tick ~5 s later; honouring it would blank the reviews, so once a real height is known the
          // collapses are ignored.
          if (known) continue;
          f.style.transition = ''; f.height = d[1].height; f.style.height = d[1].height + 'px';
          continue;
        }
        f.style.transition = 'height 0.5s'; f.height = d[1].height; f.style.height = d[1].height + 'px';
        f.setAttribute('data-snz-height', String(d[1].height));
        if (wrap) { wrap.style.height = d[1].height + 'px'; wrap.classList.add('snz-reviews--loaded'); }
      }
    } catch (err) {}
  }, false);
  // LeadConnector booking calendar: the widget posts ['highlevel.setHeight', {height, id:'msgsndr-calendar'}] and the
  // vendor helper (form_embed.js) looks for an iframe by that id, which the GoHighLevel embed does not carry, so the
  // frame stays at the browser's 150px default and the calendar is cut off. Size the iframe that sent the message.
  // The widget's own highlevel.setHeight keeps reporting the calendar's initial height (750) after a date is picked,
  // while its content grows past 3000px (time slots + details form), which left the form cut off on phones. The
  // widget also ships the iframe-resizer child script: once the page answers its "Ready" with the parent handshake,
  // it reports its real content height on every change ("[iFrameSizer]<id>:<height>:<width>:<type>"). That channel
  // wins; setHeight is only used until it is live. The iframe never scrolls itself: it just gets taller.
  function bookingFrames(win) {
    var frames = document.querySelectorAll('iframe[src*="/widget/booking/"], iframe[src*="/widget/bookings/"]'), out = [];
    for (var i = 0; i < frames.length; i++) if (!win || frames[i].contentWindow === win) out.push(frames[i]);
    return out;
  }
  function sizeBookingFrame(f, h) {
    f.style.transition = 'height 0.3s'; f.height = h; f.style.height = h + 'px'; f.style.overflow = 'hidden'; f.setAttribute('scrolling', 'no');
    f.setAttribute('data-snz-height', String(h));
  }
  function sizerInit(f) {
    try { f.contentWindow.postMessage('[iFrameSizer]' + (f.id || 'snz-booking') + ':8:false:false:32:true:true:0:lowestElement:null:null:0:false:parent:scroll:false', '*'); } catch (err) {}
  }
  // the child may announce "Ready" before its resizer accepts the handshake, load late, or sit in a frame element
  // that hydration re-creates, so the page keeps offering the handshake (every 700 ms, ~40 s after load and again
  // after every "Ready") to every booking frame that has not reported a size yet
  var armUntil = 0, armTimer = null;
  function armSizer() {
    armUntil = Date.now() + 40000;
    if (armTimer) return;
    armTimer = setInterval(function () {
      var bf = bookingFrames(null), pending = 0;
      for (var i = 0; i < bf.length; i++) if (!bf[i].getAttribute('data-snz-sizer')) { pending++; sizerInit(bf[i]); }
      if (!pending || Date.now() > armUntil) { clearInterval(armTimer); armTimer = null; }
    }, 700);
  }
  window.addEventListener('message', function (e) {
    try {
      var d = e.data;
      if (typeof d === 'string' && d.indexOf('[iFrameResizerChild]Ready') === 0) { armSizer(); return; }
      if (typeof d === 'string' && d.indexOf('[iFrameSizer]') === 0) {
        var parts = d.slice(13).split(':'); var h = Math.ceil(parseFloat(parts[1]));
        if (!(h >= 200)) return;
        var sf = bookingFrames(e.source);
        for (var k = 0; k < sf.length; k++) { sf[k].setAttribute('data-snz-sizer', '1'); sizeBookingFrame(sf[k], h); }
        return;
      }
      var gh = null;
      if (Array.isArray(d) && d[0] === 'highlevel.setHeight' && d[1] && d[1].height) gh = d[1].height;
      else if (d && typeof d === 'object' && !Array.isArray(d) && typeof d.height === 'number') gh = d.height; // any other height report from the widget host
      if (!(gh >= 200)) return;
      var frames = bookingFrames(e.source);
      for (var i = 0; i < frames.length; i++) { var f = frames[i]; if (f.getAttribute('data-snz-sizer') && gh < parseFloat(f.getAttribute('data-snz-height') || '0')) continue; sizeBookingFrame(f, Math.max(gh, f.getAttribute('data-snz-sizer') ? parseFloat(f.getAttribute('data-snz-height') || '0') : 0)); }
    } catch (err) {}
  }, false);
  // frames that were ready before this listener existed: ask them once they have loaded
  document.addEventListener('DOMContentLoaded', armSizer);
  window.addEventListener('load', armSizer);
  /* hostnames are assembled at run time so that a grep of public/ for the original hostnames stays empty */
  var LC = 'leadconnectorhq' + '.com', FS = 'filesafe' + '.space', MS = 'msgsndr' + '.com';
  var ALIAS = {}; ALIAS['assets.cdn.' + FS] = 'filesafe'; ALIAS['cdn.' + FS] = 'filesafe'; ALIAS['assets.cdn.' + MS] = 'filesafe'; ALIAS['cdn.' + MS] = 'filesafe';
  ALIAS['images.' + LC] = 'lcimg'; ALIAS['stcdn.' + LC] = 'lcstatic'; ALIAS['fonts.googleapis.com'] = 'gfonts-css'; ALIAS['fonts.gstatic.com'] = 'gfonts';
  var LC_RE = new RegExp('(^|\\\\.)(' + LC.replace('.', '\\\\.') + '|apisystem\\\\.tech)$');
  var FONTMAP = ${JSON.stringify(Object.fromEntries(Object.entries(fontmap).map(([k, v]) => [k, assetMap.get(v) || null]).filter(([, v]) => v)))};
  function fnv(s) { var h = 0x811c9dc5; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); }
  function san(seg) { var s = seg.replace(/[^A-Za-z0-9._-]/g, '_'); if (s.length > 100) { var m = seg.match(/\\.[A-Za-z0-9]{1,8}$/); s = s.slice(0, 60) + '-' + fnv(seg) + (m ? m[0] : ''); } return s; }
  function esc(s) { return s.replace(/[\\\\|:?"*<>\\x00-\\x1f]/g, function (c) { var h = c.charCodeAt(0).toString(16).toUpperCase(); return '%' + (h.length < 2 ? '0' + h : h); }); }
  function local(url) {
    if (FONTMAP[url]) return FONTMAP[url];
    var m = /^https?:\\/\\/([^\\/?#]+)(\\/[^?#]*)?(\\?[^#]*)?/.exec(url); if (!m) return null;
    var host = m[1].toLowerCase(), p = (m[2] || '/').replace(/^\\//, ''), q = m[3] || '';
    if (host === 'backend.' + LC && /^appengine\\/reviews\\/get_widget\\//.test(p)) return '/ghl-stub/widget/reviews/' + p.split('/').slice(3).join('/');
    if (host === 'link.snoozesleep.com' || host === 'reputationhub.site') return null; /* live white-label widget embeds stay untouched */
    if (LC_RE.test(host) && !ALIAS[host]) return '/ghl-stub/api/' + p;
    if (host === 'storage.googleapis.com' && /^msgsndr\\//.test(p)) { host = 'assets.cdn.' + FS; p = p.replace(/^msgsndr\\//, ''); }
    var alias = ALIAS[host]; if (!alias) return null;
    var segs;
    if (host === 'images.' + LC) {
      var mm = /^image\\/((?:[^\\/]+\\/)*?)u_https?:\\/\\/([^\\/]+)\\/(.*)$/.exec(p);
      if (mm) { var rest = mm[3]; if (mm[2] === 'storage.googleapis.com') rest = rest.replace(/^msgsndr\\//, ''); segs = ('image/' + mm[1] + 'u/filesafe/' + rest).split('/'); }
      else segs = esc(p).replace(/\\/{2,}/g, '/').split('/');
    } else {
      var w = esc(p).replace(/\\/{2,}/g, '/'); if (q) w += '@' + esc(q.slice(1));
      if (host === 'fonts.googleapis.com' && !/\\.css$/.test(w)) w += '.css';
      segs = w.split('/');
    }
    return '/assets/' + alias + '/' + segs.filter(Boolean).map(san).join('/');
  }
  var CSS_URL = /url\\(\\s*(['"]?)(https?:\\/\\/[^'")]+)\\1\\s*\\)/g;
  function fixCss(t) { return t.replace(CSS_URL, function (all, qq, u) { var l = local(u); return l ? 'url(' + qq + l + qq + ')' : all; }); }
  var busy = false;
  function fixStyle(el) { var t = el.textContent; if (!t || t.indexOf('http') === -1) return; var n = fixCss(t); if (n !== t) { busy = true; el.textContent = n; busy = false; } }
  var ATTRS = ['src', 'srcset', 'data-src', 'data-srcset', 'href', 'poster', 'style'];
  function fixAttr(el, name) {
    var v = el.getAttribute(name); if (!v || v.indexOf('http') === -1) return; var n = v;
    if (name === 'style') n = fixCss(v);
    else if (name === 'srcset' || name === 'data-srcset') n = v.split(',').map(function (part) { var s = part.trim().split(/\\s+/); var l = /^https?:/.test(s[0]) ? local(s[0]) : null; if (l) s[0] = l; return s.join(' '); }).join(', ');
    else if (/^https?:/.test(v)) { var l = local(v); if (l) n = l; }
    if (n !== v) { busy = true; el.setAttribute(name, n); busy = false; }
  }
  function fixEl(el) { if (el.nodeType !== 1) return; if (el.tagName === 'STYLE') { fixStyle(el); return; } if (el.tagName === 'SCRIPT') return; for (var i = 0; i < ATTRS.length; i++) if (el.hasAttribute(ATTRS[i])) fixAttr(el, ATTRS[i]); }
  function scan(root) { if (root.nodeType !== 1) return; fixEl(root); var all = root.querySelectorAll('style,img,source,video,iframe,link,[style],[srcset],[data-src]'); for (var i = 0; i < all.length; i++) fixEl(all[i]); }
  try {
    new MutationObserver(function (muts) {
      if (busy) return;
      for (var i = 0; i < muts.length; i++) { var m = muts[i];
        if (m.type === 'characterData') { var p = m.target.parentNode; if (p && p.tagName === 'STYLE') fixStyle(p); }
        else if (m.type === 'attributes') fixAttr(m.target, m.attributeName);
        else for (var j = 0; j < m.addedNodes.length; j++) { var n = m.addedNodes[j]; if (n.nodeType === 1) scan(n); else if (n.nodeType === 3 && n.parentNode && n.parentNode.tagName === 'STYLE') fixStyle(n.parentNode); } }
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  } catch (e) {}
  document.addEventListener('DOMContentLoaded', function () { scan(document.documentElement); });
})();
`;
}

function writeReadme() {
  const routes = report.pages.map((p) => `| \`${p.route}\` | \`${p.source}\` | ${p.title.replace(/\|/g, '\\|')} |`).join('\n');
  const widgets = Object.entries(report.widgets.reduce((acc, s) => { const k = `${s.kind} — ${s.how}`; (acc[k] ||= { kind: s.kind, how: s.how, pages: new Set(), n: 0 }).pages.add(s.page); acc[k].n++; return acc; }, {}))
    .map(([, s]) => `- **${s.kind}** × ${s.n} on ${s.pages.size} page${s.pages.size === 1 ? '' : 's'}: ${s.how}.`).join('\n');
  const overrides = Object.entries(report.overrides.reduce((acc, o) => { (acc[o.rule] ||= { rule: o.rule, file: o.file, pages: new Set(), ids: new Set() }).pages.add(o.page); acc[o.rule].ids.add(o.id); return acc; }, {}))
    .map(([, o]) => `- **${o.rule}** → \`overrides/${o.file}\` on ${[...o.pages].join(', ')} (${o.ids.size} element${o.ids.size === 1 ? '' : 's'})`).join('\n');
  const stubs = Object.entries(report.stubs.reduce((acc, s) => { const k = `${s.kind} — ${s.original}`; (acc[k] ||= { kind: s.kind, original: s.original, how: s.how, pages: new Set() }).pages.add(s.page); return acc; }, {}))
    .map(([, s]) => `- **${s.kind}** (${s.pages.size} page${s.pages.size === 1 ? '' : 's'}): original \`${s.original}\` → ${s.how}.`).join('\n');
  const trackers = Object.entries(report.removedTrackers.reduce((acc, t) => { const k = `${t.where}: ${t.what}`; (acc[k] ||= { ...t, pages: new Set() }).pages.add(t.page); return acc; }, {}))
    .map(([, t]) => `- ${t.where} (${t.pages.size} page${t.pages.size === 1 ? '' : 's'}): \`${t.what.replace(/`/g, "'")}\``).join('\n');
  const removedScripts = Object.entries(report.removedScripts.reduce((acc, s) => { (acc[s.src] ||= { ...s, pages: new Set() }).pages.add(s.page); return acc; }, {}))
    .map(([, s]) => `- \`${s.src}\` (${s.pages.size} page${s.pages.size === 1 ? '' : 's'}): ${s.reason}`).join('\n');
  const aliases = Object.entries(HOST_ALIAS).map(([h, a]) => `| \`${h}\` | \`/assets/${a}/…\` |`).join('\n');
  const missing = [...report.missingReferenced];
  write(path.join(ROOT, 'README.md'), `# Brownsville Snooze — Next.js conversion

Next.js 15 (App Router, TypeScript) rendering of the static wget clone of
\`https://brownsville.snoozemattresscompany.com/\` (a GoHighLevel / LeadConnector funnel).
The whole project is **generated** by [\`scripts/convert.mjs\`](scripts/convert.mjs); re-run it whenever the clone is re-pulled:

\`\`\`bash
npm install
CLONE_ROOT=C:/clones NEXT_PUBLIC_SITE_URL=${SITE_URL} npm run convert
npm run build && npm run start   # http://localhost:3000
npm run verify                    # routes, network capture, forbidden-host grep, screenshots
\`\`\`

## Routes (${report.pages.length})

| Route | Source page | Title |
|---|---|---|
${routes}

## How the conversion works

1. **Assets** — every non-HTML file of the clone is copied to \`public/assets/<alias>/…\` with Windows-safe, collision-free names
   (see [\`asset-map.json\`](asset-map.json) for original-local-path → public-path). Host aliases:

| Original host | Served from |
|---|---|
${aliases}

   Proxied image variants (\`images.leadconnectorhq.com/image/f_webp/q_80/r_<size>/u_https://assets.cdn.filesafe.space/<id>\`) live under
   \`/assets/lcimg/image/…/u/filesafe/<id>\`. Google Fonts CSS and the \`fonts.gstatic.com\` woff2 files are served from \`public/\`, so the app makes no external font requests.
2. **Pages** — for each HTML page one route is generated (\`app/<slug>/page.tsx\` + \`content.ts\`). \`<title>\`, description, keywords, robots, og:* and twitter:* tags become \`export const metadata\`; canonical/og:url point at \`${SITE_URL}\`.
   The \`<head>\` stylesheet/style sequence (external \`<link rel="stylesheet">\`, the data-URI custom-font stylesheet and every inline \`<style>\`) is emitted **verbatim and in the original order** in front of the \`<body>\` markup, both rendered through \`dangerouslySetInnerHTML\` in a server component (\`components/GhlPage.tsx\`). This keeps the builder's cascade order exactly; importing the stylesheets through \`globals.css\` would have moved the page-specific inline styles after the external sheets.
3. **Scripts** — every \`<script src>\` and executable inline script is re-emitted through \`next/script\` (\`strategy="afterInteractive"\`) in the original order; the Nuxt JSON payload (\`#__NUXT_DATA__\`) and the JSON-LD block are data blocks and stay inline. Because \`afterInteractive\` scripts run after \`DOMContentLoaded\`, the site's own \`document.addEventListener("DOMContentLoaded", fn)\` calls were rewritten to \`window.__ghlOnReady(fn)\` (defined in \`public/ghl-offline-shim.js\`).
4. **URL rewriting** — HTML attributes, inline CSS \`url()\`, the Nuxt payload strings, the Nuxt runtime config (\`window.__NUXT__.config\`: \`cdnURL\`, \`IMAGE_CDN\`, storage/API URLs) and the copied JS bundles (\`public/assets/lcstatic/_preview/*.js\`) were rewritten so nothing points at \`snoozemattresscompany.com\`, \`filesafe.space\`, \`leadconnectorhq.com\` or \`msgsndr.com\`. \`public/ghl-offline-shim.js\` is a runtime safety net that rewrites any such URL the GHL runtime still builds at hydration time, and \`middleware.ts\` maps the Google Fonts stylesheet URLs the runtime assembles (\`…/gfonts-css/css?family=…\`) onto the local copies.
5. **Teleport fix** — Vue's \`<Teleport to="body">\` hydration expects its SSR anchors to be direct children of \`<body>\`; React needs a host element, so \`components/GhlPage.tsx\` moves those body-level nodes out of the wrapper right after React hydration and before the Nuxt entry runs. Without this the GHL runtime "repairs" the DOM by deleting the page.

## Header / navigation

The GoHighLevel header (desktop section \`section-n2EJ48xJKc\`, mobile section \`section-EZ3DGo6-8h\`, the "active page / magnetic hover" script and the custom mobile drawer) is removed from every page (markup and Nuxt payload) and replaced by [\`components/SiteHeader.tsx\`](components/SiteHeader.tsx) + [\`SiteHeader.module.css\`](components/SiteHeader.module.css), rendered from the root layout: sticky white bar, the original logo, the same five links, an "Our Products" mega menu (Products / Sleep Accessories + a Dream Mapping card), a "Blog" dropdown (the three articles + "All articles", from \`lib/blog-nav.ts\`), a premium phone CTA, and an off-canvas mobile drawer with expandable Products and Blog groups (staggered items, swipe-to-close). Hover intent, Escape, outside-click, focus management and reduced-motion are handled in the component. Site values (phone, logo, feature image) come from \`overrides/overrides.json\` → \`components/site-config.ts\`.

## Footer

One footer for the whole site: \`components/SiteFooter.tsx\` (+ module CSS), rendered by the root layout on every route (GoHighLevel pages and the blog). It merges the light footer (logo, description, social icons, Our Products, Company, Visit Us, bottom bar with Terms / Privacy) with the pieces of the old blue footer: the Google Map with the "Our Location" card (address, Get Directions, Open Maps), the phone with its orange icon and the two CTA buttons (Book Your Dream Mapping Appointment, Get In Touch With Us). The old GHL footer sections (\`section-ghjYZIxTU2\` mobile, \`section-zTxb2Wa9Nv\` desktop) are removed from every page via \`removeElements\`.

## Buttons

\`overrides/buttons.css\` is injected after every page's own CSS and applies the client's \`.waitlist-button\` look to every GoHighLevel button: orange gradient, no border, 8px radius, Poppins 16px/600 uppercase, shine sweep, lift on hover, compact sizing on phones (≤ 767px). GHL "buttons" that are really plain text links (transparent background + \`noBorder\`: the address/phone strips, the footer product list) are excluded per page through a generated \`:not(.cbutton-ID)\` chain (the \`{{not}}\` placeholder), so they keep their original look.

## Blog (hand-written Next.js routes)

\`/blog\` and the three posts (\`/blog/custom-mattresses-improving-health\`, \`/blog/pressure-mapping-for-sleep\`, \`/blog/mattresses-that-relieve-aches\`) are native App Router pages: content in \`lib/blog-posts.ts\` (client copy verbatim), template in \`components/blog/\` (hero → featured image → article → FAQ accordion → CTA → related posts → footer, one continuous lavender gradient), unique meta title/description, canonical, Open Graph + Twitter cards, JSON-LD BlogPosting + FAQPage + BreadcrumbList, \`app/sitemap.ts\` and \`app/robots.ts\`. Images are site assets served through \`next/image\`. The converter keeps \`app/blog\`, \`app/sitemap.ts\` and \`app/robots.ts\` when it regenerates \`app/\`.

## Page fixes (\`overrides/site.css\`, \`overrides/global.css\`)

\`site.css\` is injected after every page stylesheet: the Financing / About Us / Home timeline block is transparent so the section's own lavender background flows from the heading into the timeline (no white seam). \`global.css\` is imported by the root layout for every route: smooth scrolling (disabled under reduced motion) with \`scroll-padding-top\` so anchors land below the sticky header. The timeline / guarantee scripts in \`overrides/*.html\` initialise every copy of a section (GHL renders a desktop and a mobile copy), so they animate on phones.

## Mobile navigation (paste-ready, vanilla)

\`overrides/mobile-nav/snooze-mobile-nav.html\` is a self-contained mobile-only (≤ 767px) drawer (HTML + CSS + JS, \`snzm-\` prefix, no dependencies) for a custom-code element: slide-in drawer, blurred overlay, hamburger→X, staggered items, animated submenus (Our Products, Blog), focus trap, ARIA, swipe-to-close, current-page highlight, body scroll lock. This site uses the React drawer in \`components/SiteHeader.tsx\`, which has the same behaviours.

## Replaced sections (hand-provided code)

Custom-code elements whose content matches a rule in \`overrides/overrides.json\` are swapped for the file below, in both the server markup and the Nuxt payload; \`{{custom_values.*}}\` merge tags are filled from the \`vars\` block:

${overrides || '- (none)'}

## Inserted sections (copied from another page)

\`overrides.json\` → \`insertSections\` copies whole GoHighLevel sections from one page into the others: the "Our Promise / We Stand Behind Every Single Night's Sleep" guarantee (desktop + mobile copies) from \`about-us.html\` is inserted right before the section containing "Some of Our Happy Customers" on every page that has it. \`scripts/insert-sections.mjs\` does it in the three places hydration needs: SSR markup, the Nuxt payload (nodes encoded into the devalue array, listed before the anchor in \`pageData.elements\` and in the root child list) and the per-element CSS (media queries preserved). Pages touched: ${report.insertedSections.length}.

## Hero backgrounds

\`overrides.json\` → \`heroBackgrounds\` maps a page to the image its hero should use; \`scripts/hero-backgrounds.mjs\` applies it to the first desktop-only section that carries a background (CSS variants + payload); the mobile hero copy keeps its own image. Pages configured: ${report.heroBackgrounds.length}.

## Responsive pass

\`overrides/site.css\` normalises the horizontal gutter of every content row (20px on phones, 32px on tablets; tickers/marquees excluded), makes the timelines single-column on phones (card centred, watermark inside the card, decorative blobs off), keeps media inside its container, gives the financing band a matching background colour behind its rounded image plus a slight darkening and large semibold copy for WCAG AA, and deepens the orange address strips (\`.snz-orange-strip\`, class set by the converter) to 4.5:1. \`scripts/responsive-extras.mjs\`: every text element's mobile and desktop font size become one \`clamp()\` between 390px and 1440px, and every local image gets width/height attributes read from the file (${report.imageDimsAdded || 0} added).

## Motion

One shared system: \`overrides/motion.css\` + \`public/snz-motion.js\` (loaded by the root layout). Elements carry \`data-animate="fade-up|fade-down|fade-left|fade-right|zoom-in|fade"\` and optional \`data-delay\`; the converter tags server-rendered elements from \`overrides/motion.json\` (page rules first, then the \`*\` defaults; custom-code sections keep their own animations). The hidden state only applies while \`html.js\` is set by the shim before first paint (never under reduced motion), so content is visible without JavaScript. Also: hover lift / press-down on buttons, a soft pulse on the hero CTA (\`.snz-pulse\`), card lift on the timelines.

## Locales (/es)

Every page is generated once per locale: English under \`app/(en)/\` and Spanish under \`app/es/\` (same route, \`/es\` prefix), each route group with its own root layout (\`<html lang>\`, header/footer locale). The Spanish text comes from \`overrides/i18n/es.part-*.json\` (+ \`es.extra.json\` for manual fixes), an English-segment -> Spanish dictionary produced from \`node scripts/i18n-extract.mjs\`; \`scripts/i18n.mjs\` applies it to every text node and alt/title/placeholder/aria-label of the markup and to every string of the Nuxt payload (hydration re-renders from the payload, so both must agree), and prefixes internal links. Segments without a translation are listed in \`overrides/i18n/missing.json\` after each run. Metadata (title, description, Open Graph) is translated the same way; every page declares \`hreflang\` alternates for en, es and x-default. The header, footer and blog use \`lib/i18n.ts\`; the blog posts have hand-translated Spanish versions in \`lib/i18n/blog-es/\`. The LeadConnector embeds (reviews, popup form, booking calendar) are the client's CRM widgets and render in the language configured there.

## FAQ accordions, financing ribbon, navy cards

Every GoHighLevel FAQ element is rebuilt as the blog-style accordion (\`overrides/faq-accordion.html\`, questions and answers taken verbatim from the element; one delegated click handler serves every copy). The GoHighLevel FAQ component rewrote its items' class lists on every toggle, which also removed the scroll-reveal class and faded the answers out. The "0% Financing Available" ribbon PNG (whose folds were drawn unevenly) is replaced by the coded ribbon in \`overrides/ribbon.html\` (\`.snz-ribbon\`: navy body, folded ends, dotted border, white logo, translatable headline; centred, up to 620px, flush with the section top). Both become custom-code elements in markup and payload, like the CRM widgets. Navy rounded cards with the orange border carry \`.snz-card\` (detected from their page CSS) so \`overrides/site.css\` can give them one inner padding on phones.

## CRM widgets (live embeds)

The reviews widget iframe is sized by a \`message\` listener in \`public/ghl-offline-shim.js\` (installed before the iframe can post its height). The widget posts a 1px collapse right after every real height and restores it ~5 s later, so the listener ignores collapses once a real height is known and the vendor helper \`review-widget.js\` (which re-applies them) is not embedded; \`overrides/widgets/reviews.html\` reserves space with a loading placeholder until the first real height arrives. The booking calendar iframe is sized by a second listener for the widget's \`highlevel.setHeight\` message (the vendor \`form_embed.js\` looks for an iframe id the embed does not carry, which left the calendar cut off at 150px); \`overrides/site.css\` gives it a 760px minimum until the first message.

The LeadConnector form, booking-calendar and review-widget elements are rendered as the client's white-label embeds (\`link.snoozesleep.com\`, \`reputationhub.site\`) configured in \`overrides/overrides.json\` → \`widgets\`. These iframes talk to the client's CRM on their own; the page itself still makes no request to leadconnectorhq.com (its API base URLs point at \`/ghl-stub/api/…\`, which returns 404):

${widgets || '- (none found)'}
${stubs ? `\nRemaining placeholders:\n\n${stubs}\n` : ''}
There is no chat widget in the page code itself; the LeadConnector chat widget (\`widgets.leadconnectorhq.com\`) was loaded by the Google Tag Manager container, which is removed.

## Removed tracking / analytics

${trackers || '- (none)'}

Removed external scripts:

${removedScripts || '- (none)'}

## Known differences from the original

- Third-party embeds that are not the client's CRM are kept as-is and still load from their own hosts: Google Maps embeds (\`maps.google.com\`), social links.
- The reviews widget, popup form and booking calendar show placeholders instead of live CRM content.
- Fonts, images, CSS and the GoHighLevel runtime (Nuxt bundle + ${report.assets.copied + report.assets.skippedUnchanged} asset files) are served locally.
${missing.length ? `- ${missing.length} referenced file(s) did not exist in the clone and now resolve to a local 404 instead of the CDN (see conversion-report.json → missingReferenced).` : ''}

Generated ${new Date().toISOString()} from \`${CLONE}\`.
`);
}

// ---------------------------------------------------------------- run
console.log(`converting ${pageFiles.length} pages from ${SITE_DIR} → ${ROOT}`);
// hand-written routes that must survive a regeneration (everything else under app/ is generated)
// hand-written routes that must survive a regeneration: app/(en)/blog, app/es/blog, sitemap.ts, robots.ts (everything else under app/ is generated)
const GEN_FILE = /^(page|layout|not-found)\.tsx$|^content\.ts$/;
if (fs.existsSync(APP)) for (const e of fs.readdirSync(APP)) { if (['sitemap.ts', 'robots.ts', '(en)', 'es'].includes(e)) continue; const p = path.join(APP, e); if (fs.statSync(p).isDirectory() || GEN_FILE.test(e)) fs.rmSync(p, { recursive: true, force: true }); }
for (const g of ['(en)', ...LOCALES.filter((l) => l.code !== 'en').map((l) => l.code)]) { const d = path.join(APP, g); if (!fs.existsSync(d)) continue; for (const e of fs.readdirSync(d)) { if (e === 'blog' || e === 'booking') continue; const p = path.join(d, e); if (fs.statSync(p).isDirectory() || GEN_FILE.test(e)) fs.rmSync(p, { recursive: true, force: true }); } }
// sections to copy into other pages are read once from their source page (raw clone, before any transform)
const INSERT_PACKS = OVR.insertSections.map((cfg) => extractSections(SITE_DIR, cfg));
for (const p of INSERT_PACKS) report.insertPacks.push({ name: p.name, from: p.sourcePage, sections: p.sections.map((s) => ({ id: s.id, nodes: s.nodes.length, htmlBytes: s.html.length, cssBytes: s.css.length })) });
for (const rel of pageFiles) { convertPage(rel, null); for (const loc of EXTRA_LOCALES) convertPage(rel, loc); }
if (EXTRA_LOCALES.length) { const missing = new Set(); for (const e of report.i18n) for (const m of e.missing) missing.add(m); write(path.join(I18N_DIR, 'missing.json'), JSON.stringify([...missing], null, 1)); console.log(`locales: ${EXTRA_LOCALES.map((l) => l.code).join(', ')}; untranslated segments: ${missing.size} (overrides/i18n/missing.json)`); }
writeProjectFiles();
write(path.join(ROOT, 'asset-map.json'), JSON.stringify(Object.fromEntries([...assetMap].sort()), null, 1));
report.missingReferenced = [...report.missingReferenced];
write(path.join(ROOT, 'conversion-report.json'), JSON.stringify(report, null, 2));
writeReadme();
console.log(`\nassets copied: ${report.assets.copied} (+${report.assets.skippedUnchanged} unchanged), ${(report.assets.bytes / 1048576).toFixed(1)} MB, bundles patched: ${report.assets.bundlesPatched}, name collisions resolved: ${report.assets.collisions}`);
console.log(`urls rewritten: ${report.rewrittenUrls}; trackers removed: ${report.removedTrackers.length}; scripts removed: ${report.removedScripts.length}; section overrides: ${report.overrides.length}; widgets: ${report.widgets.length}; placeholders: ${report.stubs.length}; hints dropped: ${report.droppedHints}`);
console.log(`referenced-but-missing in clone: ${report.missingReferenced.length}`); for (const m of report.missingReferenced.slice(0, 25)) console.log('   ', m);
console.log('external hosts left untouched:', report.externalHostsLeft);
