# Sikani Landing

The marketing website for **Sikani Technologies Pty Ltd** — a scan-to-pay smart POS platform.

## Stack

- **HTML5 / CSS3 / Vanilla JS** (no framework)
- **Vite** for dev server and builds
- **GSAP + ScrollTrigger** for scroll animations
- **Three.js** for WebGL shader background + interactive 3D globe
- **Lenis** for smooth scrolling
- **Anime.js** for entrance animations and micro-interactions
- **p5.js** for generative network visualization
- **Matter.js** for physics-based floating elements
- **Rough.js** for hand-drawn decorative shapes
- **Pts.js** for flowing vector fields
- **GPU.js** for GPU-accelerated metaball effects
- **Velocity.js** for spring-based entrance animations
- **Playwright** for E2E testing

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Main landing page with hero, about, product, features, showcase, registration |
| `blog.html` | Blog (fetches from Sanity CMS) |
| `careers.html` | Career listings (fetches from Sanity CMS) |
| `terms.html` | Terms of Service |
| `privacy.html` | Privacy Policy |

## Getting Started

```bash
npm install
npm run dev        # http://localhost:4000
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview production build
```

## Tests

```bash
npm run test       # runs Playwright E2E tests
```

## Sanity CMS

Blog posts and career listings are managed via Sanity Studio (`../sikani-studio`). The landing page fetches content from the Sanity CDN at runtime via `js/sanity.js`.

To connect:
1. Set up the Sanity Studio (see `../sikani-studio/README.md`)
2. Replace `YOUR_PROJECT_ID` in `js/sanity.js` with your Sanity project ID
3. Add your domain to CORS origins in [manage.sanity.io](https://manage.sanity.io)

## Project Structure

```
sikani-landing/
├── index.html              # Main landing page
├── blog.html               # Blog page
├── careers.html            # Careers page
├── terms.html              # Terms of Service
├── privacy.html            # Privacy Policy
├── css/
│   └── style.css           # All styles (~60KB)
├── js/
│   ├── main.js             # Landing page interactions (~90KB)
│   ├── shared.js           # Shared across all pages (cursor, scroll, nav)
│   ├── shader-bg.js        # Three.js shader background
│   └── sanity.js           # Sanity CMS client
├── assets/
│   ├── images/             # Logos, app screenshots
│   ├── fonts/              # Custom fonts
│   └── models/             # 3D models
└── tests/
    └── landing.spec.js     # Playwright E2E tests
```

## Design Partner

A [Midas Path Software Solutions](https://midaspathsoftwaresolutions.com) partner product.
