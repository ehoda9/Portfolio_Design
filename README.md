# Mahmoud Mohamed — Portfolio

**Project type:** static front-end portfolio site (HTML, CSS, TypeScript).
No backend, no server-rendered routes, no infrastructure-as-code — the
`Dockerfile` here exists only to run the build/test suite in isolation
(see [Testing](#testing)), not to deploy anything.

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

Opens the site at `http://localhost:8080`. There's a single `web` service
(nginx serving the static files) — no database or other backing service is
needed, since there's nothing else to bring up.

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

## Contact form integration

The contact form (`#contact-form`) currently **simulates** a submission —
see the `NOTE` comment in `src/script.ts`'s submit handler. It validates
input with `validateContactForm` and then shows a success message after
a short delay, but nothing is sent anywhere yet.

To wire it to a real backend:

1. Replace the `setTimeout` block in `src/script.ts` with a `fetch()`
   call to your endpoint of choice (e.g. Formspree, EmailJS, or your own
   API route), sending `{ name, email, desc }` as the body.
2. Only show the success message once that request resolves, and show
   `errorMsg` (or a new message) if it rejects.
3. If the endpoint needs a key, don't hardcode it — add a `.env.example`
   listing the variable name and read it via your hosting provider's
   environment variables at build/deploy time.

## License

All rights reserved — see [LICENSE.md](./LICENSE.md). This repo is public
for portfolio review only; it isn't licensed for reuse.

## Contact

- GitHub: [github.com/ehoda9](https://github.com/ehoda9)
- LinkedIn: [mahmoud-mohamed3](https://www.linkedin.com/in/mahmoud-mohamed3/)
- Phone: +20 106 881 1625
