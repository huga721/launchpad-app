from datetime import datetime

from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    content: str = Field(min_length=1)


class CommentUpdate(BaseModel):
    content: str = Field(min_length=1)


class CommentAuthorResponse(BaseModel):
    id: str
    full_name: str

    class Config:
        from_attributes = True


class CommentResponse(BaseModel):
    id: str
    content: str
    task_id: str
    author_id: str
    created_at: datetime
    updated_at: datetime | None
    author: CommentAuthorResponse

    class Config:
        from_attributes = True