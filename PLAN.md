# Snippet Search: Learning → Planning → Execution

**Deadline:** Sunday, 28 June 2026, 16:00 CEST / 21:30 MMT  
**Time budget:** ~8–12 hours total  
**Current state:** Phase 2 complete — `PRD.md` and `ARCHITECTURE.md` written. Ready for Phase 3 execution.

---

## Recommended phase flow

```mermaid
flowchart LR
  subgraph phase1 [Phase 1: Learning]
    L1[FastAPI + Pydantic]
    L2[PostgreSQL + SQLAlchemy]
    L3[Next.js App Router]
    L4[Full-stack wiring]
  end
  subgraph phase2 [Phase 2: Planning]
    P1[PRD.md]
    P2[ARCHITECTURE.md]
    P3[API contract + folder layout]
  end
  subgraph phase3 [Phase 3: Execution]
    E1[Backend CRUD + search]
    E2[Seed + README env]
    E3[Frontend pages]
    E4[Polish + NOTES.md]
  end
  phase1 --> phase2 --> phase3
```

---

## Tool versions (June 2026)

Use current LTS/stable releases — the old minimums (Python 3.11, Node 18, PostgreSQL 14) are outdated or near EOL.

| Tool | Use |
|------|-----|
| **Python 3.13+** | Backend / FastAPI |
| **Node.js 22 LTS+** (or **24 LTS**) | Next.js frontend |
| **PostgreSQL 17+** | Database |

