from fastapi import FastAPI

from app.routers import exercises, profiles

app = FastAPI()

app.include_router(profiles.router)
app.include_router(exercises.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
