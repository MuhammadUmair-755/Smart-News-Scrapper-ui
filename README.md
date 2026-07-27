# Smart News Aggregator — Web UI

The reading surface for a Django/DRF news aggregator. An n8n pipeline pulls
headlines from 14 RSS publishers every 30 minutes; this app is where people scan
them and hand off to the publisher.

**Stack:** Vite 8 · React 19 · TypeScript 6 (strict) · Tailwind v4 ·
TanStack Query · react-router 8 · Radix UI · Motion · Vitest

## Quick start

The backend must be running — this app has no mock layer.

```bash
# Backend (separate repo)
cd ../smart-news-aggregator
docker compose up -d                # Postgres on host port 5433, not 5432
source venv/Scripts/activate
python manage.py runserver          # http://127.0.0.1:8000

# Frontend
npm install
cp .env.example .env
npm run dev                         # http://localhost:5173
```

`/api` is proxied to Django in development, so the browser makes same-origin
requests and CORS never applies.

## Scripts

| Command                                     | Does                                                |
| ------------------------------------------- | --------------------------------------------------- |
| `npm run dev`                               | Dev server on 5173                                  |
| `npm run build`                             | Typecheck + production build                        |
| `npm run preview`                           | Serve the built output                              |
| `npm run typecheck` · `lint` · `format`     | Individually                                        |
| `npm test` · `test:watch` · `test:coverage` | Vitest                                              |
| **`npm run verify`**                        | **typecheck + lint + test — run before committing** |

## Documentation

Everything needed to work on this lives in [`.CLAUDE/`](.CLAUDE/README.md):

- [context.md](.CLAUDE/context.md) — the product and the shape of the data
- [api-docs.md](.CLAUDE/api-docs.md) — every endpoint, parameter, response and error shape
- [requirements.md](.CLAUDE/requirements.md) — what must be true of the finished UI
- [design-system.md](.CLAUDE/design-system.md) — tokens, components, motion, a11y
- [stitch.md](.CLAUDE/stitch.md) — Stitch ids, MCP usage, pulling the comps
- [architecture.md](.CLAUDE/architecture.md) — folder structure and conventions
- [prerequisites.md](.CLAUDE/prerequisites.md) — setup, including the Django side
- [plan.md](.CLAUDE/plan.md) — staged build plan and status

Read `context.md` first. Three things about this dataset drive most of the
design and are easy to get wrong: there is **no article body text**,
**`image_url` is empty on 100% of rows**, and the colour tokens were **solved
against WCAG**, not chosen.

## Status

Stage 1 (scaffold) complete. See [plan.md](.CLAUDE/plan.md).
