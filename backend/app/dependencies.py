from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth.utils import decode_token
from .database import get_db
from .models.user import User

DB = Annotated[Session, Depends(get_db)]

bearer = HTTPBearer()


def get_current_user(
    db: DB,
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> User:
    try:
        user_id = decode_token(credentials.credentials)
    except JWTError:
        raise HTTPException(401, "Invalid token")
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(401, "User not found")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_admin(current_user: CurrentUser) -> User:
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")
    return current_user


AdminUser = Annotated[User, Depends(require_admin)]
