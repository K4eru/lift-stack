from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ProfileBase(BaseModel):
    name: str


class ProfileCreate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class ExerciseResponse(BaseModel):
    id: str
    name: str
    category: str
    body_part: str
    equipment: str
    target: str
    muscle_group: str | None
    secondary_muscles: list[str] | None
    instructions: dict[str, str] | None
    instruction_steps: dict[str, list[str]] | None
    media_id: str | None
    image: str | None
    gif_url: str | None

    model_config = {"from_attributes": True}
