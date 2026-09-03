'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { usePathname } from 'next/navigation';
import styles from './SiteHeader.module.css';
import { SITE } from './site-config';
import { BLOG_INDEX, blogNav } from '@/lib/blog-nav';
import { alternateHref, localizeHref, splitLocale, ui, PRODUCT_KEYS, type Locale } from '@/lib/i18n';

type MenuKey = 'products' | 'blog';
type NavItem = { label: string; href: string; match?: string[]; menu?: MenuKey };
type MenuLink = { label: string; href: string; desc: string; icon: keyof typeof ICONS };

const PRODUCT_HREFS: Record<(typeof PRODUCT_KEYS)[number], { href: string; icon: keyof typeof ICONS }> = {
  mattresses: { href: '/mattresses', icon: 'bed' },
  bases: { href: '/adjustable-mattress-bases', icon: 'base' },
  chairs: { href: '/massage-chairs', icon: 'chair' },
  pillows: { href: '/pillows', icon: 'pillow' },
  protectors: { href: '/mattress-protectors', icon: 'shield' },
  sheets: { href: '/premium-sheets', icon: 'sheets' },
  recliner: { href: '/sleep-recliner', icon: 'recliner' },
  kit: { href: '/at-home-sleep-test-kit-by-sleepcorner', icon: 'kit' },
};

/* Navigation tables per locale. Hrefs are English paths; the component localizes them for /es. */
function navTables(locale: Locale) {
  const t = ui(locale);
  const PRIMARY: NavItem[] = [
    { label: t.nav.home, href: '/', match: ['/', '/home-page', '/main-page'] },
    { label: t.nav.about, href: '/about-us' },
    { label: t.nav.products, href: '/mattresses', menu: 'products' },
    { label: t.nav.financing, href: '/mattress-financing' },
    { label: t.nav.sales, href: '/mattress-sales' },
    { label: t.nav.blog, href: BLOG_INDEX.href, menu: 'blog' },
  ];
  const item = (key: (typeof PRODUCT_KEYS)[number]): MenuLink => ({ label: t.products[key].label, desc: t.products[key].desc, href: PRODUCT_HREFS[key].href, icon: PRODUCT_HREFS[key].icon });
  const PRODUCT_GROUPS: { title: string; items: MenuLink[] }[] = [
    { title: t.menu.products, items: (['mattresses', 'bases', 'chairs', 'pillows'] as const).map(item) },
    { title: t.menu.accessories, items: (['protectors', 'sheets', 'recliner', 'kit'] as const).map(item) },
  ];
  const BLOG_GROUP: { title: string; items: MenuLink[] } = {
    title: t.menu.latest,
    items: blogNav(locale).map((p) => ({ label: p.label, href: p.href, desc: p.blurb, icon: 'article' as const })),
  };
  return { t, PRIMARY, PRODUCT_GROUPS, BLOG_GROUP, blogIndex: { label: t.nav.allArticles, href: BLOG_INDEX.href } };
}

/* Minimal line icons (24px grid, stroke inherits currentColor) */
const ICONS = {
  bed: <path d="M3 18V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10M3 13h18M3 18h18M7 13V9.5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 12 9.5V13m0 0V9.5A1.5 1.5 0 0 1 13.5 8h2A1.5 1.5 0 0 1 17 9.5V13" />,
  base: <path d="M4 15.5 12 11l8 4.5M4 15.5V18h16v-2.5M6 18v2M18 18v2M12 11V6" />,
  chair: <path d="M6 20v-3M18 20v-3M5 17V10a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v7H5ZM8 13h8" />,
  pillow: <path d="M4.5 7.5c2.5-1 12.5-1 15 0 .7 2.9.7 6.1 0 9-2.5 1-12.5 1-15 0-.7-2.9-.7-6.1 0-9ZM8 10.5c1.5 1.3 6.5 1.3 8 0" />,
  shield: <path d="M12 3 5 6v5c0 4.5 3 8.3 7 9.5 4-1.2 7-5 7-9.5V6l-7-3ZM9.5 12l1.8 1.8L14.5 10" />,
  sheets: <path d="M3 9.5 12 5l9 4.5-9 4.5-9-4.5ZM3 13.5l9 4.5 9-4.5M3 17l9 4.5 9-4.5" />,
  recliner: <path d="M6 20v-2M18 20v-2M5 18v-5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5H5ZM8 11V6.5A1.5 1.5 0 0 1 9.5 5h5A1.5 1.5 0 0 1 16 6.5V11" />,
  kit: <path d="M8 4h8M9 4v3.5L5.5 15a2.5 2.5 0 0 0 2.2 3.5h8.6a2.5 2.5 0 0 0 2.2-3.5L15 7.5V4M8.5 13h7" />,
  article: <path d="M6 3h9l4 4v14H6V3ZM14 3v5h5M9 12h6M9 16h6M9 8h2" />,
};

