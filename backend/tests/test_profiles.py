from collections.abc import Generator

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
def _set_sqlite_pragma(dbapi_connection, _connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


Base.metadata.create_all(engine)


def _override_get_db() -> Generator[Session]:
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db

client = TestClient(app)


def test_create_profile() -> None:
    response = client.post("/profiles", json={"name": "Max"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Max"
    assert "id" in data
    assert "created_at" in data


def test_list_profiles() -> None:
    client.post("/profiles", json={"name": "Sis"})
    response = client.get("/profiles")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(p["name"] == "Sis" for p in data)


def test_get_profile_by_id() -> None:
    create_resp = client.post("/profiles", json={"name": "Test"})
    profile_id = create_resp.json()["id"]

    response = client.get(f"/profiles/{profile_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Test"


def test_get_profile_not_found() -> None:
    response = client.get("/profiles/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
