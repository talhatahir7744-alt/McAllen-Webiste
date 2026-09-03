// Checks for the merged site footer, the reviews widget sizing and the brand-logo hover effect.
// Usage: node scripts/check-footer-reviews.mjs [baseUrl]
import puppeteer from 'puppeteer-core';
const BASE = process.argv[2] || 'http://localhost:3000';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'] });
const out = {};

for (const [route, w] of [['/', 1366], ['/', 390], ['/mattresses', 1366], ['/mattresses', 390], ['/mattress-financing', 1366], ['/about-us', 390], ['/blog/pressure-mapping-for-sleep', 1366], ['/booking', 390]]) {
  const page = await browser.newPage(); await page.setViewport({ width: w, height: 900 });
  await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
  const errors = []; page.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
  await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 120000 }).catch((e) => errors.push('nav ' + e.message));
  // scroll to the reviews section (lazy iframes) and then to the footer
  await page.evaluate(async () => {
    const vis = (e) => e.getBoundingClientRect().height > 0;
    const s = [...document.querySelectorAll('.c-section')].find((x) => vis(x) && /Happy Customers/.test(x.innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')));
    if (s) { scrollTo(0, s.getBoundingClientRect().top + scrollY - 20); await new Promise((r) => setTimeout(r, 9000)); }
    scrollTo(0, document.body.scrollHeight); await new Promise((r) => setTimeout(r, 1200));
  });
  const info = await page.evaluate(() => {
    const vis = (e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0;
    const footers = [...document.querySelectorAll('[data-site-footer]')];
    const f = footers[0];
    const oldFooters = ['section-zTxb2Wa9Nv', 'section-ghjYZIxTU2'].filter((id) => document.getElementById(id));
    const rights = [...document.querySelectorAll('footer, .c-section')].filter((e) => /All Rights Reserved/.test(e.textContent)).length;
    const reviews = [...document.querySelectorAll('iframe.lc_reviews_widget')].map((i) => { const wrap = i.closest('.snz-reviews'); return { h: Math.round(i.getBoundingClientRect().height), vis: vis(i), wrapH: wrap ? Math.round(wrap.getBoundingClientRect().height) : null, loaded: !!(wrap && wrap.classList.contains('snz-reviews--loaded')), placeholderVisible: !!(wrap && getComputedStyle(wrap.querySelector('.snz-reviews__loading')).visibility === 'visible') }; });
    const cols = f ? [...f.querySelectorAll('h2')].map((h) => h.textContent.trim()) : [];
    return {
      footers: footers.length, oldFooters, rightsReservedBlocks: rights,
      footer: f && { cols, map: !!f.querySelector('iframe[src*="maps.google.com"]'), mapH: Math.round((f.querySelector('iframe[src*="maps.google.com"]') || {}).getBoundingClientRect?.().height || 0), ctas: [...f.querySelectorAll('a')].filter((a) => /Book Your Dream Mapping Appointment|Get In Touch With Us/i.test(a.textContent)).length, phone: !!f.querySelector('a[href^="tel:"]'), openMaps: !!f.querySelector('a[href*="maps.google.com"]'), hoursOk: /10 AM – 7 PM/.test(f.textContent) && /12 – 6 PM/.test(f.textContent), width: Math.round(f.getBoundingClientRect().width), visby: document.fonts.check('800 20px "Visby Extrabold"') },
      reviews, reviewsVisibleOk: reviews.some((r) => r.vis && (r.h > 100 || (r.wrapH || 0) >= 300)),
      overflow: document.documentElement.scrollWidth > innerWidth ? document.documentElement.scrollWidth : 0,
    };
  });
  out[`${route} @${w}`] = { ...info, errors: errors.slice(0, 3) };
  await page.screenshot({ path: `verify-out/shots/footer${route.replace(/\//g, '_') || '_home'}-${w}.png` });
  await page.close();
}

// logo hover: marquee (home) and static grid (financing)
for (const [route, sel] of [['/', '.snz-logo-marquee__item img'], ['/mattress-financing', '#section-XBwOtU_0-H .c-image img']]) {
  const page = await browser.newPage(); await page.setViewport({ width: 1366, height: 900 });
  await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
  await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
  await page.evaluate((sel) => { document.documentElement.style.scrollBehavior = 'auto'; const img = [...document.querySelectorAll(sel)].find((i) => i.getBoundingClientRect().width > 0); if (img) img.scrollIntoView({ block: 'center', behavior: 'instant' }); }, sel);
  await new Promise((r) => setTimeout(r, 400));
  // pick a logo that sits in the middle of the viewport (marquee items near the edges are under the fade mask)
  const box = await page.evaluate((sel) => { const imgs = [...document.querySelectorAll(sel)].filter((i) => { const r = i.getBoundingClientRect(); return r.width > 0 && r.left > 300 && r.right < 1066; }); const img = imgs[0] || [...document.querySelectorAll(sel)].find((i) => i.getBoundingClientRect().width > 0); if (!img) return null; document.querySelectorAll('[data-probe]').forEach((e) => delete e.dataset.probe); img.dataset.probe = '1'; const r = img.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel);
  if (!box) { out[`hover ${route}`] = 'no logo found'; await page.close(); continue; }
  const before = await page.evaluate((sel) => { const img = document.querySelector('[data-probe]'); return { w: Math.round(img.getBoundingClientRect().width), next: Math.round((img.closest('.snz-logo-marquee__item, .c-image').nextElementSibling || img).getBoundingClientRect().left) }; }, sel);
  await page.mouse.move(box.x, box.y); await new Promise((r) => setTimeout(r, 150)); await page.mouse.move(box.x + 1, box.y); await new Promise((r) => setTimeout(r, 600));
  const after = await page.evaluate((sel) => { const img = document.querySelector('[data-probe]'); const cs = getComputedStyle(img); const item = img.closest('.snz-logo-marquee__item, .c-image'); return { transform: cs.transform, w: Math.round(img.getBoundingClientRect().width), next: Math.round((item.nextElementSibling || img).getBoundingClientRect().left), z: getComputedStyle(item).zIndex, transition: cs.transitionDuration }; }, sel);
  out[`hover ${route}`] = { before, after, grew: after.w > before.w * 1.1, neighbourStayed: Math.abs(after.next - before.next) < 3 || sel.includes('marquee') };
  await page.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
