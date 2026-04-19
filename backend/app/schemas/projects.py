from typing import Literal
from datetime import datetime
from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str | None
    owner_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MemberResponse(BaseModel):
    user_id: str
    full_name: str
    email: str
    role: Literal["owner", "editor", "viewer"]
    joined_at: datetime

    model_config = {"from_attributes": True}


class AddMemberRequest(BaseModel):
    user_id: str
    role: Literal["owner", "editor", "viewer"] = "editor"


class UpdateMemberRequest(BaseModel):
    role: Literal["owner", "editor", "viewer"]
