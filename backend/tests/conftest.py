from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(Engine, "connect")
def _set_sqlite_pragma(dbapi_connection, _connection_record) -> None:
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


Base.metadata.create_all(engine)

# Seed a test exercise (needed for FK constraints on workout_sets and template_exercises)
from app.models import Exercise

with Session(engine) as seed_db:
    if not seed_db.query(Exercise).filter(Exercise.id == "0001").first():
        seed_db.add(
            Exercise(
                id="0001",
                name="Bench Press",
                category="strength",
                body_part="chest",
                equipment="barbell",
                target="pectorals",
                muscle_group="chest",
            )
        )
        seed_db.commit()


def _override_get_db() -> Generator[Session]:
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture(autouse=True)
def _cleanup_between_tests() -> Generator[None]:
    yield
    from sqlalchemy import text

    from app.models import Exercise

    with Session(engine) as db:
        db.execute(text("PRAGMA foreign_keys = OFF"))
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.execute(text("PRAGMA foreign_keys = ON"))
        # Re-seed the test exercise for FK constraints
        db.add(
            Exercise(
                id="0001",
                name="Bench Press",
                category="strength",
                body_part="chest",
                equipment="barbell",
                target="pectorals",
                muscle_group="chest",
            )
        )
        db.commit()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def db_session() -> Generator[Session]:
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()
