from datetime import datetime

from pydantic import BaseModel, Field, field_validator

TITLE_MAX_LENGTH = 200
TAG_MAX_LENGTH = 100


class SnippetCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=TITLE_MAX_LENGTH,
        description="Snippet title (string, max 200 characters)",
    )
    body: str = Field(
        ...,
        min_length=1,
        description="Snippet body (text, required)",
    )
    tags: list[str] = Field(
        default_factory=list,
        description="List of tag strings",
    )

    @field_validator("title", "body")
    @classmethod
    def strip_whitespace(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("must be a string")
        return value.strip()

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, value: str) -> str:
        if not value:
            raise ValueError("title must not be empty")
        if len(value) > TITLE_MAX_LENGTH:
            raise ValueError(f"title must be at most {TITLE_MAX_LENGTH} characters")
        return value

    @field_validator("body")
    @classmethod
    def body_not_empty(cls, value: str) -> str:
        if not value:
            raise ValueError("body must not be empty")
        return value

    @field_validator("tags", mode="before")
    @classmethod
    def tags_must_be_list(cls, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise ValueError("tags must be a list of strings")
        return value

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: list[str]) -> list[str]:
        cleaned: list[str] = []
        for tag in value:
            if not isinstance(tag, str):
                raise ValueError("each tag must be a string")
            stripped = tag.strip()
            if not stripped:
                continue
            if len(stripped) > TAG_MAX_LENGTH:
                raise ValueError(f"each tag must be at most {TAG_MAX_LENGTH} characters")
            cleaned.append(stripped)
        return cleaned


class SnippetUpdate(SnippetCreate):
    pass


class SnippetResponse(BaseModel):
    id: int
    title: str
    body: str
    tags: list[str]
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class SnippetSummary(BaseModel):
    id: int
    title: str
    body: str
    tags: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedSnippets(BaseModel):
    items: list[SnippetSummary]
    page: int
    limit: int
    total: int


class SearchResultItem(BaseModel):
    id: int
    title: str
    body: str
    preview: str
    tags: list[str]
    created_at: datetime


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]


class HealthResponse(BaseModel):
    status: str
