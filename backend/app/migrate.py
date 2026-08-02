import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.database import Base, _get_engine, _get_session_factory
from app.models import Exercise


def import_exercises(media_path: str, db: Session | None = None) -> None:
    """Import exercises from exercises.json into database. Skips if already imported."""
    owns_db = db is None
    if owns_db:
        Base.metadata.create_all(bind=_get_engine())
        db = _get_session_factory()()

    if db.query(Exercise).count() > 0:
        print("Exercises already imported, skipping...")
        if owns_db:
            db.close()
        return

    data_file = Path(media_path) / "data" / "exercises.json"
    if not data_file.exists():
        print(f"Error: {data_file} not found")
        if owns_db:
            db.close()
        return

    with open(data_file, "r", encoding="utf-8") as f:
        exercises_data = json.load(f)

    for ex_data in exercises_data:
        exercise = Exercise(
            id=ex_data["id"],
            name=ex_data["name"],
            category=ex_data["category"],
            body_part=ex_data["body_part"],
            equipment=ex_data["equipment"],
            target=ex_data["target"],
            muscle_group=ex_data.get("muscle_group"),
            secondary_muscles=ex_data.get("secondary_muscles"),
            instructions=ex_data.get("instructions"),
            instruction_steps=ex_data.get("instruction_steps"),
            media_id=ex_data.get("media_id"),
            image=ex_data.get("image"),
            gif_url=ex_data.get("gif_url"),
        )
        db.add(exercise)

    db.commit()
    print(f"Imported {len(exercises_data)} exercises")
    if owns_db:
        db.close()


if __name__ == "__main__":
    from app.config import settings

    import_exercises(settings.media_path)
