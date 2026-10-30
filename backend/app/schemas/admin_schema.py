from datetime import datetime
from pydantic import BaseModel


# Own profile (GET/PATCH /api/admins/me)


class AdminMeResponse(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str
    job_title: str | None = None
    phone: str | None = None
    is_active: bool
    created_at: datetime | None = None


class AdminMeUpdate(BaseModel):
    # All optional: only the fields present are applied (partial PATCH).
    first_name: str | None = None
    last_name: str | None = None
    job_title: str | None = None
    phone: str | None = None
