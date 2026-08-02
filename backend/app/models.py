import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    body_part = Column(String, nullable=False)
    equipment = Column(String, nullable=False)
    target = Column(String, nullable=False)
    muscle_group = Column(String)
    secondary_muscles = Column(JSON)
    instructions = Column(JSON)
    instruction_steps = Column(JSON)
    media_id = Column(String)
    image = Column(String)
    gif_url = Column(String)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now(UTC))


class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    is_system = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    created_at = Column(DateTime, default=datetime.now(UTC))

    exercises = relationship(
        "WorkoutTemplateExercise",
        back_populates="template",
        order_by="WorkoutTemplateExercise.order",
    )


class WorkoutTemplateExercise(Base):
    __tablename__ = "workout_template_exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(
        UUID(as_uuid=True), ForeignKey("workout_templates.id"), nullable=False
    )
    exercise_id = Column(String, ForeignKey("exercises.id"), nullable=False)
    target_sets = Column(Integer)
    target_reps = Column(Integer)
    target_weight = Column(Float)
    order = Column(Integer, nullable=False)

    template = relationship("WorkoutTemplate", back_populates="exercises")
    exercise = relationship("Exercise")


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("workout_templates.id"))
    name = Column(String, nullable=False)
    started_at = Column(DateTime, default=datetime.now(UTC))
    completed_at = Column(DateTime)
    notes = Column(Text)

    profile = relationship("Profile", back_populates="workouts")
    template = relationship("WorkoutTemplate")
    sets = relationship(
        "WorkoutSet",
        back_populates="workout",
        order_by="WorkoutSet.completed_at",
    )


class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workout_id = Column(UUID(as_uuid=True), ForeignKey("workouts.id"), nullable=False)
    exercise_id = Column(String, ForeignKey("exercises.id"), nullable=False)
    set_number = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=False)
    weight = Column(Float)
    duration_seconds = Column(Integer)
    rest_seconds = Column(Integer)
    notes = Column(Text)
    completed_at = Column(DateTime, default=datetime.now(UTC))

    workout = relationship("Workout", back_populates="sets")
    exercise = relationship("Exercise")
