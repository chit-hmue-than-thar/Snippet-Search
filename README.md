# Snippet Search

Full-stack snippet search app: **FastAPI** + **PostgreSQL** + **Next.js**.

Planning docs: [`PRD.md`](PRD.md), [`ARCHITECTURE.md`](ARCHITECTURE.md), [`PLAN.md`](PLAN.md).

---

## Prerequisites

- Docker Desktop (with `docker compose`)
- Node.js 22 LTS+ (or 24 LTS)

---

## Step-by-step — run the app

Run these commands from the **project root** (`Intern Coding Challenge — Snippet Search`).

### Module 1 — Backend (Docker + PostgreSQL + API)

**Step 1.** Start PostgreSQL and the API:

```powershell
docker compose up -d --build
```

**Step 2.** Wait until the API is up, then check health:

```powershell
curl http://localhost:8000/health
```

Expected: `{"status":"ok"}`

**Step 3.** Load sample data (25 snippets):

```powershell
docker compose exec api python seed.py
```

**Step 4.** Open Swagger UI in your browser:

```
http://localhost:8000/docs
```

Try `GET /search?q=liability` and `GET /snippets?page=1&limit=10`.

**Stop backend:**

```powershell
docker compose down
```

**Stop and remove database volume (fresh start):**

```powershell
docker compose down -v
```

---

### Module 2 — Frontend (Next.js on host)

**Step 1.** Go to the frontend folder:

```powershell
cd frontend
```

**Step 2.** Copy environment file:

```powershell
copy .env.local.example .env.local
```

**Step 3.** Install dependencies:

```powershell
npm install
```

**Step 4.** Start the dev server (backend must be running on port 8000):

```powershell
npm run dev
```

**Step 5.** Open the app:

```
http://localhost:3000
```

Search for `liability`, `termination`, or `dispute` to test seed data.

---

### Module 3 — Full stack (both running)

Use **two terminals**.

**Terminal 1 — backend:**

```powershell
cd "D:\Intern Coding Challenge — Snippet Search"
docker compose up -d --build
docker compose exec api python seed.py
```

**Terminal 2 — frontend:**

```powershell
cd "D:\Intern Coding Challenge — Snippet Search\frontend"
copy .env.local.example .env.local
npm install
npm run dev
```

---

## Alternative — backend without Docker

Requires local PostgreSQL 17+.

```powershell
createdb snippet_search
cd backend
copy .env.example .env
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

## Environment variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/snippet_search
CORS_ORIGINS=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API endpoints

| Method | Path | Success |
|--------|------|---------|
| `POST` | `/snippets` | 201 |
| `GET` | `/snippets?page=&limit=` | 200 |
| `GET` | `/snippets/{id}` | 200 / 404 |
| `PUT` | `/snippets/{id}` | 200 / 404 |
| `DELETE` | `/snippets/{id}` | 204 / 404 |
| `GET` | `/search?q=` | 200 |
| `GET` | `/health` | 200 |

---

## Project structure

```
├── docker-compose.yml
├── backend/          # FastAPI + PostgreSQL
└── frontend/         # Next.js App Router
```

---

## Suggested git commits (Conventional Commits)

```text
feat: add docker-compose and backend dockerfile
feat(backend): scaffold fastapi app and postgres connection
feat(api): add snippet CRUD routes
feat(api): add keyword search and health endpoints
feat(db): add seed script with sample snippets
feat(frontend): scaffold next.js app router
feat(frontend): add search, detail, create, and edit pages
docs: add setup and env instructions
```
