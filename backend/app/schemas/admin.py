from typing import Literal

from pydantic import BaseModel, EmailStr


class AdminCreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Literal["admin", "user"] = "user"


class AdminUpdateUserRequest(BaseModel):
    full_name: str | None = None
    role: Literal["admin", "user"] | None = None
    password: str | None = None
