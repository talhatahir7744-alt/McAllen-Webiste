import { SITE } from './site-config';
import type { Locale } from '@/lib/i18n';

/* Branded page loader. Rendered as the first child of <body> by both root layouts, with its critical CSS inline
   so it paints before anything else. Behaviour (see the inline script): shown on the first page view of a browser
   session only (sessionStorage flag; later navigations skip it before first paint), hidden on window load, at
   least 400 ms after it appeared, never later than 2.5 s, with a 0.4 s fade + slight scale, then removed from the
   DOM by the motion script once hydration is over (a pre-hydration removal makes React re-render the page). It dispatches "snz:loader-done" so the scroll-reveal system starts after the fade. Reduced motion: static
   logo, quick fade. */

const TEXT: Record<Locale, string> = { en: 'Preparing your best sleep…', es: 'Preparando tu mejor descanso…' };

const CSS = `
#snz-loader{position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;background:radial-gradient(120% 90% at 50% 0%,#0b2aa8 0%,#001489 55%,#000b4a 100%);color:#fff;font-family:'Poppins','Montserrat',Arial,sans-serif;transition:opacity .4s ease,transform .4s ease,visibility 0s linear .4s;transform:scale(1);will-change:opacity,transform}
#snz-loader.is-done{opacity:0;transform:scale(1.04);visibility:hidden;pointer-events:none}
html.snz-loader-skip #snz-loader,#snz-loader.is-gone{display:none}
.snz-loader__box{display:flex;flex-direction:column;align-items:center;gap:22px;padding:24px;text-align:center}
.snz-loader__logo{width:min(64vw,260px);height:auto;filter:brightness(0) invert(1);transform-origin:50% 60%;animation:snzLoaderRock 1.8s ease-in-out infinite}
.snz-loader__zz{display:flex;gap:6px;height:22px;align-items:flex-end;margin-top:-10px}
.snz-loader__zz span{font-weight:800;font-size:14px;letter-spacing:.06em;opacity:0;animation:snzLoaderZ 1.8s ease-out infinite}
.snz-loader__zz span:nth-child(2){font-size:17px;animation-delay:.3s}
.snz-loader__zz span:nth-child(3){font-size:20px;animation-delay:.6s}
.snz-loader__bar{width:min(60vw,220px);height:4px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden}
.snz-loader__bar i{display:block;height:100%;width:40%;border-radius:999px;background:linear-gradient(90deg,#d96a1a,#f58433);animation:snzLoaderBar 1.2s ease-in-out infinite}
.snz-loader__text{margin:0;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.82);max-width:80vw}
@media (max-width:420px){.snz-loader__text{font-size:11px;letter-spacing:.06em}}
.snz-loader__zz{justify-content:center;width:100%}
@keyframes snzLoaderRock{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
@keyframes snzLoaderZ{0%{opacity:0;transform:translateY(8px)}30%{opacity:.95}70%{opacity:.95}100%{opacity:0;transform:translateY(-10px)}}
@keyframes snzLoaderBar{0%{transform:translateX(-120%)}100%{transform:translateX(290%)}}
@media (prefers-reduced-motion:reduce){#snz-loader{transition:opacity .15s ease,visibility 0s linear .15s;transform:none}#snz-loader.is-done{transform:none}.snz-loader__logo,.snz-loader__zz span,.snz-loader__bar i{animation:none}.snz-loader__zz span{opacity:.9}.snz-loader__bar i{width:100%}}
`;

const SKIP_SCRIPT = `try{if(sessionStorage.getItem('snzLoaded'))document.documentElement.classList.add('snz-loader-skip')}catch(e){}`;

const RUN_SCRIPT = `(function(){var el=document.getElementById('snz-loader');if(!el)return;var d=document.documentElement;var seen=false;try{seen=!!sessionStorage.getItem('snzLoaded')}catch(e){}if(seen||d.classList.contains('snz-loader-skip')){d.classList.add('snz-loader-skip');el.classList.add('is-gone');d.dispatchEvent(new Event('snz:loader-done'));return;}var t0=Date.now(),done=false,MIN=400,MAX=2500;var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;function finish(){if(done)return;done=true;try{sessionStorage.setItem('snzLoaded','1')}catch(e){}el.classList.add('is-done');d.dispatchEvent(new Event('snz:loader-done'));setTimeout(function(){el.classList.add('is-gone')},rm?200:450)}function ready(){var wait=Math.max(0,MIN-(Date.now()-t0));setTimeout(finish,wait)}function heroReady(){var img=null;var secs=document.querySelectorAll('.c-section, main, header');for(var i=0;i<secs.length&&!img;i++){var im=secs[i].querySelector('img');if(im&&im.getBoundingClientRect().width>0)img=im}var p=[];if(img&&!img.complete)p.push(new Promise(function(r){img.addEventListener('load',r,{once:true});img.addEventListener('error',r,{once:true})}));if(document.fonts&&document.fonts.ready)p.push(document.fonts.ready);Promise.race([Promise.all(p),new Promise(function(r){setTimeout(r,900)})]).then(ready)}if(document.readyState==='complete')ready();else{window.addEventListener('load',ready,{once:true});if(document.readyState!=='loading')heroReady();else document.addEventListener('DOMContentLoaded',heroReady,{once:true})}setTimeout(finish,MAX);})();`;

export function PageLoader({ locale = 'en' }: { locale?: Locale }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }} />
      <div id="snz-loader" role="status" aria-live="polite" aria-label={TEXT[locale] || TEXT.en}>
        <div className="snz-loader__box">
          <img className="snz-loader__logo" src={SITE.logo} alt="" width={252} height={80} decoding="sync" />
          <div className="snz-loader__zz" aria-hidden="true"><span>z</span><span>z</span><span>z</span></div>
          <div className="snz-loader__bar" aria-hidden="true"><i /></div>
          <p className="snz-loader__text">{TEXT[locale] || TEXT.en}</p>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: RUN_SCRIPT }} />
    </>
  );
}
