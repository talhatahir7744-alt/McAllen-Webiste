/* Motion system runtime (pairs with overrides/motion.css). Reveals [data-animate] elements once when they
   enter the viewport; honours data-delay; keeps working for elements added later (hydration re-renders);
   reveals everything immediately when IntersectionObserver is missing or reduced motion is preferred. */
(function () {
  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supported = 'IntersectionObserver' in window && !reduced;

  function prime(el) {
    if (el.__snzPrimed) return;
    el.__snzPrimed = true;
    var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
    if (delay > 0) el.style.setProperty('--snz-delay', delay + 'ms');
  }
  function reveal(el) { el.classList.add('is-in'); el.__snzRevealed = true; }

  var loader = document.getElementById('snz-loader');
  /* this script runs after hydration, so the finished loader can now leave the DOM for good */
  if (loader) { var dropLoader = function () { setTimeout(function () { var l = document.getElementById('snz-loader'); if (l && l.parentNode) l.parentNode.removeChild(l); }, 700); }; if (loader.classList.contains('is-done') || loader.classList.contains('is-gone') || root.classList.contains('snz-loader-skip')) dropLoader(); else root.addEventListener('snz:loader-done', dropLoader, { once: true }); }

  if (!supported) {
    root.classList.remove('js');
    var all = document.querySelectorAll('[data-animate]');
    for (var i = 0; i < all.length; i++) reveal(all[i]);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var en = entries[i];
      if (!en.isIntersecting) continue;
      reveal(en.target);
      io.unobserve(en.target);
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

  function observeAll(scope) {
    var els = (scope || document).querySelectorAll('[data-animate]:not(.is-in)');
    for (var i = 0; i < els.length; i++) { prime(els[i]); io.observe(els[i]); }
  }
  /* the branded page loader (components/PageLoader.tsx) covers the page on the first view of a session: reveals
     start once it has faded so they are actually seen (fallback after 3 s in case the event never comes) */
  if (loader && !root.classList.contains('snz-loader-skip')) {
    var started = false; var start = function () { if (started) return; started = true; observeAll(); };
    root.addEventListener('snz:loader-done', start, { once: true }); setTimeout(start, 3000);
  } else observeAll();

  /* elements re-rendered or added later (Vue hydration replaces some subtrees) */
  if ('MutationObserver' in window) {
    var pending = null;
    new MutationObserver(function (records) {
      for (var r = 0; r < records.length; r++) {
        var t = records[r].target;
        /* a framework rewriting the class list (e.g. toggling an "active" state) must not hide a revealed element again */
        if (records[r].type === 'attributes' && t.__snzRevealed && !t.classList.contains('is-in')) t.classList.add('is-in');
      }
      if (pending) return;
      pending = setTimeout(function () { pending = null; observeAll(); }, 60);
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  /* safety net: anything still hidden after a while (e.g. inside a container the observer cannot see) is shown */
  setTimeout(function () {
    var left = document.querySelectorAll('[data-animate]:not(.is-in)');
    for (var i = 0; i < left.length; i++) { var r = left[i].getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) reveal(left[i]); }
  }, 2500);

})();
