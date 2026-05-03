from pydantic import BaseModel, Field


class LabelCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    color: str = Field(default="#6366f1", pattern=r"^#[0-9a-fA-F]{6}$")


class LabelUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")


class LabelResponse(BaseModel):
    id: str
    name: str
    color: str
    project_id: str

    class Config:
        from_attributes = True