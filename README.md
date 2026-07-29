# Smart News Aggregator

Headlines from 14 publishers, collected every 30 minutes, served as one
filterable feed.

> **This repo is the web UI** · Backend: [Smart-News-Scrapper](https://github.com/MuhammadUmair-755/Smart-News-Scrapper) · n8n workflow lives in neither repo ([why](#n8n-workflow))

---

## Overview

- **Problem** — staying current means checking a dozen news sites in turn.
- **Solution** — automated collection, de-duplicated, in one searchable feed.
- **Scope** — a *discovery* surface, not a reader. No article bodies are stored;
  every article ends in a hand-off to the publisher.

---

## Features

| Feature | Detail |
| --- | --- |
| Unified feed | All publishers, newest first, virtualized infinite scroll |
| Categories | World · Business · Tech · Sports, with live counts |
| Filter & sort | By publisher; by publication or collection time |
| Search | Headline + description, matches highlighted, term in the URL |
| Article preview | Summary + hand-off panel + related stories |
| Sources directory | 14 publishers, searchable, active/paused status |
| Auto-collection | New articles every 30 min, no manual step |
| De-duplication | The same story from two feeds is stored once |

**Not built (by design):** no accounts or auth · no bookmarks · no article body
text or images · no writes from the browser.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 · Vite 8 · TypeScript 6 · Tailwind v4 · TanStack Query + Virtual · React Router 8 |
| Backend | Python 3.13 · Django 6 · DRF 3.17 · Gunicorn · WhiteNoise |
| Database | PostgreSQL 16 |
| Automation | n8n (self-hosted) |
| Local infra | Docker · Docker Compose · nginx |

---

## High-Level Architecture

```
        14 RSS Feeds
    (BBC, Guardian, NPR, …)
              │
              │  every 30 min
              ▼
    ┌───────────────────┐
    │        n8n        │   fetch → clean → batch
    └───────────────────┘
              │  POST /api/ingest/articles/   (X-API-Key, ≤200/batch)
              ▼
    ┌───────────────────┐        ┌──────────────┐
    │   Django + DRF    │───────▶│ PostgreSQL 16│
    └───────────────────┘        └──────────────┘
              │  GET /api/articles · /categories · /sources
              │  public · read-only · paginated
              ▼
    ┌───────────────────┐
    │     React SPA     │
    └───────────────────┘
              │
              ▼
           Browser ────▶ publisher's site (new tab)
```

### Component Interaction

| Component | Responsibility | Writes? |
| --- | --- | --- |
| n8n | Scheduled collection + normalisation | ✅ via API key |
| Django | Validation, de-dup, REST API | — |
| PostgreSQL | Storage; unique URL enforces de-dup | — |
| React SPA | Reading surface | ❌ read-only |

---

## Request Flow

The browser **only ever calls `/api` on its own origin**. A proxy sits behind it,
so CORS never applies.

```
Browser
   │  GET /api/articles/
   ▼
Proxy
   │   npm run dev   → Vite dev-server proxy
   │   Docker image  → nginx  location /api/
   ▼
Django
   │
   ▼
PostgreSQL
   │
   ▼
JSON response
```

---

## Project Structure

```
Smart-News-Scrapper-ui/       Smart-News-Scrapper/
├── src/                      ├── api/
│   ├── api/      client      │   ├── models.py   3 models
│   ├── app/      router      │   ├── ingestion/  write (API key)
│   ├── components/           │   ├── news_feed/  read (public)
│   ├── hooks/                │   └── tests/
│   ├── lib/                  ├── config/         settings, urls
│   ├── pages/    per route   ├── docker/         entrypoint
│   └── styles/   tokens      ├── Dockerfile
└── nginx/        proxy       └── docker-compose.yml
```

`ingestion` and `news_feed` are **packages inside one Django app**, split by
direction of data flow — not separate apps.

---

## User Journey

```
Landing (/)
    │
    ├──▶ Browse categories  (/c/:slug)
    ├──▶ Filter by source   (?source=)
    └──▶ Search             (/search?q=)
              │
              ▼
      Article preview (/a/:id)
              │
              ▼
   "Continue to {source}" ──▶ publisher's website
              │
              ▼
        (journey ends — no body text is ever shown)
```

All filter, sort and search state lives in the **URL**, so every view is
shareable and survives reload.

---

## Backend Flow

```
HTTP Request
     │
     ▼
URL Routing  (/api/…)
     │
     ├──────────────── READ ─────────────────┐
     │                                       │
     ▼                                       ▼
Permission: none (public)          Permission: X-API-Key
     │                                       │
     ▼                                       ▼
ReadOnlyModelViewSet               Ingest APIView
 filter · search · order            per-item transaction
 paginate (20, max 100)             duplicates → "skipped"
     │                                       │
     ▼                                       ▼
PostgreSQL  ◀───────────────────────────────┘
     │
     ▼
JSON Response
```

| Endpoint | Access | Returns |
| --- | --- | --- |
| `GET /api/articles/` | Public | Paginated feed (`?category` `?source` `?search` `?ordering`) |
| `GET /api/categories/` | Public | Bare array + counts |
| `GET /api/sources/` | Public | Bare array |
| `POST /api/ingest/articles/` | `X-API-Key` | `{received, created, skipped, errors}` |
| `/admin/` | Session login | Operator UI — pause a feed via `is_active` |

> **De-duplication** is a `unique` constraint on the article URL. n8n
> canonicalises before sending; Django does none of its own.

---

## n8n Workflow

**One workflow — "News Ingest: RSS → Django".**

```
Schedule Trigger (every 30 min)
       │
       ▼
Feed List  (14 feeds: url + category + name)
       │
       ▼
Loop, one feed at a time ◀────────┐
       │                          │
       ▼                          │
Read RSS  (continue on error)     │
       │                          │
       ▼                          │
Normalise ────────────────────────┘
  canonical URL · strip HTML
  ISO date · attach category
       │  (all feeds done)
       ▼
Batch  (chunk under 200)
       │
       ▼
POST → Django  (X-API-Key, retry ×2)
       │
       ▼
{received, created, skipped, errors}
```

> ⚠️ **The workflow definition is in neither repository** — no JSON export, no
> `n8n/` directory, no compose service. The Django ingest contract is verifiable
> in code; the node graph above comes from design notes. Treat the running n8n
> instance as the source of truth.

---

## Local Setup

```bash
# Frontend — .env.example points at a running API, so this works standalone
npm install
cp .env.example .env
npm run dev                       # http://localhost:5173
```

<details>
<summary>Running the backend locally too</summary>

```bash
git clone https://github.com/MuhammadUmair-755/Smart-News-Scrapper.git
cd Smart-News-Scrapper
cp .env.example .env              # set SECRET_KEY + INGEST_API_KEY
docker volume create pg_data      # first time only
docker compose up -d --build      # Postgres + Django on :8000
```

Then set `VITE_PROXY_TARGET=http://127.0.0.1:8000` in the frontend `.env`.

</details>

> ⚠️ **A local database starts empty and nothing in either repo fills it** — the
> pipeline is in n8n. Either point at a backend n8n already feeds, or seed one:

```bash
curl -X POST http://127.0.0.1:8000/api/ingest/articles/ \
  -H "X-API-Key: $INGEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"articles":[{"title":"Hello","url":"https://example.com/1",
       "category":"tech","source_name":"Example","source_feed_url":"https://example.com/rss"}]}'
```

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server on 5173 |
| `npm run build` | Typecheck + production build |
| **`npm run verify`** | **typecheck + lint + test — run before committing** |
| `docker compose exec web python manage.py test` | Backend tests (what CI runs) |

---

## Environment Variables

| Variable | Side | Secret? | Purpose |
| --- | --- | --- | --- |
| `SECRET_KEY` | Backend | 🔒 | Django signing key |
| `DATABASE_URL` | Backend | 🔒 | PostgreSQL connection |
| `INGEST_API_KEY` | Backend | 🔒 | Shared secret n8n presents to write |
| `ALLOWED_HOSTS` | Backend | — | Hostnames Django answers for |
| `CORS_ALLOWED_ORIGINS` | Backend | — | Only needed if calling the API cross-origin |
| `VITE_API_BASE_URL` | Frontend | 🌐 | Where the browser sends calls. Keep `/api` |
| `VITE_PROXY_TARGET` | Frontend | — | Where the **dev server** forwards `/api` |
| `API_PROXY_TARGET` | Frontend | — | Where the **nginx image** forwards `/api` |

> 🌐 **`VITE_*` values are compiled into the JavaScript bundle** — they are
> public, not runtime config. Never put a key or token in one.

---

## Future Improvements

| Improvement | Why it's easy |
| --- | --- |
| Multi-select source filter | Backend filter is a single `NumberFilter`; needs a `BaseInFilter` |
| Per-source article counts | Categories already annotate a count; sources don't |
| AI summaries | `ai_summary` exists end-to-end but nothing populates it |
| Version the n8n workflow | The one part of the system not reproducible from source |
| Order nulls last | `-published_at` puts null dates *first* on PostgreSQL |
| Seed fixture | Would make local onboarding a single step |
