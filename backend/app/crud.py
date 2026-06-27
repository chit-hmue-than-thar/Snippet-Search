from datetime import datetime, timezone

from sqlalchemy import case, func, or_, select
from sqlalchemy.orm import Session

from app.models import Snippet
from app.schemas import SnippetCreate, SnippetUpdate

_ACTIVE = Snippet.delete_flag.is_(False)


def get_snippet(db: Session, snippet_id: int) -> Snippet | None:
    return db.scalar(select(Snippet).where(Snippet.id == snippet_id, _ACTIVE))


def list_snippets(db: Session, page: int, limit: int) -> tuple[list[Snippet], int]:
    total = db.scalar(select(func.count()).select_from(Snippet).where(_ACTIVE)) or 0
    offset = (page - 1) * limit
    items = db.scalars(
        select(Snippet)
        .where(_ACTIVE)
        .order_by(Snippet.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    return list(items), total


def create_snippet(db: Session, snippet_in: SnippetCreate) -> Snippet:
    snippet = Snippet(
        title=snippet_in.title,
        body=snippet_in.body,
        tags=snippet_in.tags,
        delete_flag=False,
    )
    db.add(snippet)
    db.commit()
    db.refresh(snippet)
    return snippet


def update_snippet(db: Session, snippet: Snippet, snippet_in: SnippetUpdate) -> Snippet:
    snippet.title = snippet_in.title
    snippet.body = snippet_in.body
    snippet.tags = snippet_in.tags
    snippet.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(snippet)
    return snippet


def delete_snippet(db: Session, snippet: Snippet) -> None:
    snippet.delete_flag = True
    snippet.updated_at = datetime.now(timezone.utc)
    db.commit()


def search_snippets(db: Session, query: str) -> list[Snippet]:
    q = query.strip()
    if not q:
        return []

    pattern = f"%{q}%"
    title_match = Snippet.title.ilike(pattern)
    body_match = Snippet.body.ilike(pattern)

    stmt = (
        select(Snippet)
        .where(_ACTIVE, or_(title_match, body_match))
        .order_by(
            case((title_match, 0), else_=1),
            Snippet.created_at.desc(),
        )
    )
    return list(db.scalars(stmt).all())
