"""Smoke tests of the patient flow: list, find by RUT and assign a patient to the specialist."""

from tests import seed_data


def test_specialist_lists_patients(client, specialist_headers):
    r = client.get("/api/patients/", headers=specialist_headers)
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list)
    ids = {p["id"] for p in data}
    assert seed_data.PATIENT_PEDRO_ID in ids  # assigned in the seed
    assert seed_data.PATIENT_ANA_ID not in ids  # not assigned yet


def test_patients_pagination_limit(client, specialist_headers):
    r = client.get("/api/patients/?limit=1", headers=specialist_headers)
    assert r.status_code == 200, r.text
    assert len(r.json()) == 1


def test_specialist_lookup_by_rut(client, specialist_headers):
    r = client.get(
        f"/api/patients/by-rut/{seed_data.PATIENT_ANA_RUT}", headers=specialist_headers
    )
    assert r.status_code == 200, r.text
    assert r.json()["rut"] == seed_data.PATIENT_ANA_RUT


def test_lookup_by_rut_not_found_404(client, specialist_headers):
    r = client.get("/api/patients/by-rut/00000000-0", headers=specialist_headers)
    assert r.status_code == 404


def test_specialist_assigns_patient(client, specialist_headers):
    # Ana starts unassigned: the first assignment must work.
    r = client.post(
        "/api/patients/assign",
        json={"rut": seed_data.PATIENT_ANA_RUT},
        headers=specialist_headers,
    )
    assert r.status_code in (200, 201), r.text

    # Assigning her again must return 409 (duplicate guard).
    r = client.post(
        "/api/patients/assign",
        json={"rut": seed_data.PATIENT_ANA_RUT},
        headers=specialist_headers,
    )
    assert r.status_code == 409


def test_dashboard_lists_patients_needing_attention(client, specialist_headers):
    r = client.get("/api/specialists/dashboard", headers=specialist_headers)
    assert r.status_code == 200
    body = r.json()
    assert len(body["attention"]) == body["stats"]["alerts"]
    for item in body["attention"]:
        assert item["full_name"]
        assert item["kind"] in {"pain", "inactive", "no_sessions"}


def test_specialist_lists_only_assigned_patients(client, specialist_headers):
    client.post("/api/patients/assign", json={"rut": seed_data.PATIENT_ANA_RUT}, headers=specialist_headers)
    after = {p["id"] for p in client.get("/api/patients/", headers=specialist_headers).json()}
    assert seed_data.PATIENT_ANA_ID in after


def test_patient_cannot_list_patients(client, patient_headers):
    assert client.get("/api/patients/", headers=patient_headers).status_code == 403


def test_by_rut_withholds_contact_data_until_assigned(client, specialist_headers):
    body = client.get(f"/api/patients/by-rut/{seed_data.PATIENT_ANA_RUT}", headers=specialist_headers).json()
    if not body["assigned"]:
        assert body["email"] == "" and body["phone"] is None and body["address"] is None
        assert body["fullName"]

    client.post("/api/patients/assign", json={"rut": seed_data.PATIENT_ANA_RUT}, headers=specialist_headers)
    body = client.get(f"/api/patients/by-rut/{seed_data.PATIENT_ANA_RUT}", headers=specialist_headers).json()
    assert body["assigned"] is True and body["email"]


def test_patient_list_includes_rut_and_age(client, specialist_headers):
    items = client.get("/api/patients/", headers=specialist_headers).json()
    pedro = next(p for p in items if p["id"] == seed_data.PATIENT_PEDRO_ID)
    assert pedro["rut"] and pedro["age"]


def _new_patient(**overrides):
    body = {
        "fullName": "Rosa Pérez Díaz",
        "email": "rosa.perez@test.com",
        "rut": "15.555.555-5",
        "phone": "+56911112222",
        "age": 70,
        "gender": "Femenino",
    }
    body.update(overrides)
    return body


def test_specialist_creates_patient_and_gets_them_in_the_list(client, specialist_headers):
    r = client.post("/api/patients", json=_new_patient(), headers=specialist_headers)
    assert r.status_code == 201, r.text
    created = r.json()
    assert created["temp_password"] and created["role"] == "PATIENT"

    ids = {p["id"] for p in client.get("/api/patients/", headers=specialist_headers).json()}
    assert created["id"] in ids

    # The patient can log in with the temporary password.
    login = client.post(
        "/api/auth/login", json={"email": "rosa.perez@test.com", "password": created["temp_password"]}
    )
    assert login.status_code == 200, login.text


def test_create_patient_rejects_duplicates(client, specialist_headers):
    client.post("/api/patients", json=_new_patient(email="dup@test.com", rut="16.666.666-6"), headers=specialist_headers)
    same_rut = client.post(
        "/api/patients", json=_new_patient(email="otro@test.com", rut="16666666-6"), headers=specialist_headers
    )
    assert same_rut.status_code == 409
    same_email = client.post(
        "/api/patients", json=_new_patient(email="dup@test.com", rut="17.777.777-7"), headers=specialist_headers
    )
    assert same_email.status_code == 409


def test_patient_cannot_create_patients(client, patient_headers):
    assert client.post("/api/patients", json=_new_patient(), headers=patient_headers).status_code == 403
