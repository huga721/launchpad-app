import hashlib
import os

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from .models import Base, User, Project, ProjectMember, Task, Label


def init_db(url: str = "sqlite:///launchpad.db") -> sessionmaker:
    echo = os.getenv("SQL_ECHO", "false").lower() == "true"
    engine = create_engine(url, echo=echo)

    @event.listens_for(engine, "connect")
    def _pragmas(conn, _):
        conn.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine, expire_on_commit=False)


def seed(session):

    def fake_hash(p):
        return "pbkdf2:" + hashlib.sha256(p.encode()).hexdigest()

    # Users
    admin = User(
        email="john@example.com",
        password_hash=fake_hash("admin123"),
        full_name="John Smith",
        role="admin",
    )
    u1 = User(
        email="lisa@example.com",
        password_hash=fake_hash("pass123"),
        full_name="Lisa Brown",
    )
    u2 = User(
        email="chris@example.com",
        password_hash=fake_hash("pass123"),
        full_name="Chris Evans",
    )
    u3 = User(
        email="sara@example.com",
        password_hash=fake_hash("pass123"),
        full_name="Sara Wilson",
    )
    u4 = User(
        email="mike@example.com",
        password_hash=fake_hash("pass123"),
        full_name="Mike Taylor",
    )
    session.add_all([admin, u1, u2, u3, u4])
    session.flush()

    # Projects
    store = Project(
        name="Online Store", description="Redesign the store.", owner_id=admin.id
    )
    app = Project(name="Mobile App", description="New mobile app.", owner_id=u1.id)
    blog = Project(
        name="Company Blog", description="New blog for the company.", owner_id=admin.id
    )
    session.add_all([store, app, blog])
    session.flush()

    session.add_all(
        [
            # Store
            ProjectMember(project_id=store.id, user_id=admin.id, role="owner"),
            ProjectMember(project_id=store.id, user_id=u1.id, role="editor"),
            ProjectMember(project_id=store.id, user_id=u2.id, role="editor"),
            ProjectMember(project_id=store.id, user_id=u3.id, role="viewer"),
            # App
            ProjectMember(project_id=app.id, user_id=u1.id, role="owner"),
            ProjectMember(project_id=app.id, user_id=u2.id, role="editor"),
            ProjectMember(project_id=app.id, user_id=u4.id, role="editor"),
            # Blog
            ProjectMember(project_id=blog.id, user_id=admin.id, role="owner"),
            ProjectMember(project_id=blog.id, user_id=u3.id, role="editor"),
            ProjectMember(project_id=blog.id, user_id=u4.id, role="editor"),
            ProjectMember(project_id=blog.id, user_id=u1.id, role="viewer"),
        ]
    )

    # Labels – Store
    s_bug = Label(name="bug", color="#ef4444", project_id=store.id)
    s_feature = Label(name="feature", color="#6366f1", project_id=store.id)
    s_perf = Label(name="performance", color="#f59e0b", project_id=store.id)
    s_design = Label(name="design", color="#ec4899", project_id=store.id)

    # Labels – App
    a_bug = Label(name="bug", color="#ef4444", project_id=app.id)
    a_feature = Label(name="feature", color="#6366f1", project_id=app.id)
    a_research = Label(name="research", color="#14b8a6", project_id=app.id)

    # Labels – Blog
    c_bug = Label(name="bug", color="#ef4444", project_id=blog.id)
    c_feature = Label(name="feature", color="#6366f1", project_id=blog.id)
    c_urgent = Label(name="urgent", color="#f97316", project_id=blog.id)

    session.add_all(
        [
            s_bug,
            s_feature,
            s_perf,
            s_design,
            a_bug,
            a_feature,
            a_research,
            c_bug,
            c_feature,
            c_urgent,
        ]
    )

    # Tasks – Store
    s_tasks = [
        Task(
            title="Check how checkout works",
            project_id=store.id,
            creator_id=admin.id,
            status="done",
            priority="high",
            description="Go through the whole flow and write down what's broken.",
        ),
        Task(
            title="Update product page layout",
            project_id=store.id,
            creator_id=admin.id,
            status="done",
            priority="high",
            description="Make it look better, move some stuff around.",
        ),
        Task(
            title="Images not loading",
            project_id=store.id,
            creator_id=u1.id,
            status="done",
            priority="critical",
            description="Some images show a broken icon. Happens randomly.",
        ),
        Task(
            title="Add wishlist",
            project_id=store.id,
            creator_id=admin.id,
            status="in_progress",
            priority="medium",
            description="Users want to save items for later.",
        ),
        Task(
            title="Search is too slow",
            project_id=store.id,
            creator_id=u2.id,
            status="in_progress",
            priority="high",
            description="Takes like 5 seconds sometimes. Needs to be fixed.",
        ),
        Task(
            title="Dark mode",
            project_id=store.id,
            creator_id=u1.id,
            status="backlog",
            priority="low",
            description="Would be nice to have.",
        ),
        Task(
            title="Recurring payments",
            project_id=store.id,
            creator_id=admin.id,
            status="backlog",
            priority="critical",
            description="We need subscriptions, not just one-time purchases.",
        ),
        Task(
            title="Tests for cart",
            project_id=store.id,
            creator_id=u2.id,
            status="backlog",
            priority="medium",
        ),
    ]

    # Tasks – App
    a_tasks = [
        Task(
            title="Set up the project",
            project_id=app.id,
            creator_id=u1.id,
            status="done",
            priority="high",
        ),
        Task(
            title="Onboarding screens",
            project_id=app.id,
            creator_id=u2.id,
            status="done",
            priority="medium",
            description="A few screens to show new users around.",
        ),
        Task(
            title="Push notifications",
            project_id=app.id,
            creator_id=u1.id,
            status="in_progress",
            priority="high",
            description="Basic notifications, nothing fancy.",
        ),
        Task(
            title="Offline support",
            project_id=app.id,
            creator_id=u4.id,
            status="in_progress",
            priority="medium",
            description="App should work without internet, at least for reading.",
        ),
        Task(
            title="Login with face / fingerprint",
            project_id=app.id,
            creator_id=u1.id,
            status="backlog",
            priority="high",
        ),
        Task(
            title="Pick a charts library",
            project_id=app.id,
            creator_id=u2.id,
            status="backlog",
            priority="low",
            description="Just pick one and go with it.",
        ),
        Task(
            title="Smoother screen transitions",
            project_id=app.id,
            creator_id=u4.id,
            status="backlog",
            priority="low",
            description="Animations feel a bit janky right now.",
        ),
    ]

    # Tasks – Blog
    c_tasks = [
        Task(
            title="Pick a blog platform",
            project_id=blog.id,
            creator_id=admin.id,
            status="done",
            priority="high",
            description="We went with WordPress. Not ideal but everyone knows it.",
        ),
        Task(
            title="Set up the domain",
            project_id=blog.id,
            creator_id=u3.id,
            status="done",
            priority="medium",
            description="blog.company.com, SSL done.",
        ),
        Task(
            title="Homepage looks broken on mobile",
            project_id=blog.id,
            creator_id=u4.id,
            status="in_progress",
            priority="critical",
            description="Header overlaps the text on small screens.",
        ),
        Task(
            title="Write first 3 posts",
            project_id=blog.id,
            creator_id=admin.id,
            status="in_progress",
            priority="high",
            description="Drafts exist, need review before publishing.",
        ),
        Task(
            title="Add newsletter signup",
            project_id=blog.id,
            creator_id=u3.id,
            status="backlog",
            priority="medium",
            description="Just a simple email field, nothing fancy.",
        ),
        Task(
            title="SEO basics",
            project_id=blog.id,
            creator_id=u4.id,
            status="backlog",
            priority="high",
            description="Meta tags, sitemap, that kind of stuff.",
        ),
        Task(
            title="Comment section",
            project_id=blog.id,
            creator_id=admin.id,
            status="backlog",
            priority="medium",
        ),
    ]

    session.add_all(s_tasks + a_tasks + c_tasks)
    session.flush()

    # Assignees – Store
    s_tasks[0].assignees.extend([u1, u2])
    s_tasks[1].assignees.append(u2)
    s_tasks[2].assignees.append(u1)
    s_tasks[3].assignees.extend([u1, u3])
    s_tasks[4].assignees.append(u2)
    s_tasks[6].assignees.append(admin)
    s_tasks[7].assignees.append(u2)

    # Assignees – App
    a_tasks[1].assignees.append(u2)
    a_tasks[2].assignees.extend([u1, u4])
    a_tasks[3].assignees.append(u4)
    a_tasks[4].assignees.append(u1)
    a_tasks[5].assignees.append(u2)
    a_tasks[6].assignees.extend([u2, u4])

    # Assignees – Blog
    c_tasks[0].assignees.extend([u3, u4])
    c_tasks[1].assignees.append(u3)
    c_tasks[2].assignees.append(u4)
    c_tasks[3].assignees.extend([admin, u3])
    c_tasks[4].assignees.append(u3)
    c_tasks[5].assignees.append(u4)
    c_tasks[6].assignees.append(admin)

    # Labels – Store
    s_tasks[2].labels.append(s_bug)
    s_tasks[3].labels.append(s_feature)
    s_tasks[4].labels.extend([s_bug, s_perf])
    s_tasks[5].labels.append(s_design)
    s_tasks[6].labels.append(s_feature)
    s_tasks[7].labels.append(s_bug)

    # Labels – App
    a_tasks[1].labels.append(a_feature)
    a_tasks[2].labels.append(a_feature)
    a_tasks[3].labels.extend([a_feature, a_bug])
    a_tasks[4].labels.append(a_feature)
    a_tasks[5].labels.append(a_research)

    # Labels – Blog
    c_tasks[2].labels.extend([c_bug, c_urgent])
    c_tasks[3].labels.append(c_feature)
    c_tasks[4].labels.append(c_feature)
    c_tasks[5].labels.extend([c_feature, c_urgent])
    c_tasks[6].labels.append(c_feature)

    session.commit()
    print("Seed complete")


SessionLocal = init_db()


def get_db():
    with SessionLocal() as session:
        yield session


if __name__ == "__main__":
    with SessionLocal() as s:
        seed(s)
