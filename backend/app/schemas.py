from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class SnippetCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1)
    tags: list[str] = Field(default_factory=list)

    @field_validator("title", "body")
    @classmethod
    def strip_whitespace(cls, value: str) -> str:
        return value.strip()

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, value: str) -> str:
        if not value:
            raise ValueError("title must not be empty")
        return value


class SnippetUpdate(SnippetCreate):
    pass


class SnippetResponse(BaseModel):
    id: int
    title: str
    body: str
    tags: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class SnippetSummary(BaseModel):
    id: int
    title: str
    tags: list[str]

    model_config = {"from_attributes": True}


class PaginatedSnippets(BaseModel):
    items: list[SnippetSummary]
    page: int
    limit: int
    total: int


class SearchResultItem(BaseModel):
    id: int
    title: str
    preview: str
    tags: list[str]


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]


class HealthResponse(BaseModel):
    status: str
