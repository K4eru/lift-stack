from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import WorkoutTemplate, WorkoutTemplateExercise
from app.schemas import TemplateCreate, TemplateResponse

router = APIRouter()


@router.get("/templates", response_model=list[TemplateResponse])
def list_templates(
    is_system: bool | None = None,
    db: Session = Depends(get_db),
) -> list[WorkoutTemplate]:
    query = db.query(WorkoutTemplate)
    if is_system is not None:
        query = query.filter(WorkoutTemplate.is_system == is_system)
    return query.all()


@router.get("/templates/{template_id}", response_model=TemplateResponse)
def get_template(
    template_id: UUID,
    db: Session = Depends(get_db),
) -> WorkoutTemplate:
    template = (
        db.query(WorkoutTemplate).filter(WorkoutTemplate.id == template_id).first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.post("/templates", response_model=TemplateResponse)
def create_template(
    template: TemplateCreate,
    db: Session = Depends(get_db),
) -> WorkoutTemplate:
    db_template = WorkoutTemplate(
        name=template.name,
        description=template.description,
        is_system=False,
    )
    db.add(db_template)
    db.flush()

    for i, ex in enumerate(template.exercises):
        template_ex = WorkoutTemplateExercise(
            template_id=db_template.id,
            exercise_id=ex.exercise_id,
            target_sets=ex.target_sets,
            target_reps=ex.target_reps,
            target_weight=ex.target_weight,
            order=i,
        )
        db.add(template_ex)

    db.commit()
    db.refresh(db_template)
    return db_template
