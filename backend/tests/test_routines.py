"""A routine is one record with several weekdays; it can be edited in place."""

from datetime import date, timedelta

from tests import seed_data


def _payload(days, slugs=("squat", "toe_touch")):
    today = date.today()
    return {
        "patient_id": seed_data.PATIENT_PEDRO_ID,
        "name": "Rutina de varios días",
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(days=14)).isoformat(),
        "days_of_week": days,
        "scheduled_time": "09:30:00",
        "exercises": [
            {"exercise_id": slug, "order_index": i, "level": 1, "total_series": 2, "total_reps": 8}
            for i, slug in enumerate(slugs)
        ],
    }


def test_create_routine_with_several_days(client, specialist_headers):
    r = client.post("/api/routines", json=_payload([5, 1, 3, 3]), headers=specialist_headers)
    assert r.status_code == 200, r.text
    # Sorted and without duplicates.
    assert r.json()["days_of_week"] == [1, 3, 5]


def test_create_routine_rejects_invalid_days(client, specialist_headers):
    assert client.post("/api/routines", json=_payload([8]), headers=specialist_headers).status_code == 422
    assert client.post("/api/routines", json=_payload([]), headers=specialist_headers).status_code == 422


def test_active_routine_matches_any_of_its_days(client, specialist_headers, patient_headers):
    today = date.today().isoweekday()
    created = client.post("/api/routines", json=_payload([today]), headers=specialist_headers).json()
    r = client.get(
        f"/api/routines/active?patient_id={seed_data.PATIENT_PEDRO_ID}", headers=patient_headers
    )
    assert r.status_code == 200, r.text
    assert r.json()["id"] == created["id"]


def test_update_routine_changes_days_and_exercises(client, specialist_headers):
    created = client.post(
        "/api/routines", json=_payload([1, 2], ("squat", "toe_touch")), headers=specialist_headers
    ).json()

    changed = _payload([4], ("toe_touch", "leg_raise"))
    changed["name"] = "Renombrada"
    r = client.put(f"/api/routines/{created['id']}", json=changed, headers=specialist_headers)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["name"] == "Renombrada"
    assert body["days_of_week"] == [4]
    assert [e["exercise_id"] for e in body["exercises"]] == ["toe_touch", "leg_raise"]


def test_update_unknown_routine_404(client, specialist_headers):
    r = client.put(
        "/api/routines/00000000-0000-0000-0000-000000000000",
        json=_payload([1]),
        headers=specialist_headers,
    )
    assert r.status_code == 404
