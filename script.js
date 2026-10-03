/* They Keep Rolling landing page
   1. Regional consent for third-party tracking (Meta Pixel / GTM)
      - EU / UK / EEA visitors: opt-in. Nothing loads until they click Accept.
      - Everyone else: tracking loads on page view; a notice offers "Opt out",
        and the footer "Do Not Sell or Share" link opts out at any time (CCPA).
      - The Global Privacy Control browser signal is honored as an opt-out.
      Region comes from the browser's time zone (standard lightweight approach).
   2. Click events on Wishlist buttons for attribution
   3. Click-to-play trailer (no YouTube cookies until the visitor clicks)
   4. Screenshot lightbox
*/
(function () {
  'use strict';

  var CONSENT_KEY = 'tkr_consent';   // 'yes' | 'no'
  var trackingLoaded = false;

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

  // Google Consent Mode v2 shim. Eric: GTM/GA read these signals automatically.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  var GRANTED = { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' };
  var DENIED  = { ad_storage: 'denied',  analytics_storage: 'denied',  ad_user_data: 'denied',  ad_personalization: 'denied' };

  /* ---------- 1a. Region: who needs opt-in? ---------- */
  // Over-inclusive on purpose: Europe/* also catches CH, NO, IS, UK, and a few non-EU zones.
  var OPT_IN_ZONES = /^(Europe\/|Atlantic\/(Reykjavik|Faroe|Canary|Madeira|Azores)|Arctic\/)/;
  var EU_LANG_REGIONS = /-(AT|BE|BG|HR|CY|CZ|DK|EE|FI|FR|DE|GR|HU|IE|IT|LV|LT|LU|MT|NL|PL|PT|RO|SK|SI|ES|SE|GB|IS|LI|NO|CH)$/i;
  function needsOptInFor(timeZone, language) {
    if (timeZone && OPT_IN_ZONES.test(timeZone)) return true;
    if (!timeZone && language && EU_LANG_REGIONS.test(language)) return true;  // fallback only
    return false;
  }
  var tz = '', lang = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  try { lang = navigator.language || ''; } catch (e) {}
  var optIn = needsOptInFor(tz, lang);
  var gpc = navigator.globalPrivacyControl === true;

  /* ---------- 1b. Tracking activation / revocation ---------- */
  // Eric: any <script type="text/plain" data-tracking> in <head> is activated here.
  function loadTracking() {
    if (trackingLoaded) return;
    trackingLoaded = true;
    gtag('consent', 'update', GRANTED);
    var inert = document.querySelectorAll('script[type="text/plain"][data-tracking]');
    Array.prototype.forEach.call(inert, function (s) {
      var live = document.createElement('script');
      if (s.src) { live.src = s.src; live.async = true; }
      else { live.textContent = s.textContent; }
      document.head.appendChild(live);
    });
    document.dispatchEvent(new CustomEvent('tkr:tracking-loaded'));
  }
  function revokeTracking() {
    try { if (typeof window.fbq === 'function') window.fbq('consent', 'revoke'); } catch (e) {}
    gtag('consent', 'update', DENIED);
    window.dataLayer.push({ event: 'consent_revoked' });
    document.dispatchEvent(new CustomEvent('tkr:tracking-revoked'));
  }

  /* ---------- 1c. Banner ---------- */
  var banner = document.getElementById('consent');
  var textEl = document.getElementById('consentText');
  var acceptBtn = document.getElementById('consentAccept');
  var declineBtn = document.getElementById('consentDecline');
  var bannerMode = null;
  var POLICY = ' <a href="privacy.html">Privacy Policy</a>';

  function showBanner(mode) {
    if (!banner || !textEl || !acceptBtn || !declineBtn) return;
    bannerMode = mode;
    declineBtn.hidden = false;
    if (mode === 'optin') {
      textEl.innerHTML = 'We use cookies and similar tools (Meta Pixel, Google Tag Manager) to measure how our ads perform. Nothing runs until you accept.' + POLICY;
      declineBtn.textContent = 'Decline';
      acceptBtn.textContent = 'Accept';
    } else if (mode === 'notice') {
      textEl.innerHTML = 'We use cookies and similar tools (Meta Pixel, Google Tag Manager) to measure how our ads perform.' + POLICY;
      declineBtn.textContent = 'Opt out';
      acceptBtn.textContent = 'Got it';
    } else { // 'optedout'
      textEl.innerHTML = 'You are opted out of ad measurement on this site.' + POLICY;
      declineBtn.hidden = true;
      acceptBtn.textContent = 'Close';
    }
    banner.hidden = false;
  }
  function hideBanner() { if (banner) banner.hidden = true; }

  function optOut() {
    safeSet(CONSENT_KEY, 'no');
    revokeTracking();
  }

  if (acceptBtn) acceptBtn.addEventListener('click', function () {
    if (bannerMode === 'optedout') { hideBanner(); return; }
    safeSet(CONSENT_KEY, 'yes');
    hideBanner();
    loadTracking();
  });
  if (declineBtn) declineBtn.addEventListener('click', function () {
    optOut();
    hideBanner();
  });
  Array.prototype.forEach.call(document.querySelectorAll('.js-do-not-sell'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      optOut();
      if (banner) showBanner('optedout');
      else a.textContent = 'Opted out of ad measurement';
    });
  });

  /* ---------- 1d. Decide ---------- */
  var choice = safeGet(CONSENT_KEY);
  if (gpc && choice !== 'yes') { choice = 'no'; safeSet(CONSENT_KEY, 'no'); }  // honor GPC unless explicitly accepted
  gtag('consent', 'default', (choice === 'yes' || (!optIn && choice !== 'no')) ? GRANTED : DENIED);

  if (choice === 'yes') {
    loadTracking();
  } else if (choice === 'no') {
    // nothing loads
  } else if (optIn) {
    showBanner('optin');
  } else {
    loadTracking();
    showBanner('notice');
  }

  // For testing in the console: tkrConsent.status(), tkrConsent.region, tkrConsent.needsOptInFor('Europe/Berlin')
  window.tkrConsent = {
    status: function () { return safeGet(CONSENT_KEY); },
    region: { timeZone: tz, language: lang, optIn: optIn, gpc: gpc },
    trackingLoaded: function () { return trackingLoaded; },
    needsOptInFor: needsOptInFor,
    reset: function () { try { localStorage.removeItem(CONSENT_KEY); } catch (e) {} }
  };

  /* ---------- 2. Conversion click events ---------- */
  function fire(eventName, extra) {
    try { if (typeof window.fbq === 'function') window.fbq('trackCustom', eventName, extra || {}); } catch (e) {}
    try { window.dataLayer.push(Object.assign({ event: eventName.toLowerCase() }, extra || {})); } catch (e) {}
  }
  var wishlistLinks = document.querySelectorAll('.js-wishlist');
  var inboundParams = new URLSearchParams(window.location.search);
  var inboundKeys = [];
  inboundParams.forEach(function (value, key) {
    if (inboundKeys.indexOf(key) === -1) inboundKeys.push(key);
  });
  Array.prototype.forEach.call(wishlistLinks, function (a) {
    // Keep the placement used for the landing-page click event before inbound
    // utm_content (or any other matching key) replaces the CTA's default.
    a.setAttribute('data-wishlist-placement', placementOf(a));

    if (inboundKeys.length) {
      var destination = new URL(a.href, window.location.href);
      inboundKeys.forEach(function (key) { destination.searchParams.delete(key); });
      inboundParams.forEach(function (value, key) { destination.searchParams.append(key, value); });
      a.href = destination.href;
    }

    a.addEventListener('click', function () {
      fire('WishlistClick', { placement: placementOf(a) });
    });
  });
  function placementOf(a) {
    var placement = a.getAttribute('data-wishlist-placement');
    if (placement) return placement;
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
