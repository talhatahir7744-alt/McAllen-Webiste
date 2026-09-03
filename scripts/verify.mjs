#!/usr/bin/env node
/**
 * verify.mjs — post-build verification of the converted site.
 *
 *   npm run build && npm run start          # in one terminal
 *   node scripts/verify.mjs                 # in another (BASE=http://localhost:3000 by default)
 *
 * Checks:
 *   1. every generated route returns HTTP 200
 *   2. in a real browser (Edge/Chrome via puppeteer-core) every route is loaded and every network
 *      request is recorded: none may go to snoozemattresscompany.com, filesafe.space,
 *      leadconnectorhq.com or msgsndr.com; failed requests, console errors and broken <img> are reported
 *   3. the built output (.next) and public/ are grepped for those hostnames
 *   4. optional: COMPARE=<url-or-file-of-original-clone> renders the same page from the original clone
 *      and reports the pixel difference of the homepage (pixelmatch)
 * Screenshots go to verify-out/.
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ROOT = path.resolve(import.meta.dirname, '..');
const BASE = (process.env.BASE || 'http://localhost:3000').replace(/\/+$/, '');
const BROWSER = process.env.BROWSER_PATH || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const FORBIDDEN = /(?:^|\.)(?:snoozemattresscompany\.com|filesafe\.space|leadconnectorhq\.com|msgsndr\.com)$/i;
const OUT = path.join(ROOT, 'verify-out'); fs.mkdirSync(OUT, { recursive: true });
const routes = JSON.parse(fs.readFileSync(path.join(ROOT, 'conversion-report.json'), 'utf8')).pages.map((p) => p.route);
const summary = { base: BASE, routes: {}, forbiddenRequests: [], failedRequests: [], consoleErrors: [], pageErrors: [], brokenImages: [], grep: {}, compare: null };

// 1. HTTP status of every route
console.log(`# 1. HTTP status of ${routes.length} routes on ${BASE}`);
for (const r of routes) {
  const res = await fetch(BASE + r, { redirect: 'manual' });
  const body = await res.text();
  summary.routes[r] = { status: res.status, bytes: body.length };
  console.log(`  ${String(res.status).padEnd(4)} ${r.padEnd(42)} ${(body.length / 1024).toFixed(0)} KB`);
}
const notOk = Object.entries(summary.routes).filter(([, v]) => v.status !== 200);
console.log(notOk.length ? `  !! ${notOk.length} route(s) not 200` : '  all routes 200');

// 2. browser: network capture per route
console.log(`\n# 2. browser network capture (${BROWSER})`);
const browser = await puppeteer.launch({ executablePath: BROWSER, headless: true, args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'] });
const hostTotals = {};
for (const r of routes) {
  const page = await browser.newPage(); await page.setViewport({ width: 1366, height: 900 });
  const reqs = [];
  const widgetReqs = []; // requests made from inside embedded third-party iframes (forms, calendar, reviews, maps)
  page.on('request', (q) => { const fr = q.frame(); if (fr && fr !== page.mainFrame()) widgetReqs.push(q.url()); else reqs.push(q.url()); });
  page.on('requestfailed', (q) => { if (!q.url().startsWith('data:')) summary.failedRequests.push({ route: r, url: q.url().slice(0, 200), err: q.failure()?.errorText }); });
  page.on('response', (s) => { if (s.status() >= 400 && s.url().startsWith(BASE)) summary.failedRequests.push({ route: r, url: s.url().slice(0, 200), err: 'HTTP ' + s.status() }); });
  page.on('console', (m) => { if (m.type() === 'error') summary.consoleErrors.push({ route: r, text: m.text().slice(0, 200) }); });
  page.on('pageerror', (e) => summary.pageErrors.push({ route: r, text: String(e.message).slice(0, 200) }));
  try { await page.goto(BASE + r, { waitUntil: 'networkidle2', timeout: 60000 }); } catch (e) { console.log(`  goto ${r}: ${e.message.slice(0, 100)}`); }
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((res) => setTimeout(res, 120)); } window.scrollTo(0, 0); });
  // wait until every (lazy) image has finished loading before judging it
  await page.evaluate(() => Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((res) => { i.addEventListener('load', res, { once: true }); i.addEventListener('error', res, { once: true }); setTimeout(res, 8000); }))));
  await new Promise((res) => setTimeout(res, 1500));
  // an image is "broken" when the browser finished loading it and could not decode it (404, corrupt file);
  // lazy images that have not been requested yet (far below the fold) are reported separately, not as broken
  const imgs = await page.evaluate(() => [...document.images].map((i) => ({ src: i.currentSrc || i.src, complete: i.complete, ok: i.complete && i.naturalWidth > 0, visible: !!(i.offsetWidth || i.offsetHeight), lazy: i.loading === 'lazy' })));
  const pendingLazy = imgs.filter((i) => i.visible && !i.complete && i.lazy).length;
  for (const i of imgs) if (i.visible && i.complete && !i.ok && i.src && !i.src.startsWith('data:')) summary.brokenImages.push({ route: r, src: i.src.slice(0, 200) });
  summary.routes[r].images = { total: imgs.length, visible: imgs.filter((i) => i.visible).length, loaded: imgs.filter((i) => i.visible && i.ok).length, pendingLazy };
  for (const u of reqs) { let h; try { h = new URL(u).host; } catch { continue; } hostTotals[h] = (hostTotals[h] || 0) + 1; if (FORBIDDEN.test(h)) summary.forbiddenRequests.push({ route: r, url: u.slice(0, 200) }); }
  for (const u of widgetReqs) { let h; try { h = new URL(u).host; } catch { continue; } (summary.widgetFrameHosts ||= {})[h] = (summary.widgetFrameHosts[h] || 0) + 1; }
  if (process.env.SCREENSHOTS !== '0') await page.screenshot({ path: path.join(OUT, `next${r === '/' ? '/home' : r}`.replace(/\//g, '_') + '.png'), fullPage: false });
  console.log(`  ${r.padEnd(42)} requests=${String(reqs.length).padStart(4)} imgs=${imgs.filter((i) => i.visible).length} loaded=${imgs.filter((i) => i.visible && i.ok).length} lazy-pending=${pendingLazy} broken=${imgs.filter((i) => i.visible && i.complete && !i.ok).length}`);
  await page.close();
}
console.log('  hosts requested:', Object.entries(hostTotals).sort((a, b) => b[1] - a[1]).map(([h, n]) => `${h}(${n})`).join(', '));
console.log(summary.forbiddenRequests.length ? `  !! ${summary.forbiddenRequests.length} request(s) to forbidden hosts` : '  zero requests to snoozemattresscompany.com / filesafe.space / leadconnectorhq.com / msgsndr.com from the pages themselves');
if (summary.widgetFrameHosts) console.log('  requests made inside embedded widget iframes (their own traffic):', Object.entries(summary.widgetFrameHosts).sort((a, b) => b[1] - a[1]).map(([h, n]) => `${h}(${n})`).join(', '));
console.log(`  failed requests: ${summary.failedRequests.length}, console errors: ${summary.consoleErrors.length}, page errors: ${summary.pageErrors.length}, broken visible images: ${summary.brokenImages.length}`);
for (const f of summary.failedRequests.slice(0, 15)) console.log('     failed:', f.route, f.url, f.err);
for (const f of summary.pageErrors.slice(0, 10)) console.log('     pageerror:', f.route, f.text);
for (const f of summary.brokenImages.slice(0, 10)) console.log('     broken img:', f.route, f.src);

// 3. grep built output + public for the hostnames
console.log('\n# 3. grep of .next and public for the original hostnames');
const HOSTS = ['snoozemattresscompany.com', 'filesafe.space', 'leadconnectorhq.com', 'msgsndr.com'];
function grepDir(dir) {
  const hits = {}; if (!fs.existsSync(dir)) return hits;
  const stack = [dir];
  while (stack.length) { const d = stack.pop(); for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name === 'cache') continue; stack.push(p); continue; } if (!/\.(js|mjs|css|html|json|txt|map|rsc|body|meta)$/i.test(e.name) && !/^[^.]+$/.test(e.name)) continue; let t; try { t = fs.readFileSync(p, 'utf8'); } catch { continue; } for (const h of HOSTS) if (t.includes(h)) (hits[h] ||= []).push(path.relative(ROOT, p)); } }
  return hits;
}
for (const dir of ['.next', 'public']) { const hits = grepDir(path.join(ROOT, dir)); summary.grep[dir] = Object.fromEntries(Object.entries(hits).map(([h, f]) => [h, f.length])); console.log(`  ${dir}: ${Object.keys(hits).length ? Object.entries(hits).map(([h, f]) => `${h} in ${f.length} file(s): ${f.slice(0, 4).join(', ')}`).join('; ') : 'no hostname found'}`); }

// 4. optional pixel comparison of the homepage against the original clone
if (process.env.COMPARE) {
  // COMPARE may hold several comma-separated URLs (e.g. the clone served over http and the clone opened from disk)
  summary.compare = [];
  const shot = async (url, file) => {
    const page = await browser.newPage(); await page.setViewport({ width: 1366, height: 3000 });
    try { await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); } catch {}
    await new Promise((res) => setTimeout(res, 4000));
    // hide the site's auto-opening popup and freeze animations so both sides are compared in the same state
    await page.addStyleTag({ content: '.snz-modal,[class*="snz-modal"]{display:none!important} *{animation-play-state:paused!important;transition:none!important}' }).catch(() => {});
    await new Promise((res) => setTimeout(res, 500));
    await page.screenshot({ path: file, fullPage: false }); await page.close();
  };
  const nextShot = path.join(OUT, 'compare-next.png'); await shot(BASE + '/', nextShot);
  for (const [i, target] of process.env.COMPARE.split(',').map((s) => s.trim()).filter(Boolean).entries()) {
    console.log(`\n# 4.${i + 1} pixel comparison of / against ${target}`);
    const origShot = path.join(OUT, `compare-original-${i + 1}.png`); await shot(target, origShot);
    const [a, b] = [nextShot, origShot].map((f) => PNG.sync.read(fs.readFileSync(f)));
    const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
    const diff = new PNG({ width: w, height: h });
    const crop = (img) => { const out = new PNG({ width: w, height: h }); PNG.bitblt(img, out, 0, 0, w, h, 0, 0); return out; };
    const n = pixelmatch(crop(a).data, crop(b).data, diff.data, w, h, { threshold: 0.1 });
    const diffFile = path.join(OUT, `compare-diff-${i + 1}.png`); fs.writeFileSync(diffFile, PNG.sync.write(diff));
    const entry = { against: target, differingPixels: n, total: w * h, pct: +((100 * n) / (w * h)).toFixed(2), diff: path.relative(ROOT, diffFile) };
    summary.compare.push(entry);
    console.log(`  differing pixels: ${n} of ${w * h} (${entry.pct}%) → ${entry.diff}`);
  }
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(`\nsummary written to verify-out/summary.json`);
process.exit(notOk.length || summary.forbiddenRequests.length ? 1 : 0);
