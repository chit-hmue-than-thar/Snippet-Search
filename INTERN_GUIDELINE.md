# Intern Coding Challenge — Snippet Search

> Thanks for your interest! This challenge is a small full-stack app built on the stack our team uses. We care most about **working code you understand** — not about you finishing every single feature.
> 

**You have 1 week** from the day you start. Plan for roughly **8–12 hours** of work — please don't burn your whole week on it.

<aside>
💡

Challenge Deadline : 

**Sunday, 28 June 2026,** 

**16:00 CEST (UTC+2) / 21:30 Myanmar time (MMT)** 

</aside>

## 💻 The stack (please use this)

- **Backend:** Python + FastAPI
- **Database:** PostgreSQL
- **Frontend:** Next.js

# 🧑🏻‍💻 What to build

A small **"Snippet Search"** app. A *snippet* is a short piece of text with a **title**, a **body**, and **tags** (e.g. a note or a reference entry). Users should be able to save snippets and search through them.

### Backend (FastAPI + PostgreSQL) — required

Build an API that can:

- **Create** a snippet (title, body, tags)
- **List** snippets, with simple pagination (e.g. page / limit)
- **Get** one snippet by its id (return `404` if it doesn't exist)
- **Update** a snippet
- **Delete** a snippet
- **Search** snippets by keyword — `GET /search?q=...` — matching title and body
- A **`/health`** endpoint returning `{ "status": "ok" }`

Use *Pydantic* for validation and correct status codes (`201` on create, `404` when not found, etc.).

### Frontend (Next.js) — required

- A **search page**: a search box and a list of results (title + short preview + tags)
- A **detail view** for a single snippet
- A **form** to create (and ideally edit) a snippet
- Visible **loading and error states** so the screen is never just blank

The UI doesn't need to look fancy — clean and usable is all we want.

### 📦 Examples to guide you

These show the *shape* of what we expect. Field names and exact formatting are up to you — treat them as a guide, not a strict spec. Just keep things sensible and document your choices in your README.

**A snippet looks like this**

```json
{
  "id": 1,
  "title": "Force majeure clause",
  "body": "Neither party shall be liable for failure to perform due to events beyond its reasonable control...",
  "tags": ["contract", "clause"],
  "created_at": "2026-06-22T10:30:00Z"
}
```

**Create a snippet — `POST /snippets`**

Request body:

```json
{
  "title": "Force majeure clause",
  "body": "Neither party shall be liable...",
  "tags": ["contract", "clause"]
}
```

Response — **`201 Created`** — returns the created snippet, now with its `id`.

**List with pagination — `GET /snippets?page=1&limit=10`**

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

**Get one — `GET /snippets/1`**

Returns the full snippet. If the id doesn't exist → **`404 Not Found`**:

```json
{ "detail": "Snippet not found" }
```

**Search — `GET /search?q=force`**

Returns snippets whose title or body matches the keyword:

```json
{
  "query": "force",
  "results": [
    {
      "id": 1,
      "title": "Force majeure clause",
      "preview": "Neither party shall be liable for failure to perform due to..."
    }
  ]
}
```

**Health — `GET /health`**

```json
{ "status": "ok" }
```

> 💡 Tip: a clear, well-organized API like the above — with correct status codes and a tidy response shape — is exactly what we're looking for.
> 

---

## 🗂️ Sample data

To save you time inventing test data — and so search has something real to run against — here is a small sample set of ~25 snippets. **Using it is optional:** you may load this data, write your own seed script, or just create snippets by hand through your API. If you do use it, a simple seed script that loads these into your database is a nice touch.

- 📄 sample seed data (JSON — click to expand and copy)
    
    ```json
    [
      { "title": "Force Majeure Clause", "body": "Neither party shall be liable for any failure or delay in performance caused by events beyond its reasonable control, including acts of God, war, fire, flood, or government action.", "tags": ["contract", "clause", "liability"] },
      { "title": "Confidentiality Obligation", "body": "Each party agrees to keep confidential all non-public information disclosed by the other party and to use it solely for the purposes of this agreement.", "tags": ["contract", "nda", "privacy"] },
      { "title": "Indemnification", "body": "The contractor shall indemnify and hold harmless the client against any claims, damages, or losses arising from the contractor's negligence or breach of this agreement.", "tags": ["contract", "clause", "liability"] },
      { "title": "Governing Law", "body": "This agreement shall be governed by and construed in accordance with the laws of the jurisdiction in which the company is registered.", "tags": ["contract", "jurisdiction"] },
      { "title": "Termination for Convenience", "body": "Either party may terminate this agreement without cause by providing thirty days' written notice to the other party.", "tags": ["contract", "termination"] },
      { "title": "Termination for Cause", "body": "A party may terminate this agreement immediately if the other party commits a material breach and fails to cure it within fifteen days of written notice.", "tags": ["contract", "termination", "breach"] },
      { "title": "Limitation of Liability", "body": "In no event shall either party be liable for indirect, incidental, or consequential damages, even if advised of the possibility of such damages.", "tags": ["contract", "clause", "liability"] },
      { "title": "Intellectual Property Assignment", "body": "All work product created under this agreement shall be the exclusive property of the client, and the contractor hereby assigns all rights, title, and interest therein.", "tags": ["contract", "ip", "ownership"] },
      { "title": "Non-Compete Covenant", "body": "During the term and for twelve months thereafter, the employee shall not engage in any business that directly competes with the employer within the defined territory.", "tags": ["employment", "clause", "restraint"] },
      { "title": "Severability", "body": "If any provision of this agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.", "tags": ["contract", "boilerplate"] },
      { "title": "Entire Agreement", "body": "This document constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements, whether written or oral.", "tags": ["contract", "boilerplate"] },
      { "title": "Arbitration Clause", "body": "Any dispute arising out of or relating to this agreement shall be finally resolved by binding arbitration rather than in court.", "tags": ["contract", "dispute", "arbitration"] },
      { "title": "Data Protection and GDPR Compliance", "body": "The processor shall implement appropriate technical and organisational measures to protect personal data in accordance with applicable data protection law.", "tags": ["privacy", "compliance", "data"] },
      { "title": "Payment Terms", "body": "Invoices are payable within thirty days of receipt. Late payments may accrue interest at the rate of 1.5 percent per month on the outstanding balance.", "tags": ["contract", "payment", "finance"] },
      { "title": "Warranty Disclaimer", "body": "The software is provided as is, without warranty of any kind, and the provider disclaims all liability for fitness for a particular purpose.", "tags": ["contract", "warranty", "liability"] },
      { "title": "Assignment of Agreement", "body": "Neither party may assign its rights or obligations under this agreement without the prior written consent of the other party.", "tags": ["contract", "boilerplate"] },
      { "title": "Notice Provision", "body": "All notices under this agreement must be in writing and delivered by hand, registered mail, or email to the addresses specified by the parties.", "tags": ["contract", "boilerplate", "notice"] },
      { "title": "Dispute Resolution and Escalation", "body": "The parties shall first attempt to resolve any dispute through good-faith negotiation before pursuing arbitration or litigation.", "tags": ["contract", "dispute"] },
      { "title": "Liquidated Damages", "body": "In the event of late delivery, the supplier shall pay liquidated damages of one percent of the contract value per week of delay, capped at ten percent.", "tags": ["contract", "damages", "finance"] },
      { "title": "Power of Attorney", "body": "The principal grants the agent authority to act on the principal's behalf in all matters relating to the management of the specified property.", "tags": ["instrument", "authority"] },
      { "title": "Statute of Limitations", "body": "A claim for breach of contract must generally be brought within the limitation period prescribed by the governing jurisdiction, after which the claim is time-barred.", "tags": ["procedure", "litigation"] },
      { "title": "Burden of Proof", "body": "In civil proceedings, the party asserting a claim bears the burden of proving it on the balance of probabilities.", "tags": ["procedure", "evidence", "litigation"] },
      { "title": "The Hearsay Rule", "body": "An out-of-court statement offered to prove the truth of the matter asserted is generally inadmissible as evidence, subject to recognised exceptions.", "tags": ["evidence", "litigation"] },
      { "title": "Due Process Guarantee", "body": "No person shall be deprived of life, liberty, or property without fair legal procedure and an opportunity to be heard.", "tags": ["constitutional", "rights"] },
      { "title": "Specific Performance Remedy", "body": "Where monetary damages are inadequate, a court may order specific performance compelling a party to fulfil its contractual obligations.", "tags": ["remedy", "contract", "litigation"] }
    ]
    ```
    

> 💡 Try searching this data for words like `liability`, `termination`, or `dispute` — notice some terms appear in several snippets, and some only in the body, not the title. Good search should handle both.
> 

---

## Nice-to-haves (optional — these help you stand out)

Pick any that interest you; you don't need them:

- Ranked / full-text search using PostgreSQL's full-text search instead of a plain match
- A few tests
- Highlighting the matched words in search results
- A simple Docker / docker-compose setup
- A seed script with sample data

## ⚠️ Rules ⚠️

- **Commit your work in small steps** using git. We look at your commit history — it tells us how you work. (One single giant commit at the end is a red flag.)
- **Using AI tools is allowed and encouraged** — we're an AI company and we use them too. But you must **understand everything you submit.** If you reach the interview, we'll ask you to explain and change your own code live.

---

# How to submit

1. When you're done, send us **one of these**:
    - a **`.zip`** of your whole project, **or**
    - a **Google Drive link** to your project folder

Send it to **`hello@etverdict.com`** before your deadline.

1. Your submission must include:
    1. All your code (backend + frontend)
    2. **A README** in your project explaining how to set it up and run it (commands, and a sample `.env`), plus anything we need to know to run it on our machine
    3. **A `NOTES.md`** (short — half a page is fine) covering: the main decisions you made and why, what you'd improve with more time, and how you used AI tools
    4. **Please keep your git history** — include the `.git` folder in the zip (don't delete it), or instead just send a link to your own public GitHub repo

> 💡 **Optional but recommended:** a **2–4 minute screen recording** (e.g. Loom) demoing the app and briefly walking through your code. It's the fastest way for us to see how you think, and it helps your application a lot.
> 

---

# What happens next

We review every submission **by hand** against the instructions you provide. Selected candidates are invited to a short interview where we'll talk through your code together.

**Questions about scope?** Email us at `hello@etverdict.com`.

Good luck — we're excited to see what you build! 🚀