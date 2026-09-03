// Mobile drawer: the products/blog list must scroll with touch while the page behind stays pinned.
// Usage: node scripts/check-drawer-scroll.mjs [baseUrl]
import puppeteer from 'puppeteer-core';
const BASE = process.argv[2] || 'http://localhost:3000';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.emulate({ viewport: { width: 390, height: 664, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
await page.goto(BASE + '/mattresses', { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
await page.evaluate(() => scrollTo(0, 600)); await new Promise((r) => setTimeout(r, 300));
const pageScrollBefore = await page.evaluate(() => scrollY);
await page.tap('[data-site-header] > div > button[aria-controls]'); await new Promise((r) => setTimeout(r, 600));
const state = await page.evaluate(() => {
  const body = document.querySelector('[data-site-header] aside > div:nth-child(2)');
  const toggles = [...document.querySelectorAll('[data-site-header] aside button[aria-expanded]')];
  return { bodyPinned: document.body.style.position === 'fixed', bodyTop: document.body.style.top, listOverflow: getComputedStyle(body).overflowY, listMinHeight: getComputedStyle(body).minHeight, listClient: body.clientHeight, listScroll: body.scrollHeight, productsExpanded: toggles[0] && toggles[0].getAttribute('aria-expanded') };
});
if (state.productsExpanded !== 'true') { await page.tap('[data-site-header] aside button[aria-expanded]'); await new Promise((r) => setTimeout(r, 500)); }
const before = await page.evaluate(() => { const body = document.querySelector('[data-site-header] aside > div:nth-child(2)'); return { scrollTop: body.scrollTop, scrollHeight: body.scrollHeight, clientHeight: body.clientHeight, lastLinkVisible: (() => { const a = [...body.querySelectorAll('a')].pop(); const r = a.getBoundingClientRect(); return r.bottom <= innerHeight; })() }; });
// swipe up inside the list (touch drag)
const box = await page.evaluate(() => { const b = document.querySelector('[data-site-header] aside > div:nth-child(2)').getBoundingClientRect(); return { x: b.x + b.width / 2, y1: b.y + b.height * 0.8, y2: b.y + b.height * 0.2 }; });
for (let k = 0; k < 3; k++) {
  await page.touchscreen.touchStart(box.x, box.y1);
  for (let i = 1; i <= 10; i++) { await page.touchscreen.touchMove(box.x, box.y1 + (box.y2 - box.y1) * (i / 10)); await new Promise((r) => setTimeout(r, 16)); }
  await page.touchscreen.touchEnd(); await new Promise((r) => setTimeout(r, 300));
}
const after = await page.evaluate(() => { const body = document.querySelector('[data-site-header] aside > div:nth-child(2)'); const a = [...body.querySelectorAll('a')].pop(); const r = a.getBoundingClientRect(); return { scrollTop: Math.round(body.scrollTop), lastLink: a.textContent.trim(), lastLinkVisible: r.bottom <= innerHeight && r.top >= 0, drawerStillOpen: !!document.querySelector('[data-site-header] aside[aria-modal]') && document.querySelector('[data-site-header] > div > button[aria-controls]').getAttribute('aria-expanded') === 'true', pageScroll: scrollY }; });
await page.screenshot({ path: 'verify-out/shots/drawer-scrolled-390.png' });
await page.tap('[data-site-header] aside button[aria-label="Close menu"]'); await new Promise((r) => setTimeout(r, 500));
const closed = await page.evaluate(() => ({ bodyPosition: document.body.style.position || 'static', scrollY }));
console.log(JSON.stringify({ pageScrollBefore, state, before, after, closed, ok: after.scrollTop > 100 && after.drawerStillOpen && closed.bodyPosition === 'static' && Math.abs(closed.scrollY - pageScrollBefore) < 5 }, null, 1));
await browser.close();
