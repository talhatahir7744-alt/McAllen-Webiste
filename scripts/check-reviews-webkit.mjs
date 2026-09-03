// WebKit (Safari engine) check of the mobile reviews sizing. Needs the playwright package + `npx playwright install webkit` (see scratchpad setup); usage: node scripts/check-reviews-webkit.mjs <baseUrl> [route]
import { webkit, devices } from 'playwright';
const BASE = process.argv[2] || 'https://brownsville-webiste.vercel.app';
const routes = process.argv[3] ? [process.argv[3]] : ['/mattresses', '/'];
const browser = await webkit.launch();
for (const route of routes) {
  const ctx = await browser.newContext({ ...devices['iPhone 14 Pro Max'] });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__snoozeModalInit = true; window.__msgs = []; const t0 = performance.now(); window.addEventListener('message', (e) => { try { if (Array.isArray(e.data) && /^lc\./.test(e.data[0])) window.__msgs.push({ t: Math.round(performance.now() - t0), h: e.data[1] && e.data[1].height }); } catch {} }); });
  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 120000 }).catch((e) => console.log('nav', e.message));
  await page.evaluate(() => { const s = [...document.querySelectorAll('.c-section')].find((x) => x.getBoundingClientRect().height > 0 && /Happy Customers/.test(x.innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '))); if (s) scrollTo(0, s.getBoundingClientRect().top + scrollY - 10); });
  await page.waitForTimeout(12000);
  const outer = await page.evaluate(() => {
    const vis = (e) => e.getBoundingClientRect().width > 0;
    const f = [...document.querySelectorAll('iframe.lc_reviews_widget')].find(vis); if (!f) return { noIframe: true };
    const wrap = f.parentNode; const sec = f.closest('.c-section');
    let next = sec.nextElementSibling; while (next && !(next.classList && next.classList.contains('c-section') && next.getBoundingClientRect().height > 0)) next = next.nextElementSibling;
    return { msgs: window.__msgs, iframe: { h: Math.round(f.getBoundingClientRect().height), attr: f.getAttribute('height'), style: f.style.height, w: Math.round(f.getBoundingClientRect().width) }, wrap: { h: Math.round(wrap.getBoundingClientRect().height), style: wrap.style.height, loaded: wrap.classList.contains('snz-reviews--loaded'), overflow: getComputedStyle(wrap).overflow }, section: { id: sec.id, h: Math.round(sec.getBoundingClientRect().height) }, gapToNext: next ? Math.round(next.getBoundingClientRect().top - f.getBoundingClientRect().bottom) : null, vw: innerWidth };
  });
  const frame = page.frames().find((fr) => /reputationhub/.test(fr.url()));
  const inner = frame ? await frame.evaluate(() => { const els = [...document.body.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.height > 0 && r.width > 0 && getComputedStyle(e).visibility !== 'hidden'; }); const bottom = Math.max(...els.map((e) => e.getBoundingClientRect().bottom + scrollY)); return { innerHeight, docScrollH: document.documentElement.scrollHeight, bodyScrollH: document.body.scrollHeight, bodyOffsetH: document.body.offsetHeight, contentBottom: Math.round(bottom), pages: [...document.querySelectorAll('*')].map((e) => e.textContent && e.textContent.trim()).filter((t) => /^Powered by/.test(t || '')).length }; }).catch((e) => 'frame eval failed: ' + e.message) : 'widget frame not found';
  console.log(route, JSON.stringify({ outer, inner }));
  await page.screenshot({ path: `webkit${route.replace(/\//g, '_') || '_home'}.png` });
  await ctx.close();
}
await browser.close();
