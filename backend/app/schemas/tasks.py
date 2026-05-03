from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


TaskStatus = Literal["backlog", "in_progress", "done"]
TaskPriority = Literal["low", "medium", "high", "critical"]


class TaskAssigneeResponse(BaseModel):
    id: str
    full_name: str

    class Config:
        from_attributes = True


class TaskLabelResponse(BaseModel):
    id: str
    name: str
    color: str

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    description: str | None = None
    status: TaskStatus = "backlog"
    priority: TaskPriority = "medium"
    start_date: date | None = None
    end_date: date | None = None
    assignee_ids: list[str] = []
    label_ids: list[str] = []


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    start_date: date | None = None
    end_date: date | None = None
    assignee_ids: list[str] | None = None
    label_ids: list[str] | None = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskResponse(BaseModel):
    id: str
    title: str
    description: str | None
    project_id: str
    creator_id: str
    status: TaskStatus
    priority: TaskPriority
    start_date: date | None
    end_date: date | None
    created_at: datetime
    updated_at: datetime
    assignees: list[TaskAssigneeResponse] = []
    labels: list[TaskLabelResponse] = []

    class Config:
        from_attributes = True