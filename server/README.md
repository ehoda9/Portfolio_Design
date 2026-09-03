# Portfolio API

Backend for [Mahmoud Mohamed's portfolio](../README.md) — the blog and
contact form persist here. See [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
for the overall design, schema, and phased build plan.

**Status:** Phase 3 — public blog read API is live and backed by a real
Postgres database. Write endpoints (create/edit/delete posts) land in
Phase 4, together with admin auth — never separately.

## Endpoints (so far)

| Method | Path | Auth |
|---|---|---|
| GET | `/api/health` | — |
| GET | `/api/posts` | public — published posts only, newest first, no `content` field |
| GET | `/api/posts/:slug` | public — 404 if missing or not published |

## Database

Migrations live in `migrations/*.sql`, applied in filename order by
`src/db/migrate.ts`, which tracks what's been applied in a
`schema_migrations` table (so it's safe to run repeatedly).

```bash
# with DATABASE_URL set (see .env.example)
npm run build
npm run migrate
```

`npm test` also runs a full migration test against a real Postgres if
`DATABASE_URL` is set (it skips cleanly, rather than failing, if it's
not — see `tests/migrate.test.ts`).

## Development

```bash
cd server
cp .env.example .env   # then fill in DATABASE_URL
npm install
npm run build             # compiles src/**/*.ts → dist/**/*.js
npm run dev                 # runs dist/index.js, restarting on change
npm run migrate                # applies pending migrations
npm test                         # runs the test suite
npm run lint                        # lints src/ and tests/
npx tsc --noEmit                       # typecheck without emitting files
```

## Running standalone

```bash
npm run build
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio PORT=3000 npm start
curl http://localhost:3000/api/health
```

## Docker

The easiest way to run this with a real database is the root-level
`docker-compose.yml` (brings up `db`, `api`, and the static `web` site
together — see the root [README](../README.md#docker)). To run just this
service in isolation instead:

```bash
docker build -t portfolio-api .
docker run --rm -p 3000:3000 -e DATABASE_URL=... portfolio-api
```
