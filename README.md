# Snippet Search

Full-stack app for saving and searching short text snippets. **FastAPI** + **PostgreSQL** + **Next.js 15**.

More detail: [`PRD.md`](PRD.md) · [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`DEPLOYMENT-VERCEL.md`](DEPLOYMENT-VERCEL.md)

---

## Live (Vercel)

- **Frontend:** https://snippet-search.vercel.app
- **API:** https://snippet-search-api.vercel.app
- **API docs:** https://snippet-search-api.vercel.app/docs
- **Health:** https://snippet-search-api.vercel.app/health

---

## Prerequisites

- **Docker Desktop** — runs PostgreSQL + API locally (`docker compose`)
- **Node.js** 22+ and **npm**
- **Git**

Optional (without Docker): **Python** 3.13+ and **PostgreSQL** 17+

---

## Local setup (step by step)

**Step 1.** Clone the repo and open the project root.

**Step 2.** Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_DISABLE_DEVTOOLS=1
```

**Step 3.** One-time setup (install frontend, start Docker, seed data):

```powershell
npm run setup
```

**Step 4.** Start the frontend:

```powershell
npm run dev
```

**Step 5.** Open http://localhost:3000

### Manual steps (if you prefer)

```powershell
npm run frontend:install
npm run docker:up
npm run docker:seed
npm run dev
```

### Useful commands

```powershell
npm run docker:health      # check API
npm run docker:logs        # API logs
npm run docker:down        # stop containers
npm run docker:reset       # wipe database volume
npm run backend:venv       # Python venv (non-Docker / Neon seed)
npm run seed:neon          # seed production DB (set DATABASE_URL first)
```

API docs locally: http://localhost:8000/docs

---

## Features

### Backend

- REST API (FastAPI + SQLAlchemy + PostgreSQL)
- CRUD for snippets with soft delete
- Keyword search on title and body (case-insensitive, title ranked first)
- Pagination (`page`, `limit`)
- Pydantic validation (title, body, tags)
- CORS for the frontend origin
- Swagger UI at `/docs`
- Seed script with 25 sample snippets

### Frontend

- Search dashboard with URL state (`?q=`, `?page=`)
- Paginated snippet list with preview cards
- View, create, edit, and delete snippets
- Loading, error, and empty states
- Form validation aligned with the API
- Confirm dialog before delete

---

## API endpoints (backend)

Base URL (local): `http://localhost:8000`  
Base URL (production): `https://snippet-search-api.vercel.app`

- `GET /health` — health check
- `GET /snippets?page=1&limit=10` — paginated list
- `POST /snippets` — create snippet
- `GET /snippets/{id}` — get one snippet
- `PUT /snippets/{id}` — update snippet
- `DELETE /snippets/{id}` — soft-delete snippet
- `GET /search?q=keyword` — keyword search

Interactive docs: `/docs`

---

## Frontend routes

Base URL (local): `http://localhost:3000`  
Base URL (production): `https://snippet-search.vercel.app`

- `/` — search and browse snippets
- `/snippets/new` — create a snippet
- `/snippets/{id}` — snippet detail
- `/snippets/{id}/edit` — edit a snippet

---

## Deploy to Vercel

Full guide: **[DEPLOYMENT-VERCEL.md](DEPLOYMENT-VERCEL.md)** (frontend + API on Vercel, database on Neon).

Alternative (Render API): **[DEPLOYMENT.md](DEPLOYMENT.md)**
