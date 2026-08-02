from fastapi import FastAPI

from app.routers import profiles

app = FastAPI()

app.include_router(profiles.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
