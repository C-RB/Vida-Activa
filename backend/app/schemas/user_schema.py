from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from app.models.user_model import UserRole

_ROLE_MAP = {
    "patient": UserRole.PATIENT,
    "specialist": UserRole.SPECIALIST,
    "admin": UserRole.ADMIN,
}


def role_from_str(value: str) -> UserRole:
    """Resolve a role from its lowercase key or the enum value itself."""
    normalized = value.strip().lower()
    if normalized in _ROLE_MAP:
        return _ROLE_MAP[normalized]
    return UserRole(value.upper())


class CreateUserRequest(BaseModel):
    fullName: str
    email: EmailStr
    role: str  # accepts 'patient', 'specialist', 'admin' (any case)
    # Optional role-specific fields
    rut: Optional[str] = None
    specialty: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None

    def mapped_role(self) -> UserRole:
        normalized = self.role.strip().lower()
        if normalized in _ROLE_MAP:
            return _ROLE_MAP[normalized]
        try:
            return UserRole(self.role.upper())
        except ValueError:
            raise ValueError(f"Invalid role: {self.role}")

    def split_name(self) -> tuple[str, str]:
        parts = self.fullName.strip().split(" ", 1)
        first = parts[0]
        last = parts[1] if len(parts) > 1 else ""
        return first, last


class UserResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str
    role: UserRole
    temp_password: Optional[str] = None  # returned once at creation

    model_config = {"from_attributes": True}


class UserListItem(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserStatusUpdate(BaseModel):
    is_active: bool
