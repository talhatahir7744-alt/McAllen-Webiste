/* Hydration guard for tags that write into <body> while the page is still being parsed (performance pass, October 2026).
   Rendered by both root layouts as the first script in <head>, just before the tracking tags.

   Google Tag Manager loads at parse time, and its custom-HTML tags append <script>/<noscript> elements to <body> as soon
   as the container arrives. Everything React renders in <body> sits in <div id="snz-app"> (display: contents), so an
   element appended while that wrapper is being parsed lands after it, at the end of <body>, where React's hydration
   ignores it. The only unsafe moment is the few bytes before the wrapper exists (after Next's <div hidden> and the GTM
   noscript): an element appended then sits before the wrapper, React finds it where it expects the wrapper, throws
   error #418 and re-renders the whole page on the client. On a slow phone connection the network can pause the parser
   exactly there.

   While the document is loading and #snz-app does not exist yet, this holds elements appended to <body> (appendChild,
   or insertBefore with no reference node — what GTM uses) and appends them, in order, at the end of <body> as soon as
   the wrapper appears (a MutationObserver; DOMContentLoaded as a fallback) — usually a few milliseconds later. Then it
   removes itself. Nothing else is delayed, and nothing is ever hidden. */
export const BODY_GUARD = `(function(){try{var B=HTMLBodyElement.prototype,N=Node.prototype,ap=N.appendChild,ib=N.insertBefore,q=[],mo=null;
function ready(){return !!document.getElementById('snz-app')}
function early(el){return el===document.body&&document.readyState==='loading'&&!ready()}
function done(){if(!ready()&&document.readyState==='loading')return;while(q.length)ap.call(document.body,q.shift());delete B.appendChild;delete B.insertBefore;if(mo){mo.disconnect();mo=null}}
function hold(n){q.push(n);if(!mo&&window.MutationObserver){mo=new MutationObserver(done);mo.observe(document.documentElement,{childList:true,subtree:true})}return n}
B.appendChild=function(n){return early(this)?hold(n):ap.call(this,n)};
B.insertBefore=function(n,r){return (r==null&&early(this))?hold(n):ib.call(this,n,r)};
document.addEventListener('DOMContentLoaded',done,{once:true})}catch(e){}})();`;
