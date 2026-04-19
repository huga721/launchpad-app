from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.dependencies import CurrentUser, DB
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User
from app.schemas.projects import (
    AddMemberRequest,
    MemberResponse,
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)

router = APIRouter(prefix="/projects", tags=["projects"])


def _get_membership(db: DB, project_id: str, user_id: str) -> ProjectMember | None:
    return db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    )


def _require_project(db: DB, project_id: str) -> Project:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def _require_membership(db: DB, project_id: str, user_id: str) -> ProjectMember:
    membership = _get_membership(db, project_id, user_id)
    if not membership:
        raise HTTPException(status_code=403, detail="Not a project member")
    return membership


def _require_owner(membership: ProjectMember, current_user: User) -> None:
    if current_user.role != "admin" and membership.role != "owner":
        raise HTTPException(status_code=403, detail="Only owner or admin can perform this action")


@router.get("", response_model=list[ProjectResponse])
def list_projects(db: DB, current_user: CurrentUser):
    memberships = db.scalars(
        select(ProjectMember).where(ProjectMember.user_id == current_user.id)
    ).all()
    project_ids = [m.project_id for m in memberships]
    if not project_ids:
        return []
    return db.scalars(select(Project).where(Project.id.in_(project_ids))).all()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(body: ProjectCreate, db: DB, current_user: CurrentUser):
    project = Project(
        name=body.name,
        description=body.description,
        owner_id=current_user.id,
    )
    db.add(project)
    db.flush()
    db.add(ProjectMember(
        project_id=project.id,
        user_id=current_user.id,
        role="owner",
    ))
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: DB, current_user: CurrentUser):
    project = _require_project(db, project_id)
    _require_membership(db, project_id, current_user.id)
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, body: ProjectUpdate, db: DB, current_user: CurrentUser):
    project = _require_project(db, project_id)
    membership = _require_membership(db, project_id, current_user.id)
    _require_owner(membership, current_user)
    if body.name is not None:
        project.name = body.name
    if body.description is not None:
        project.description = body.description
    db.commit()
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: DB, current_user: CurrentUser):
    project = _require_project(db, project_id)
    membership = _require_membership(db, project_id, current_user.id)
    _require_owner(membership, current_user)
    db.delete(project)
    db.commit()


@router.get("/{project_id}/members", response_model=list[MemberResponse])
def list_members(project_id: str, db: DB, current_user: CurrentUser):
    _require_membership(db, project_id, current_user.id)
    memberships = db.scalars(
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id)
        .options(joinedload(ProjectMember.user))
    ).all()
    return [
        MemberResponse(
            user_id=m.user_id,
            full_name=m.user.full_name,
            email=m.user.email,
            role=m.role,
            joined_at=m.joined_at,
        )
        for m in memberships
    ]


@router.post("/{project_id}/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def add_member(project_id: str, body: AddMemberRequest, db: DB, current_user: CurrentUser):
    _require_project(db, project_id)
    membership = _require_membership(db, project_id, current_user.id)
    _require_owner(membership, current_user)
    target_user = db.get(User, body.user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if _get_membership(db, project_id, body.user_id):
        raise HTTPException(status_code=409, detail="User is already a member")
    new_member = ProjectMember(
        project_id=project_id,
        user_id=body.user_id,
        role=body.role,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return MemberResponse(
        user_id=new_member.user_id,
        full_name=target_user.full_name,
        email=target_user.email,
        role=new_member.role,
        joined_at=new_member.joined_at,
    )


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(project_id: str, user_id: str, db: DB, current_user: CurrentUser):
    membership = _require_membership(db, project_id, current_user.id)
    _require_owner(membership, current_user)
    target = _get_membership(db, project_id, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="Member not found")
    if target.role == "owner":
        owner_count = db.scalar(
            select(func.count()).select_from(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.role == "owner",
            )
        )
        if owner_count <= 1:
            raise HTTPException(status_code=409, detail="Cannot remove the last owner")
    db.delete(target)
    db.commit()
