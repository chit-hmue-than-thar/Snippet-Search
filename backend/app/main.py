from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import create_tables
from app.routers import health, search, snippets


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(title="Snippet Search API", lifespan=lifespan)


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {"service": "Snippet Search API", "health": "/health", "docs": "/docs"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(snippets.router)
app.include_router(search.router)
