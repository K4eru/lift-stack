from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Exercise


def _seed_exercises(db: Session) -> None:
    db.query(Exercise).delete()
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
            Exercise(
                id="0025",
                name="Barbell Bench Press",
                category="chest",
                body_part="chest",
                equipment="barbell",
                target="pectorals",
                muscle_group="chest",
                secondary_muscles=["triceps", "shoulders"],
                instructions={"en": "Lie on bench..."},
                instruction_steps={"en": ["Lie on bench...", "Lower bar..."]},
                media_id="EIeI8Vf",
                image="images/0025-EIeI8Vf.jpg",
                gif_url="videos/0025-EIeI8Vf.gif",
            ),
        ]
    )
    db.commit()


def test_list_exercises(client: TestClient, db_session: Session) -> None:
    _seed_exercises(db_session)
    response = client.get("/exercises")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_filter_by_category(client: TestClient, db_session: Session) -> None:
    _seed_exercises(db_session)
    response = client.get("/exercises?category=chest")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Barbell Bench Press"


def test_filter_by_equipment(client: TestClient, db_session: Session) -> None:
    _seed_exercises(db_session)
    response = client.get("/exercises?equipment=body weight")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "3/4 sit-up"


def test_search_by_name(client: TestClient, db_session: Session) -> None:
    _seed_exercises(db_session)
    response = client.get("/exercises?search=bench")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "Bench Press" in data[0]["name"]


def test_get_exercise_by_id(client: TestClient, db_session: Session) -> None:
    _seed_exercises(db_session)
    response = client.get("/exercises/0001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "0001"
    assert data["name"] == "3/4 sit-up"


def test_get_exercise_not_found(client: TestClient) -> None:
    response = client.get("/exercises/9999")
    assert response.status_code == 404


def test_filter_by_target(client: TestClient, db_session: Session) -> None:
    _seed_exercises(db_session)
    response = client.get("/exercises?target=abs")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["target"] == "abs"


def test_filter_by_muscle_group(client: TestClient, db_session: Session) -> None:
    _seed_exercises(db_session)
    response = client.get("/exercises?muscle_group=chest")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Barbell Bench Press"
