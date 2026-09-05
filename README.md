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
index.html
css/
  styles.css
src/
  script.ts              ← entry point, wires DOM to lib/
  lib/
    validate-contact-form.ts
    nav.ts
    faq.ts
    portfolio-filter.ts
js/                       ← compiled output (committed), mirrors src/
tests/
  validate-contact-form.test.ts
  nav.test.ts
  faq.test.ts
  portfolio-filter.test.ts
assets/
  img/
.github/
  workflows/ci.yml         ← build + lint + test on every push
  dependabot.yml
tsconfig.json
vitest.config.ts
eslint.config.js
package.json
package-lock.json
```

## Running locally

No server or environment variables are required — this is a static site.

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
