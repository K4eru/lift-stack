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
