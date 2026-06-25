from sqlalchemy import case, func, or_, select
from sqlalchemy.orm import Session

from app.models import Snippet
from app.schemas import SnippetCreate, SnippetUpdate

PREVIEW_MAX_LEN = 120


def make_preview(body: str, max_len: int = PREVIEW_MAX_LEN) -> str:
    if len(body) <= max_len:
        return body
    return body[:max_len].rstrip() + "..."


def get_snippet(db: Session, snippet_id: int) -> Snippet | None:
    return db.get(Snippet, snippet_id)


def list_snippets(db: Session, page: int, limit: int) -> tuple[list[Snippet], int]:
    total = db.scalar(select(func.count()).select_from(Snippet)) or 0
    offset = (page - 1) * limit
    items = db.scalars(
        select(Snippet)
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
    )
    db.add(snippet)
    db.commit()
    db.refresh(snippet)
    return snippet


def update_snippet(db: Session, snippet: Snippet, snippet_in: SnippetUpdate) -> Snippet:
    snippet.title = snippet_in.title
    snippet.body = snippet_in.body
    snippet.tags = snippet_in.tags
    db.commit()
    db.refresh(snippet)
    return snippet


def delete_snippet(db: Session, snippet: Snippet) -> None:
    db.delete(snippet)
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
        .where(or_(title_match, body_match))
        .order_by(
            case((title_match, 0), else_=1),
            Snippet.created_at.desc(),
        )
    )
    return list(db.scalars(stmt).all())
