from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.migrate import import_exercises
from app.routers import exercises, profiles, templates, workouts


@asynccontextmanager
async def lifespan(app: FastAPI):
    import_exercises(settings.media_path)
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(profiles.router)
app.include_router(exercises.router)
app.include_router(templates.router)
app.include_router(workouts.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
