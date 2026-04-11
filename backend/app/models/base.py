import uuid
from datetime import datetime

from sqlalchemy.orm import DeclarativeBase


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.utcnow()


class Base(DeclarativeBase):
    pass
