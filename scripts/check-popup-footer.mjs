import puppeteer from 'puppeteer-core';
const BASE = process.argv[2] || 'http://localhost:3000';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'] });
for (const [w, how] of [[1366, 'button'], [1366, 'escape'], [390, 'button'], [390, 'backdrop']]) {
  const page = await browser.newPage(); await page.setViewport({ width: w, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 4000));
  // while open: the popup must be usable (its iframe on top, backdrop blocking the page)
  const open = await page.evaluate(() => { const m = document.getElementById('snzModal'); const fr = m && m.querySelector('iframe'); const r = fr && fr.getBoundingClientRect(); const top = r && document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { isOpen: !!(m && m.classList.contains('is-open')), pe: m && getComputedStyle(m).pointerEvents, vis: m && getComputedStyle(m).visibility, iframeOnTop: !!(top && (top === fr || fr.contains(top))), iframeH: r && Math.round(r.height) }; });
  if (how === 'button') await page.evaluate(() => document.querySelector('#snzModal .snz-modal__close')?.click());
  else if (how === 'escape') await page.keyboard.press('Escape');
  else await page.evaluate(() => document.querySelector('#snzModal .snz-modal__backdrop')?.click());
  await new Promise((r) => setTimeout(r, 800));
  const closed = await page.evaluate(() => { const m = document.getElementById('snzModal'); const cs = getComputedStyle(m); const fr = m.querySelector('iframe'); return { isOpen: m.classList.contains('is-open'), pe: cs.pointerEvents, vis: cs.visibility, iframePe: fr && getComputedStyle(fr).pointerEvents, bodyOverflow: document.body.style.overflow }; });
  const res = await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; const f = document.querySelector('[data-site-footer]'); const link = [...f.querySelectorAll('a')].find((a) => a.textContent.trim() === 'Pillows'); link.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = link.getBoundingClientRect(); const top = document.elementFromPoint(r.x + 10, r.y + r.height / 2); return { x: r.x + 10, y: r.y + r.height / 2, topIsLink: top === link || link.contains(top), top: top && (top.tagName + '.' + String(top.className).slice(0, 30)) }; });
  let url; try { await Promise.all([page.waitForNavigation({ timeout: 8000 }), page.mouse.click(res.x, res.y)]); url = page.url(); } catch { url = 'NO NAVIGATION'; }
  console.log(w, how, JSON.stringify({ open, closed, click: { topIsLink: res.topIsLink, top: res.top }, url }));
  await page.close();
}
await browser.close();
