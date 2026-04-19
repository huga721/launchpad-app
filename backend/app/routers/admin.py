from fastapi import APIRouter, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError

from ..auth.utils import hash_password
from ..dependencies import DB, AdminUser
from ..models.user import User
from ..schemas.admin import AdminCreateUserRequest, AdminUpdateUserRequest
from ..schemas.auth import UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserResponse])
def list_users(db: DB, _: AdminUser, skip: int = 0, limit: int = 100):
    return db.scalars(select(User).order_by(User.created_at).offset(skip).limit(limit)).all()


@router.post("/users", response_model=UserResponse, status_code=201)
def create_user(body: AdminCreateUserRequest, db: DB, _: AdminUser):
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        role=body.role,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        raise HTTPException(400, "Email already registered")
    return user


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: str, body: AdminUpdateUserRequest, db: DB, _: AdminUser):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if body.full_name is not None:
        user.full_name = body.full_name
    if body.role is not None:
        user.role = body.role
    if body.password is not None:
        user.password_hash = hash_password(body.password)
    db.commit()
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: str, db: DB, _: AdminUser):
    result = db.execute(delete(User).where(User.id == user_id))
    if result.rowcount == 0:
        raise HTTPException(404, "User not found")
    db.commit()
