<<<<<<< HEAD
# Snippet Search

Full-stack app for saving and searching short text snippets. **FastAPI** + **PostgreSQL 17** + **Next.js 15**.

Planning docs: [`PRD.md`](PRD.md) · [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`PLAN.md`](PLAN.md) · [`DEPLOYMENT.md`](DEPLOYMENT.md) (Render) · [`DEPLOYMENT-VERCEL.md`](DEPLOYMENT-VERCEL.md) (Vercel + Neon, no card)

---

## Prerequisites

| Requirement | Version / notes |
|-------------|-----------------|
| **Docker Desktop** | With `docker compose` (runs PostgreSQL + API) |
| **Node.js** | 22 LTS or newer |
| **npm** | Comes with Node.js |
| **Git** | To clone the repository |

Optional (backend without Docker):

| Requirement | Version / notes |
|-------------|-----------------|
| **Python** | 3.13+ |
| **PostgreSQL** | 17+ running locally |

---

## Quick start (recommended)

From the **project root**:

```powershell
npm run setup
```

This will:

1. Install frontend dependencies
2. Build and start Docker containers (PostgreSQL + API)
3. Seed the database with 25 sample snippets (skipped if data already exists)

Create `frontend/.env.local` first — see [Local configuration](#local-configuration).

Then start the frontend:

```powershell
npm run dev
```

Open **http://localhost:3000**

---

## Production deployment

**No credit card (recommended):** Vercel frontend + Vercel backend + Neon database  
→ **[DEPLOYMENT-VERCEL.md](DEPLOYMENT-VERCEL.md)** (step-by-step)

**Alternative:** Vercel frontend + Render API  
→ **[DEPLOYMENT.md](DEPLOYMENT.md)**

---

## Local configuration

Environment files are **gitignored** — create them locally. Replace `USER`, `PASSWORD`, `HOST`, and `DATABASE_NAME` with your own values. **Do not commit real credentials.**

### `backend/.env` (non-Docker only)

Skip this file when using **Docker Compose** — the API is configured in `docker-compose.yml`.

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME
CORS_ORIGINS=http://localhost:3000
```

### `frontend/.env.local` (required for dev server)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_DISABLE_DEVTOOLS=1
```

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (backend, non-Docker) |
| `CORS_ORIGINS` | Allowed frontend origin for API requests |
| `NEXT_PUBLIC_API_URL` | Backend API URL (no trailing slash) |
| `NEXT_DISABLE_DEVTOOLS` | Optional — hides Next.js devtools overlay |

For **production**, set these in the Vercel and Render dashboards — see [`DEPLOYMENT.md`](DEPLOYMENT.md).

---

## Step-by-step setup

### 1. Backend (Docker)

**Step 1.** Start PostgreSQL and the API:

```powershell
docker compose up -d --build
```

**Step 2.** Verify the API is healthy:

```powershell
npm run docker:health
```

Expected response:

```json
{"status":"ok"}
```

**Step 3.** Load sample data:

```powershell
npm run docker:seed
```

Expected output: `Seeded 25 snippets.` (or a skip message if snippets already exist)

**Step 4.** Open interactive API docs:

```
http://localhost:8000/docs
```

**Useful backend commands:**

```powershell
npm run docker:status    # show running containers
npm run docker:logs      # tail API logs
npm run docker:psql      # open PostgreSQL shell
npm run docker:down      # stop containers
npm run docker:reset     # stop containers and wipe database volume
```

### 2. Frontend (Next.js on host)

**Step 1.** Create `frontend/.env.local` — see [Local configuration](#local-configuration).

**Step 2.** Install dependencies:

```powershell
npm run frontend:install
```

**Step 3.** Start the dev server (backend must be running on port 8000):

```powershell
npm run dev
```

**Step 4.** Open the app:

```
http://localhost:3000
```

### 3. Full stack (two terminals)

**Terminal 1 — backend:**

```powershell
docker compose up -d --build
docker compose exec api python seed.py
```

**Terminal 2 — frontend:**

```powershell
# Create frontend/.env.local first — see Local configuration
npm run frontend:install
npm run dev
```

---

## Step-by-step testing

### A. Backend API (curl or Swagger)

Use Swagger at **http://localhost:8000/docs**, or run these from the project root.

**Health check**

```powershell
curl http://localhost:8000/health
```

Expected: `{"status":"ok"}`

**List snippets (paginated)**

```powershell
curl "http://localhost:8000/snippets?page=1&limit=10"
```

Expected: JSON with `items`, `page`, `limit`, and `total`. Each item includes `id`, `title`, `body`, `tags`, and `created_at`.

**Search by keyword**

```powershell
curl "http://localhost:8000/search?q=liability"
curl "http://localhost:8000/search?q=termination"
curl "http://localhost:8000/search?q=dispute"
```

Expected: matching snippets from seed data. Title matches are ranked before body-only matches.

**Get one snippet**

```powershell
curl http://localhost:8000/snippets/1
```

Expected: full snippet with `id`, `title`, `body`, `tags`, `created_at`, and `updated_at`.

**Create a snippet**

```powershell
curl -X POST http://localhost:8000/snippets ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Test snippet\",\"body\":\"This is a test body.\",\"tags\":[\"test\"]}"
```

Expected: `201 Created` with the new snippet including an `id`.

**Update a snippet**

```powershell
curl -X PUT http://localhost:8000/snippets/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Updated title\",\"body\":\"Updated body text.\",\"tags\":[\"updated\"]}"
```

Expected: `200 OK` with updated fields and a non-null `updated_at`.

**Delete a snippet**

```powershell
curl -X DELETE http://localhost:8000/snippets/1 -i
```

Expected: `204 No Content`. The snippet is soft-deleted and no longer appears in list or search.

**Validation error**

```powershell
curl -X POST http://localhost:8000/snippets ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"\",\"body\":\"\",\"tags\":[]}"
```

Expected: `422 Unprocessable Entity` with field-level error details.

**Not found**

```powershell
curl http://localhost:8000/snippets/99999
```

Expected: `404` with `{"detail":"Snippet not found"}`

### B. Frontend UI

With both backend and frontend running:

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Open **http://localhost:3000** | Dashboard loads with snippet cards (or empty state if no data) |
| 2 | Search for `liability` and press Enter | Results update; only matching snippets shown |
| 3 | Clear search (empty query + Search) | Full paginated list returns |
| 4 | Go to page 2 (if more than 10 snippets) | URL shows `?page=2`; different snippets displayed |
| 5 | Click **View** on a card | Detail page shows full title, body, and tags |
| 6 | Click **Back to search** | Returns to dashboard with search query and page preserved in URL |
| 7 | Click **Add snippet** | Create form opens at `/snippets/new` |
| 8 | Submit a new snippet (title, body, tags) | Redirects to detail page; snippet appears in list |
| 9 | Click **Edit** on a snippet | Form pre-fills with current data |
| 10 | Save changes | Detail page shows updated content |
| 11 | Click **Delete** and confirm | Snippet removed; returns to dashboard |
| 12 | Stop the API (`docker compose down`) and refresh | Error message with retry button (not a blank screen) |

**Suggested search terms** (from seed data): `liability`, `termination`, `dispute`, `contract`, `force`

---

## System features

### Backend

- **REST API** built with FastAPI and SQLAlchemy 2
- **PostgreSQL 17** with native `TEXT[]` for tags
- **CRUD** — create, read, update, and soft-delete snippets
- **Keyword search** — case-insensitive match on title and body (`ILIKE`)
- **Search ranking** — title matches first, then newest first
- **Pagination** — `page` and `limit` query params (default `page=1`, `limit=10`, max `limit=100`)
- **Validation** — Pydantic schemas enforce:
  - Title: required, max 200 characters, trimmed, not numeric-only
  - Body: required, trimmed, not numeric-only
  - Tags: optional list of strings, max 100 characters each, empty tags stripped
- **Soft delete** — deleted snippets are hidden from all queries (`delete_flag`)
- **Timestamps** — `created_at` on create, `updated_at` on update
- **CORS** — configured for `http://localhost:3000`
- **Auto table creation** on API startup
- **Seed script** — 25 legal-themed sample snippets (`backend/seed_data.json`)
- **Swagger UI** at `/docs`

### Frontend

- **Next.js 15** App Router with React 19 and Material UI 6
- **Search dashboard** (`/`) — keyword search with URL state (`?q=`, `?page=`)
- **Paginated list** — 10 snippets per page with pagination controls
- **Body preview** — first 120 characters shown on cards (truncated client-side)
- **Snippet cards** — title, preview, tags, and action menu (View / Edit / Delete)
- **Detail view** (`/snippets/[id]`) — full snippet content
- **Create** (`/snippets/new`) and **Edit** (`/snippets/[id]/edit`) forms
- **Navigation state** — search query and page preserved when viewing or editing
- **UI states** — loading spinners, error messages with retry, and empty-state messages
- **Confirm dialog** before delete
- **Client-side API cache** — 15-second TTL for faster navigation
- **Form validation** — mirrors backend rules with field-level error display

---

## API endpoints

Base URL: **http://localhost:8000**

| Method | Path | Description | Success | Not found |
|--------|------|-------------|---------|-----------|
| `GET` | `/health` | Health check | `200` | — |
| `GET` | `/snippets?page=&limit=` | Paginated snippet list | `200` | — |
| `POST` | `/snippets` | Create snippet | `201` | — |
| `GET` | `/snippets/{id}` | Get one snippet | `200` | `404` |
| `PUT` | `/snippets/{id}` | Update snippet | `200` | `404` |
| `DELETE` | `/snippets/{id}` | Soft-delete snippet | `204` | `404` |
| `GET` | `/search?q=` | Keyword search | `200` | — |

Interactive docs: **http://localhost:8000/docs**

### `GET /health`

**Response `200`:**

```json
{ "status": "ok" }
```

### `GET /snippets?page=1&limit=10`

**Query parameters:**

| Param | Default | Constraints |
|-------|---------|-------------|
| `page` | `1` | ≥ 1 |
| `limit` | `10` | 1–100 |

**Response `200`:**

```json
{
  "items": [
    {
      "id": 1,
      "title": "Force Majeure Clause",
      "body": "Neither party shall be liable for any failure or delay...",
      "tags": ["contract", "clause", "liability"],
      "created_at": "2026-06-22T10:30:00Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 25
}
```

Items are ordered by `created_at` descending (newest first).

### `POST /snippets`

**Request body:**

```json
{
  "title": "Force Majeure Clause",
  "body": "Neither party shall be liable...",
  "tags": ["contract", "clause"]
}
```

**Response `201`:** full snippet with `id`, `created_at`, and `updated_at` (null on create).

**Response `422`:** validation error (empty title, numeric-only values, etc.).

### `GET /snippets/{id}`

**Response `200`:**

```json
{
  "id": 1,
  "title": "Force Majeure Clause",
  "body": "Neither party shall be liable for any failure or delay...",
  "tags": ["contract", "clause", "liability"],
  "created_at": "2026-06-22T10:30:00Z",
  "updated_at": null
}
```

**Response `404`:**

```json
{ "detail": "Snippet not found" }
```

### `PUT /snippets/{id}`

Same request body as create. All fields are required.

**Response `200`:** updated snippet with `updated_at` set.

**Response `404`:** snippet not found or soft-deleted.

### `DELETE /snippets/{id}`

**Response `204`:** empty body on success.

**Response `404`:** snippet not found or already deleted.

### `GET /search?q=force`

**Query parameters:**

| Param | Description |
|-------|-------------|
| `q` | Keyword to match in title or body (case-insensitive) |

**Response `200`:**

```json
{
  "query": "force",
  "results": [
    {
      "id": 1,
      "title": "Force Majeure Clause",
      "body": "Neither party shall be liable for any failure or delay...",
      "tags": ["contract", "clause", "liability"],
      "created_at": "2026-06-22T10:30:00Z"
    }
  ]
}
```

- Empty or whitespace-only `q` returns `"results": []`
- Title matches are ranked before body-only matches
- Only active (non-deleted) snippets are returned

---

## Alternative — backend without Docker

Requires local PostgreSQL 17+.

```powershell
createdb snippet_search
cd backend
# Create backend/.env — see Local configuration
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

In another terminal:

```powershell
cd backend
.venv\Scripts\activate
python seed.py
```

---

## Project structure

```
├── docker-compose.yml       # PostgreSQL 17 + FastAPI services
├── package.json             # root scripts (setup, docker, frontend)
├── backend/
│   ├── Dockerfile
│   ├── seed.py              # load seed_data.json
│   ├── seed_data.json       # 25 sample snippets
│   └── app/
│       ├── main.py          # FastAPI app entry point
│       ├── models.py        # SQLAlchemy Snippet model
│       ├── schemas.py       # Pydantic request/response models
│       ├── crud.py          # database operations
│       └── routers/         # health, snippets, search
└── frontend/
    ├── app/                 # Next.js App Router pages
    ├── components/          # UI components (cards, forms, dialogs)
    ├── hooks/               # data-fetching hooks
    └── lib/                 # API client, validation, navigation helpers
```

---

## npm scripts (project root)

| Script | Description |
|--------|-------------|
| `npm run setup` | Full first-time setup (config, install, docker, seed) |
| `npm run dev` | Start Next.js dev server |
| `npm run docker:up` | Build and start Docker containers |
| `npm run docker:down` | Stop Docker containers |
| `npm run docker:reset` | Stop containers and remove database volume |
| `npm run docker:seed` | Seed sample snippets |
| `npm run docker:health` | Check API health |
| `npm run docker:logs` | Tail API container logs |
| `npm run docker:psql` | Open PostgreSQL shell |
| `npm run frontend:build` | Production build of the frontend |

---

## Troubleshooting

**Frontend shows a runtime error about `body.length`**

The API container may be running an outdated image. Rebuild it:

```powershell
npm run docker:up
```

**Seed script says snippets already exist**

The database already has data. To start fresh:

```powershell
npm run docker:reset
npm run docker:up
npm run docker:seed
```

**Frontend cannot reach the API**

1. Confirm the API is running: `npm run docker:health`
2. Create `frontend/.env.local` if missing — see [Local configuration](#local-configuration)
3. Restart the Next.js dev server after changing local config

**Port already in use**

- API uses port **8000** — stop other services on that port or change the mapping in `docker-compose.yml`
- Frontend uses port **3000** — stop other Next.js instances
