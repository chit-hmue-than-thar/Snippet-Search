# Deploy on Vercel (Frontend + Backend + Neon)

Deploy the full stack **without Render** and usually **without a credit card**:

| Part | Vercel project | Root directory |
|------|----------------|----------------|
| **Frontend** (Next.js) | Project 1 | `frontend` |
| **Backend** (FastAPI serverless) | Project 2 | `backend` |
| **Database** (PostgreSQL) | **Neon** (via Vercel integration) | — |

You will create **two Vercel projects** from the **same GitHub repo**.

---

## Before you start

- [ ] Code pushed to GitHub: `https://github.com/chit-hmue-than-thar/Snippet-Search`
- [ ] Branch: `main`
- [ ] Local build works: `npm run frontend:build`
- [ ] [Vercel account](https://vercel.com) (sign up with GitHub — Hobby/free, no card usually)

---

## Part 1 — Deploy the backend (FastAPI)

### Step 1: New Vercel project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import **Snippet-Search** repository
3. Configure:

| Setting | Value |
|---------|--------|
| **Project Name** | `snippet-search-api` (or any name) |
| **Framework Preset** | **Other** (Vercel auto-detects FastAPI) |
| **Root Directory** | `backend` |
| **Build Command** | *(leave empty — Vercel handles Python)* |
| **Output Directory** | *(leave empty)* |

### Step 2: Add Neon PostgreSQL (required before the API will work)

**Option A — Neon via Vercel (recommended)**

1. In the project setup (or **Settings → Integrations**), add **Neon**
2. Create a new Neon database linked to this project
3. Vercel injects `DATABASE_URL` automatically into the backend project
4. **Redeploy** after Neon is connected (env vars only apply on new deployments)

**Option B — Neon directly**

1. Sign up at [neon.tech](https://neon.tech) (GitHub login, usually no card)
2. Create project → database `snippet_search`
3. Copy connection string (use **pooled** URL if offered)
4. In Vercel → **Settings → Environment Variables**:

| Name | Value |
|------|--------|
| `DATABASE_URL` | `postgresql://...neon.tech/...?sslmode=require` |

### Step 3: Other environment variables

Add in Vercel → **Settings → Environment Variables** (Production + Preview):

| Name | Value |
|------|--------|
| `CORS_ORIGINS` | `http://localhost:3000` *(update after frontend deploy)* |

`DATABASE_URL` comes from Neon integration if you used Option A.

### Step 4: Deploy backend

Click **Deploy**. Wait for the build to finish.

Your API URL will be something like:

```
https://snippet-search-api.vercel.app
```

### Step 5: Test backend

```powershell
curl https://snippet-search-api.vercel.app/health
```

Expected: `{"status":"ok"}`

Open Swagger:

```
https://snippet-search-api.vercel.app/docs
```

### Step 6: Seed the database

Run **locally** against your Neon database (one time):

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

set DATABASE_URL=postgresql://YOUR_NEON_CONNECTION_STRING
python seed.py
```

Expected: `Seeded 25 snippets.`

Test search:

```powershell
curl "https://snippet-search-api.vercel.app/search?q=liability"
```

---

## Part 2 — Deploy the frontend (Next.js)

### Step 1: New Vercel project (same repo)

1. [vercel.com/new](https://vercel.com/new) again
2. Import **the same** Snippet-Search repository
3. Configure:

| Setting | Value |
|---------|--------|
| **Project Name** | `snippet-search` |
| **Framework Preset** | **Next.js** |
| **Root Directory** | `frontend` |

### Step 2: Environment variable

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://snippet-search-api.vercel.app` |

Use your **actual backend URL** from Part 1 (no trailing slash).

Optional:

| Name | Value |
|------|--------|
| `NEXT_DISABLE_DEVTOOLS` | `1` |

### Step 3: Deploy

Click **Deploy**.

Your app URL:

```
https://snippet-search.vercel.app
```

### Step 4: Test frontend

1. Open the Vercel URL
2. Snippet cards should load
3. Search for `liability` or `contract`
4. Create / edit / delete a snippet

---

## Part 3 — Connect frontend and backend (CORS)

1. Vercel → **backend project** (`snippet-search-api`) → **Settings → Environment Variables**
2. Update `CORS_ORIGINS`:

```
https://snippet-search.vercel.app
```

Use your real frontend URL. For local dev too:

```
https://snippet-search.vercel.app,http://localhost:3000
```

3. **Redeploy** the backend (Deployments → ⋯ → Redeploy)

---

## Part 4 — Verify checklist

| # | Test | Expected |
|---|------|----------|
| 1 | `GET /health` on backend | `{"status":"ok"}` |
| 2 | `GET /search?q=liability` | JSON with results |
| 3 | Frontend homepage | Snippet list loads |
| 4 | Search in UI | Results appear |
| 5 | Create snippet | Works, shows in list |
| 6 | Browser DevTools → Network | Calls go to `*.vercel.app` API, not `localhost` |
| 7 | No CORS errors in console | — |

---

## Deploy with Vercel CLI (optional)

### Backend

```powershell
cd backend
npm install -g vercel
vercel login
vercel
vercel --prod
```

Set env vars in dashboard or:

```powershell
vercel env add DATABASE_URL
vercel env add CORS_ORIGINS
```

### Frontend

```powershell
cd frontend
vercel
vercel --prod
vercel env add NEXT_PUBLIC_API_URL
```

---

## Troubleshooting

### Backend build fails

- Confirm **Root Directory** is `backend`
- Check build logs for missing packages in `requirements.txt` or `pyproject.toml`
- Entrypoint is `app.main:app` (see `backend/pyproject.toml`)

### Serverless Function has crashed (`FUNCTION_INVOCATION_FAILED`)

Most common cause: **`DATABASE_URL` is missing or still the localhost default.**

1. Vercel → backend project → **Settings → Environment Variables**
2. Confirm `DATABASE_URL` exists for **Production** (from Neon integration or manual paste)
3. If you added Neon **after** the first deploy, click **Redeploy**
4. Check **Deployments → … → View Function Logs** for the exact Python error

### `health` returns error / 500

- Check `DATABASE_URL` is set and correct (Neon, with SSL)
- Run `python seed.py` locally with the same `DATABASE_URL`
- Check backend **Functions** logs in Vercel dashboard

### Frontend shows "Failed to load snippets"

- Confirm `NEXT_PUBLIC_API_URL` points to the **backend** project URL
- Redeploy frontend after changing env vars
- Test backend `/health` directly in browser

### CORS error

- Add exact frontend URL to backend `CORS_ORIGINS` (include `https://`)
- Redeploy backend

### Cold start slow

- First request after idle may take a few seconds on free tier — normal for serverless

---

## Architecture

```
Browser
   │
   ▼
https://snippet-search.vercel.app          (Vercel Project 1 — frontend/)
   │
   │  fetch(NEXT_PUBLIC_API_URL + "/snippets")
   ▼
https://snippet-search-api.vercel.app      (Vercel Project 2 — backend/)
   │
   ▼
Neon PostgreSQL                            (DATABASE_URL)
```

---

## Local development (unchanged)

```powershell
npm run docker:up
npm run docker:seed
npm run dev
```

Uses `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000`.

See also: [`README.md`](README.md) · [`DEPLOYMENT.md`](DEPLOYMENT.md) (Render option)
