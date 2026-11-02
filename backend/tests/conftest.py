"""
Pytest fixtures using a real Postgres test database.

Run `docker compose up -d db`, then `pip install -r requirements-dev.txt` and `pytest` from backend/.
The suite creates a clean `vida_activa_test` database, loads database/init.sql + seed.sql, points the app at it
and drops it at the end. Override the connection with TEST_DB_HOST/PORT/USER/PASSWORD or TEST_DATABASE_URL.
"""

import os
from pathlib import Path

import psycopg2
import pytest

# SECRET_KEY must exist before importing the app (core/security.py fails at startup without it).
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-prod")

DB_DIR = Path(__file__).resolve().parent.parent / "database"

TEST_DB_NAME = os.getenv("TEST_DB_NAME", "vida_activa_test")
DB_USER = os.getenv("TEST_DB_USER", "vida_activa")
DB_PASSWORD = os.getenv("TEST_DB_PASSWORD", "change_me")
DB_HOST = os.getenv("TEST_DB_HOST", "localhost")
DB_PORT = os.getenv("TEST_DB_PORT", "5432")

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{TEST_DB_NAME}",
)
# The app reads DATABASE_URL when database.py is imported, so point it at the test database first.
os.environ["DATABASE_URL"] = TEST_DATABASE_URL

# Imports must come after the env vars above.
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.database import get_db  # noqa: E402

from tests import seed_data  # noqa: E402


def _admin_dsn() -> str:
    # Connect to the 'postgres' database to create and drop the test database.
    return f"dbname=postgres user={DB_USER} password={DB_PASSWORD} host={DB_HOST} port={DB_PORT}"


def _run_sql_file(conn, path: Path) -> None:
    with open(path, "r", encoding="utf-8") as f:
        sql = f.read()
    with conn.cursor() as cur:
        cur.execute(sql)


@pytest.fixture(scope="session")
def _setup_test_database():
    # Recreate the test database from scratch
    admin_conn = psycopg2.connect(_admin_dsn())
    admin_conn.autocommit = True
    with admin_conn.cursor() as cur:
        cur.execute(f'DROP DATABASE IF EXISTS "{TEST_DB_NAME}"')
        cur.execute(f'CREATE DATABASE "{TEST_DB_NAME}"')
    admin_conn.close()

    # Load the schema (init.sql) and the test data (seed.sql)
    conn = psycopg2.connect(
        f"dbname={TEST_DB_NAME} user={DB_USER} password={DB_PASSWORD} host={DB_HOST} port={DB_PORT}"
    )
    conn.autocommit = True
    _run_sql_file(conn, DB_DIR / "init.sql")
    _run_sql_file(conn, DB_DIR / "seed.sql")
    conn.close()

    yield

    # Cleanup: drop the test database
    admin_conn = psycopg2.connect(_admin_dsn())
    admin_conn.autocommit = True
    with admin_conn.cursor() as cur:
        cur.execute(f'DROP DATABASE IF EXISTS "{TEST_DB_NAME}"')
    admin_conn.close()


@pytest.fixture(scope="session")
def client(_setup_test_database):
    engine = create_engine(TEST_DATABASE_URL)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    engine.dispose()




def _auth_headers(client, email: str, password: str) -> dict:
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, f"login falló para {email}: {r.status_code} {r.text}"
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture
def admin_headers(client):
    return _auth_headers(client, seed_data.ADMIN_EMAIL, seed_data.ADMIN_PASSWORD)


@pytest.fixture
def specialist_headers(client):
    return _auth_headers(client, seed_data.SPECIALIST_EMAIL, seed_data.SPECIALIST_PASSWORD)


@pytest.fixture
def patient_headers(client):
    return _auth_headers(client, seed_data.PATIENT_EMAIL, seed_data.PATIENT_PASSWORD)