Full setup details: [`ARCHITECTURE.md` §10](ARCHITECTURE.md#10-local-development)

---

## Phase 1: Learning (2–3 hours)

Goal: understand *enough* to explain every line you submit. Focus on concepts directly used by this challenge.

### Backend — FastAPI + PostgreSQL

| Topic | Why it matters for this project | Resource |
|-------|----------------------------------|----------|
| Routes, status codes, Pydantic models | All 7 API endpoints + validation | [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/) (first 6 sections) |
| SQL databases with FastAPI | Snippet persistence | [FastAPI SQL Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/) |
| CRUD + project structure | Clean, reviewable code | [Pasly CRUD tutorial](https://pasly.co/blogs/fastapi-sqlalchemy-postgresql-crud) (simpler) or [StackLesson CRUD layers](https://www.stacklesson.com/react-fastapi/fastapi-crud/ch26-lesson-01-crud-architecture/) |
| Pagination | `GET /snippets?page=&limit=` | SQLAlchemy `offset` / `limit` + `count` query |
| Keyword search | `GET /search?q=` | Start with `ILIKE '%q%'` on title + body; optional upgrade: [PostgreSQL full-text search](https://www.postgresql.org/docs/current/textsearch-tables.html) |
| CORS | Next.js (port 3000) calling FastAPI (port 8000) | [FastAPI CORS middleware](https://fastapi.tiangolo.com/tutorial/cors/) |

**Key concepts checklist:**
- Pydantic `BaseModel` for request/response shapes
- `status_code=201` on create, `HTTPException(404)` when id missing
- Dependency injection: `db: Session = Depends(get_db)`
- Tags stored as PostgreSQL `TEXT[]` (see `PRD.md`)

### Frontend — Next.js

| Topic | Why it matters | Resource |
|-------|----------------|----------|
| App Router file structure | `app/` pages for search, detail, form | [Next.js App Router](https://nextjs.org/docs/app) |
| Data fetching + loading states | Required: never blank screen | [Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data) |
| Client vs Server Components | Search box = client; list can be either | [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) |
| `loading.tsx` + error UI | Built-in loading boundaries | [loading.js convention](https://nextjs.org/docs/app/api-reference/file-conventions/loading) |
| Forms + navigation | Create/edit snippet | [Forms](https://nextjs.org/docs/app/guides/forms) |

**Recommended frontend approach (keep it simple):**
- Use **Client Components** for search input (debounced search) and forms (controlled inputs)
- Use `fetch(`${API_URL}/search?q=...`)` with explicit `loading` / `error` state
- Plain `fetch` + `useState` is enough — no SWR/React Query required

### Full-stack wiring (30 min)

- Run FastAPI on `http://localhost:8000`, Next.js on `http://localhost:3000`
- Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in frontend `.env.local`
- Enable CORS on FastAPI for `http://localhost:3000`
- Test with Swagger UI at `http://localhost:8000/docs` before building UI

### Primary reference project (save & study)

**[full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template)** — the official FastAPI full-stack starter. Highly recommended as your main architectural reference.

| What to borrow | What to adapt |
|----------------|---------------|
| Backend folder layout (`app/api`, `app/models`, `app/schemas`, `app/crud`) | Frontend is **Next.js** per challenge (template uses React) |
| `get_db` dependency injection pattern | Simpler — no auth, no users |
| Pydantic schemas separate from SQLAlchemy models | Single `snippets` resource instead of items/users |
| `.env` + settings pattern | No Docker required for v1 (optional nice-to-have) |
| Seed / initial data approach | Use the 25 legal snippets from `INTERN_GUIDELINE.md` |

Clone locally for reference:

```bash
git clone https://github.com/fastapi/full-stack-fastapi-template.git
```

Skim `backend/app/` structure before scaffolding your own backend. Do **not** copy the whole repo — this challenge is intentionally smaller.

---

## Phase 2: Planning — DONE

| Document | Status | Purpose |
|----------|--------|---------|
| [`PRD.md`](PRD.md) | Complete | Requirements, decisions, acceptance criteria |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Complete | System design, schema, API table, folder layout |

### Planning exit criteria

You are ready to execute when you can answer without looking:
- What does each endpoint return and which status codes?
- What are the 4 frontend routes?
- How are tags stored in PostgreSQL?
- How does the frontend know the API base URL?

---

## Phase 3: Execution (5–7 hours) — NEXT

Execute in **small git commits** (guideline explicitly reviews commit history).

### Milestone A — Backend foundation (~2h)

1. Init repo + `.gitignore`
2. Backend scaffold — FastAPI app, PostgreSQL connection, `Snippet` model
3. CRUD endpoints — `POST/GET/GET:id/PUT/DELETE /snippets`
4. Pagination — `GET /snippets?page=1&limit=10`
5. Search — `GET /search?q=...`
6. Health — `GET /health`
7. Seed script — load 25 sample snippets
8. Manual test — Swagger UI; verify `liability`, `termination`, `dispute` searches

### Milestone B — Frontend (~2.5h)

9. Next.js scaffold — App Router, `lib/api.ts`, env example
10. Search page — debounced fetch, loading/error/empty states
11. Detail page — `/snippets/[id]`
12. Create form — `/snippets/new`
13. Edit form — `/snippets/[id]/edit`
14. CORS + E2E smoke test

### Milestone C — Submission polish (~1h)

15. `README.md` — setup commands, sample `.env`
16. `NOTES.md` — decisions, AI usage, improvements
17. Final commit — lint/format pass
18. Implement Docker Compose for development and testing environments
19. Add Full Text Search (FTS) capability to snippet search
20. Implement result highlighting for search matches
21. Write and maintain pytest tests for backend coverage

### Time-boxing priority (drop from bottom up)

1. All required API endpoints with correct status codes
2. Search page with loading/error states
3. Detail view
4. Create form
5. Edit form
6. Seed script, Docker, FTS, tests

---

## Learning resources (bookmark list)

### Backend
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [FastAPI SQL Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
- [full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template) — **primary reference**
- [Pasly: FastAPI + SQLAlchemy CRUD](https://pasly.co/blogs/fastapi-sqlalchemy-postgresql-crud)

### Frontend
- [Next.js Docs — App Router](https://nextjs.org/docs/app)
- [Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Forms guide](https://nextjs.org/docs/app/guides/forms)

### Full-stack
- [FastAPI Interactive Docs (Swagger)](https://fastapi.tiangolo.com/features/#automatic-docs)