const Icon = ({ name }: { name: keyof typeof ICONS }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONS[name]}
  </svg>
);
const Chevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const Phone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4M8 14h3M13 14h3M8 18h3" />
  </svg>
);
const Close = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);
const PRODUCT_PATHS = Object.values(PRODUCT_HREFS).map((i) => i.href);
const menuActive = (key: MenuKey, pathname: string) => (key === 'products' ? PRODUCT_PATHS.includes(pathname) : pathname === BLOG_INDEX.href || pathname.startsWith(`${BLOG_INDEX.href}/`));

export function SiteHeader({ locale = 'en' }: { locale?: Locale }) {
  const rawPath = normalize(usePathname() || '/');
  const pathname = splitLocale(rawPath).path; // English path used for the active states
  const { t, PRIMARY, PRODUCT_GROUPS, BLOG_GROUP, blogIndex } = navTables(locale);
  const L = (href: string) => localizeHref(href, locale);
  const langSwitch = (cls: string) => (
    <div className={cls} role="group" aria-label={t.menu.switchTo}>
      {(['en', 'es'] as const).map((l) => (
        <a key={l} href={alternateHref(rawPath, l)} hrefLang={l} lang={l} className={`${styles.langLink} ${l === locale ? styles.langOn : ''}`} aria-current={l === locale ? 'true' : undefined} aria-label={l === 'en' ? 'English' : 'Español'}>
          {l.toUpperCase()}
        </a>
      ))}
    </div>
  );
  const idBase = useId();
  const panelIds: Record<MenuKey, string> = { products: `${idBase}-products`, blog: `${idBase}-blog` };
  const drawerId = `${idBase}-drawer`;

  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openAcc, setOpenAcc] = useState<MenuKey | null>(menuActive('products', pathname) ? 'products' : menuActive('blog', pathname) ? 'blog' : null);
  const [scrolled, setScrolled] = useState(false);

  const itemRefs = useRef<Record<MenuKey, HTMLLIElement | null>>({ products: null, blog: null });
  const triggerRefs = useRef<Record<MenuKey, HTMLButtonElement | null>>({ products: null, blog: null });
  const panelRefs = useRef<Record<MenuKey, HTMLDivElement | null>>({ products: null, blog: null });
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | null>(null);

  const isActive = (item: NavItem) => (item.match ? item.match.includes(pathname) : item.menu ? menuActive(item.menu, pathname) : pathname === item.href);

  /* header shadow once the page is scrolled */
  /* + desktop scroll effects (CSS limits them to >= 1025px): compact "pill" header past ~96px with a hysteresis band
     (compact on above 96, off again below 56, so it never flickers at the boundary) and a top progress line driven by
     scaleX from a rAF-throttled scroll handler (no re-render per frame: the bar is updated through a ref). */
  const [compact, setCompact] = useState(false);
  const compactRef = useRef(false);
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 4);
      const next = compactRef.current ? y > 56 : y > 96;
      if (next !== compactRef.current) { compactRef.current = next; setCompact(next); }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (progressRef.current) progressRef.current.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) window.cancelAnimationFrame(raf); };
  }, []);

  /* dropdown menus: close on outside click / Escape; hover intent on desktop */
  const clearHover = () => { if (hoverTimer.current) { window.clearTimeout(hoverTimer.current); hoverTimer.current = null; } };
  const open = useCallback((key: MenuKey) => { clearHover(); setOpenMenu(key); }, []);
  const close = useCallback(() => { clearHover(); setOpenMenu(null); }, []);
  const onEnter = (key: MenuKey) => { clearHover(); hoverTimer.current = window.setTimeout(() => setOpenMenu(key), 90); };
  const onLeave = () => { clearHover(); hoverTimer.current = window.setTimeout(() => setOpenMenu(null), 160); };

  useEffect(() => {
    if (!openMenu) return;
    const key = openMenu;
    const onPointer = (e: PointerEvent) => { const li = itemRefs.current[key]; if (li && !li.contains(e.target as Node)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { close(); triggerRefs.current[key]?.focus(); } };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [openMenu, close]);

  const onTriggerKey = (key: MenuKey) => (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || ((e.key === 'Enter' || e.key === ' ') && openMenu !== key)) {
      e.preventDefault();
      open(key);
      window.setTimeout(() => panelRefs.current[key]?.querySelector<HTMLElement>('a')?.focus(), 30);
    }
  };
  const onItemBlur = (e: React.FocusEvent<HTMLLIElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) close();
  };

  /* mobile drawer: scroll lock, Escape, focus management, simple focus trap */
  const openMobile = () => setMobileOpen(true);
  const closeMobile = useCallback(() => { setMobileOpen(false); burgerRef.current?.focus(); }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    /* iOS Safari ignores overflow:hidden on body, so the page is pinned in place instead (and restored on close) */
    const scrollY = window.scrollY;
    const prev = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width, overflow: document.body.style.overflow };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => closeBtnRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeMobile(); return; }
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.position = prev.position; document.body.style.top = prev.top; document.body.style.width = prev.width; document.body.style.overflow = prev.overflow;
      window.scrollTo({ top: scrollY, behavior: 'instant' }); // position restore after the drawer's body lock must not animate
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen, closeMobile]);

  /* swipe right to close: the drawer follows the finger and snaps back after a short swipe */
  const drag = useRef({ x: 0, y: 0, dx: 0, active: false, t: 0 });
  const [dragX, setDragX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { if (e.touches.length !== 1) return; drag.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dx: 0, active: false, t: Date.now() }; };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const mx = e.touches[0].clientX - drag.current.x, my = e.touches[0].clientY - drag.current.y;
    if (!drag.current.active) { if (Math.abs(mx) < 8 || Math.abs(mx) < Math.abs(my)) return; drag.current.active = true; }
    drag.current.dx = Math.max(0, mx);
    setDragX(drag.current.dx);
  };
  const onTouchEnd = () => {
    if (!drag.current.active) return;
    const width = drawerRef.current?.offsetWidth || 320;
    const fast = drag.current.dx > 40 && Date.now() - drag.current.t < 250;
    drag.current.active = false;
    setDragX(null);
    if (drag.current.dx > width * 0.35 || fast) closeMobile();
  };

  /* close everything when the viewport crosses the mobile breakpoint */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1025px)');
    const onChange = () => { if (mq.matches) setMobileOpen(false); else setOpenMenu(null); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const renderGroup = (group: { title: string; items: MenuLink[] }) => (
    <div key={group.title} className={styles.group}>
      {group.title === BLOG_GROUP.title && <p className={styles.groupTitle}>{group.title}</p>}
      <ul className={styles.groupList}>
        {group.items.map((p) => (
          <li key={p.href}>
            <a href={L(p.href)} className={`${styles.menuLink} ${pathname === p.href ? styles.activeMenuLink : ''}`} aria-current={pathname === p.href ? 'page' : undefined}>
              <span className={styles.menuIcon}><Icon name={p.icon} /></span>
              <span className={styles.menuText}>
                <span className={styles.menuLabel}>{p.label}</span>
                <span className={styles.menuDesc}>{p.desc}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderMobileLinks = (items: MenuLink[]) =>
    items.map((p) => (
      <a key={p.href} href={L(p.href)} className={`${styles.mSubLink} ${pathname === p.href ? styles.mActive : ''}`} aria-current={pathname === p.href ? 'page' : undefined} onClick={closeMobile}>
        <Icon name={p.icon} />
        {p.label}
      </a>
    ));

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${compact ? styles.compact : ''}`} data-site-header="" data-locale={locale}>
      <div ref={progressRef} className={styles.progress} aria-hidden="true" />
      <div className={styles.bar}>
        <a href={L('/')} className={styles.logo} aria-label={t.menu.homeAria}>
          <img src={SITE.logo} alt={SITE.logoAlt} width={156} height={44} />
        </a>

        <nav className={styles.nav} aria-label={locale === 'es' ? 'Principal' : 'Primary'}>
          <ul className={styles.list}>
            {PRIMARY.map((item) =>
              item.menu ? (
                <li
                  key={item.label}
                  ref={(el) => { itemRefs.current[item.menu as MenuKey] = el; }}
                  className={`${styles.item} ${openMenu === item.menu ? styles.open : ''}`}
                  onMouseEnter={() => onEnter(item.menu as MenuKey)}
                  onMouseLeave={onLeave}
                  onBlur={onItemBlur}
                >
                  <a href={L(item.href)} className={`${styles.link} ${isActive(item) ? styles.active : ''}`} aria-current={isActive(item) ? 'page' : undefined}>
                    {item.label}
                  </a>
                  <button
                    ref={(el) => { triggerRefs.current[item.menu as MenuKey] = el; }}
                    type="button"
                    className={styles.chevron}
                    aria-expanded={openMenu === item.menu}
                    aria-controls={panelIds[item.menu]}
                    aria-label={openMenu === item.menu ? t.menu.closeMenu(item.label) : t.menu.openMenu(item.label)}
                    onClick={() => (openMenu === item.menu ? close() : open(item.menu as MenuKey))}
                    onKeyDown={onTriggerKey(item.menu)}
                  >
                    <Chevron />
                  </button>
                  <div
                    id={panelIds[item.menu]}
                    ref={(el) => { panelRefs.current[item.menu as MenuKey] = el; }}
                    className={`${styles.panel} ${item.menu === 'blog' ? styles.panelSmall : ''}`}
                    aria-label={item.label}
                  >
                    {item.menu === 'products' ? (
                      <>
                        {PRODUCT_GROUPS.map(renderGroup)}
                        <a href={L('/booking')} className={styles.feature}>
                          <img src={SITE.featureImage} alt="" loading="lazy" />
                          <span className={styles.featureEyebrow}>{t.feature.eyebrow}</span>
                          <span className={styles.featureTitle}>{t.feature.title}</span>
                          <span className={styles.featureCta}>{t.feature.cta} <Arrow /></span>
                        </a>
                      </>
                    ) : (
                      <>
                        {renderGroup(BLOG_GROUP)}
                        <a href={L(blogIndex.href)} className={styles.panelAll}>{blogIndex.label} <Arrow /></a>
                      </>
                    )}
                  </div>
                </li>
              ) : (
                <li key={item.label} className={styles.item}>
                  <a href={L(item.href)} className={`${styles.link} ${isActive(item) ? styles.active : ''}`} aria-current={isActive(item) ? 'page' : undefined}>
                    {item.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>

        {langSwitch(styles.lang)}
        <a href={SITE.phoneHref} className={styles.cta} aria-label={t.menu.call(SITE.phone)}>
          <span className={styles.ctaIcon}><Phone /></span>
          <span className={styles.ctaText}>
            <span className={styles.ctaNumber}>{SITE.phone}</span>
          </span>
        </a>
        <a href={SITE.phoneHref} className={styles.phoneMini} aria-label={t.menu.call(SITE.phone)}><Phone /></a>
        <button
          ref={burgerRef}
          type="button"
          className={`${styles.burger} ${mobileOpen ? styles.burgerOpen : ''}`}
          aria-expanded={mobileOpen}
          aria-controls={drawerId}
          aria-label={mobileOpen ? t.menu.closeSite : t.menu.openSite}
          onClick={() => (mobileOpen ? closeMobile() : openMobile())}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`${styles.overlay} ${mobileOpen ? styles.overlayShow : ''}`} onClick={closeMobile} aria-hidden="true" style={dragX !== null ? { opacity: Math.max(0, 1 - dragX / (drawerRef.current?.offsetWidth || 320)) } : undefined} />
      <aside
        id={drawerId}
        ref={drawerRef}
        className={`${styles.drawer} ${mobileOpen ? styles.drawerShow : ''} ${dragX !== null ? styles.drawerDragging : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.menu.siteMenu}
        style={dragX !== null ? { transform: `translateX(${dragX}px)` } : undefined}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div className={styles.drawerHead}>
          <a href={L('/')} aria-label={t.menu.homeAria}><img src={SITE.logo} alt={SITE.logoAlt} width={132} height={37} /></a>
          <button ref={closeBtnRef} type="button" className={styles.close} aria-label={t.menu.closeSite} onClick={closeMobile}><Close /></button>
        </div>
        <div className={styles.drawerBody}>
          <div className={styles.mLangRow}>
            <span className={styles.mLangLabel}>{locale === 'es' ? 'Idioma' : 'Language'}</span>
            {langSwitch(styles.mLang)}
          </div>
          <ul className={styles.mList}>
            {PRIMARY.map((item, index) =>
              item.menu ? (
                <li key={item.label} className={styles.mItem} style={{ '--i': index } as React.CSSProperties}>
                  <button
                    type="button"
                    className={`${styles.mToggle} ${openAcc === item.menu ? styles.mToggleOpen : ''} ${isActive(item) ? styles.mActive : ''}`}
                    aria-expanded={openAcc === item.menu}
                    onClick={() => setOpenAcc((v) => (v === item.menu ? null : (item.menu as MenuKey)))}
                  >
                    {item.label}
                    <Chevron />
                  </button>
                  <div className={`${styles.mSub} ${openAcc === item.menu ? styles.mSubOpen : ''}`}>
                    <div className={styles.mSubInner}>
                      {item.menu === 'products' ? (
                        PRODUCT_GROUPS.map((group) => (
                          <div key={group.title}>
                            {renderMobileLinks(group.items)}
                          </div>
                        ))
                      ) : (
                        <div>
                          <a href={L(blogIndex.href)} className={`${styles.mSubLink} ${pathname === blogIndex.href ? styles.mActive : ''}`} aria-current={pathname === blogIndex.href ? 'page' : undefined} onClick={closeMobile}>
                            <Icon name="article" />
                            {blogIndex.label}
                          </a>
                          <p className={styles.mGroupTitle}>{BLOG_GROUP.title}</p>
                          {renderMobileLinks(BLOG_GROUP.items)}
                        </div>
                      )}
                      <div className={styles.mSubPad} />
                    </div>
                  </div>
                </li>
              ) : (
                <li key={item.label} className={styles.mItem} style={{ '--i': index } as React.CSSProperties}>
                  <a href={L(item.href)} className={`${styles.mLink} ${isActive(item) ? styles.mActive : ''}`} aria-current={isActive(item) ? 'page' : undefined} onClick={closeMobile}>{item.label}</a>
                </li>
              ),
            )}
          </ul>
        </div>
        <div className={styles.drawerFoot}>
          <a href={SITE.phoneHref} className={styles.mCta}><Phone />{SITE.phone}</a>
          <a href={L('/booking')} className={styles.mBook}><CalendarIcon />{t.drawerBook}</a>
        </div>
      </aside>
    </header>
  );
}
