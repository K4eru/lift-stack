from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Workout, WorkoutSet
from app.schemas import (
    WorkoutCreate,
    WorkoutResponse,
    WorkoutSetCreate,
    WorkoutSetResponse,
    WorkoutUpdate,
)

router = APIRouter()


@router.post("/workouts", response_model=WorkoutResponse)
def start_workout(
    workout: WorkoutCreate, db: Session = Depends(get_db)
) -> WorkoutResponse:
    db_workout = Workout(
        name=workout.name,
        template_id=workout.template_id,
        profile_id=workout.profile_id,
    )
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)
    return db_workout


@router.post("/workouts/{workout_id}/sets", response_model=WorkoutSetResponse)
def add_set(
    workout_id: UUID, set_data: WorkoutSetCreate, db: Session = Depends(get_db)
) -> WorkoutSetResponse:
    workout = db.query(Workout).filter(Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    db_set = WorkoutSet(
        workout_id=workout_id,
        exercise_id=set_data.exercise_id,
        set_number=set_data.set_number,
        reps=set_data.reps,
        weight=set_data.weight,
        duration_seconds=set_data.duration_seconds,
        rest_seconds=set_data.rest_seconds,
        notes=set_data.notes,
    )
    db.add(db_set)
    db.commit()
    db.refresh(db_set)
    return db_set


@router.get("/workouts", response_model=list[WorkoutResponse])
def list_workouts(
    profile_id: UUID | None = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> list[WorkoutResponse]:
    query = db.query(Workout)
    if profile_id:
        query = query.filter(Workout.profile_id == profile_id)
    return query.order_by(Workout.started_at.desc()).offset(offset).limit(limit).all()


@router.get("/workouts/{workout_id}", response_model=WorkoutResponse)
def get_workout(workout_id: UUID, db: Session = Depends(get_db)) -> WorkoutResponse:
    workout = db.query(Workout).filter(Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout


@router.put("/workouts/{workout_id}", response_model=WorkoutResponse)
def update_workout(
    workout_id: UUID, update: WorkoutUpdate, db: Session = Depends(get_db)
) -> WorkoutResponse:
    workout = db.query(Workout).filter(Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    if update.completed_at is not None:
        workout.completed_at = update.completed_at
    if update.notes is not None:
        workout.notes = update.notes

    db.commit()
    db.refresh(workout)
    return workout
