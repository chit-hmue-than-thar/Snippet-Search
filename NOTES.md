# NOTES — Snippet Search

Short notes for the ET Verdict submission.

---

## Main decisions

**Stack and layout.** I used a monorepo: FastAPI + PostgreSQL backend, Next.js 15 frontend. Local dev runs Postgres and the API in Docker (`docker compose`), while the frontend runs on the host with `npm run dev`. That keeps setup simple for reviewers: one `npm run setup` command after creating `frontend/.env.local`.

**Backend structure.** I followed patterns from the official [full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template): separate `routers/`, `crud.py`, `schemas.py`, and `models.py`. I skipped auth and Alembic because they were out of scope for v1.

**Data model.** Snippets use soft delete (`delete_flag`) so deleted items disappear from list/search but are not physically removed. Tags are stored as PostgreSQL `TEXT[]`.

**Search.** Keyword search uses `ILIKE` on title and body. Title matches are ranked first, then newest first. I chose this over full-text search because it is easy to understand, works well on 25–few hundred snippets, and matches the challenge requirements.

**Frontend.** Next.js App Router with Material UI. Search query and page live in the URL (`?q=`, `?page=`) so refresh and back/forward work. A small in-memory API cache (15s TTL) makes navigation between list, detail, and edit feel faster.

**Deployment.** Production is on Vercel (frontend + serverless FastAPI) with Neon PostgreSQL — no credit card needed. Root npm scripts (`backend:venv`, `seed:neon`) make it easy to seed the remote database once.

**Git.** I committed in small steps (backend CRUD, frontend pages, fixes, deployment, docs) instead of one large commit at the end.

---

## What I would improve with more time

- **Database migrations** — replace `create_tables()` on startup with Alembic so schema changes are versioned safely.
- **Search** — PostgreSQL full-text search and/or tag filters.
- **Tests** — pytest for the API (CRUD, validation, search ranking) and a few Playwright flows for the UI.
- **Production hardening** — rate limiting, structured logging, and monitoring for cold starts on Vercel serverless.
- **UX** — debounced search, optimistic updates, and keyboard shortcuts.

---

## How I used AI tools

I used **Cursor** (AI-assisted IDE) throughout the project. Typical uses:

- **Scaffolding and boilerplate** — initial folder layout, Docker Compose, and repetitive CRUD/router code. I reviewed and adjusted everything to fit this project.
- **Debugging** — Vercel serverless entrypoint, `DATABASE_URL` / SSL for Neon, CORS after deploy, and Windows-specific issues (`curl.exe`, env quoting).
- **Documentation** — drafts for README and deployment guides; I trimmed and verified commands myself.
- **Small scripts** — `scripts/backend-venv.js` and `scripts/seed-neon.js` to simplify Neon seeding on Windows.

I did **not** paste in code I could not explain. For anything AI suggested, I read it, ran it locally, and fixed what broke. I can walk through `crud.py` (search ranking), the frontend API client/cache, and the Vercel deployment setup in an interview.
