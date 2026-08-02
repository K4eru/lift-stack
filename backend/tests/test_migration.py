import json
import tempfile
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.migrate import import_exercises
from app.models import Exercise


def _clear_exercises(db: Session) -> None:
    db.execute(text("PRAGMA foreign_keys = OFF"))
    db.query(Exercise).delete()
    db.commit()
    db.execute(text("PRAGMA foreign_keys = ON"))


def test_import_exercises(db_session: Session) -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        data_path = Path(tmpdir) / "data"
        data_path.mkdir()

        exercises_data = [
            {
                "id": "9999",
                "name": "Test Exercise",
                "category": "test",
                "body_part": "test",
                "equipment": "body weight",
                "target": "test muscle",
                "muscle_group": "test group",
                "secondary_muscles": ["muscle1"],
                "instructions": {"en": "Do this"},
                "instruction_steps": {"en": ["Step 1"]},
                "media_id": "test123",
                "image": "images/test.jpg",
                "gif_url": "videos/test.gif",
            },
        ]

        with open(data_path / "exercises.json", "w") as f:
            json.dump(exercises_data, f)

        _clear_exercises(db_session)

        import_exercises(str(tmpdir), db=db_session)

        count = db_session.query(Exercise).count()
        assert count == 1
        exercise = db_session.query(Exercise).first()
        assert exercise is not None
        assert exercise.id == "9999"
        assert exercise.name == "Test Exercise"


def test_import_exercises_skips_if_present(db_session: Session) -> None:
    _clear_exercises(db_session)
    db_session.add(
        Exercise(
            id="seed",
            name="Seed Exercise",
            category="c",
            body_part="bp",
            equipment="e",
            target="t",
        )
    )
    db_session.commit()

    with tempfile.TemporaryDirectory() as tmpdir:
        data_path = Path(tmpdir) / "data"
        data_path.mkdir()

        exercises_data = [
            {
                "id": "new_ex",
                "name": "New Exercise",
                "category": "c",
                "body_part": "bp",
                "equipment": "e",
                "target": "t",
            },
        ]

        with open(data_path / "exercises.json", "w") as f:
            json.dump(exercises_data, f)

        import_exercises(str(tmpdir), db=db_session)

        new_exercise = (
            db_session.query(Exercise).filter(Exercise.id == "new_ex").first()
        )
        assert new_exercise is None


def test_import_exercises_missing_file(db_session: Session, capsys) -> None:
    _clear_exercises(db_session)

    with tempfile.TemporaryDirectory() as tmpdir:
        import_exercises(str(tmpdir), db=db_session)
        captured = capsys.readouterr()
        assert "not found" in captured.out
