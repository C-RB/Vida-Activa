"""Smoke tests of the patient flow: list, find by RUT and assign a patient to the specialist."""

from tests import seed_data


def test_specialist_lists_patients(client, specialist_headers):
    r = client.get("/api/patients/", headers=specialist_headers)
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 2  # Pedro + Ana como mínimo


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
