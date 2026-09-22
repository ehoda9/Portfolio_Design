# Mahmoud Mohamed — Portfolio

**Project classification:** this is a static front-end site (HTML, CSS,
TypeScript) plus a small Express/PostgreSQL backend under `server/` for
the blog and contact form. There is **no infrastructure-as-code** here —
no Terraform, Kubernetes, or Helm — the `Dockerfile` and
`docker-compose.yml` exist only to run tests in isolation and to serve
the site locally, not to provision infrastructure.

Personal portfolio site. Front-end development, Unreal Engine 5 Blueprint
systems, AI model evaluation & data annotation, and workflow automation.

**Sections:** Services · Selected work (MissionCoach, UE5 Cover System on
Fab, earnings tracker, n8n Arabic node reference, RTL fitness calendar) ·
About · Skills · Contact form.

## Stack

Plain HTML, CSS (custom properties, BEM naming), and TypeScript — no UI
framework, no bundler. `js/**/*.js` is the compiled, committed output and
is loaded directly by `index.html` via a native `<script type="module">`,
so the site runs in any browser with no build step required. `src/**/*.ts`
is the source of truth.

## Hero 3D scene

The hero section has a subtle rotating wireframe built with
[three.js](https://threejs.org), loaded from a CDN via an import map in
`index.html` — not bundled, matching the rest of this project's
no-bundler approach. `three` and `@types/three` are **devDependencies
only** (needed for local type-checking and for the test runner to
resolve the module) — the real library ships to the browser from
`cdn.jsdelivr.net`, never from this repo.

The scene:
- Never loads at all if the user prefers reduced motion or the browser
  lacks WebGL (`src/lib/hero-scene.ts` feature-detects both before ever
  importing three.js).
- Is hidden outright under 700px viewport width (`css/styles.css`) —
  not worth the GPU/battery cost on small phones.
- Pauses its render loop when scrolled off-screen or the tab is
  backgrounded (`IntersectionObserver` + `visibilitychange`).

## About photo 3D scene

The About section's photo (`src/lib/about-scene.ts`) renders as a
tilting 3D plane — a glowing ring and orbiting particles around it,
using the photo itself as a texture. Same feature-detection and
performance discipline as the hero scene, plus one more: it's **lazy by
default** — three.js isn't even fetched until the About section actually
scrolls into view (`IntersectionObserver` in `src/script.ts`), since it's
well below the fold. If it never starts (no WebGL, reduced motion, or
the image fails to load), the plain `<img>` underneath stays exactly as
it was — nothing else changes. When it doesn't start, a small CSS-only
glow-pulse animation around the photo (`.about__photo-wrap:not(.is-3d)`)
runs instead, so the section still feels alive rather than static.

## Reduced motion

`@media (prefers-reduced-motion: reduce)` only disables one thing:
auto-smooth-scrolling to anchor links (`html { scroll-behavior: auto }`),
since a long fast scroll is the one thing here with real vestibular-
trigger potential. Small, slow motion — the hero orb drift, `.fade-up`
reveals, the status-dot pulse, hover transforms, the About-photo glow
pulse — stays on: none of it is a vestibular trigger, and disabling
everything made reduced-motion visits feel dead rather than just calmer.
The genuinely heavy stuff — the two WebGL scenes — is gated separately
in JS (`src/lib/webgl-support.ts`), and that gate is intentionally strict.

## Color palettes

Three curated palettes (`src/lib/palette.ts`, tokens in
`css/styles.css`), each with its own dark and light variant, switchable
from the gear icon in the header:

- **Blueprint** (default) — gold/cyan, ties to the UE5 Blueprint identity
  already established in the hero's grid and wireframe.
- **Terminal** — muted phosphor green + warm amber, evoking annotation/
  evaluation interfaces, deliberately soft rather than neon-on-black.
- **Ledger** — warm rust + muted teal, ties to the MissionCoach project
  and 2026's shift toward warm, tactile neutrals over sterile tech-blue.

None of the three use purple/violet — 2026 color-trend research (see the
project's design notes) found that near-black-plus-violet has become
such a strong AI-product visual cliché that it now reads as generic
rather than distinctive, which is exactly what a portfolio shouldn't be.
Light mode in every palette uses a warm off-white background and a warm
near-black (never pure gray) for text — the actual fix for a "washed
out" light theme is warmth and contrast, not a different hue.

The picker is three circular swatch buttons (each rendered from two CSS
custom properties, `--sw-a`/`--sw-b` — no images) — deliberately not a
custom color input, so the choice stays a one-click preset rather than
free-form tuning. The chosen palette persists in `localStorage` and
re-applies via `data-palette` on `<html>`, alongside the existing
`data-theme` attribute; the two are independent, so all 6 combinations
are one click apart from each other.

## Scroll to top

A small floating button (`.scroll-top`, wired in `site-chrome.ts`)
appears once the page is scrolled past 400px and smooth-scrolls back to
the top on click — instantly instead, if the visitor prefers reduced
motion, since that's a real (if brief) fast-scroll motion.

## Architecture

The TypeScript layer is split into two kinds of module:

- **`src/lib/*.ts`** — small, framework-free functions with no direct
  `document` queries beyond the DOM nodes passed into them. Each one owns
  a single piece of behaviour (contact-form validation, mobile-nav
  open/close, the FAQ accordion, the portfolio filter predicate) and is
  covered by a matching file in `tests/`.
- **`src/script.ts`** — the entry point. It queries the real page elements
  once at load time and wires them to the `lib` functions via event
  listeners. This file is intentionally thin; it has no logic of its own
  worth unit testing beyond "did it attach the right listener."

This split exists so the actual behaviour (is this email valid? should
this item be visible under this filter?) can be tested without a browser,
while `script.ts` stays a straightforward DOM-wiring layer.

## Structure

```
index.html                  ← homepage
blog.html                    ← blog post list
blog-post.html                ← blog post detail (?slug=... query param)
admin-login.html                ← admin sign-in
admin.html                        ← admin dashboard + post editor (?post=new|<id>)
css/
  styles.css
src/
  script.ts                  ← index.html entry, wires DOM to lib/
  blog.ts                     ← blog.html entry
  blog-post.ts                  ← blog-post.html entry
  admin-login.ts                   ← admin-login.html entry
  admin.ts                           ← admin.html entry
  lib/
    site-chrome.ts               ← header/nav/theme/scroll-progress, composable pieces
    validate-contact-form.ts
    contact-api.ts
    blog-api.ts
    blog-render.ts                 ← Markdown → sanitized HTML (marked + DOMPurify)
    format-date.ts
    hero-scene.ts                   ← 3D hero (three.js, dev-only dependency)
    about-scene.ts                   ← 3D About photo (lazy-loaded, same pattern)
    webgl-support.ts
    scroll-progress.ts
    spotlight.ts
    palette.ts                     ← 3 curated color palettes, persisted in localStorage
    admin-session.ts                 ← admin JWT storage (sessionStorage)
    admin-api.ts                      ← admin dashboard API client
    admin-dashboard.ts                  ← pure helpers (URL mode parsing, stat formatting)
    analytics.ts                          ← fire-and-forget page-view recording
    nav.ts
    faq.ts
    portfolio-filter.ts
js/                           ← compiled output (committed), mirrors src/
tests/                         ← one file per src/ module, plus *-wiring.test.ts
                                  integration tests per entry point
  setup.ts                          ← test-only localStorage/sessionStorage polyfill
assets/
  img/
server/                         ← backend API — see server/README.md
ARCHITECTURE.md                  ← system design, schema, phased build plan
.github/
  workflows/ci.yml                 ← build + lint + test on every push
  dependabot.yml
docker-compose.yml                 ← web + api + db, one command
tsconfig.json
vitest.config.ts
eslint.config.js
package.json
package-lock.json
```

## Running locally

No environment variables are required to view the site itself, but the
contact form and blog pages need the backend running (see
[`server/README.md`](./server/README.md)) — either `docker compose up`
(brings up everything) or `cd server && npm run dev` alongside serving
this folder separately.

```bash
npm install
npm run build
```

Then just open `index.html` in a browser, or serve the folder with any
static file server.

### Docker

```bash
docker compose up
```

Brings up three services together:
- `web` — nginx serving this static site at `http://localhost:8080`
- `api` — the Express backend ([`server/`](./server/README.md)) at
  `http://localhost:3000`, migrating its own database on startup
- `db` — PostgreSQL, with a named volume so data survives restarts

`curl http://localhost:3000/api/health` once it's up to confirm the API
is live.

## Development

```bash
npm install
npm run build          # compiles src/**/*.ts → js/**/*.js
npm run watch            # recompiles on change
npm test                   # runs the test suite once
npm run test:watch          # re-runs tests on change
npm run lint                  # lints src/ and tests/
npx tsc --noEmit                # typecheck without emitting files
npm run coverage                  # runs tests with coverage thresholds enforced
```

CI (`.github/workflows/ci.yml`) runs `npm ci`, a dependency audit, a
typecheck, the build, lint, tests, and coverage — in that order — on
every push and pull request against `main`.

## Testing

Unit tests use [Vitest](https://vitest.dev) with a `jsdom` environment.

- **`src/lib/*.ts`** functions are pure or take DOM nodes as parameters,
  so they're tested directly and sit at 100% coverage
  (`tests/validate-contact-form.test.ts`, `tests/nav.test.ts`,
  `tests/faq.test.ts`, `tests/portfolio-filter.test.ts`).
- **`src/script.ts`**, the DOM-wiring entry point, is exercised in
  `tests/script-wiring.test.ts` against a fixture DOM matching
  `index.html`'s structure — clicking the theme toggle, mobile nav,
  portfolio filters, FAQ accordion, and submitting the contact form, then
  asserting on the resulting DOM state.

Coverage thresholds (`vitest.config.ts`) are enforced in CI via
`npm run coverage` — currently ~87% statements / lines across `src/`.

```bash
npm test          # run once
npm run coverage    # run with coverage + enforce thresholds
```

## Backend

This site is growing a real backend (blog + contact form persistence) in
[`server/`](./server/README.md) — see [`ARCHITECTURE.md`](./ARCHITECTURE.md)
for the design and build phases. It's being built incrementally and
doesn't affect anything in this README above; the frontend still runs
standalone with no backend required.

## Blog

`blog.html` lists published posts; `blog-post.html?slug=your-slug` shows
one in full, rendering its Markdown `content` to sanitized HTML
(`src/lib/blog-render.ts` — `marked` + `DOMPurify`, both dev-only
dependencies loaded from a CDN, same pattern as three.js).

Posts are managed from **`admin.html`** — see the Admin dashboard section
below. `curl`/the admin API still work directly too; see
[`server/README.md`](./server/README.md#admin-setup) for the login setup
and `server/src/lib/validate-post.ts` for the exact validation rules.

## Admin dashboard

`admin-login.html` → `admin.html`. Everything here calls `/api/admin/*`,
guarded by `requireAdmin` on the backend and a session check on load
(no token in `sessionStorage` → redirect to login; an expired/invalid
token on the dashboard's initial fetch → same redirect, token cleared).

- **Dashboard** (`admin.html`, no query param): total page views, post
  counts (published/draft), and message count; the full post list
  (drafts included) with Edit/Delete; every contact-form submission,
  newest first.
- **Editor** (`admin.html?post=new` or `admin.html?post=<id>`): the same
  page, toggled by that query param — create or edit a post (title,
  slug, excerpt, Markdown content, status), or delete it.
- **Page views**: `src/lib/analytics.ts` fires a fire-and-forget
  `POST /api/analytics/pageview` from `script.ts`/`blog.ts`/`blog-post.ts`
  (not from the admin pages themselves — an admin visit shouldn't count
  as a site visitor). Failures are silent; analytics never blocks or
  breaks the page for a real visitor.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md#api-security-posture) for why
the session token lives in `sessionStorage` behind a bearer header
rather than an httpOnly cookie — a deliberate call, not an oversight.

## Contact form integration

The contact form (`#contact-form`) is wired to the real backend
([`server/`](./server/README.md)) — `src/lib/contact-api.ts` POSTs to
`{api-base-url}/api/contact`, where `api-base-url` comes from the
`<meta name="api-base-url">` tag in `index.html`.

**Running it locally:** the meta tag defaults to `http://localhost:3000`
— start the backend (`cd server && npm run dev`, or `docker compose up`)
and the form works as-is.

**Deploying:** change the `content` attribute of that one meta tag to
your deployed API's URL, and set `CORS_ORIGIN` in the backend's
environment to this site's real domain (see
[`server/README.md`](./server/README.md#cors)). No other frontend code
needs to change.

## License

All rights reserved — see [LICENSE.md](./LICENSE.md). This repo is public
for portfolio review only; it isn't licensed for reuse.

## Contact

- GitHub: [github.com/ehoda9](https://github.com/ehoda9)
- LinkedIn: [mahmoud-mohamed3](https://www.linkedin.com/in/mahmoud-mohamed3/)
- Phone: +20 106 881 1625
