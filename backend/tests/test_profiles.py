from fastapi.testclient import TestClient


def test_create_profile(client: TestClient) -> None:
    response = client.post("/profiles", json={"name": "Max"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Max"
    assert "id" in data
    assert "created_at" in data


def test_list_profiles(client: TestClient) -> None:
    client.post("/profiles", json={"name": "Sis"})
    response = client.get("/profiles")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(p["name"] == "Sis" for p in data)


def test_get_profile_by_id(client: TestClient) -> None:
    create_resp = client.post("/profiles", json={"name": "Test"})
    profile_id = create_resp.json()["id"]

    response = client.get(f"/profiles/{profile_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Test"


def test_get_profile_not_found(client: TestClient) -> None:
    response = client.get("/profiles/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
