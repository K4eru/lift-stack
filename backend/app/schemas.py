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


class TemplateExerciseCreate(BaseModel):
    exercise_id: str
    target_sets: int | None = None
    target_reps: int | None = None
    target_weight: float | None = None


class TemplateExerciseResponse(BaseModel):
    id: UUID
    exercise_id: str
    target_sets: int | None
    target_reps: int | None
    target_weight: float | None
    order: int
    exercise: ExerciseResponse

    model_config = {"from_attributes": True}


class TemplateCreate(BaseModel):
    name: str
    description: str | None = None
    exercises: list[TemplateExerciseCreate]


class WorkoutSetCreate(BaseModel):
    exercise_id: str
    set_number: int
    reps: int
    weight: float | None = None
    duration_seconds: int | None = None
    rest_seconds: int | None = None
    notes: str | None = None


class WorkoutSetResponse(BaseModel):
    id: UUID
    exercise_id: str
    set_number: int
    reps: int
    weight: float | None
    duration_seconds: int | None
    rest_seconds: int | None
    notes: str | None
    completed_at: datetime

    model_config = {"from_attributes": True}


class WorkoutCreate(BaseModel):
    name: str
    profile_id: UUID
    template_id: UUID | None = None


class WorkoutUpdate(BaseModel):
    completed_at: datetime | None = None
    notes: str | None = None


class WorkoutResponse(BaseModel):
    id: UUID
    profile_id: UUID
    template_id: UUID | None
    name: str
    started_at: datetime
    completed_at: datetime | None
    notes: str | None
    sets: list[WorkoutSetResponse]

    model_config = {"from_attributes": True}


class TemplateResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    is_system: bool
    created_by: UUID | None
    exercises: list[TemplateExerciseResponse]

    model_config = {"from_attributes": True}
