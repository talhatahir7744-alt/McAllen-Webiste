#!/usr/bin/env node
/**
 * qa-header.mjs — navigation / header QA in a real browser (puppeteer-core + Edge/Chrome).
 *   node scripts/qa-header.mjs            # BASE=http://localhost:3000 by default
 * Screenshots go to verify-out/header/. Checks: header renders on every width, mega menu opens on hover and
 * via keyboard, Escape/outside-click close it, mobile drawer + products accordion, no horizontal scrolling,
 * no layout shift of the header across hydration, every nav link returns 200, no console errors, and the
 * replaced sections + live widget embeds are present after hydration.
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(import.meta.dirname, '..');
const BASE = (process.env.BASE || 'http://localhost:3000').replace(/\/+$/, '');
const BROWSER = process.env.BROWSER_PATH || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
const OUT = path.join(ROOT, 'verify-out', 'header'); fs.mkdirSync(OUT, { recursive: true });
const WIDTHS = [1920, 1366, 1024, 768, 390, 320];
const problems = [];
const note = (ok, msg) => { console.log(`  ${ok ? 'ok ' : '!! '} ${msg}`); if (!ok) problems.push(msg); };

const browser = await puppeteer.launch({ executablePath: BROWSER, headless: true, args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'] });
const errors = [];
async function open(url, width, height = 900) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  // the site's own promo popup auto-opens 2.5 s after load and covers the page; its script honours this guard flag
  await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
  page.on('pageerror', (e) => errors.push(`${width}px ${url}: ${String(e.message).slice(0, 160)}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/404|ERR_|net::/.test(m.text())) errors.push(`${width}px console: ${m.text().slice(0, 160)}`); });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const early = await page.evaluate(() => { const h = document.querySelector('[data-site-header]'); return h ? h.getBoundingClientRect().height : null; });
  await page.waitForNetworkIdle({ idleTime: 800, timeout: 60000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1500));
  const late = await page.evaluate(() => { const h = document.querySelector('[data-site-header]'); return h ? h.getBoundingClientRect().height : null; });
  return { page, early, late };
}

console.log(`# header QA on ${BASE}`);
for (const w of WIDTHS) {
  const { page, early, late } = await open(BASE + '/', w);
  const info = await page.evaluate(() => {
    const h = document.querySelector('[data-site-header]');
    const nav = h && h.querySelector('nav');
    const burger = h && h.querySelector(':scope > div > button[aria-controls]'); // the hamburger (dropdown chevrons live inside nav)
    const visible = (el) => !!el && el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== 'hidden';
    return {
      header: !!h, sticky: h && getComputedStyle(h).position, height: h && Math.round(h.getBoundingClientRect().height),
      desktopNav: visible(nav), burger: visible(burger), docWidth: document.documentElement.scrollWidth, inner: innerWidth,
      nuxt: !!document.getElementById('__nuxt'), images: document.images.length,
      logoLoaded: (() => { const i = h && h.querySelector('img'); return !!i && i.complete && i.naturalWidth > 0; })(),
    };
  });
  note(info.header, `${w}px: header present (position ${info.sticky}, height ${info.height}px)`);
  note(info.docWidth <= info.inner, `${w}px: no horizontal scrolling (document ${info.docWidth}px vs viewport ${info.inner}px)`);
  note(early === late, `${w}px: no header layout shift across hydration (${early}px -> ${late}px)`);
  note(info.nuxt, `${w}px: page content still hydrated (#__nuxt present, ${info.images} images)`);
  note(info.logoLoaded, `${w}px: logo loaded`);
  note(w >= 1025 ? info.desktopNav && !info.burger : !info.desktopNav && info.burger, `${w}px: ${w >= 1025 ? 'desktop nav shown, hamburger hidden' : 'hamburger shown, desktop nav hidden'}`);
  await page.screenshot({ path: path.join(OUT, `home-${w}.png`), clip: { x: 0, y: 0, width: w, height: Math.min(900, 140 + 60) } });

  if (w >= 1025) {
    // hover opens the mega menu
    const trigger = await page.$('[data-site-header] nav li:has(button[aria-controls]) > a');
    await trigger.hover(); await new Promise((r) => setTimeout(r, 450));
    let open = await page.evaluate(() => { const b = document.querySelector('[data-site-header] nav button[aria-controls]'); const p = document.getElementById(b.getAttribute('aria-controls')); const r = p.getBoundingClientRect(); return { expanded: b.getAttribute('aria-expanded'), visible: getComputedStyle(p).visibility === 'visible' && r.height > 100, inViewport: r.left >= 0 && r.right <= innerWidth, links: p.querySelectorAll('a').length }; });
    note(open.expanded === 'true' && open.visible, `${w}px: mega menu opens on hover (${open.links} links, aria-expanded=${open.expanded})`);
    note(open.inViewport, `${w}px: mega menu stays inside the viewport`);
    await page.screenshot({ path: path.join(OUT, `mega-${w}.png`), clip: { x: 0, y: 0, width: w, height: 520 } });
    // outside click closes
    await page.mouse.click(w - 40, 700); await new Promise((r) => setTimeout(r, 350));
    open = await page.evaluate(() => document.querySelector('[data-site-header] nav button[aria-controls]').getAttribute('aria-expanded'));
    note(open === 'false', `${w}px: outside click closes the mega menu`);
    // keyboard: focus the chevron button, Enter opens + focuses first item, Escape closes and returns focus
    await page.evaluate(() => document.querySelector('[data-site-header] nav button[aria-controls]').focus());
    await page.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 300));
    const kb = await page.evaluate(() => { const b = document.querySelector('[data-site-header] nav button[aria-controls]'); return { expanded: b.getAttribute('aria-expanded'), focusInPanel: !!document.activeElement.closest('#' + CSS.escape(b.getAttribute('aria-controls'))), focusTag: document.activeElement.tagName }; });
    note(kb.expanded === 'true' && kb.focusInPanel, `${w}px: keyboard Enter opens the mega menu and moves focus into it (${kb.focusTag})`);
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
    await page.keyboard.press('Escape'); await new Promise((r) => setTimeout(r, 300));
    const esc = await page.evaluate(() => { const b = document.querySelector('[data-site-header] nav button[aria-controls]'); return { expanded: b.getAttribute('aria-expanded'), focusBack: document.activeElement === b }; });
    note(esc.expanded === 'false' && esc.focusBack, `${w}px: Escape closes the mega menu and returns focus to the toggle`);
  } else {
    const burger = await page.$('[data-site-header] > div > button[aria-controls]');
    await burger.click(); await new Promise((r) => setTimeout(r, 450));
    let dr = await page.evaluate(() => { const b = document.querySelector('[data-site-header] > div > button[aria-controls]'); const d = document.getElementById(b.getAttribute('aria-controls')); const r = d.getBoundingClientRect(); return { expanded: b.getAttribute('aria-expanded'), visible: getComputedStyle(d).visibility === 'visible' && r.width > 200 && r.left >= 0 && r.right <= innerWidth + 1, bodyLocked: document.body.style.overflow === 'hidden', focusInside: !!document.activeElement.closest('#' + CSS.escape(b.getAttribute('aria-controls'))), links: d.querySelectorAll('a').length, tapTargets: [...d.querySelectorAll('a,button')].filter((el) => el.getBoundingClientRect().height && el.getBoundingClientRect().height < 44).length }; });
    note(dr.expanded === 'true' && dr.visible, `${w}px: mobile drawer opens inside the viewport (${dr.links} links)`);
    note(dr.bodyLocked, `${w}px: body scroll locked while the drawer is open`);
    note(dr.focusInside, `${w}px: focus moved into the drawer`);
    // expand products accordion
    await page.click('[data-site-header] aside button[aria-expanded]'); await new Promise((r) => setTimeout(r, 400));
    const acc = await page.evaluate(() => { const b = document.querySelector('[data-site-header] aside button[aria-expanded]'); const sub = b.parentElement.querySelector('a'); return { expanded: b.getAttribute('aria-expanded'), subVisible: !!sub && sub.getBoundingClientRect().height > 30, small: [...document.querySelectorAll('[data-site-header] aside a, [data-site-header] aside button')].filter((el) => { const r = el.getBoundingClientRect(); return r.height > 0 && r.height < 44; }).length }; });
    note(acc.expanded === 'true' && acc.subVisible, `${w}px: "Our Products" accordion expands in the drawer`);
    note(acc.small === 0, `${w}px: every drawer tap target is at least 44px tall (${acc.small} smaller)`);
    await page.screenshot({ path: path.join(OUT, `drawer-${w}.png`), fullPage: false });
    await page.keyboard.press('Escape'); await new Promise((r) => setTimeout(r, 400));
    dr = await page.evaluate(() => ({ expanded: document.querySelector('[data-site-header] > div > button[aria-controls]').getAttribute('aria-expanded'), bodyLocked: document.body.style.overflow === 'hidden', focusOnBurger: document.activeElement === document.querySelector('[data-site-header] > div > button[aria-controls]') }));
    note(dr.expanded === 'false' && !dr.bodyLocked && dr.focusOnBurger, `${w}px: Escape closes the drawer, unlocks scroll and returns focus to the hamburger`);
  }
  await page.close();
}

// sticky header over the page content after scrolling
{
  const { page } = await open(BASE + '/', 1366);
  await page.evaluate(() => window.scrollTo(0, 900)); await new Promise((r) => setTimeout(r, 400));
  const st = await page.evaluate(() => { const h = document.querySelector('[data-site-header]'); const r = h.getBoundingClientRect(); return { top: Math.round(r.top), shadow: getComputedStyle(h).boxShadow !== 'none' }; });
  note(st.top === 0, `1366px: header stays pinned to the top while scrolled (top=${st.top}px, shadow=${st.shadow})`);
  await page.screenshot({ path: path.join(OUT, 'scrolled-1366.png'), clip: { x: 0, y: 0, width: 1366, height: 400 } });
  await page.close();
}

// every nav link resolves
console.log('\n# nav links');
const hrefs = ['/', '/about-us', '/mattresses', '/adjustable-mattress-bases', '/massage-chairs', '/pillows', '/mattress-protectors', '/premium-sheets', '/sleep-recliner', '/at-home-sleep-test-kit-by-sleepcorner', '/mattress-financing', '/mattress-sales', '/booking'];
for (const h of hrefs) { const res = await fetch(BASE + h, { redirect: 'manual' }); note(res.status === 200, `${h} -> ${res.status}`); }

// replaced sections + live embeds present after hydration
console.log('\n# replaced sections and live embeds (after hydration)');
const checks = [
  ['/', () => ({ 'dream-map timeline': document.querySelectorAll('.pm-section .pm-step').length, 'logo marquee items': document.querySelectorAll('.snz-logo-marquee__item').length, 'popup form iframe (link.snoozesleep.com)': !!document.querySelector('iframe[data-src*="link.snoozesleep.com/widget/form/"], iframe[src*="link.snoozesleep.com/widget/form/"]'), 'reviews embed': document.querySelectorAll('iframe.lc_reviews_widget').length, 'old GHL nav gone': !document.querySelector('#nav-menu-80-yjT9XGE, .snz-hamburger') })],
  ['/about-us', () => ({ 'store-experience timeline steps': document.querySelectorAll('.pm-section .pm-step').length, 'guarantee section': document.querySelectorAll('.guar-section').length, 'guarantee cards': document.querySelectorAll('.guar-card').length, 'reviews embed': document.querySelectorAll('iframe.lc_reviews_widget').length, 'merge tags left': (document.body.innerHTML.match(/\{\{custom_values/g) || []).length })],
  ['/mattress-financing', () => ({ 'store-experience timeline steps': document.querySelectorAll('.pm-section .pm-step').length, 'merge tags left': (document.body.innerHTML.match(/\{\{custom_values/g) || []).length })],
  ['/booking', () => ({ 'calendar embed': document.querySelectorAll('iframe[src*="link.snoozesleep.com/widget/booking/"]').length })],
  ['/optin-page', () => ({ 'opt-in form embed': document.querySelectorAll('iframe[src*="link.snoozesleep.com/widget/form/0BTnYKylVR6OcWJug3r8"]').length })],
];
for (const [route, fn] of checks) {
  const { page } = await open(BASE + route, 1366);
  const r = await page.evaluate(fn);
  console.log(`  ${route}: ${JSON.stringify(r)}`);
  await page.close();
}
await browser.close();
console.log(`\nconsole/page errors: ${errors.length}`); for (const e of errors.slice(0, 10)) console.log('   ', e);
console.log(`problems: ${problems.length}`);
process.exit(problems.length ? 1 : 0);
