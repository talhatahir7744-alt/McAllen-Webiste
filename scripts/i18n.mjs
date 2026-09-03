/*
 * Locale support for scripts/convert.mjs.
 *
 * A locale is a dictionary (overrides/i18n/<locale>.part-*.json + <locale>.extra.json, English segment ->
 * translation) applied to every text node and translatable attribute of the server-rendered markup AND to
 * every string of the Nuxt payload (hydration re-renders from the payload, so both must agree), plus an
 * internal-link prefix (/es/...). Segments are looked up with whitespace collapsed, exactly as
 * scripts/i18n-extract.mjs produced them; leading/trailing whitespace of the original node is kept.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

export const ATTRS = ['alt', 'title', 'placeholder', 'aria-label'];
const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'template', 'code', 'pre']);
export const norm = (s) => s.replace(/\s+/g, ' ').trim();

export function loadLocale(dir, locale) {
  const dict = new Map();
  const files = fs.readdirSync(dir).filter((f) => new RegExp(`^${locale}\\.(part-\\d+|extra)\\.json$`).test(f)).sort((a, b) => (a.includes('extra') ? 1 : 0) - (b.includes('extra') ? 1 : 0));
  for (const f of files) {
    const obj = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const [k, v] of Object.entries(obj)) if (typeof v === 'string' && v.trim()) dict.set(norm(k), v);
  }
  return { locale, dict, files };
}

/** Translate one text value (a text node or attribute), keeping surrounding whitespace. */
export function tr(text, loc, stats) {
  if (!text || !loc) return text;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
  const core = norm(m[2]);
  if (!core) return text;
  const hit = loc.dict.get(core);
  if (hit === undefined) { if (stats && /[A-Za-z]{2,}/.test(core) && !/^[\d\s.,:;()+\-–—/%$#&|©®™"'!?…•·]*$/.test(core)) stats.missing.add(core); return text; }
  if (stats) stats.hits++;
  return m[1] + hit + m[3];
}

/** Internal page links get the locale prefix (/es/...); assets, anchors, tel/mailto and other hosts are untouched. */
export function localizeHref(href, loc, siteHosts) {
  if (!href || !loc || !loc.prefix) return href;
  let p = href.trim();
  const m = /^https?:\/\/([^/?#]+)([^?#]*)([?#].*)?$/i.exec(p);
  if (m) { if (!siteHosts.has(m[1].toLowerCase())) return href; p = (m[2] || '/') + (m[3] || ''); }
  if (!p.startsWith('/') || p.startsWith('//')) return href;
  if (/^\/(assets|ghl-stub|_next|api)\//.test(p) || p.startsWith(loc.prefix + '/') || p === loc.prefix) return href;
  if (/\.[a-z0-9]{2,5}($|[?#])/i.test(p)) return href; // files
  return loc.prefix + (p === '/' ? '' : p);
}

/** Translate text nodes + attributes below `root` (a cheerio node) and localize links. */
export function translateDom($, root, loc, stats, siteHosts) {
  const visit = (node) => {
    if (node.type === 'text') { const t = tr(node.data, loc, stats); if (t !== node.data) node.data = t; return; }
    if (node.type !== 'tag') return;
    if (SKIP_TAGS.has(node.name)) return;
    const a = node.attribs || {};
    for (const k of ATTRS) if (a[k]) { const t = tr(a[k], loc, stats); if (t !== a[k]) a[k] = t; }
    if (node.name === 'input' && /^(submit|button)$/i.test(a.type || '') && a.value) { const t = tr(a.value, loc, stats); if (t !== a.value) a.value = t; }
    if (node.name === 'a' && a.href) { const h = localizeHref(a.href, loc, siteHosts); if (h !== a.href) a.href = h; }
    for (const c of node.children || []) visit(c);
  };
  for (const c of root.children || []) visit(c);
}

const LOOKS_HTML = /<[a-z][^>]*>/i;
const LOOKS_CSS = /[{};]\s*[a-z-]+\s*:/i;
const HAS_ELEMENTS = /<(div|span|section|p|h[1-6]|ul|ol|li|a|img|button|nav|header|footer|article)\b[^>]*>/i;
/** Translate a payload string: markup is parsed and translated node by node, plain text is looked up whole, bare page paths get the prefix. */
export function translateString(s, loc, stats, siteHosts) {
  if (!loc || typeof s !== 'string' || !s) return s;
  // markup is parsed node by node; a custom-code block that ships its own <style>/<script> (the hand-provided section
  // templates) is markup too: translateDom skips style/script contents, and cheerio keeps them byte-identical (CRLF aside)
  if (LOOKS_HTML.test(s) && (HAS_ELEMENTS.test(s) || (!LOOKS_CSS.test(s) && !s.includes('@import')))) {
    const $ = cheerio.load(s, null, false);
    const before = stats.hits;
    translateDom($, $.root()[0], loc, stats, siteHosts);
    return stats.hits === before && !/href=/.test(s) ? s : $.html();
  }
  if (/^(https?:\/\/[^\s"'<>]+|\/[a-z0-9\-/]*)$/i.test(s)) return localizeHref(s, loc, siteHosts);
  if (s.length > 4000 || /[{}<>]/.test(s)) return s; // long plain strings (page schema descriptions) are still exact dictionary lookups
  const t = tr(s, loc, null); if (t !== s) { if (stats) stats.hits++; return t; }
  // no whole-string entry (the page schema descriptions join several sentences the dictionary knows one by one):
  // translate sentence by sentence, but only when every sentence is known
  const parts = s.split(/(?<=[.!?])\s+/); if (parts.length < 2) return s;
  const out = parts.map((p) => tr(p, loc, null));
  if (out.some((p, i) => p === parts[i] && /[A-Za-z]{2,}/.test(parts[i]))) return s;
  if (stats) stats.hits++;
  return out.join(' ');
}
