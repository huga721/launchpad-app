from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from ..dependencies import CurrentUser, DB
from ..models.comment import Comment
from ..models.project import Project
from ..models.project_member import ProjectMember
from ..models.task import Task
from ..models.user import User
from ..schemas.comments import CommentCreate, CommentResponse, CommentUpdate

router = APIRouter(
    prefix="/projects/{project_id}/tasks/{task_id}/comments",
    tags=["comments"],
)


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
        raise HTTPException(
            status_code=403,
            detail="Only owner or editor can perform this action",
        )


def _require_task(db: DB, project_id: str, task_id: str) -> Task:
    task = db.scalar(
        select(Task).where(
            Task.id == task_id,
            Task.project_id == project_id,
        )
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


def _require_comment(db: DB, task_id: str, comment_id: str) -> Comment:
    comment = db.scalar(
        select(Comment)
        .where(
            Comment.id == comment_id,
            Comment.task_id == task_id,
        )
        .options(joinedload(Comment.author))
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


@router.get("", response_model=list[CommentResponse])
def list_comments(
    project_id: str,
    task_id: str,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    _require_membership(db, project_id, current_user)
    _require_task(db, project_id, task_id)

    return db.scalars(
        select(Comment)
        .where(Comment.task_id == task_id)
        .options(joinedload(Comment.author))
        .order_by(Comment.created_at.asc())
    ).all()


@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    project_id: str,
    task_id: str,
    body: CommentCreate,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    membership = _require_membership(db, project_id, current_user)
    _require_can_edit(membership, current_user)
    _require_task(db, project_id, task_id)

    comment = Comment(
        content=body.content,
        task_id=task_id,
        author_id=current_user.id,
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return _require_comment(db, task_id, comment.id)


@router.patch("/{comment_id}", response_model=CommentResponse)
def update_comment(
    project_id: str,
    task_id: str,
    comment_id: str,
    body: CommentUpdate,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    _require_membership(db, project_id, current_user)
    _require_task(db, project_id, task_id)

    comment = _require_comment(db, task_id, comment_id)

    if current_user.role != "admin" and comment.author_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only comment author or admin can edit this comment",
        )

    comment.content = body.content
    db.commit()

    return _require_comment(db, task_id, comment_id)


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    project_id: str,
    task_id: str,
    comment_id: str,
    db: DB,
    current_user: CurrentUser,
):
    _require_project(db, project_id)
    _require_membership(db, project_id, current_user)
    _require_task(db, project_id, task_id)

    comment = _require_comment(db, task_id, comment_id)

    if current_user.role != "admin" and comment.author_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only comment author or admin can delete this comment",
        )

    db.delete(comment)
    db.commit()
