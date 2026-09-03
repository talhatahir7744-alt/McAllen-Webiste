// Spanish site audit: every /es page at 390 and 1280 — lang, hreflang, links stay on /es, switcher, no hydration errors,
// leftover English (a list of common English words that should not appear in visible Spanish text), FAQ/footer in Spanish.
// Usage: node scripts/check-es.mjs [baseUrl]
import puppeteer from 'puppeteer-core';
const BASE = process.argv[2] || 'http://localhost:3000';
const ROUTES = ['/', '/about-us', '/mattress-financing', '/mattress-sales', '/mattresses', '/adjustable-mattress-bases', '/massage-chairs', '/pillows', '/mattress-protectors', '/premium-sheets', '/sleep-recliner', '/at-home-sleep-test-kit-by-sleepcorner', '/booking', '/optin-page', '/blog', '/blog/pressure-mapping-for-sleep', '/privacy-policy-page', '/terms-conditions-page'];
const ENGLISH = /\b(the|and|with|your|our|for|you|from|mattress|mattresses|sleep|book|appointment|financing|available|learn more|get in touch|read article|visit us|home|about us|frequently asked)\b/i;
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-first-run', '--disable-gpu', '--hide-scrollbars'] });
let problems = 0;
const flag = (m) => { problems++; console.log('  !! ' + m); };
for (const w of [1280, 390]) {
  console.log(`\n=== ${w}px`);
  for (const route of ROUTES) {
    const es = route === '/' ? '/es' : '/es' + route;
    const page = await browser.newPage(); await page.setViewport({ width: w, height: 900, isMobile: w < 800, hasTouch: w < 800 });
    const errors = []; page.on('pageerror', (e) => errors.push(String(e).slice(0, 120))); page.on('console', (m) => { if (/hydrat|mismatch/i.test(m.text())) errors.push(m.text().slice(0, 140)); }); page.on('response', (r) => { if (r.status() >= 400 && !/ghl-stub|challenges\.cloudflare|leadconnectorhq|snoozesleep|synchrony/.test(r.url())) errors.push(r.status() + ' ' + r.url().slice(0, 120)); });
    await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
    const res = await page.goto(BASE + es, { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => null);
    await new Promise((r) => setTimeout(r, 1200));
    const info = await page.evaluate((englishSrc) => {
      const ENGLISH = new RegExp(englishSrc, 'i');
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
      const links = [...document.querySelectorAll('a[href]:not([hreflang])')].map((a) => a.getAttribute('href')).filter((h) => h && (h.startsWith('/') || /^https?:\/\/(brownsville-webiste\.vercel\.app|brownsville\.snoozemattresscompany\.com)/.test(h)) && !h.startsWith('//'));
      const internal = links.map((h) => h.replace(/^https?:\/\/[^/]+/, '') || '/').filter((p) => !/^\/(assets|ghl-stub|_next)\//.test(p) && !/\.[a-z0-9]{2,5}($|[?#])/i.test(p));
      const bad = [...new Set(internal.filter((p) => !(p === '/es' || p.startsWith('/es/'))))];
      const hreflang = [...document.querySelectorAll('link[rel="alternate"][hreflang], link[rel="alternate"][hrefLang]')].map((l) => (l.getAttribute('hreflang') || l.getAttribute('hrefLang')) + '=' + l.getAttribute('href').replace(/^https?:\/\/[^/]+/, ''));
      // visible English leftovers: text of visible elements (GHL pages + header/footer), excluding brand names/legal URLs
      const leftovers = [];
      for (const e of document.querySelectorAll('h1,h2,h3,h4,p,li,a,button,span,td')) {
        if (!vis(e) || e.children.length) continue; const t = (e.textContent || '').replace(/\s+/g, ' ').trim(); if (t.length < 8) continue;
        if (/Snooze|Dream Mapping|Sleep Coach|Zcliner|SleepCorner|Infinity|Synchrony|10th Street|http|@|Beautyrest|Stearns|Tempur|Englander|King Koil|Spring Air|Puffy|Bedgear|Helix|DreamFit|BedTech|Sealy|Serta|Nectar/i.test(t)) continue;
        if (ENGLISH.test(t)) leftovers.push(t.slice(0, 80));
      }
      const sw = [...document.querySelectorAll('header a[hreflang]')].map((a) => a.getAttribute('href') + (a.getAttribute('aria-current') ? '*' : ''));
      return { lang: document.documentElement.lang, title: document.title.slice(0, 60), hreflang, bad: bad.slice(0, 8), leftovers: [...new Set(leftovers)].slice(0, 6), leftoverCount: new Set(leftovers).size, switcher: sw, faq: document.querySelectorAll('.snz-faq__btn').length, footerBook: (document.querySelector('footer a[href*="booking"]') || {}).textContent, scrollW: document.documentElement.scrollWidth };
    }, ENGLISH.source);
    const status = res ? res.status() : 'ERR';
    console.log(`  ${es.padEnd(44)} ${status} lang=${info.lang} hreflang=${info.hreflang.length} links-off-es=${info.bad.length} english=${info.leftoverCount} faq=${info.faq} sw=${info.scrollW}`);
    if (status !== 200 && status !== 304) flag(`${es}: HTTP ${status}`);
    if (info.lang !== 'es') flag(`${es}: html lang=${info.lang}`);
    if (!info.hreflang.some((h) => h.startsWith('en=')) || !info.hreflang.some((h) => h.startsWith('es='))) flag(`${es}: hreflang missing (${info.hreflang.join(' ')})`);
    if (info.bad.length) flag(`${es}: links leaving /es: ${info.bad.join(' ')}`);
    if (info.leftoverCount) flag(`${es}: English leftovers: ${info.leftovers.join(' | ')}`);
    if (w === 1280 && !(info.switcher.length >= 2)) flag(`${es}: language switcher missing (${info.switcher.join(' ')})`);
    if (errors.length) flag(`${es}: ${errors.length} console/page errors: ${errors.slice(0, 2).join(' | ')}`);
    if (info.scrollW > w) flag(`${es}: horizontal overflow ${info.scrollW}`);
    await page.close();
  }
}
// English pages must still link to English pages and show the switcher pointing at /es
{
  const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 900 });
  await page.evaluateOnNewDocument(() => { window.__snoozeModalInit = true; });
  await page.goto(BASE + '/mattress-financing', { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
  const r = await page.evaluate(() => ({ lang: document.documentElement.lang, esLinks: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h && (h === '/es' || h.startsWith('/es/'))), switcher: [...document.querySelectorAll('header a[hreflang]')].map((a) => a.getAttribute('href') + (a.getAttribute('aria-current') ? '*' : '')) }));
  console.log('\nEN /mattress-financing', JSON.stringify(r));
  if (r.lang !== 'en') flag('EN page lang ' + r.lang);
  const nonSwitcher = r.esLinks.filter((h) => h !== '/es/mattress-financing');
  if (nonSwitcher.length) flag('EN page links into /es: ' + nonSwitcher.join(' '));
  if (!r.switcher.includes('/es/mattress-financing')) flag('EN switcher does not point at /es/mattress-financing: ' + r.switcher.join(' '));
  await page.close();
}
console.log(problems ? `\nPROBLEMS: ${problems}` : '\nspanish audit ok');
await browser.close();
