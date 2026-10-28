/*
 * The contact page lives at /contact-us and /es/contact-us (October 29, 2026; the builder's opt-in page, same content,
 * form and design: only the URL and the SEO changed). scripts/convert.mjs writes the page to the new route
 * (RENAMED_ROUTES); this script does the rest on the generated pages, EN + ES, idempotent:
 *   1. every page's builder payload lists the funnel steps with their URLs (the "Optin" step's URL is what builder
 *      buttons that open the contact form link to): the old step URL becomes /contact-us (/es/contact-us on the Spanish
 *      pages, which list their own /es URLs); also any static link to it;
 *   2. the contact page's script ids follow the route (they are derived from it);
 *   3. the contact page's H1 names the store: "Contact Snooze Mattress in McAllen" / "Contacta a Snooze Mattress en
 *      McAllen" (the desktop heading — a p[role=heading] since the one-H1 pass — and the phone h1, in the markup and in
 *      the payload's heading strings; nothing else on the page changes);
 *   4. the payload's page title / description (re-applied to <head> by the runtime after hydration) = the SEO title
 *      and description.
 * Run after `npm run convert`, before the other post-convert scripts.  node scripts/contact-page.mjs  (npm run contact:page)  [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');

const OLD = '/' + 'optin' + '-page'; // the builder's opt-in URL (spelled out once here; vercel.json redirects it)
const NEW = '/contact-us';
const H1 = {
  en: { from: 'Contact Us', to: 'Contact Snooze Mattress in McAllen' },
  es: { from: 'Contáctanos', to: 'Contacta a Snooze Mattress en McAllen' },
};
/* 4. the page's own head values in the payload: after hydration the builder runtime writes its page title, meta
   description and og:title back into <head> from the payload (pageData meta, its social-share block and its schema
   object), which replaced the SEO title with "Contact Us". Those fields are re-pointed to new strings with the SEO
   title and description (same text as scripts/seo-metadata.mjs META['/contact-us']: keep the two in sync); the old
   strings are left in place, unreferenced (shared payload strings are never overwritten). */
const META = {
  en: { title: 'Contact Snooze Mattress in McAllen, TX | Snooze Mattress', description: 'Contact Snooze Mattress + Wellness in McAllen: call (956) 586-5646, visit 7913 N 10th St, Suite 130 or send a message to book a free Dream Mapping fitting.', oldTitle: 'Contact Us', oldDescription: 'Have questions? Reach out and our team will get back to you shortly.' },
  es: { title: 'Contacta a Snooze Mattress en McAllen, TX | Snooze Mattress', description: 'Contacta a Snooze Mattress + Wellness en McAllen: llama al (956) 586-5646, visita 7913 N 10th St, Suite 130 o escríbenos y agenda tu Dream Mapping gratis.', oldTitle: 'Contáctanos', oldDescription: '¿Tienes preguntas? Escríbenos y nuestro equipo te responderá muy pronto.' },
};
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'content.ts' || (e.name === 'scripts.ts' && path.basename(d) === 'contact-us')) files.push(p); } })(path.join(ROOT, 'app'));

let changed = 0; const totals = { url: 0, ids: 0, h1Markup: 0, h1Payload: 0, meta: 0 };
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const src = fs.readFileSync(file, 'utf8'); let next = src;
  // 1. the funnel step URL / links (the token has no characters that JSON or HTML escape, so a plain replace covers
  //    the markup, the payload and the scripts in every encoding)
  const nUrl = next.split(OLD).length - 1; if (nUrl) { next = next.split(OLD).join(NEW); totals.url += nUrl; }
  // 2. the contact page's script ids ("<route>-src-0", …)
  if (rel.endsWith('/contact-us/scripts.ts')) { const re = new RegExp(`(["-])${escRe(OLD.slice(1))}-`, 'g'); const n = (next.match(re) || []).length; if (n) { next = next.replace(re, `$1${NEW.slice(1)}-`); totals.ids += n; } } // "contact-us-src-0", "es-contact-us-src-0", …
  // 3. the contact page's H1 (markup + payload heading strings)
  if (rel.endsWith('/contact-us/content.ts')) {
    const loc = rel.startsWith('app/es/') ? 'es' : 'en'; const h = H1[loc];
    const bodyM = next.match(/export const BODY_HTML = ("[\s\S]*");\s*$/);
    if (bodyM) {
      const body = JSON.parse(bodyM[1]);
      const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
      let markup = pm ? body.replace(pm[0], '\u0000PAYLOAD\u0000') : body;
      const re = new RegExp(`>${escRe(h.from)}</span></(p|h1)>`, 'g');
      markup = markup.replace(re, (m, tag) => { totals.h1Markup++; return `>${h.to}</span></${tag}>`; });
      let payload = pm ? pm[0] : '';
      if (pm) {
        const nodes = JSON.parse(pm[2]); let touched = false;
        for (let i = 0; i < nodes.length; i++) { if (typeof nodes[i] !== 'string' || !re.test(nodes[i])) { re.lastIndex = 0; continue; } re.lastIndex = 0; nodes[i] = nodes[i].replace(re, (m, tag) => `>${h.to}</span></${tag}>`); totals.h1Payload++; touched = true; }
        // 4. head values the runtime re-applies after hydration (see META above)
        const mt = META[loc]; const oldT = nodes.indexOf(mt.oldTitle), oldD = nodes.indexOf(mt.oldDescription);
        const push = (v) => { const i = nodes.indexOf(v); if (i >= 0) return i; nodes.push(v); return nodes.length - 1; };
        for (const n of nodes) {
          if (!n || typeof n !== 'object' || Array.isArray(n)) continue;
          for (const key of ['title', 'name']) if (oldT >= 0 && n[key] === oldT && ('description' in n)) { n[key] = push(mt.title); totals.meta++; touched = true; }
          if (oldD >= 0 && n.description === oldD) { n.description = push(mt.description); totals.meta++; touched = true; }
        }
        if (touched) payload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3];
      }
      const newBody = pm ? markup.replace('\u0000PAYLOAD\u0000', () => payload) : markup;
      if (newBody !== body) next = next.replace(bodyM[1], () => JSON.stringify(newBody));
    }
  }
  if (next !== src) { changed++; if (!CHECK) fs.writeFileSync(file, next); }
}
console.log(`contact page: ${totals.url} old-URL references -> ${NEW}, ${totals.ids} script ids, H1 ${totals.h1Markup} markup + ${totals.h1Payload} payload headings, ${totals.meta} payload head fields; ${changed} files ${CHECK ? 'would change' : 'changed'}`);
