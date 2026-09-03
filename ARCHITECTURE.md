# Architecture

## Overview

Two independently deployable services:

1. **Frontend** (repo root) — static HTML/CSS/TypeScript portfolio site.
   Unchanged by this work; documented in `README.md`.
2. **Backend API** (`server/`) — Express + TypeScript REST API backing the
   blog and the contact form, persisting to PostgreSQL.

## Why these choices

- **Express** — matches the plain, dependency-light style already used in
  the frontend (no heavy framework), and stays easy to reason about for a
  small number of routes.
- **PostgreSQL** — the data is genuinely relational (posts, contact
  messages, unique slugs) and benefits from real constraints, which fits
  an RDBMS better than a document store. It's also the most common
  production choice for exactly this kind of app.
- **A separate service, not merged into one framework (e.g. Next.js)** —
  keeps the already-shipped, tested static frontend untouched, and keeps
  the two concerns (marketing site vs. content API) independently
  deployable and testable.

## Planned schema

Introduced incrementally in Phase 2 — this is the target design, not yet
implemented.

### `posts`

| column | type | notes |
|---|---|---|
| id | serial primary key | |
| slug | text unique not null | URL-safe identifier |
| title | text not null | |
| excerpt | text not null | shown in the blog list |
| content | text not null | Markdown |
| status | text not null default `'draft'` | `'draft'` \| `'published'` |
| published_at | timestamptz | null until published |
| created_at | timestamptz not null default now() | |
| updated_at | timestamptz not null default now() | |

### `contact_messages`

| column | type | notes |
|---|---|---|
| id | serial primary key | |
| name | text not null | |
| email | text not null | |
| message | text not null | |
| created_at | timestamptz not null default now() | |

## Planned API surface

Introduced incrementally — the **Phase** column is when each row lands.

| Method | Path | Auth | Phase |
|---|---|---|---|
| GET | `/api/health` | — | 1 |
| GET | `/api/posts` | public | 3 |
| GET | `/api/posts/:slug` | public | 3 |
| POST | `/api/posts` | admin | 4 |
| PUT | `/api/posts/:id` | admin | 4 |
| DELETE | `/api/posts/:id` | admin | 4 |
| POST | `/api/auth/login` | — | 4 |
| POST | `/api/contact` | public | 5 |

## Auth approach

Single-admin model — there's exactly one author. Credentials are an email
+ a bcrypt password hash stored in environment variables, never in the
database or source control. `POST /api/auth/login` verifies the password
against the hash and returns a short-lived JWT; write endpoints require a
valid `Authorization: Bearer <token>` header. No user table, no signup
flow — deliberately minimal for a single-author blog.

## Rate limiting

Two limiters (`express-rate-limit`), sized for what this app actually is
— a single-author portfolio site, not a high-traffic service:

- **Login** (`/api/auth/login`): 10 attempts per IP per 15 minutes. This
  is the endpoint someone would brute-force a password against, so it's
  deliberately tight.
- **General API** (`/api/*`): 300 requests per IP per 15 minutes. Not
  meant to shape real traffic — it's a ceiling against scraping,
  accidental retry loops, or a flood of pointless requests, without
  affecting a real visitor browsing the blog.

No caching layer, connection pool tuning, or horizontal-scaling setup —
none of that is a real problem at this traffic scale, and adding it now
would be complexity with nothing to justify it.

## Local development

`docker-compose.yml` brings the API and a Postgres instance up together
(this arrives in Phase 2 onward, once the API actually needs a database —
no point adding a `db` service before anything talks to it).

## Status

This is a living document. Each phase below updates it if the design
changes along the way.

- [x] Phase 0 — this document
- [x] Phase 1 — backend skeleton + `/api/health`
- [x] Phase 2 — database + migrations (`posts`, `contact_messages`, real Postgres in CI and docker-compose)
- [x] Phase 3 — public blog read API (`GET /api/posts`, `GET /api/posts/:slug`)
- [x] Phase 4 — admin auth + protected write endpoints (`POST`/`PUT`/`DELETE /api/posts`), plus rate limiting (login brute-force protection + a general API ceiling)
- [ ] Phase 5 — contact form → real backend
- [ ] Phase 6 — frontend blog pages
- [ ] Phase 7 — admin UI
- [x] Phase 8 — full docker-compose (web + api + db) — done early in Phase 2, since the API needed a real Postgres to test migrations against locally anyway
- [ ] Phase 9 — final docs
