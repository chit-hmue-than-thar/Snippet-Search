from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import (
    PaginatedSnippets,
    SnippetCreate,
    SnippetResponse,
    SnippetSummary,
    SnippetUpdate,
)

router = APIRouter(prefix="/snippets", tags=["snippets"])


def _get_snippet_or_404(db: Session, snippet_id: int):
    snippet = crud.get_snippet(db, snippet_id)
    if snippet is None:
        raise HTTPException(status_code=404, detail="Snippet not found")
    return snippet


@router.post("", response_model=SnippetResponse, status_code=status.HTTP_201_CREATED)
def create_snippet(snippet_in: SnippetCreate, db: Session = Depends(get_db)):
    return crud.create_snippet(db, snippet_in)


@router.get("", response_model=PaginatedSnippets)
def list_snippets(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = crud.list_snippets(db, page=page, limit=limit)
    return PaginatedSnippets(
        items=[
            SnippetSummary(
                id=item.id,
                title=item.title,
                body=item.body,
                tags=item.tags or [],
                created_at=item.created_at,
            )
            for item in items
        ],
        page=page,
        limit=limit,
        total=total,
    )


@router.get("/{snippet_id}", response_model=SnippetResponse)
def get_snippet(snippet_id: int, db: Session = Depends(get_db)):
    return _get_snippet_or_404(db, snippet_id)


@router.put("/{snippet_id}", response_model=SnippetResponse)
def update_snippet(
    snippet_id: int,
    snippet_in: SnippetUpdate,
    db: Session = Depends(get_db),
):
    snippet = _get_snippet_or_404(db, snippet_id)
    return crud.update_snippet(db, snippet, snippet_in)


@router.delete("/{snippet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_snippet(snippet_id: int, db: Session = Depends(get_db)):
    snippet = _get_snippet_or_404(db, snippet_id)
    crud.delete_snippet(db, snippet)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
