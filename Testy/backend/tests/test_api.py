from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.database import get_db, init_db
from app.main import app
import app.main as main_module


@pytest.fixture()
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    # Disable startup side-effect that writes to default DB file.
    monkeypatch.setattr(main_module, "ensure_default_admin", lambda: None)

    session_local = init_db(f"sqlite:///{tmp_path / 'test.db'}")

    def override_get_db():
        with session_local() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_health_endpoint_returns_healthy(client: TestClient):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_register_login_and_me_flow(client: TestClient):
    payload = {
        "email": "tester@example.com",
        "password": "super-secret",
        "full_name": "Test User",
    }
    register = client.post("/auth/register", json=payload)
    assert register.status_code == 201
    token = register.json()["access_token"]

    login = client.post(
        "/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    assert login.status_code == 200
    assert login.json()["access_token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == payload["email"]
    assert me.json()["full_name"] == payload["full_name"]
