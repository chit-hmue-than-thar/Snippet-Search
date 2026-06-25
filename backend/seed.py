import json
from pathlib import Path

from sqlalchemy import func, select

from app import crud
from app.database import SessionLocal, create_tables
from app.models import Snippet
from app.schemas import SnippetCreate

SEED_FILE = Path(__file__).parent / "seed_data.json"


def main() -> None:
    create_tables()
    db = SessionLocal()
    try:
        existing = db.scalar(select(func.count()).select_from(Snippet)) or 0
        if existing > 0:
            print(f"Skipped seeding — {existing} snippet(s) already in database.")
            return

        data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
        for item in data:
            crud.create_snippet(db, SnippetCreate(**item))

        print(f"Seeded {len(data)} snippets.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
