# Padeuce Pretoria P1 Live Hub

A production-ready, framework-free static event dashboard for Pretoria P1. It combines live court scores, official fixtures and results, seeded-player lists, and behind-the-scenes content.

> Fixtures and results are synchronized from the official Premier Padel tournament feed. Seeded-player information was sourced from the official page on 29 July 2026. Live court cards use Padeuce’s public match feed. Behind-the-scenes content remains demonstration content.

## Structure

```text
.
├── index.html
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── utilities.css
│   └── responsive.css
├── js/
│   ├── data.js
│   ├── app.js
│   ├── official-results.js
│   ├── official-results-snapshot.js
│   ├── live-score.js
│   ├── court-scores.js
│   ├── navigation.js
│   ├── filters.js
│   └── share.js
├── data/
│   └── official-results.json
├── scripts/
│   └── sync-official-results.mjs
├── assets/
│   └── images/
├── favicon.svg
└── manifest.webmanifest
```

## Run locally

ES modules need an HTTP server. From the project directory:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Deploy

Upload the repository contents to any static host. For GitHub Pages, publish the repository root. For Netlify or Cloudflare Pages, use no build command and set the output directory to `.`.

Before a public launch, update the placeholder canonical URL and event dates in `index.html`, and replace the placeholder privacy and terms links.

## Content updates

- **Fixtures and results:** `.github/workflows/sync-official-results.yml` keeps an active tournament-day poller that checks the official Premier Padel feed every five minutes. It updates `data/official-results.json` and the bundled JavaScript snapshot only when the schedule or a score changes. The page requests the uncached raw snapshot on load and every five minutes while visible, then falls back to the deployed JSON, bundled official snapshot, and finally the saved fixtures in `js/data.js`.
- **Behind the scenes:** `.github/workflows/sync-instagram-feeds.yml` checks the public `@premierpadel` and `@ohpadel_club` feeds hourly. It retries temporary Instagram errors, preserves the last valid snapshot instead of failing when Instagram throttles a request, publishes five recent posts from each account in alternating order, and stores their cover images locally. The page carousel checks for a refreshed snapshot every fifteen minutes while visible.
- **Players:** edit the seeded-player snapshot exported from `js/data.js`.
- **Live-score API:** set `API_CONFIG.useMockData` to `false`, provide `liveScoreEndpoint`, and ensure the endpoint returns `{ "matches": [...] }` in the documented mock match shape. The client uses a timeout, `AbortController`, validation, visibility-aware polling, offline handling, and a retry state.
- **Live court cards:** `js/court-scores.js` reads the public Padeuce club and match endpoints used by the TV display. It maps live or most recently completed scores to Centre Court, Court 2, and Court 3, receives point changes through the same real-time event stream as the TV display, and uses 15-second uncached polling as a fallback. Streams pause in hidden tabs, and the cards work when `index.html` is opened directly.
- **Behind the scenes:** cards use Premier Padel’s public Instagram posts and locally stored thumbnails. Edit their captions, image paths, and post URLs in `js/data.js`.
- **Editorial links:** edit the footer URLs in `index.html`.
- **Images:** hero and editorial images live in `assets/images/`. Keep width and height attributes accurate when replacing them.
- **Brand colours and fonts:** edit custom properties in `css/variables.css`.
- **Event details:** update `eventData` in `js/data.js` and the JSON-LD block in `index.html`.

## Live API response shape

```json
{
  "matches": [{
    "id": "match-101",
    "status": "live",
    "court": "Centre Court",
    "division": "Men",
    "round": "Quarter-final",
    "format": "Best of 3",
    "currentSet": "Second set",
    "updatedAt": "2026-01-01T12:00:00Z",
    "teams": [
      {"names":["Player One","Player Two"],"sets":[6,3],"current":30,"serving":true},
      {"names":["Player Three","Player Four"],"sets":[4,2],"current":15,"serving":false}
    ]
  }]
}
```

API-provided strings are inserted with `textContent`, never `innerHTML`.

## Accessibility

The site includes a skip link, semantic landmarks, labelled sections, visible focus treatment, keyboard-accessible navigation, `aria-pressed` filter state, `aria-live` score regions and toast, reduced-motion support, non-colour winner labels, and 44px minimum interactive targets.

## Browser support

Current versions of Chrome, Edge, Firefox, and Safari are supported. The layout and core links remain usable if JavaScript is disabled; dynamic scores, filters, share enhancements, and local time require JavaScript. Web Share and Clipboard APIs fall back gracefully where unavailable.

## Generated visual

The match-night visual was created for this project with the built-in image-generation workflow using a premium photorealistic courtside prompt, dark green palette, anonymous players, and a right-weighted composition with quiet space for webpage copy.
