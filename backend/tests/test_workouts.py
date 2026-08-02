from datetime import UTC, datetime

from fastapi.testclient import TestClient


def test_start_workout(client: TestClient) -> None:
    profile_resp = client.post("/profiles", json={"name": "Test User"})
    profile_id = profile_resp.json()["id"]

    response = client.post(
        "/workouts",
        json={"name": "Test Workout", "profile_id": profile_id},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Workout"
    assert data["profile_id"] == profile_id
    assert data["completed_at"] is None
    assert "id" in data
    assert "started_at" in data


def test_start_workout_with_template(client: TestClient) -> None:
    profile_resp = client.post("/profiles", json={"name": "Test User"})
    profile_id = profile_resp.json()["id"]

    template_resp = client.post(
        "/templates",
        json={
            "name": "Test Template",
            "exercises": [{"exercise_id": "0001", "target_sets": 3, "target_reps": 10}],
        },
    )
    template_id = template_resp.json()["id"]

    response = client.post(
        "/workouts",
        json={
            "name": "Template Workout",
            "profile_id": profile_id,
            "template_id": template_id,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["template_id"] == template_id


def test_add_set_to_workout(client: TestClient) -> None:
    profile_resp = client.post("/profiles", json={"name": "Test User"})
    profile_id = profile_resp.json()["id"]

    workout_resp = client.post(
        "/workouts",
        json={"name": "Test Workout", "profile_id": profile_id},
    )
    workout_id = workout_resp.json()["id"]

    set_data = {
        "exercise_id": "0001",
        "set_number": 1,
        "reps": 10,
        "weight": 50.0,
    }
    response = client.post(f"/workouts/{workout_id}/sets", json=set_data)
    assert response.status_code == 200
    data = response.json()
    assert data["reps"] == 10
    assert data["weight"] == 50.0
    assert data["set_number"] == 1
    assert "completed_at" in data


def test_add_set_optional_fields(client: TestClient) -> None:
    profile_resp = client.post("/profiles", json={"name": "Test User"})
    profile_id = profile_resp.json()["id"]

    workout_resp = client.post(
        "/workouts",
        json={"name": "Test Workout", "profile_id": profile_id},
    )
    workout_id = workout_resp.json()["id"]

    set_data = {
        "exercise_id": "0001",
        "set_number": 1,
        "reps": 30,
        "duration_seconds": 60,
        "rest_seconds": 90,
        "notes": "Felt easy",
    }
    response = client.post(f"/workouts/{workout_id}/sets", json=set_data)
    assert response.status_code == 200
    data = response.json()
    assert data["duration_seconds"] == 60
    assert data["rest_seconds"] == 90
    assert data["notes"] == "Felt easy"


def test_add_set_workout_not_found(client: TestClient) -> None:
    set_data = {
        "exercise_id": "0001",
        "set_number": 1,
        "reps": 10,
        "weight": 50.0,
    }
    response = client.post(
        "/workouts/00000000-0000-0000-0000-000000000000/sets",
        json=set_data,
    )
    assert response.status_code == 404


def test_list_workouts(client: TestClient) -> None:
    response = client.get("/workouts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_list_workouts_with_profile_filter(client: TestClient) -> None:
    profile_resp = client.post("/profiles", json={"name": "Test User"})
    profile_id = profile_resp.json()["id"]

    client.post(
        "/workouts",
        json={"name": "Workout 1", "profile_id": profile_id},
    )
    client.post(
        "/workouts",
        json={"name": "Workout 2", "profile_id": profile_id},
    )

    response = client.get(f"/workouts?profile_id={profile_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_list_workouts_pagination(client: TestClient) -> None:
    profile_resp = client.post("/profiles", json={"name": "Test User"})
    profile_id = profile_resp.json()["id"]

    for i in range(3):
        client.post(
            "/workouts",
            json={"name": f"Workout {i}", "profile_id": profile_id},
        )

    response = client.get(f"/workouts?profile_id={profile_id}&limit=2&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_get_workout(client: TestClient) -> None:
    profile_resp = client.post("/profiles", json={"name": "Test User"})
    profile_id = profile_resp.json()["id"]

    workout_resp = client.post(
        "/workouts",
        json={"name": "Test Workout", "profile_id": profile_id},
    )
    workout_id = workout_resp.json()["id"]

    response = client.get(f"/workouts/{workout_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Workout"
    assert data["id"] == workout_id


def test_get_workout_not_found(client: TestClient) -> None:
    response = client.get("/workouts/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_get_workout_with_sets(client: TestClient) -> None:
    profile_resp = client.post("/profiles", json={"name": "Test User"})
    profile_id = profile_resp.json()["id"]

    workout_resp = client.post(
        "/workouts",
        json={"name": "Test Workout", "profile_id": profile_id},
    )
    workout_id = workout_resp.json()["id"]

    client.post(
        f"/workouts/{workout_id}/sets",
        json={"exercise_id": "0001", "set_number": 1, "reps": 10, "weight": 50.0},
    )
    client.post(
        f"/workouts/{workout_id}/sets",
        json={"exercise_id": "0001", "set_number": 2, "reps": 8, "weight": 55.0},
    )

    response = client.get(f"/workouts/{workout_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["sets"]) == 2


def test_update_workout(client: TestClient) -> None:
    profile_resp = client.post("/profiles", json={"name": "Test User"})
    profile_id = profile_resp.json()["id"]

    workout_resp = client.post(
        "/workouts",
        json={"name": "Test Workout", "profile_id": profile_id},
    )
    workout_id = workout_resp.json()["id"]

    completed_at = datetime.now(UTC).isoformat()
    response = client.put(
        f"/workouts/{workout_id}",
        json={"completed_at": completed_at, "notes": "Great session"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["completed_at"] is not None
    assert data["notes"] == "Great session"


def test_update_workout_partial(client: TestClient) -> None:
    profile_resp = client.post("/profiles", json={"name": "Test User"})
    profile_id = profile_resp.json()["id"]

    workout_resp = client.post(
        "/workouts",
        json={"name": "Test Workout", "profile_id": profile_id},
    )
    workout_id = workout_resp.json()["id"]

    response = client.put(
        f"/workouts/{workout_id}",
        json={"notes": "Just notes"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["notes"] == "Just notes"
    assert data["completed_at"] is None


def test_update_workout_not_found(client: TestClient) -> None:
    response = client.put(
        "/workouts/00000000-0000-0000-0000-000000000000",
        json={"notes": "test"},
    )
    assert response.status_code == 404
