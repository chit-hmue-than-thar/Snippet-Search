# Production Deployment Guide

Deploy **Snippet Search** as a production app:

| Layer | Platform | Why |
|-------|----------|-----|
| **Frontend** (Next.js) | [Vercel](https://vercel.com) | Native Next.js hosting, HTTPS, CDN |
| **Backend** (FastAPI) | [Render](https://render.com) | Docker support, free tier |
| **Database** (PostgreSQL) | Render Postgres (or Neon) | Managed PostgreSQL |

Vercel hosts the frontend only. The FastAPI API and PostgreSQL run on Render (or similar).

---

## Before you start

### Accounts (free tier is enough)

1. [GitHub](https://github.com) — your code must be in a Git repository
2. [Render](https://render.com) — backend + database
3. [Vercel](https://vercel.com) — frontend

### Push code to GitHub

If the project is not on GitHub yet:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/snippet-search.git
git push -u origin main
```

Use your actual branch name (`main` or `dev`) if different.

### Production checklist

- [ ] Code builds locally: `npm run frontend:build`
- [ ] API health works locally: `npm run docker:health`
- [ ] No secrets committed (`.env` files are gitignored)
- [ ] GitHub repo is public or connected to Vercel/Render

---

## Architecture (production)

```
User browser
    │
    ▼
Vercel CDN  ──HTTPS──►  https://your-app.vercel.app  (Next.js)
    │
    │  REST JSON (NEXT_PUBLIC_API_URL)
    ▼
Render Web Service  ──►  https://snippetsearch-api.onrender.com  (FastAPI)
    │
    ▼
Render PostgreSQL  (snippet_search database)
```

---

## Part 1 — Deploy the backend (Render)

### Step 1: Create a PostgreSQL database

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Settings:
   - **Name:** `snippetsearch-db`
   - **Database:** `snippet_search`
   - **User:** `snippetsearch`
   - **Region:** pick one close to you
   - **Plan:** Free
4. Click **Create Database**
5. Wait until status is **Available**
6. Copy the **Internal Database URL** (used by the API on Render)

### Step 2: Deploy the FastAPI service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `snippetsearch-api` |
| **Region** | Same as database |
| **Branch** | `main` (or your deploy branch) |
| **Root Directory** | *(leave empty — uses repo root)* |
| **Runtime** | **Docker** |
| **Dockerfile Path** | `backend/Dockerfile` |
| **Docker Context** | `backend` |
| **Instance Type** | Free |

4. **Environment variables** — add these in the Render service settings:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Paste the **Internal Database URL** from Step 1 |
| `CORS_ORIGINS` | `https://your-app.vercel.app` *(update after Vercel deploy — see Part 3)* |

For now you can set `CORS_ORIGINS` to `http://localhost:3000` and update it after Vercel gives you a URL.

5. Click **Create Web Service**
6. Wait for the first deploy to finish (5–10 minutes on free tier)

### Step 3: Verify the API

Open in your browser:

```
https://snippetsearch-api.onrender.com/health
```

Expected:

```json
{"status":"ok"}
```

Also open Swagger:

```
https://snippetsearch-api.onrender.com/docs
```

Try `GET /snippets?page=1&limit=5`.

> **Free tier note:** Render spins down idle services. The first request after idle may take 30–60 seconds.

### Step 4: Seed production data

In the Render dashboard → your **Web Service** → **Shell**:

```bash
python seed.py
```

Expected: `Seeded 25 snippets.` or a skip message if already seeded.

Alternatively, from your machine (if the database allows external connections), use the **External Database URL** with a one-off run — the Internal URL only works inside Render.

---

## Part 2 — Deploy the frontend (Vercel)

### Step 1: Import the project

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New…** → **Project**
3. Import your GitHub repository
4. Configure the project:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `frontend` ← **important** |
| **Build Command** | `npm run build` *(default)* |
| **Output Directory** | *(leave default — Next.js)* |
| **Install Command** | `npm install` *(default)* |

### Step 2: Set environment variables

In **Environment Variables**, add:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://snippetsearch-api.onrender.com` | Production, Preview, Development |

Use your actual Render API URL (no trailing slash).

### Step 3: Deploy

1. Click **Deploy**
2. Wait for the build to complete (2–5 minutes)
3. Vercel gives you a URL like `https://snippet-search-abc123.vercel.app`

### Step 4: Verify the frontend

1. Open your Vercel URL
2. Confirm snippet cards load (or empty state if not seeded)
3. Search for `liability` or `contract`
4. Create, edit, and delete a test snippet

---

## Part 3 — Connect frontend and backend

### Update CORS on Render

1. Render Dashboard → **snippetsearch-api** → **Environment**
2. Set `CORS_ORIGINS` to your Vercel URL:

```
https://your-app.vercel.app
```

If you use a custom domain later:

```
https://your-app.vercel.app,https://www.yourdomain.com
```

3. Save — Render redeploys automatically

### Redeploy Vercel (if you changed the API URL)

Vercel → **Deployments** → **Redeploy** (only needed if you changed `NEXT_PUBLIC_API_URL`).

---

## Part 4 — Custom domain (optional)

### Vercel (frontend)

1. Vercel project → **Settings** → **Domains**
2. Add your domain and follow DNS instructions

### Render (backend)

1. Render service → **Settings** → **Custom Domains**
2. Add e.g. `api.yourdomain.com`
3. Update `NEXT_PUBLIC_API_URL` on Vercel to the new API URL
4. Add the new frontend domain to `CORS_ORIGINS` on Render

---

## Alternative: one-click Render Blueprint

This repo includes `render.yaml` at the project root.

1. Render Dashboard → **New +** → **Blueprint**
2. Connect the GitHub repo
3. Render creates the database and API service
4. After deploy, set `CORS_ORIGINS` manually (Blueprint marks it as `sync: false`)
5. Seed via Shell: `python seed.py`
6. Continue with **Part 2** (Vercel) using the Render API URL

---

## Production verification checklist

| # | Test | Expected |
|---|------|----------|
| 1 | `GET /health` on Render | `{"status":"ok"}` |
| 2 | Open Vercel homepage | Snippet list or empty state (not a crash) |
| 3 | Search `liability` | Results from seed data |
| 4 | Create snippet | Appears in list |
| 5 | Edit snippet | Changes saved |
| 6 | Delete snippet | Removed from list |
| 7 | Browser DevTools → Network | API calls go to Render URL, not `localhost` |
| 8 | No CORS errors in console | Requests succeed with 200/201/204 |

---

## Troubleshooting

### Vercel build fails

Run locally first:

```powershell
npm run frontend:build
```

Fix any TypeScript or Next.js errors before redeploying.

### Frontend shows “Failed to load snippets”

1. Confirm Render API is up: open `/health` in the browser
2. Confirm `NEXT_PUBLIC_API_URL` on Vercel matches your Render URL exactly
3. Redeploy Vercel after changing env vars
4. On free Render tier, wait 30–60 s for a cold start

### CORS error in browser console

```
Access to fetch ... has been blocked by CORS policy
```

Fix: add your exact Vercel URL (including `https://`) to `CORS_ORIGINS` on Render, then wait for redeploy.

### Empty list but API has data

Run `python seed.py` in the Render Shell, or create snippets via the UI.

### Database connection errors on Render

1. Use the **Internal Database URL** for `DATABASE_URL` on the web service
2. Ensure database and API are in the same Render region
3. Check Render logs: **snippetsearch-api** → **Logs**

### Render free tier sleeps

First request after idle is slow. Upgrade to a paid plan for always-on, or accept cold starts during demos.

---

## Local vs production

| | Local | Production |
|---|-------|------------|
| Frontend | `http://localhost:3000` | `https://*.vercel.app` |
| API | `http://localhost:8000` | `https://*.onrender.com` |
| Database | Docker PostgreSQL | Render Postgres |
| Config | Local env files (gitignored) | Vercel + Render dashboards |

---

## Security notes (production)

- Never commit `.env` or `.env.local` files
- Set `CORS_ORIGINS` to your real frontend domain only — not `*`
- Use HTTPS URLs everywhere in production config
- Rotate database credentials if they are ever exposed
- This app has no authentication — do not expose sensitive data in snippets on a public deployment

---

## Quick reference

```text
Render API URL:     https://snippetsearch-api.onrender.com
Render health:      https://snippetsearch-api.onrender.com/health
Render Swagger:     https://snippetsearch-api.onrender.com/docs
Vercel frontend:    https://YOUR-PROJECT.vercel.app

Vercel env:         NEXT_PUBLIC_API_URL = Render API URL
Render env:         DATABASE_URL = Internal DB URL
Render env:         CORS_ORIGINS = Vercel URL
```

For local development, see [`README.md`](README.md).
