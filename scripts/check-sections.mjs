import puppeteer from 'puppeteer-core';
const BASE = process.argv[2] || 'http://localhost:3000';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'] });
const results = {};
const visible = (e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0;

for (const [route, w] of [['/mattresses', 1366], ['/mattresses', 390], ['/pillows', 1366], ['/', 390], ['/about-us', 1366]]) {
  const page = await browser.newPage(); await page.setViewport({ width: w, height: 900 });
  await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
  const errors = []; page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 120000 }).catch((e) => errors.push('nav ' + e.message));
  await new Promise((r) => setTimeout(r, 1500));
  // scroll to the guarantee section so its IntersectionObserver fires
  await page.evaluate(async () => { const g = [...document.querySelectorAll('.guar-section')].find((e) => e.getBoundingClientRect().width > 0); if (g) { scrollTo(0, g.getBoundingClientRect().top + scrollY - 200); await new Promise((r) => setTimeout(r, 1600)); } });
  const info = await page.evaluate(() => {
    const vis = (e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0;
    const guars = [...document.querySelectorAll('.guar-section')];
    const g = guars.find(vis);
    const gSec = g && g.closest('.c-section');
    const happy = [...document.querySelectorAll('.c-section')].find((s) => vis(s) && /Some of Our Happy Customers/.test(s.innerHTML.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ')));
    const order = gSec && happy ? (gSec.compareDocumentPosition(happy) & Node.DOCUMENT_POSITION_FOLLOWING ? 'guarantee-before-happy' : 'WRONG ORDER') : 'missing';
    const hydrated = !!(document.querySelector('#__nuxt') && document.querySelector('#__nuxt').childElementCount) && !!document.querySelector('[data-v-app], #__nuxt [class]');
    const nuxtMounted = !!(window.useNuxtApp || window.__NUXT__ || document.querySelector('#__nuxt').__vue_app__);
    const btns = [...document.querySelectorAll('.c-button a.custom, .c-button button.custom')].filter(vis);
    const cta = btns.filter((b) => !/10th Street|586-5646|^(Mattresses|Adjustable Mattress Bases|Massage Chairs|Pillows|Mattress Protectors|Premium Sheets|Sleep Recliner|At-Home Sleep Test Kit|About Us|Financing|Sales)$/.test(b.textContent.trim()));
    const links = btns.filter((b) => /10th Street|586-5646|^(Mattresses|Pillows|About Us|Sales)$/.test(b.textContent.trim()));
    const style = (b) => { const s = getComputedStyle(b); return { text: b.textContent.trim().slice(0, 26), bg: s.backgroundImage === 'none' ? s.backgroundColor : 'gradient', radius: s.borderRadius, border: s.borderTopWidth + ' ' + s.borderTopStyle, tt: s.textTransform, font: s.fontSize + '/' + s.fontWeight, pad: s.paddingTop + ' ' + s.paddingLeft, width: Math.round(b.getBoundingClientRect().width), height: Math.round(b.getBoundingClientRect().height), overflowsViewport: b.getBoundingClientRect().right > innerWidth + 1 }; };
    return {
      guaranteeCopies: guars.length, visibleGuarantee: !!g, guaranteeSectionId: gSec && gSec.id, order,
      guarAnimated: g ? { titleIn: g.querySelector('.guar-title')?.classList.contains('guar-in'), stars: g.querySelectorAll('.guar-star').length, height: Math.round(g.getBoundingClientRect().height) } : null,
      hydrated, nuxtMounted, errors: [],
      ctaSample: cta.slice(0, 4).map(style), textLinkSample: links.slice(0, 4).map(style),
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      blogNav: !!document.querySelector('[data-site-header] nav a[href="/blog"]'),
      overflow: document.documentElement.scrollWidth > innerWidth ? document.documentElement.scrollWidth : 0,
    };
  });
  results[`${route} @${w}`] = { ...info, errors: errors.slice(0, 4) };
  // screenshots: guarantee section, financing band
  await page.evaluate(() => { const g = [...document.querySelectorAll('.guar-section')].find((e) => e.getBoundingClientRect().width > 0); if (g) scrollTo(0, g.getBoundingClientRect().top + scrollY - 40); });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: `verify-out/shots/guar${route.replace(/\//g, '_') || '_home'}-${w}.png` });
  const fin = await page.evaluate(() => { const h = [...document.querySelectorAll('.c-section')].find((s) => /Pay Over Time/.test(s.textContent) && s.getBoundingClientRect().width > 0); if (!h) return null; scrollTo(0, h.getBoundingClientRect().top + scrollY - 10); return true; });
  if (fin) { await new Promise((r) => setTimeout(r, 600)); await page.screenshot({ path: `verify-out/shots/fin${route.replace(/\//g, '_') || '_home'}-${w}.png` }); }
  await page.close();
}

// Blog menu: hover + keyboard on desktop, accordion in the drawer on mobile
{
  const page = await browser.newPage(); await page.setViewport({ width: 1366, height: 900 });
  await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
  await page.goto(BASE + '/blog/pressure-mapping-for-sleep', { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
  const li = await page.evaluateHandle(() => document.querySelector('[data-site-header] nav a[href="/blog"]').closest('li'));
  const box = await li.boundingBox(); await page.mouse.move(box.x + 10, box.y + 10); await new Promise((r) => setTimeout(r, 400));
  results['blog menu desktop'] = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-site-header] nav button[aria-controls]')].find((x) => /Blog/.test(x.getAttribute('aria-label'))); const p = document.getElementById(b.getAttribute('aria-controls')); const r = p.getBoundingClientRect(); return { expanded: b.getAttribute('aria-expanded'), visible: getComputedStyle(p).visibility === 'visible' && r.height > 60, links: [...p.querySelectorAll('a')].map((a) => a.getAttribute('href')), inViewport: r.left >= 0 && r.right <= innerWidth, activeBlog: !!document.querySelector('[data-site-header] nav a[href="/blog"][aria-current="page"]') }; });
  await page.screenshot({ path: 'verify-out/shots/blog-menu-1366.png' });
  await page.close();
  const m = await browser.newPage(); await m.setViewport({ width: 390, height: 844 });
  await m.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
  await m.goto(BASE + '/mattresses', { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
  await m.click('[data-site-header] > div > button[aria-controls]'); await new Promise((r) => setTimeout(r, 500));
  const toggles = await m.$$('[data-site-header] aside button[aria-expanded]');
  await toggles[toggles.length - 1].click(); await new Promise((r) => setTimeout(r, 500));
  results['blog menu mobile'] = await m.evaluate(() => { const bs = [...document.querySelectorAll('[data-site-header] aside button[aria-expanded]')]; const b = bs[bs.length - 1]; const sub = b.parentElement.querySelectorAll('a'); return { label: b.textContent.trim(), expanded: b.getAttribute('aria-expanded'), subLinks: [...sub].map((a) => a.getAttribute('href')), firstVisible: sub[0] && sub[0].getBoundingClientRect().height > 30 }; });
  await m.screenshot({ path: 'verify-out/shots/blog-menu-390.png' });
  await m.close();
}
console.log(JSON.stringify(results, null, 1));
await browser.close();
