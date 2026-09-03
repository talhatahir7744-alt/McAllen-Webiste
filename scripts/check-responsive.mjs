// Responsive + motion audit at 390 / 768 / 1280 on every page. Usage: node scripts/check-responsive.mjs [baseUrl]
import puppeteer from 'puppeteer-core';
const BASE = process.argv[2] || 'http://localhost:3000';
const ROUTES = ['/', '/about-us', '/mattress-financing', '/mattress-sales', '/mattresses', '/adjustable-mattress-bases', '/massage-chairs', '/pillows', '/mattress-protectors', '/premium-sheets', '/sleep-recliner', '/at-home-sleep-test-kit-by-sleepcorner', '/booking', '/blog', '/blog/pressure-mapping-for-sleep'];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'] });
let problems = 0;
const flag = (msg) => { problems++; console.log('  !! ' + msg); };

for (const w of [390, 768, 1280]) {
  console.log(`\n=== ${w}px`);
  for (const route of ROUTES) {
    const page = await browser.newPage(); await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1, isMobile: w < 800, hasTouch: w < 800 });
    await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
    const errors = []; page.on('pageerror', (e) => errors.push(String(e).slice(0, 100)));
    await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 120000 }).catch((e) => errors.push('nav ' + e.message));
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 120)); } await new Promise((r) => setTimeout(r, 900)); scrollTo({ top: 0, behavior: 'instant' }); });
    const info = await page.evaluate((w) => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const secs = [...document.querySelectorAll('.c-section')].filter(vis);
      const gaps = [];
      for (let i = 0; i < secs.length; i++) {
        const s = secs[i]; const r = s.getBoundingClientRect();
        // empty space at the bottom of a section: distance from its last visible descendant to the section bottom
        const kids = [...s.querySelectorAll('*')].filter((e) => vis(e) && !/\bbg\b/.test(e.className) && getComputedStyle(e).position !== 'absolute');
        const lastBottom = kids.length ? Math.max(...kids.map((e) => e.getBoundingClientRect().bottom)) : r.top;
        const trailing = Math.round(r.bottom - lastBottom);
        if (trailing > 220) gaps.push({ sec: s.id, trailing });
        if (i > 0) { const prev = secs[i - 1].getBoundingClientRect(); const between = Math.round(r.top - prev.bottom); if (between > 24) gaps.push({ sec: s.id, between }); }
      }
      // gutters: left edge of text blocks in content rows (excluding full-bleed custom code)
      const lefts = [...document.querySelectorAll('.c-section .c-heading, .c-section .c-paragraph, .c-section .c-sub-heading')].filter((e) => vis(e) && !e.closest('.custom-code-container')).map((e) => Math.round(e.getBoundingClientRect().left));
      const gutterSet = [...new Set(lefts)].sort((a, b) => a - b).slice(0, 6);
      const taggedEls = [...document.querySelectorAll('[data-animate]')].filter(vis); const tagged = taggedEls.length; const revealed = taggedEls.filter((e) => e.classList.contains('is-in')).length;
      const offenders = document.documentElement.scrollWidth > innerWidth ? [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1 && !e.closest('[aria-modal], .snz-modal'); }).slice(0, 6).map((e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ').slice(0, 2).join('.') + ' right=' + Math.round(e.getBoundingClientRect().right)) : [];
      return { scrollW: document.documentElement.scrollWidth, gaps: gaps.slice(0, 4), gutters: gutterSet, minGutter: lefts.length ? Math.min(...lefts) : null, tagged, revealed, offenders, jsClass: document.documentElement.classList.contains('js') };
    }, w);
    const line = `${route.padEnd(40)} scrollW=${info.scrollW} gutters=${JSON.stringify(info.gutters)} tagged=${info.tagged} revealed=${info.revealed}`;
    console.log('  ' + line);
    if (info.scrollW > w) flag(`${route} @${w}: horizontal overflow (${info.scrollW}px) ${info.offenders.join(' | ')}`);
    for (const g of info.gaps) flag(`${route} @${w}: gap ${JSON.stringify(g)}`);
    if (info.tagged && info.revealed < info.tagged) flag(`${route} @${w}: only ${info.revealed}/${info.tagged} reveals fired after scrolling`);
    if (!info.jsClass) flag(`${route} @${w}: html.js missing`);
    if (errors.length) flag(`${route} @${w}: page errors ${errors.join(' | ')}`);
    await page.close();
  }
}

// no-JS fallback: content must be visible without the runtime
{
  const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 900 }); await page.setJavaScriptEnabled(false);
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 120000 }).catch(() => {});
  const r = await page.evaluate(() => { const el = document.querySelector('[data-animate]'); return { jsClass: document.documentElement.classList.contains('js'), opacity: el && getComputedStyle(el).opacity }; });
  console.log('\nno-JS:', JSON.stringify(r)); if (r.jsClass || r.opacity !== '1') flag('content hidden without JavaScript');
  await page.close();
}
// reduced motion: everything visible immediately
{
  const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 900 }); await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
  const r = await page.evaluate(() => { const els = [...document.querySelectorAll('[data-animate]')]; return { tagged: els.length, hidden: els.filter((e) => getComputedStyle(e).opacity !== '1').length, jsClass: document.documentElement.classList.contains('js') }; });
  console.log('reduced-motion:', JSON.stringify(r)); if (r.hidden) flag('elements hidden under reduced motion');
  await page.close();
}
// hero sequence + contrast samples on the home page
{
  const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 900 });
  await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1500));
  const r = await page.evaluate(() => { const h = document.querySelector('#heading-yMj0fYz3M-'); const b = document.querySelector('#button-x0nbGNExMP'); const pulse = document.querySelector('.snz-pulse'); const fin = document.querySelector('#section-FVn4UvdYfr .c-paragraph p'); const strip = document.querySelector('.snz-orange-strip'); return { heroHeading: h && { animate: h.getAttribute('data-animate'), in: h.classList.contains('is-in'), opacity: getComputedStyle(h).opacity }, heroButton: b && { delay: b.getAttribute('data-delay'), in: b.classList.contains('is-in') }, pulse: !!pulse && getComputedStyle(pulse).animationName, financingCopy: fin && { size: getComputedStyle(fin).fontSize, weight: getComputedStyle(fin).fontWeight }, stripBg: strip && getComputedStyle(strip).backgroundColor, btnFont: (() => { const a = document.querySelector('.c-button a.custom.snz-pulse') || document.querySelector('.c-button a.custom'); return a && getComputedStyle(a).fontSize + '/' + getComputedStyle(a).fontWeight; })() }; });
  console.log('home:', JSON.stringify(r));
  await page.close();
}
console.log(problems ? `\nPROBLEMS: ${problems}` : '\nresponsive + motion audit ok');
await browser.close();
