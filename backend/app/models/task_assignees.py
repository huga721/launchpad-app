from sqlalchemy import Table, Column, String, ForeignKey

from .base import Base

task_assignees = Table(
    "task_assignees",
    Base.metadata,
    Column(
        "task_id",
        String(36),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "user_id",
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)
