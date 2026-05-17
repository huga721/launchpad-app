from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from ..dependencies import CurrentUser, DB
from ..models.label import Label
from ..models.project import Project
from ..models.project_member import ProjectMember
from ..models.task import Task
from ..models.user import User
from ..schemas.tasks import TaskCreate, TaskResponse, TaskStatusUpdate, TaskUpdate

router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["tasks"])


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


def _require_membership(db: DB, project_id: str, current_user: User) -> ProjectMember | None:
    if current_user.role == "admin":
        return _get_membership(db, project_id, current_user.id)
    membership = _get_membership(db, project_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="Not a project member")
    return membership


def _require_can_edit(membership: ProjectMember | None, current_user: User) -> None:
    if current_user.role == "admin":
        return
    if not membership or membership.role not in ["owner", "editor"]:
        raise HTTPException(status_code=403, detail="Only owner or editor can perform this action")


def _require_task(db: DB, project_id: str, task_id: str) -> Task:
    task = db.scalar(
        select(Task)
        .where(Task.id == task_id, Task.project_id == project_id)
        .options(
            joinedload(Task.assignees),
            joinedload(Task.labels),
        )
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


def _get_project_users(db: DB, project_id: str, user_ids: list[str]) -> list[User]:
    if not user_ids:
        return []

    users = db.scalars(
        select(User)
        .join(ProjectMember, ProjectMember.user_id == User.id)
        .where(
            ProjectMember.project_id == project_id,
            User.id.in_(user_ids),
        )
    ).all()

    if len(users) != len(set(user_ids)):
        raise HTTPException(status_code=400, detail="One or more assignees are not project members")

    return users


def _get_project_labels(db: DB, project_id: str, label_ids: list[str]) -> list[Label]:
    if not label_ids:
        return []

    labels = db.scalars(
        select(Label).where(
            Label.project_id == project_id,
            Label.id.in_(label_ids),
        )
    ).all()

    if len(labels) != len(set(label_ids)):
        raise HTTPException(status_code=400, detail="One or more labels do not belong to this project")

    return labels


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    project_id: str,
    db: DB,
    current_user: CurrentUser,
    status_filter: str | None = None,
    priority: str | None = None,
    assignee_id: str | None = None,
    label_id: str | None = None,
    only_my: bool = False,
):
    _require_project(db, project_id)
    _require_membership(db, project_id, current_user)

    query = (
        select(Task)
        .where(Task.project_id == project_id)
        .options(
            joinedload(Task.assignees),
            joinedload(Task.labels),
        )
        .order_by(Task.created_at.desc())
    )

    if status_filter:
        if status_filter not in ["backlog", "in_progress", "done"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        query = query.where(Task.status == status_filter)

    if priority:
        if priority not in ["low", "medium", "high", "critical"]:
            raise HTTPException(status_code=400, detail="Invalid priority")
        query = query.where(Task.priority == priority)

    if assignee_id:
        query = query.where(Task.assignees.any(User.id == assignee_id))

    if label_id:
        query = query.where(Task.labels.any(Label.id == label_id))

    if only_my:
        query = query.where(Task.assignees.any(User.id == current_user.id))

    return db.scalars(query).unique().all()


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    project_id: str,
    body: TaskCreate,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    membership = _require_membership(db, project_id, current_user)
    _require_can_edit(membership, current_user)

    task = Task(
        title=body.title,
        description=body.description,
        project_id=project_id,
        creator_id=current_user.id,
        status=body.status,
        priority=body.priority,
        start_date=body.start_date,
        end_date=body.end_date,
    )

    task.assignees = _get_project_users(db, project_id, body.assignee_ids)
    task.labels = _get_project_labels(db, project_id, body.label_ids)

    db.add(task)
    db.commit()
    db.refresh(task)

    return _require_task(db, project_id, task.id)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    project_id: str,
    task_id: str,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    _require_membership(db, project_id, current_user)

    return _require_task(db, project_id, task_id)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    project_id: str,
    task_id: str,
    body: TaskUpdate,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    membership = _require_membership(db, project_id, current_user)
    _require_can_edit(membership, current_user)

    task = _require_task(db, project_id, task_id)

    if body.title is not None:
        task.title = body.title
    if body.description is not None:
        task.description = body.description
    if body.status is not None:
        task.status = body.status
    if body.priority is not None:
        task.priority = body.priority
    if body.start_date is not None:
        task.start_date = body.start_date
    if body.end_date is not None:
        task.end_date = body.end_date
    if body.assignee_ids is not None:
        task.assignees = _get_project_users(db, project_id, body.assignee_ids)
    if body.label_ids is not None:
        task.labels = _get_project_labels(db, project_id, body.label_ids)

    db.commit()

    return _require_task(db, project_id, task_id)


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    project_id: str,
    task_id: str,
    body: TaskStatusUpdate,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    membership = _require_membership(db, project_id, current_user)
    _require_can_edit(membership, current_user)

    task = _require_task(db, project_id, task_id)
    task.status = body.status

    db.commit()

    return _require_task(db, project_id, task_id)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    project_id: str,
    task_id: str,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    membership = _require_membership(db, project_id, current_user)
    _require_can_edit(membership, current_user)

    task = _require_task(db, project_id, task_id)

    db.delete(task)
    db.commit()
