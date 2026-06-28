# PRD — Snippet Search

**Project:** Intern Coding Challenge — Snippet Search  
**Author:** _(your name)_  
**Last updated:** 2026-06-24  
**Source of truth:** [`INTERN_GUIDELINE.md`](INTERN_GUIDELINE.md)  
**Architecture:** [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

## 1. Problem statement

Users need a simple app to **save short text entries (snippets)** with a title, body, and tags, and **search** through them by keyword. The app must be clean, usable, and backed by a well-structured REST API.

---

## 2. Goals

| Goal | Success metric |
|------|----------------|
| Full CRUD API with correct HTTP semantics | All endpoints pass manual Swagger/curl tests |
| Keyword search across title and body | Searching `liability`, `termination`, `dispute` returns expected results from seed data |
| Usable Next.js UI | User can search, view, create, and edit snippets without blank screens |
| Understandable codebase | Every submitted line can be explained in a live interview |

---

## 3. In scope (required)

### Backend (FastAPI + PostgreSQL)

- `POST /snippets` — create snippet → **201 Created**
- `GET /snippets?page=&limit=` — paginated list
- `GET /snippets/{id}` — single snippet → **404** if missing
- `PUT /snippets/{id}` — update snippet → **404** if missing
- `DELETE /snippets/{id}` — delete snippet → **404** if missing, **204** or **200** on success
- `GET /search?q=` — keyword search on title + body
- `GET /health` — `{ "status": "ok" }`
- Pydantic validation on all request bodies
- Correct status codes throughout

### Frontend (Next.js)

- **Search page** (`/`) — search box + results (title, preview, tags)
- **Detail view** (`/snippets/[id]`) — full snippet
- **Create form** (`/snippets/new`)
- **Edit form** (`/snippets/[id]/edit`) — ideal per guideline
- Visible **loading**, **error**, and **empty** states on every data-fetching view

### Submission

- `README.md` — setup and run instructions (Docker Compose as primary path)
- `NOTES.md` — decisions, AI usage, future improvements
- Git history with small, meaningful commits
- Zip or Drive link to `hello@etverdict.com` before **Sunday 28 June 2026, 16:00 CEST**

### Project initialization

- `docker-compose.yml` at repo root — **PostgreSQL 17** + **FastAPI backend**
- `backend/Dockerfile` — API container image
- Frontend runs on host via `npm run dev` (points at `http://localhost:8000`)
- Pattern inspired by [full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template)

---

## 4. Out of scope

- User authentication / accounts
- Rich text / markdown editor
- Tag-based filtering (search is keyword-only on title + body)
- Production deployment / HTTPS
- Fancy UI / design system

---

## 5. Data model

### Entity: `Snippet`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `integer` | PK, auto-increment | Assigned by database |
| `title` | `string` | required, max 200 chars | Trimmed whitespace |
| `body` | `text` | required, min 1 char | Full content |
| `tags` | `string[]` | optional, default `[]` | Stored as PostgreSQL `TEXT[]` |
| `created_at` | `timestamptz` | required, set on create | UTC ISO 8601 in API responses |

### Design decisions

- **Tags as `TEXT[]`** — native PostgreSQL array; simple to query and serialize to JSON `["contract", "clause"]`
- **No `updated_at`** — not required by guideline; can add later
- **List endpoint returns summary** — `id`, `title`, `tags` only (no body) to keep payloads small
- **Search preview** — first 120 characters of body, with `...` appended if truncated

---

## 6. API contract

Base URL: `http://localhost:8000` (development)

### Snippet (full)

```json
{
  "id": 1,
  "title": "Force majeure clause",
  "body": "Neither party shall be liable for failure to perform due to events beyond its reasonable control...",
  "tags": ["contract", "clause"],
  "created_at": "2026-06-22T10:30:00Z"
}
```

### `POST /snippets`

**Request:**

```json
{
  "title": "Force majeure clause",
  "body": "Neither party shall be liable...",
  "tags": ["contract", "clause"]
}
```

**Response:** `201 Created` — full snippet with `id` and `created_at`

**Validation errors:** `422 Unprocessable Entity` (Pydantic default)

### `GET /snippets?page=1&limit=10`

**Response:** `200 OK`

```json
{
  "items": [
    { "id": 1, "title": "Force majeure clause", "tags": ["contract"] }
  ],
  "page": 1,
  "limit": 10,
  "total": 42
}
```

- Default `page=1`, `limit=10`
- Max `limit=100`
- Items ordered by `created_at` descending (newest first)

### `GET /snippets/{id}`

**Response:** `200 OK` — full snippet  
**Not found:** `404` — `{ "detail": "Snippet not found" }`

### `PUT /snippets/{id}`

**Request:** same shape as create (all fields required on update)

**Response:** `200 OK` — updated full snippet  
**Not found:** `404`

### `DELETE /snippets/{id}`

**Response:** `204 No Content` (empty body)  
**Not found:** `404`

### `GET /search?q=force`

**Response:** `200 OK`

```json
{
  "query": "force",
  "results": [
    {
      "id": 1,
      "title": "Force majeure clause",
      "preview": "Neither party shall be liable for failure to perform due to...",
      "tags": ["contract", "clause"]
    }
  ]
}
```

**Search rules (v1):**
- Case-insensitive match: `title ILIKE '%q%' OR body ILIKE '%q%'`
- Empty or whitespace-only `q` → `200` with `"results": []`
- Results include `tags` (added beyond minimal guideline example — useful for UI)
- Ordered by relevance proxy: title match first, then `created_at` desc

### `GET /health`

**Response:** `200 OK` — `{ "status": "ok" }`

---

## 7. Frontend pages

| Route | Component type | Behavior |
|-------|----------------|----------|
| `/` | Client | Search input (debounced 300ms), results list, link to detail |
| `/snippets/[id]` | Client or Server | Fetch snippet by id; show 404 message if API returns 404 |
| `/snippets/new` | Client | Form: title, body, tags (comma-separated input → array); POST on submit |
| `/snippets/[id]/edit` | Client | Pre-fill form from GET; PUT on submit; redirect to detail |

### UI states (required on every page that fetches data)

| State | User sees |
|-------|-----------|
| Loading | "Loading…" or skeleton placeholder |
| Error | Error message + retry button |
| Empty | "No snippets found" / "Enter a search term" |
| Success | Data rendered |

### Navigation

- Header with app title + link to search (`/`) + link to create (`/snippets/new`)
- Detail page: Edit + Delete buttons; Delete confirms then redirects to `/`

---

## 8. Acceptance criteria

### Backend

- [ ] `POST /snippets` returns `201` with `id` and `created_at`
- [ ] `GET /snippets/999` returns `404` with `{ "detail": "Snippet not found" }`
- [ ] `PUT /snippets/999` returns `404`
- [ ] `DELETE /snippets/999` returns `404`
- [ ] `GET /snippets?page=1&limit=10` returns correct `total` count
- [ ] `GET /search?q=liability` returns multiple results from seed data
- [ ] `GET /search?q=termination` matches snippets where term is only in body
- [ ] `GET /health` returns `{ "status": "ok" }`
- [ ] Invalid create body (empty title) returns `422`

### Frontend

- [ ] Search page shows loading state while fetching
- [ ] Search page shows error state if API is down
- [ ] Search page shows empty state when no results
- [ ] Clicking a result opens detail view with full body and tags
- [ ] Create form successfully creates snippet and navigates to detail
- [ ] Edit form pre-fills and saves changes
- [ ] Delete removes snippet and returns to search page
- [ ] Screen is never blank during data operations

### Submission

- [ ] `README.md` documents full setup from scratch
- [ ] `NOTES.md` covers decisions, AI usage, improvements
- [ ] Git history shows incremental commits (not one giant commit)

---

## 9. Nice-to-haves (optional — only after core works)

| Feature | Priority |
|---------|----------|
| Seed script with 25 sample snippets | High — saves testing time |
| PostgreSQL full-text search with ranking | Medium |
| Highlight matched words in search results | Low |
| Pytest tests for CRUD + search | Low |

---

## 10. References

- Challenge spec: [`INTERN_GUIDELINE.md`](INTERN_GUIDELINE.md)
- Architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Roadmap: [`PLAN.md`](PLAN.md)
- Backend patterns: [full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template)
