// Reviews widget sizing: first real height applied, exactly one collapse honoured for an honest re-measure,
// later collapses ignored, wrapper clipped to the reported height, normal gap to the next section.
// Usage: node scripts/check-reviews-sizing.mjs [baseUrl]
import puppeteer from 'puppeteer-core';
const BASE = process.argv[2] || 'http://localhost:3000';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'] });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
let problems = 0;
for (const [route, w] of [['/mattresses', 390], ['/', 430], ['/about-us', 1366]]) {
  const page = await browser.newPage();
  if (w < 800) await page.emulate({ viewport: { width: w, height: 800, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, userAgent: UA }); else await page.setViewport({ width: w, height: 900 });
  await page.evaluateOnNewDocument(() => {
    window.__snoozeModalInit = true; window.__log = []; const t0 = performance.now();
    window.addEventListener('message', (e) => { try { if (Array.isArray(e.data) && /^lc\./.test(e.data[0])) window.__log.push({ t: Math.round(performance.now() - t0), msg: e.data[1] && e.data[1].height }); } catch {} });
    document.addEventListener('DOMContentLoaded', () => setInterval(() => { const f = [...document.querySelectorAll('iframe.lc_reviews_widget')].find((x) => x.getBoundingClientRect().width > 0); if (f) window.__log.push({ t: Math.round(performance.now() - t0), h: Math.round(f.getBoundingClientRect().height), wrap: Math.round(f.parentNode.getBoundingClientRect().height) }); }, 500));
  });
  await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
  await page.evaluate(() => { const s = [...document.querySelectorAll('.c-section')].find((x) => x.getBoundingClientRect().height > 0 && /Happy Customers/.test(x.innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '))); if (s) scrollTo(0, s.getBoundingClientRect().top + scrollY - 20); });
  await new Promise((r) => setTimeout(r, 16000));
  const res = await page.evaluate(() => {
    const f = [...document.querySelectorAll('iframe.lc_reviews_widget')].find((x) => x.getBoundingClientRect().width > 0); const sec = f.closest('.c-section');
    let next = sec.nextElementSibling; while (next && !(next.classList && next.classList.contains('c-section') && next.getBoundingClientRect().height > 0)) next = next.nextElementSibling;
    const ticks = window.__log.filter((e) => 'h' in e); const msgs = window.__log.filter((e) => 'msg' in e).map((e) => e.msg);
    const collapsedTicks = ticks.filter((e) => e.h <= 1).length;
    return { msgs, finalH: Math.round(f.getBoundingClientRect().height), wrapH: Math.round(f.parentNode.getBoundingClientRect().height), remeasured: f.getAttribute('data-snz-remeasured'), collapsedTicks, gapToNext: next ? Math.round(next.getBoundingClientRect().top - f.getBoundingClientRect().bottom) : null, wrapOverflow: getComputedStyle(f.parentNode).overflow };
  });
  const ok = res.finalH > 100 && res.wrapH === res.finalH && res.collapsedTicks <= 2 && (res.gapToNext === null || res.gapToNext < 160); // no next GHL section after the last one (the site footer follows)
  if (!ok) problems++;
  console.log(`${route} @${w} ${ok ? 'ok ' : 'BAD'} ${JSON.stringify(res)}`);
  await page.close();
}
console.log(problems ? `PROBLEMS: ${problems}` : 'reviews sizing ok');
await browser.close();
