from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import ensure_default_admin
from .routers import admin, auth, projects, tasks, labels, comments



@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_default_admin()
    yield


app = FastAPI(
    title="Launchpad",
    lifespan=lifespan,
    description=(
        "Protected endpoints require `Authorization: Bearer <token>`.\n\n"
        "Obtain a token via `POST /auth/login` or `POST /auth/register`.\n\n"
        "`/admin/*` endpoints additionally require the `admin` role."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"service": "Launchpad API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(labels.router)
app.include_router(comments.router)