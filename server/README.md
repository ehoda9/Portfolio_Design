# Portfolio API

Backend for [Mahmoud Mohamed's portfolio](../README.md) — the blog and
contact form persist here. See [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
for the overall design, schema, and phased build plan.

**Status:** Phase 1 — skeleton + health check only. No database
connection yet (that's Phase 2).

## Endpoints (so far)

| Method | Path | Auth |
|---|---|---|
| GET | `/api/health` | — |

## Development

```bash
cd server
npm install
npm run build       # compiles src/**/*.ts → dist/**/*.js
npm run dev            # runs dist/index.js, restarting on change
npm test                 # runs the test suite
npm run lint                # lints src/ and tests/
npx tsc --noEmit               # typecheck without emitting files
```

## Running standalone

```bash
npm run build
PORT=3000 npm start
curl http://localhost:3000/api/health
```

## Docker

```bash
docker build -t portfolio-api .
docker run --rm -p 3000:3000 portfolio-api
```

(A `db` service and full `docker-compose.yml` integration arrive in
Phase 2, once the API actually talks to Postgres.)
