import os

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/snippet_search"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = _DEFAULT_DATABASE_URL
    CORS_ORIGINS: str = "http://localhost:3000"

    @model_validator(mode="before")
    @classmethod
    def resolve_database_url(cls, data: object) -> object:
        if not isinstance(data, dict):
            return data
        url = data.get("DATABASE_URL")
        if url and url != _DEFAULT_DATABASE_URL:
            return data
        for key in (
            "POSTGRES_URL",
            "DATABASE_URL_UNPOOLED",
            "POSTGRES_URL_NON_POOLING",
        ):
            fallback = data.get(key) or os.getenv(key)
            if fallback:
                data["DATABASE_URL"] = fallback
                break
        return data

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
