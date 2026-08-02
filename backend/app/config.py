from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://liftstack:password@localhost:5432/liftstack"
    media_path: str = "/data/exercises-dataset"

    model_config = {"env_file": ".env"}


settings = Settings()
