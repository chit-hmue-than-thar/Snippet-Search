from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import SearchResponse, SearchResultItem

router = APIRouter(tags=["search"])


@router.get("/search", response_model=SearchResponse)
def search_snippets(
    q: str = Query("", description="Keyword to search in title and body"),
    db: Session = Depends(get_db),
):
    query = q.strip()
    snippets = crud.search_snippets(db, query)
    return SearchResponse(
        query=query,
        results=[
            SearchResultItem(
                id=snippet.id,
                title=snippet.title,
                body=snippet.body,
                preview=crud.make_preview(snippet.body),
                tags=snippet.tags or [],
            )
            for snippet in snippets
        ],
    )
