// Verifies overrides.json → heroBackgrounds: on every configured page, at desktop and phone widths, the visible
// hero section's background image is the configured file. Usage: node scripts/check-hero-backgrounds.mjs [baseUrl]
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
const BASE = process.argv[2] || 'http://localhost:3000';
const cfg = JSON.parse(fs.readFileSync('overrides/overrides.json', 'utf8')).heroBackgrounds || {};
const report = JSON.parse(fs.readFileSync('conversion-report.json', 'utf8'));
const routeOf = (page) => (page === 'index.html' ? '/' : '/' + page.replace(/\.html$/, ''));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'] });
let bad = 0;
for (const [page, image] of Object.entries(cfg)) {
  const expected = image.split('/').pop();
  const rep = report.heroBackgrounds.find((h) => h.page === page) || {};
  for (const w of [1366, 390]) {
    const p = await browser.newPage(); await p.setViewport({ width: w, height: 900 });
    await p.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
    await p.goto(BASE + routeOf(page), { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 800));
    const info = await p.evaluate((ids) => {
      const vis = (e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0;
      // the configured (desktop) section when visible, otherwise the first visible section with a background (the mobile hero)
      let sec = ids.map((id) => document.getElementById(id)).find((e) => e && vis(e));
      if (!sec) sec = [...document.querySelectorAll('.c-section')].find((s) => vis(s) && s.querySelector(':scope > .bg') && /url\(/.test(getComputedStyle(s.querySelector(':scope > .bg')).backgroundImage));
      if (!sec) return { missing: true };
      const bg = sec.querySelector(':scope > .bg');
      const img = bg ? getComputedStyle(bg).backgroundImage : getComputedStyle(sec).backgroundImage;
      const url = (img.match(/url\("?([^")]+)"?\)/) || [])[1] || '';
      return { id: sec.id, file: url.split('/').pop(), loaded: !!url, height: Math.round(sec.getBoundingClientRect().height) };
    }, [rep.desktop, rep.mobile].filter(Boolean));
    // desktop: the configured image; mobile: whatever the source page used for its mobile hero (unchanged)
    let want = expected;
    if (w === 390) {
      const src = fs.readFileSync('C:/clones/brownsville.snoozemattresscompany.com/' + page, 'utf8');
      const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const m = info.id && src.match(new RegExp('\\.bg-' + esc(info.id) + '\\s*\\{\\s*background:\\s*url\\(([^)]+)\\)'));
      want = m ? m[1].split('/').pop() : '(original)';
    }
    let status = 'ok';
    if (info.missing || info.file !== want) { status = 'MISMATCH'; bad++; }
    else { const r = await fetch(BASE + '/assets/filesafe/' + image.split('/media/')[0].split('/').pop() + '/media/' + expected).catch(() => null); if (!r || r.status !== 200) { status = 'IMAGE ' + (r ? r.status : 'unreachable'); bad++; } }
    console.log(`${page.padEnd(42)} @${String(w).padEnd(5)} ${status.padEnd(9)} ${info.id || '-'} -> ${info.file || '-'} (h ${info.height || 0})`);
    if (w === 1366 && page === 'index.html' || page === 'mattresses.html' || page === 'mattress-sales.html') await p.screenshot({ path: `verify-out/shots/hero-${page.replace('.html', '')}-${w}.png` });
    await p.close();
  }
}
console.log(bad ? `PROBLEMS: ${bad}` : 'all hero backgrounds ok');
await browser.close();
