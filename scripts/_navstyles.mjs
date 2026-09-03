import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-first-run', '--disable-gpu'] });
for (const w of [1366, 390]) {
  const page = await browser.newPage(); await page.setViewport({ width: w, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2500));
  const info = await page.evaluate(() => {
    const cs = (el, props) => { if (!el) return null; const s = getComputedStyle(el); const o = {}; for (const p of props) o[p] = s[p]; const r = el.getBoundingClientRect(); o.rect = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; return o; };
    const sec = document.getElementById('section-n2EJ48xJKc');
    const link = document.querySelector('#nav-menu-80-yjT9XGE .nav-menu-item a');
    const dd = document.querySelector('#nav-menu-80-yjT9XGE .dropdown-menu');
    const ddItem = document.querySelector('#nav-menu-80-yjT9XGE .dropdown-item a');
    const btn = document.querySelector('#section-n2EJ48xJKc a[href^="tel"], #section-n2EJ48xJKc .c-button a, #section-n2EJ48xJKc button');
    const logo = document.querySelector('#nav-menu-80-yjT9XGE .logo img');
    const ham = document.querySelector('.snz-hamburger');
    const ticker = document.querySelector('#custom-code-7YL3oxz30e');
    return {
      viewport: innerWidth,
      section: cs(sec, ['position', 'top', 'zIndex', 'backgroundColor', 'display']),
      inner: cs(sec && sec.querySelector('.inner'), ['maxWidth', 'paddingLeft', 'paddingRight']),
      navLink: cs(link, ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'textTransform', 'color']),
      dropdown: cs(dd, ['display', 'backgroundColor', 'boxShadow', 'borderRadius', 'minWidth', 'padding']),
      dropdownItem: cs(ddItem, ['fontFamily', 'fontSize', 'color', 'padding']),
      phone: btn ? { tag: btn.tagName, text: btn.textContent.trim().slice(0, 30), ...cs(btn, ['fontFamily', 'fontSize', 'fontWeight', 'color', 'backgroundColor', 'borderRadius', 'padding']) } : null,
      logo: cs(logo, ['width', 'height']), hamburger: cs(ham, ['display']), ticker: cs(ticker, ['display']),
      bodyFont: getComputedStyle(document.body).fontFamily, rootVars: ['--color-m6a8t67b', '--primary', '--secondary', '--white', '--black'].map((v) => v + '=' + getComputedStyle(document.documentElement).getPropertyValue(v).trim()),
      docWidth: document.documentElement.scrollWidth,
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await page.close();
}
await browser.close();
