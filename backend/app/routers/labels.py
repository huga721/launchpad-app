from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from ..dependencies import CurrentUser, DB
from ..models.label import Label
from ..models.project import Project
from ..models.project_member import ProjectMember
from ..models.user import User
from ..schemas.labels import LabelCreate, LabelResponse, LabelUpdate

router = APIRouter(prefix="/projects/{project_id}/labels", tags=["labels"])


def _require_project(db: DB, project_id: str) -> Project:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def _get_membership(db: DB, project_id: str, user_id: str) -> ProjectMember | None:
    return db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    )


def _require_membership(db: DB, project_id: str, user_id: str) -> ProjectMember:
    membership = _get_membership(db, project_id, user_id)
    if not membership:
        raise HTTPException(status_code=403, detail="Not a project member")
    return membership


def _require_can_edit(membership: ProjectMember, current_user: User) -> None:
    if current_user.role == "admin":
        return
    if membership.role not in ["owner", "editor"]:
        raise HTTPException(status_code=403, detail="Only owner or editor can perform this action")


def _require_label(db: DB, project_id: str, label_id: str) -> Label:
    label = db.scalar(
        select(Label).where(
            Label.id == label_id,
            Label.project_id == project_id,
        )
    )
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    return label


@router.get("", response_model=list[LabelResponse])
def list_labels(project_id: str, db: DB, current_user: CurrentUser):
    _require_project(db, project_id)
    _require_membership(db, project_id, current_user.id)

    return db.scalars(
        select(Label)
        .where(Label.project_id == project_id)
        .order_by(Label.name)
    ).all()


@router.post("", response_model=LabelResponse, status_code=status.HTTP_201_CREATED)
def create_label(
    project_id: str,
    body: LabelCreate,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    membership = _require_membership(db, project_id, current_user.id)
    _require_can_edit(membership, current_user)

    label = Label(
        name=body.name,
        color=body.color,
        project_id=project_id,
    )

    db.add(label)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Label with this name already exists in this project")

    db.refresh(label)
    return label


@router.get("/{label_id}", response_model=LabelResponse)
def get_label(
    project_id: str,
    label_id: str,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    _require_membership(db, project_id, current_user.id)

    return _require_label(db, project_id, label_id)


@router.patch("/{label_id}", response_model=LabelResponse)
def update_label(
    project_id: str,
    label_id: str,
    body: LabelUpdate,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    membership = _require_membership(db, project_id, current_user.id)
    _require_can_edit(membership, current_user)

    label = _require_label(db, project_id, label_id)

    if body.name is not None:
        label.name = body.name
    if body.color is not None:
        label.color = body.color

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Label with this name already exists in this project")

    db.refresh(label)
    return label


@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_label(
    project_id: str,
    label_id: str,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    membership = _require_membership(db, project_id, current_user.id)
    _require_can_edit(membership, current_user)

    label = _require_label(db, project_id, label_id)

    db.delete(label)
    db.commit()