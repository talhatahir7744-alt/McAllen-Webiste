/* Snooze McAllen — dataLayer events for GA4 key events (SEO audit, October 2026 — section 7b).
   Loaded by both root layouts after hydration. Pushes to window.dataLayer (read by the GTM container and gtag):
     phone_click            — a tel: link was clicked          { phone_number, link_text, page_path }
     directions_click       — a Google Maps link was clicked   { link_url, link_text, page_path }
     booking_confirmation   — the Dream Mapping booking confirmation page loaded (/dream/map/thank/you, /es/…)
     optin_submit           — the contact opt-in confirmation page loaded (/thank/you, /es/thank/you); the form
                              itself is a LeadConnector iframe, so the redirect to its thank-you page is the hook
     booking_widget_message — best effort: a confirmation-like postMessage from the LeadConnector booking widget
   The Sleep Fit Quiz already pushes quiz_start, quiz_answer, quiz_lead_form_view, quiz_completed and
   quiz_results_revisit (public/sleep-fit-quiz.js). */
(function () {
  var dl = (window.dataLayer = window.dataLayer || []);
  var path = (location.pathname.replace(/\/+$/, '') || '/');
  function push(name, data) { var o = { event: name, page_path: path }; for (var k in data) if (Object.prototype.hasOwnProperty.call(data, k)) o[k] = data[k]; dl.push(o); }
  function text(a) { return (a.textContent || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 80); }
  var MAPS = /(^|\/\/)(www\.)?(google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps)/i;
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var a = t.closest('a[href]'); if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^tel:/i.test(href)) push('phone_click', { phone_number: href.replace(/^tel:/i, ''), link_text: text(a) });
    else if (MAPS.test(href)) push('directions_click', { link_url: href, link_text: text(a) });
  }, true);
  if (/^(\/es)?\/dream\/map\/thank\/you$/.test(path)) push('booking_confirmation', {});
  if (/^(\/es)?\/thank\/you$/.test(path)) push('optin_submit', {});
  window.addEventListener('message', function (e) {
    var d = e.data; if (!d) return;
    var s = typeof d === 'string' ? d : (d.type || d.event || d.action || '');
    if (typeof s !== 'string' || !s) return;
    if (/booking|appointment|calendar/i.test(s) && /confirm|success|booked|complete|submitted/i.test(s)) push('booking_widget_message', { message_type: s.slice(0, 80) });
  });
})();
