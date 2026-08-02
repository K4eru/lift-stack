from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models import (
    Exercise,
    Workout,
    WorkoutSet,
    WorkoutTemplate,
    WorkoutTemplateExercise,
)


def _clear_all(db: Session) -> None:
    db.execute(text("PRAGMA foreign_keys = OFF"))
    db.query(WorkoutSet).delete()
    db.query(Workout).delete()
    db.query(WorkoutTemplateExercise).delete()
    db.query(WorkoutTemplate).delete()
    db.query(Exercise).delete()
    db.commit()
    db.execute(text("PRAGMA foreign_keys = ON"))


def _seed_exercise(db: Session) -> None:
    _clear_all(db)
    db.add_all(
        [
            Exercise(
                id="0001",
                name="3/4 sit-up",
                category="waist",
                body_part="waist",
                equipment="body weight",
                target="abs",
                muscle_group="hip flexors",
                secondary_muscles=["hip flexors", "lower back"],
                instructions={"en": "Lie flat..."},
                instruction_steps={"en": ["Lie flat...", "Lift up..."]},
                media_id="2gPfomN",
                image="images/0001-2gPfomN.jpg",
                gif_url="videos/0001-2gPfomN.gif",
            ),
        ]
    )
    db.commit()


def test_list_templates_empty(client: TestClient, db_session: Session) -> None:
    _clear_all(db_session)
    response = client.get("/templates")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_list_templates(client: TestClient, db_session: Session) -> None:
    _seed_exercise(db_session)
    template_data = {
        "name": "Test Template",
        "description": "Test description",
        "exercises": [{"exercise_id": "0001", "target_sets": 3, "target_reps": 10}],
    }
    response = client.post("/templates", json=template_data)
    assert response.status_code == 200

    response = client.get("/templates")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Template"
    assert data[0]["is_system"] is False


def test_list_templates_filter_is_system(
    client: TestClient, db_session: Session
) -> None:
    _seed_exercise(db_session)
    template_data = {
        "name": "User Template",
        "exercises": [],
    }
    response = client.post("/templates", json=template_data)
    assert response.status_code == 200

    response = client.get("/templates?is_system=false")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    response = client.get("/templates?is_system=true")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


def test_create_template(client: TestClient, db_session: Session) -> None:
    _seed_exercise(db_session)
    template_data = {
        "name": "Test Template",
        "description": "Test description",
        "exercises": [{"exercise_id": "0001", "target_sets": 3, "target_reps": 10}],
    }
    response = client.post("/templates", json=template_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Template"
    assert len(data["exercises"]) == 1
    assert data["is_system"] is False
    assert data["exercises"][0]["exercise_id"] == "0001"
    assert data["exercises"][0]["target_sets"] == 3
    assert data["exercises"][0]["target_reps"] == 10


def test_create_template_with_optional_fields(
    client: TestClient, db_session: Session
) -> None:
    _seed_exercise(db_session)
    template_data = {
        "name": "Minimal Template",
        "exercises": [{"exercise_id": "0001"}],
    }
    response = client.post("/templates", json=template_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Minimal Template"
    assert data["description"] is None
    assert data["exercises"][0]["target_sets"] is None


def test_get_template_by_id(client: TestClient, db_session: Session) -> None:
    _seed_exercise(db_session)
    template_data = {
        "name": "Fetch Me",
        "exercises": [{"exercise_id": "0001", "target_sets": 4, "target_reps": 12}],
    }
    response = client.post("/templates", json=template_data)
    assert response.status_code == 200
    template_id = response.json()["id"]

    response = client.get(f"/templates/{template_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Fetch Me"
    assert len(data["exercises"]) == 1


def test_get_template_not_found(client: TestClient) -> None:
    response = client.get(f"/templates/{uuid4()}")
    assert response.status_code == 404


def test_exercise_order_preserved(client: TestClient, db_session: Session) -> None:
    _seed_exercise(db_session)
    template_data = {
        "name": "Order Test",
        "exercises": [
            {"exercise_id": "0001", "target_sets": 1},
        ],
    }
    response = client.post("/templates", json=template_data)
    assert response.status_code == 200
    data = response.json()
    assert data["exercises"][0]["order"] == 0
