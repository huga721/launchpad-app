from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, _uuid, _now
from .task_assignees import task_assignees


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="user")
    # "admin" | "user"  (role values)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    project_members: Mapped[list["ProjectMember"]] = relationship(back_populates="user")
    assigned_tasks: Mapped[list["Task"]] = relationship(
        secondary=task_assignees, back_populates="assignees"
    )
    created_tasks: Mapped[list["Task"]] = relationship(
        back_populates="creator", foreign_keys="Task.creator_id"
    )
