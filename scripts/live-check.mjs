// Post-deploy smoke test against the live site: route statuses, blog structured data, the seamless
// ticker, the mobile timeline reveal and forbidden-host requests. Usage: node scripts/live-check.mjs [baseUrl]
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] || 'https://mcallen.snoozemattresscompany.com';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const FORBIDDEN = /snoozemattresscompany\.com|filesafe\.space|leadconnectorhq\.com|msgsndr\.com/i;
const routes = ['/', '/about-us', '/mattress-financing', '/mattress-sales', '/mattresses', '/booking', '/blog', '/blog/custom-mattresses-improving-health', '/blog/pressure-mapping-for-sleep', '/blog/mattresses-that-relieve-aches', '/sitemap.xml', '/robots.txt'];

const status = {};
for (const r of routes) { const res = await fetch(BASE + r, { redirect: 'manual' }); status[r] = res.status; }
console.log('routes:', JSON.stringify(status));

const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'] });
const check = async (route, width, fn) => {
  const page = await browser.newPage(); await page.setViewport({ width, height: 900 });
  await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
  const bad = new Set();
  page.on('request', (req) => { if (req.frame() === page.mainFrame() && FORBIDDEN.test(req.url()) && !/form_embed\.js|backend\.leadconnectorhq\.com/.test(req.url())) bad.add(req.url().slice(0, 100)); });
  await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 120000 }).catch((e) => console.log('nav', route, e.message));
  await new Promise((r) => setTimeout(r, 1500));
  const result = await fn(page);
  console.log(`${route} @${width}:`, JSON.stringify({ ...result, forbiddenMainFrame: [...bad] }));
  await page.close();
};

await check('/blog/pressure-mapping-for-sleep', 1366, (page) => page.evaluate(() => ({
  title: document.title,
  h1: document.querySelectorAll('h1').length,
  visby: document.fonts.check('800 20px "Visby Extrabold"'),
  brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
  ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { return JSON.parse(s.textContent)['@graph'].map((g) => g['@type']); } catch { return 'INVALID'; } }),
  canonical: document.querySelector('link[rel=canonical]')?.href,
})));

await check('/about-us', 1366, async (page) => {
  const a = await page.evaluate(() => { const t = [...document.querySelectorAll('#ghl-trust-ticker')].find((e) => e.getBoundingClientRect().width > 0); if (!t) return null; const m = getComputedStyle(t.querySelector('.ticker-track')).transform.match(/-?[\d.]+/g); return { x: Math.round(parseFloat(m[4])), copies: t.querySelectorAll('.ticker-group').length, dots: t.querySelectorAll('.ticker-dot').length }; });
  await new Promise((r) => setTimeout(r, 4000));
  const b = await page.evaluate(() => { const t = [...document.querySelectorAll('#ghl-trust-ticker')].find((e) => e.getBoundingClientRect().width > 0); const m = getComputedStyle(t.querySelector('.ticker-track')).transform.match(/-?[\d.]+/g); return Math.round(parseFloat(m[4])); });
  return { ticker: a, movedPx: a ? b - a.x : null };
});

await check('/mattress-financing', 390, async (page) => {
  await page.evaluate(async () => { const s = [...document.querySelectorAll('.pm-section')].find((e) => e.getBoundingClientRect().width > 0); scrollTo(0, s.getBoundingClientRect().top + scrollY + 200); await new Promise((r) => setTimeout(r, 1500)); });
  return page.evaluate(() => { const s = [...document.querySelectorAll('.pm-section')].find((e) => e.getBoundingClientRect().width > 0); return { pmBackground: getComputedStyle(s).backgroundImage === 'none' ? 'transparent' : 'own', stepsRevealed: [...s.querySelectorAll('.pm-step')].filter((e) => e.classList.contains('pm-in')).length, steps: s.querySelectorAll('.pm-step').length, button: (() => { const b = document.querySelector('.c-button a.custom'); const c = getComputedStyle(b); return c.borderTopWidth + ' ' + c.borderRadius + ' ' + c.fontFamily.split(',')[0]; })() }; });
});

await check('/pillows', 390, async (page) => {
  await page.evaluate(async () => { const g = [...document.querySelectorAll('.guar-section')].find((e) => e.getBoundingClientRect().width > 0); if (g) { scrollTo(0, g.getBoundingClientRect().top + scrollY - 150); await new Promise((r) => setTimeout(r, 1800)); } });
  return page.evaluate(() => { const vis = (e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0; const g = [...document.querySelectorAll('.guar-section')].find(vis); const gs = g && g.closest('.c-section'); const happy = [...document.querySelectorAll('.c-section')].find((s) => vis(s) && /Some of Our Happy Customers/.test(s.innerHTML.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' '))); const footer = [...document.querySelectorAll('.c-section')].find((s) => vis(s) && /All Rights Reserved/.test(s.textContent)); return { guaranteeVisible: !!g, stars: g ? g.querySelectorAll('.guar-star').length : 0, titleIn: !!(g && g.querySelector('.guar-title.guar-in')), beforeHappy: !!(gs && happy && gs.compareDocumentPosition(happy) & Node.DOCUMENT_POSITION_FOLLOWING), beforeFooter: !!(gs && footer && gs.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING), blogNav: !!document.querySelector('[data-site-header] nav a[href="/blog"]'), scroll: getComputedStyle(document.documentElement).scrollBehavior }; });
});

await check('/mattresses', 1366, async (page) => {
  await page.evaluate(async () => { const s = [...document.querySelectorAll('.c-section')].find((x) => x.getBoundingClientRect().height > 0 && /Happy Customers/.test(x.innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '))); if (s) { scrollTo(0, s.getBoundingClientRect().top + scrollY - 20); await new Promise((r) => setTimeout(r, 12000)); } scrollTo(0, document.body.scrollHeight); await new Promise((r) => setTimeout(r, 1500)); });
  return page.evaluate(() => { const vis = (e) => e.getBoundingClientRect().width > 0; const fr = [...document.querySelectorAll('iframe.lc_reviews_widget')].find(vis); const f = document.querySelector('[data-site-footer]'); return { reviewsHeight: fr ? Math.round(fr.getBoundingClientRect().height) : null, reviewsLoaded: !!(fr && fr.closest('.snz-reviews--loaded')), vendorHelperEmbedded: [...document.scripts].some((s) => /review-widget\.js/.test(s.src)), footers: document.querySelectorAll('[data-site-footer]').length, oldFooter: !!(document.getElementById('section-zTxb2Wa9Nv') || document.getElementById('section-ghjYZIxTU2')), footerMap: !!(f && f.querySelector('iframe[src*="maps.google.com"]')), footerCtas: f ? [...f.querySelectorAll('a')].filter((a) => /Dream Mapping Appointment|Get In Touch/i.test(a.textContent)).length : 0 }; });
});

await browser.close();
