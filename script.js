/* They Keep Rolling landing page
   1. Consent-gated tracking (Meta Pixel / GTM stay inert until Accept)
   2. Click events on Wishlist / Demo buttons for Eric's attribution
   3. Click-to-play trailer (no YouTube cookies until the visitor clicks)
   4. Screenshot lightbox
*/
(function () {
  'use strict';

  var CONSENT_KEY = 'tkr_consent';           // 'yes' | 'no'
  var trackingLoaded = false;

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

  /* ---------- 1. Consent + tracking activation ---------- */
  // Eric: any <script type="text/plain" data-tracking> in <head> is activated here.
  function loadTracking() {
    if (trackingLoaded) return;
    trackingLoaded = true;
    var inert = document.querySelectorAll('script[type="text/plain"][data-tracking]');
    Array.prototype.forEach.call(inert, function (s) {
      var live = document.createElement('script');
      if (s.src) { live.src = s.src; live.async = true; }
      else { live.textContent = s.textContent; }
      document.head.appendChild(live);
    });
    document.dispatchEvent(new CustomEvent('tkr:tracking-loaded'));
  }

  var banner = document.getElementById('consent');
  var choice = safeGet(CONSENT_KEY);

  if (choice === 'yes') {
    loadTracking();
  } else if (choice !== 'no' && banner) {
    banner.hidden = false;
  }

  var acceptBtn = document.getElementById('consentAccept');
  var declineBtn = document.getElementById('consentDecline');
  if (acceptBtn) acceptBtn.addEventListener('click', function () {
    safeSet(CONSENT_KEY, 'yes'); banner.hidden = true; loadTracking();
  });
  if (declineBtn) declineBtn.addEventListener('click', function () {
    safeSet(CONSENT_KEY, 'no'); banner.hidden = true;
  });

  /* ---------- 2. Conversion click events ---------- */
  function fire(eventName, extra) {
    try { if (typeof window.fbq === 'function') window.fbq('trackCustom', eventName, extra || {}); } catch (e) {}
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: eventName.toLowerCase() }, extra || {}));
    } catch (e) {}
  }
  Array.prototype.forEach.call(document.querySelectorAll('.js-wishlist'), function (a) {
    a.addEventListener('click', function () {
      fire('WishlistClick', { placement: placementOf(a) });
    });
  });
  function placementOf(a) {
    var m = /utm_content=([^&]+)/.exec(a.getAttribute('href') || '');
    return m ? m[1] : 'unknown';
  }

  /* ---------- 3. Trailer facade ---------- */
  var facade = document.getElementById('trailerFacade');
  if (facade) {
    var playVideo = function () {
      var id = facade.getAttribute('data-video-id');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
      iframe.title = 'They Keep Rolling trailer';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      facade.innerHTML = '';
      facade.appendChild(iframe);
      facade.style.cursor = 'default';
      fire('TrailerPlay');
    };
    facade.addEventListener('click', playVideo);
    facade.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playVideo(); }
    });
  }

  /* ---------- 4. Lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  var lbClose = document.getElementById('lightboxClose');
  if (lb && lbImg && typeof lb.showModal === 'function') {
    Array.prototype.forEach.call(document.querySelectorAll('.js-shot'), function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        lbImg.src = a.getAttribute('href');
        lbImg.alt = a.querySelector('img') ? a.querySelector('img').alt : '';
        lb.showModal();
      });
    });
    lbClose.addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }
})();
