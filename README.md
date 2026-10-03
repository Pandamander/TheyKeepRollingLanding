# They Keep Rolling: landing page

Static landing page for the Steam wishlist ad campaign. No build step. Edit the HTML, push to `main`, and GitHub Pages serves it.

- Live (GitHub Pages default): https://theykeeprolling.com/
- Steam page: https://store.steampowered.com/app/5122910/They_Keep_Rolling_Incremental_Ball_Roller/
- Demo: https://store.steampowered.com/app/5261020/They_Keep_Rolling_Incremental_Ball_Roller_Demo/

## Files

| File | What it is |
|---|---|
| `index.html` | The landing page |
| `privacy.html` | Privacy policy (required by Meta ad policy) |
| `styles.css` | All styling. Palette from the key art. |
| `script.js` | Consent banner, tracking activation, click events, trailer, lightbox |
| `assets/` | Web-optimized images. `hero-1920.jpg`, `logo.png`, `og-image.jpg`, `gameplay.gif`, `screens/` |
| `Capsule Assets/`, `Screenshots/` | Source art. PSDs and the 15MB+ hero originals are gitignored. |

## For Eric: adding Meta Pixel and Google Tag Manager

Open `index.html` and find the `TRACKING` comment block in `<head>`. Paste the snippets there, but change each script tag from `<script>` to:

```html
<script type="text/plain" data-tracking> ...pixel code... </script>
<script type="text/plain" data-tracking src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX"></script>
```

That keeps them inert until the visitor clicks **Accept** on the cookie banner. `script.js` then turns them into live scripts. Visitors who decline get no pixel and no cookies, which is what keeps the page compliant for EU/UK traffic. If you only ever target the US and want the pixel to fire unconditionally, change `type="text/plain"` back to a normal `<script>` and delete the `#consent` block, but the consent version is the safer default.

### Events already wired up

When tracking is active, `script.js` fires on button clicks:

| User action | Meta Pixel | dataLayer (GTM) |
|---|---|---|
| Any "Wishlist on Steam" button | `fbq('trackCustom','WishlistClick',{placement})` | `{event:'wishlistclick', placement}` |
| Any "Play the Free Demo" button | `fbq('trackCustom','DemoClick',{placement})` | `{event:'democlick', placement}` |
| Trailer play | `fbq('trackCustom','TrailerPlay')` | `{event:'trailerplay'}` |

`placement` is `topbar`, `hero`, `hero_demo`, `footer`, or `footer_demo`, so you can see which button converts.

Use `WishlistClick` as the conversion event in Ads Manager. It's the closest thing to a wishlist we can measure from our side, since the actual wishlist happens on Steam.

### Steam-side attribution

Every Steam link carries UTM parameters (`utm_source=landing&utm_medium=web&utm_campaign=wishlist&utm_content=<placement>`). Steamworks reports these under **Marketing & Visibility → UTM Analytics**, which shows visits and wishlists per UTM. That's the real wishlist number. Pair it with the pixel's `WishlistClick` count to estimate click-to-wishlist rate. If you want per-campaign tracking, change `utm_campaign` per ad set.

## Deploying

### First time (Brice)

1. Push this repo to GitHub (GitHub Desktop → Push origin).
2. On github.com: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save.**
3. Wait a minute. The site is live at `https://theykeeprolling.com/`.

### Custom domain via Cloudflare

You need to own a domain first. Cloudflare Registrar sells them at cost (about $10/yr for a .com). Once you have one:

1. In Cloudflare → your domain → **DNS**, add:
   - `A` record, name `@`, value `185.199.108.153` (proxy **off** / grey cloud)
   - `A` record, name `@`, value `185.199.109.153`
   - `A` record, name `@`, value `185.199.110.153`
   - `A` record, name `@`, value `185.199.111.153`
   - `CNAME` record, name `www`, value `pandamander.github.io` (proxy **off**)
2. On GitHub: **Settings → Pages → Custom domain** → enter the domain → Save. Wait for the DNS check, then tick **Enforce HTTPS**.
3. Add a file named `CNAME` to the repo root containing just the domain (GitHub does this automatically when you save the custom domain; pull afterwards so it's in the repo).
4. Update the `canonical` and `og:url` / `og:image` tags in `index.html` to the new domain.

Proxy off matters: GitHub needs to see the real DNS records to issue the HTTPS certificate. You can turn the orange cloud back on after HTTPS is working if you want Cloudflare's CDN in front.

## Editing content

Everything is plain HTML. The copy is in `index.html`; sections are labelled with comments (`HERO`, `PITCH`, `FEATURES`, `TRAILER`, `SCREENSHOTS`, `DETAILS`, `FINAL CTA`). Swap screenshots by replacing files in `assets/screens/` (keep the `-thumb` versions around 640px wide).
