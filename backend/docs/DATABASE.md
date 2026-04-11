# Database

SQLite via SQLAlchemy 2.x. No migrations — `drop & recreate` on schema changes.

## Tables

### `users`
App users. `role` is either `admin` or `user`.

| column | type | notes |
|---|---|---|
| id | string (uuid) | PK |
| email | string | unique |
| password_hash | string | |
| full_name | string | |
| role | string | `admin` / `user` |
| created_at | datetime | |

---

### `projects`
Top-level containers for tasks.

| column | type | notes |
|---|---|---|
| id | string (uuid) | PK |
| name | string | |
| description | text | nullable |
| owner_id | string | FK → users |
| created_at | datetime | |

---

### `project_members`
Who has access to a project and with what role.

| column | type | notes |
|---|---|---|
| id | string (uuid) | PK |
| project_id | string | FK → projects (cascade delete) |
| user_id | string | FK → users (cascade delete) |
| role | string | `owner` / `editor` / `viewer` |
| joined_at | datetime | |

Unique constraint: `(project_id, user_id)`.

---

### `tasks`
The main unit of work. Belongs to a project.

| column | type | notes |
|---|---|---|
| id | string (uuid) | PK |
| title | string | |
| description | text | nullable |
| project_id | string | FK → projects (cascade delete) |
| creator_id | string | FK → users |
| status | string | `backlog` / `in_progress` / `done` |
| priority | string | `low` / `medium` / `high` / `critical` |
| start_date | date | nullable |
| end_date | date | nullable |
| created_at | datetime | |
| updated_at | datetime | auto-updated on change |

---

### `labels`
Tags that can be attached to tasks. Scoped per project.

| column | type | notes |
|---|---|---|
| id | string (uuid) | PK |
| name | string | |
| color | string | hex, e.g. `#ef4444` |
| project_id | string | FK → projects (cascade delete) |

Unique constraint: `(project_id, name)`.

---

### `task_labels` *(association)*
Many-to-many between tasks and labels.

| column | type |
|---|---|
| task_id | FK → tasks (cascade delete) |
| label_id | FK → labels (cascade delete) |

---

### `task_assignees` *(association)*
Many-to-many between tasks and users (a task can have multiple assignees).

| column | type |
|---|---|
| task_id | FK → tasks (cascade delete) |
| user_id | FK → users (cascade delete) |

---

## Seed data

Run `python -m app.database` to populate the DB with sample data:
- 5 users (1 admin, 4 regular)
- 3 projects with members
- ~20 tasks spread across statuses and priorities
- labels and assignees attached

> ERD to be added.
