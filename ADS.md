# Ad specs and copy for the wishlist campaign

Budget: $1,000 across Meta and Reddit. Goal: Steam wishlists, measured via Steamworks UTM Analytics plus the landing page's `WishlistClick` pixel event.

## Creative dimensions

### Meta (Facebook + Instagram)

| Placement | Size | Ratio | Notes |
|---|---|---|---|
| Feed image (FB + IG) | 1080 × 1080 | 1:1 | Safe default. Also accepted: 1080 × 1350 (4:5), performs better on IG. |
| Feed video | 1080 × 1080 or 1080 × 1350 | 1:1 / 4:5 | MP4, H.264, max 4 GB, 1 sec to 241 min. Keep it 6 to 15 sec. |
| Stories / Reels | 1080 × 1920 | 9:16 | Keep text and logo inside the middle 1080 × 1420; top 250px and bottom 250px get covered by UI. |
| Right column (desktop) | 1080 × 1080 | 1:1 | Low priority. |

Text: primary text 125 chars shows before "See more". Headline 27 chars. Description 27 chars. Keep the image itself under 20% text (no longer a hard rule, but heavy text still hurts delivery).

### Reddit

| Placement | Size | Ratio |
|---|---|---|
| Feed image | 1200 × 628 | 1.91:1 |
| Feed image (square) | 1080 × 1080 | 1:1 |
| Video | 1080 × 1080 or 1920 × 1080 | 1:1 / 16:9 |

Title max 300 chars, but keep it under 100. Reddit rewards ads that read like posts, not ads.

## Ready-to-cut assets

- `assets/og-image.jpg` (1200 × 687) → crop to 1080 × 1080 with the squirrel and cabinet both in frame for the feed image.
- `assets/gameplay.gif` → convert to MP4 for a 5 sec feed video: `ffmpeg -i assets/gameplay.gif -movflags faststart -pix_fmt yuv420p -vf "scale=1080:-2,pad=1080:1080:(ow-iw)/2:(oh-ih)/2:0x22103f" ad-square.mp4`
- The trailer (YouTube `dw3FqPtr36o`) → pull the best 10 sec for Reels at 9:16.

## Copy drafts

Meta's review rejects landing-page mismatch, so every claim below is also true on the landing page and the Steam page. Don't add "free game" or a price; the demo is free, the game isn't out.

### Meta, cozy/idle audience

- **Primary:** Roll balls. Rake in tokens. Never leave the arcade. A cozy-spooky incremental game with a free demo out now.
- **Headline:** Wishlist on Steam
- **Description:** Free demo available

### Meta, "satisfying" angle

- **Primary:** Every roll pays. Every token buys an upgrade. Every upgrade makes the next roll pay more. Try the free demo of They Keep Rolling.
- **Headline:** Play the free demo
- **Description:** PS1-style arcade incremental

### Meta, mystery angle

- **Primary:** The regulars never leave. The red phone keeps ringing. Something is off at this arcade, and the tokens keep rolling in.
- **Headline:** Wishlist They Keep Rolling
- **Description:** Cozy on top, strange underneath

### Reddit (write like a post)

- r/incremental_games, r/CozyGamers, r/IndieGaming targeting
- **Title:** We made a ball-rolling incremental set in a haunted Appalachian arcade. The demo is free on Steam if you want to see the loop.
- **Body (optional):** PS1-era look, animal regulars you can hire, machines with their own gimmicks, and a mystery about why nobody ever goes home. Wishlist if it's your thing; it helps a two-person studio a lot.

### Audiences worth testing

- Interest: idle games, incremental games, Cookie Clicker, Balatro, cozy games, Stardew Valley, Vampire Survivors
- Lookalike: people who watched 50%+ of the trailer (build after the first week)
- Reddit: subreddit targeting beats interest targeting here

## Measurement plan

1. Week 1: 3 creatives × 1 audience on Meta at ~$20/day. Reddit at ~$10/day, one post-style ad.
2. Kill anything under 1% CTR after 2,000 impressions. Scale the winner.
3. Report: ad spend → landing page visits (GA/GTM) → `WishlistClick` (pixel) → Steam visits and wishlists (Steamworks UTM). Cost per wishlist is the number that matters. Under $1 is great for an indie, $1 to $2 is normal, over $3 means the creative or audience is wrong.
