/*
 * Per-page lastmod for app/sitemap.ts. For every public route (EN + ES) the date of the last commit that touched the
 * route's own source files is written to lib/lastmod.json: the generated page folder (page.tsx, content.ts, client.tsx,
 * scripts.ts) for builder pages, the hand-written component for /booking and /sleep-quiz, the blog module for /blog.
 * Shared files (layouts, header, footer, global CSS) are deliberately not counted — they change every page's markup
 * but not the page. Uncommitted changes fall back to the file's mtime. Blog posts keep their own dates (lib/blog-posts.ts).
 *
 *   node scripts/lastmod.mjs      (npm run lastmod)   — run before `npm run build` whenever page content changed; commit the JSON.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUTES = ['/', '/about-us', '/mattresses', '/adjustable-mattress-bases', '/massage-chairs', '/pillows', '/mattress-protectors', '/premium-sheets', '/sleep-recliner', '/at-home-sleep-test-kit-by-sleepcorner', '/mattress-financing', '/mattress-sales', '/booking', '/sleep-quiz', '/blog', '/privacy-policy-page', '/terms-conditions-page'];
const EXTRA = { '/booking': ['components/BookingPage.tsx', 'components/BookingPage.module.css'], '/sleep-quiz': ['components/SleepQuiz.tsx', 'components/sleep-quiz', 'public/sleep-fit-quiz.js'], '/blog': ['components/blog', 'lib/blog-posts.ts', 'lib/blog-images.ts', 'lib/blog-nav.ts'] };

const pageFiles = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^(page\.tsx|content\.ts|client\.tsx|scripts\.ts)$/.test(f)).map((f) => path.join(dir, f)) : [];
const gitDate = (paths) => { try { const d = execSync(`git log -1 --format=%cI -- ${paths.map((p) => `"${p}"`).join(' ')}`, { cwd: ROOT, encoding: 'utf8' }).trim(); return d ? d.slice(0, 10) : null; } catch { return null; } };
const mtime = (paths) => { let m = 0; for (const p of paths) { try { const st = fs.statSync(path.join(ROOT, p)); m = Math.max(m, st.mtimeMs); } catch {} } return m ? new Date(m).toISOString().slice(0, 10) : null; };
const dirty = (paths) => { try { return execSync(`git status --porcelain -- ${paths.map((p) => `"${p}"`).join(' ')}`, { cwd: ROOT, encoding: 'utf8' }).trim().length > 0; } catch { return false; } };

const out = {};
for (const route of ROUTES) {
  for (const locale of ['en', 'es']) {
    const base = locale === 'en' ? 'app/(en)' : 'app/es';
    const dir = route === '/' ? base : path.join(base, route.slice(1));
    const files = [...pageFiles(path.join(ROOT, dir)).map((f) => path.relative(ROOT, f)), ...(EXTRA[route] || [])];
    if (route === '/blog') files.push(path.join(dir)); // the route folder itself (page.tsx + [slug])
    const url = locale === 'en' ? route : route === '/' ? '/es' : `/es${route}`;
    const date = (dirty(files) ? mtime(files) : null) || gitDate(files) || mtime(files) || new Date().toISOString().slice(0, 10);
    out[url] = date;
  }
}
const file = path.join(ROOT, 'lib', 'lastmod.json');
fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
console.log(`lib/lastmod.json: ${Object.keys(out).length} routes, ${new Set(Object.values(out)).size} distinct dates (${[...new Set(Object.values(out))].sort().join(', ')})`);
