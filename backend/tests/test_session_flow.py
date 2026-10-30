"""Smoke test of the most critical flow: create session → PRE survey → save exercise progress → complete session → POST survey."""

from tests import seed_data


def test_full_session_and_survey_flow(client, patient_headers):
    # 1. Create the session: inserts one session_exercises per routine_exercise and returns their real ids.
    r = client.post(
        "/api/sessions",
        json={
            "patient_id": seed_data.PATIENT_PEDRO_ID,
            "routine_id": seed_data.ROUTINE_ID,
        },
        headers=patient_headers,
    )
    assert r.status_code in (200, 201), r.text
    session = r.json()
    session_id = session["id"]
    session_exercises = session["session_exercises"]
    assert len(session_exercises) >= 1, "POST /api/sessions debe sembrar session_exercises"
    se_id = session_exercises[0]["id"]

    # 2. PRE survey (patient-only, /surveys prefix).
    r = client.post(
        "/surveys/pre",
        json={"session_id": session_id, "pain_level": 3, "fatigue_level": 4, "comments": "ok"},
        headers=patient_headers,
    )
    assert r.status_code in (200, 201), r.text

    # 3. Save exercise progress (real ids from step 1).
    r = client.put(
        f"/api/sessions/{session_id}/exercises/{se_id}",
        json={"series_completed": 1, "reps_completed": 10},
        headers=patient_headers,
    )
    assert r.status_code == 200, r.text
    assert r.json()["reps_completed"] == 10

    # 4. Complete the session.
    r = client.post(f"/api/sessions/{session_id}/complete", headers=patient_headers)
    assert r.status_code in (200, 201), r.text

    # 5. POST survey.
    r = client.post(
        "/surveys/post",
        json={"session_id": session_id, "mood_level": 4, "comments": "listo"},
        headers=patient_headers,
    )
    assert r.status_code in (200, 201), r.text

    # 6. The session is marked as completed.
    r = client.get(f"/api/sessions/{session_id}", headers=patient_headers)
    assert r.status_code == 200, r.text
    assert r.json()["is_completed"] is True


def test_pre_survey_rejects_out_of_range(client, patient_headers):
    # pain_level outside 1-10 -> 422 (pydantic validation).
    r = client.post(
        "/api/sessions",
        json={"patient_id": seed_data.PATIENT_PEDRO_ID, "routine_id": seed_data.ROUTINE_ID},
        headers=patient_headers,
    )
    assert r.status_code in (200, 201), r.text
    session_id = r.json()["id"]

    r = client.post(
        "/surveys/pre",
        json={"session_id": session_id, "pain_level": 99, "fatigue_level": 4},
        headers=patient_headers,
    )
    assert r.status_code == 422
