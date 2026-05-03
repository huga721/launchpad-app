from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, _uuid, _now


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    task_id: Mapped[str] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
    )

    author_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=_now)

    task: Mapped["Task"] = relationship()
    author: Mapped["User"] = relationship()