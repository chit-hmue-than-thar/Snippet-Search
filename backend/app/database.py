from collections.abc import Generator
import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.models import Base


def _connect_args() -> dict:
    url = settings.DATABASE_URL.lower()
    if "sslmode=" in url:
        return {}
    if any(host in url for host in ("neon.tech", "render.com", "supabase.co", "railway.app")):
        return {"sslmode": "require"}
    return {}


def _engine_kwargs() -> dict:
    kwargs: dict = {"connect_args": _connect_args()}
    if os.getenv("VERCEL"):
        kwargs["poolclass"] = NullPool
    return kwargs


engine = create_engine(settings.DATABASE_URL, **_engine_kwargs())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE snippets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ"
            )
        )
        conn.execute(
            text(
                "ALTER TABLE snippets ADD COLUMN IF NOT EXISTS delete_flag BOOLEAN NOT NULL DEFAULT FALSE"
            )
        )


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
