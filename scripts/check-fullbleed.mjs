// Coloured/dark blocks that stop short of the viewport edges (white side strips) at 390 / 768 / 1280 on every page.
import puppeteer from 'puppeteer-core';
const BASE = process.argv[2] || 'http://localhost:3000';
const ROUTES = ['/', '/about-us', '/mattress-financing', '/mattress-sales', '/mattresses', '/adjustable-mattress-bases', '/massage-chairs', '/pillows', '/mattress-protectors', '/premium-sheets', '/sleep-recliner', '/at-home-sleep-test-kit-by-sleepcorner', '/booking'];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'] });
let problems = 0;
for (const w of [390, 768, 1280]) {
  for (const route of ROUTES) {
    const page = await browser.newPage(); await page.setViewport({ width: w, height: 844, isMobile: w < 800, hasTouch: w < 800 });
    await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
    await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
    const r = await page.evaluate(() => {
      const notWhite = (c) => { const m = c.match(/[\d.]+/g); if (!m) return false; const [r, g, b, a] = m.map(Number); if (a === 0) return false; return !(r > 235 && g > 235 && b > 235); };
      const out = [];
      // section-level backgrounds: a .c-section, its .bg child, or a custom-code root that paints a background must span the viewport
      for (const e of document.querySelectorAll('.c-section, .c-section > .bg, .custom-code-container > section, .custom-code-container > div')) {
        const rect = e.getBoundingClientRect(); if (rect.width < 200 || rect.height < 120) continue;
        const cs = getComputedStyle(e); const painted = notWhite(cs.backgroundColor) || cs.backgroundImage !== 'none';
        if (!painted) continue; if (parseFloat(cs.borderTopLeftRadius) >= 8) continue; if (e.closest('.snz-card, .borderFull')) continue;
        if (rect.left > 1 || rect.right < innerWidth - 1) out.push(`${e.tagName.toLowerCase()}#${e.id}.${String(e.className).split(' ').slice(0, 2).join('.')} L=${Math.round(rect.left)} R=${Math.round(innerWidth - rect.right)} sec=${e.closest('.c-section') && e.closest('.c-section').id}`);
      }
      return { sw: document.documentElement.scrollWidth, out };
    });
    if (r.out.length || r.sw > w) { problems += r.out.length + (r.sw > w ? 1 : 0); console.log(`${w} ${route} sw=${r.sw}`); r.out.forEach((l) => console.log('   !! ' + l)); }
    await page.close();
  }
}
console.log(problems ? `PROBLEMS: ${problems}` : 'full-bleed audit ok (no coloured section stops short of the viewport)');
await browser.close();
