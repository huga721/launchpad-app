from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, _uuid, _now
from .task_labels import task_labels
from .task_assignees import task_assignees


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    project_id: Mapped[str] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    creator_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="backlog")
    # "backlog" | "in_progress" | "done"
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    # "low" | "medium" | "high" | "critical"
    start_date: Mapped[Optional[str]] = mapped_column(Date)
    end_date: Mapped[Optional[str]] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    project: Mapped["Project"] = relationship(back_populates="tasks")
    creator: Mapped["User"] = relationship(
        back_populates="created_tasks", foreign_keys=[creator_id]
    )
    assignees: Mapped[list["User"]] = relationship(
        secondary=task_assignees, back_populates="assigned_tasks"
    )
    labels: Mapped[list["Label"]] = relationship(
        secondary=task_labels, back_populates="tasks"
    )
