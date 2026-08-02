from fastapi import FastAPI

from app.routers import exercises, profiles, templates

app = FastAPI()

app.include_router(profiles.router)
app.include_router(exercises.router)
app.include_router(templates.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
