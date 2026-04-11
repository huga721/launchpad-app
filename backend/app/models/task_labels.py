from sqlalchemy import Table, Column, String, ForeignKey

from .base import Base

task_labels = Table(
    "task_labels",
    Base.metadata,
    Column(
        "task_id",
        String(36),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "label_id",
        String(36),
        ForeignKey("labels.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)
