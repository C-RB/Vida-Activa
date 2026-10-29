"""Smoke test of the exercise catalog (GET /api/exercises), including that the instructions are returned."""

from tests import seed_data


def test_list_exercises(client, patient_headers):
    r = client.get("/api/exercises", headers=patient_headers)
    assert r.status_code == 200, r.text
    data = r.json()
    ids = {e["id"] for e in data}
    assert seed_data.EXERCISE_SLUGS <= ids


def test_exercises_include_instructions(client, patient_headers):
    r = client.get("/api/exercises", headers=patient_headers)
    assert r.status_code == 200, r.text
    toe = next(e for e in r.json() if e["id"] == "toe_touch")
    assert toe["instructions"]
    # Neutral Spanish (tuteo, not voseo): checks the seed.sql fix.
    assert "Inclínate" in toe["instructions"]
    assert "Mantené" not in toe["instructions"]


def test_exercises_requires_auth(client):
    r = client.get("/api/exercises")
    assert r.status_code in (401, 403)
