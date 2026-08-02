from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Exercise
from app.schemas import ExerciseResponse

router = APIRouter()


@router.get("/exercises", response_model=list[ExerciseResponse])
def list_exercises(
    category: str | None = None,
    equipment: str | None = None,
    target: str | None = None,
    muscle_group: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
) -> list[Exercise]:
    query = db.query(Exercise)
    if category:
        query = query.filter(Exercise.category == category)
    if equipment:
        query = query.filter(Exercise.equipment == equipment)
    if target:
        query = query.filter(Exercise.target == target)
    if muscle_group:
        query = query.filter(Exercise.muscle_group == muscle_group)
    if search:
        query = query.filter(Exercise.name.ilike(f"%{search}%"))
    return query.all()


@router.get("/exercises/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(exercise_id: str, db: Session = Depends(get_db)) -> Exercise:
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise
