from fastapi.testclient import TestClient


def test_full_workflow(client: TestClient) -> None:
    # 1. Create profile
    profile_resp = client.post("/profiles", json={"name": "Max"})
    assert profile_resp.status_code == 200
    profile_id = profile_resp.json()["id"]

    # 2. List exercises
    exercises_resp = client.get("/exercises")
    assert exercises_resp.status_code == 200
    exercises = exercises_resp.json()
    assert len(exercises) >= 1

    # 3. Create template
    template_resp = client.post(
        "/templates",
        json={
            "name": "My Workout",
            "exercises": [{"exercise_id": "0001", "target_sets": 3, "target_reps": 10}],
        },
    )
    assert template_resp.status_code == 200
    template_id = template_resp.json()["id"]

    # 4. Start workout from template
    workout_resp = client.post(
        "/workouts",
        json={
            "name": "Test Workout",
            "profile_id": profile_id,
            "template_id": template_id,
        },
    )
    assert workout_resp.status_code == 200
    workout_id = workout_resp.json()["id"]

    # 5. Log a set
    set_resp = client.post(
        f"/workouts/{workout_id}/sets",
        json={"exercise_id": "0001", "set_number": 1, "reps": 10, "weight": 0.0},
    )
    assert set_resp.status_code == 200

    # 6. Get workout and verify set
    get_resp = client.get(f"/workouts/{workout_id}")
    assert get_resp.status_code == 200
    assert len(get_resp.json()["sets"]) == 1

    # 7. List workouts
    list_resp = client.get("/workouts")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1
