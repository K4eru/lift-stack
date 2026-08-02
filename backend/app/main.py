import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.migrate import import_exercises
from app.routers import exercises, profiles, templates, workouts


@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.to_thread(import_exercises, settings.media_path)
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(profiles.router)
app.include_router(exercises.router)
app.include_router(templates.router)
app.include_router(workouts.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# Mount media directories
media_images = Path(f"{settings.media_path}/images")
media_videos = Path(f"{settings.media_path}/videos")
if media_images.exists():
    app.mount("/media/images", StaticFiles(directory=str(media_images)), name="images")
if media_videos.exists():
    app.mount("/media/videos", StaticFiles(directory=str(media_videos)), name="videos")

# Serve frontend static files
frontend_path = Path(__file__).parent.parent.parent / "frontend" / "dist"
if frontend_path.exists():
    assets_path = frontend_path / "assets"
    if assets_path.exists():
        app.mount(
            "/assets", StaticFiles(directory=str(assets_path)), name="frontend-assets"
        )

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str) -> FileResponse:
        file_path = frontend_path / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_path / "index.html")
