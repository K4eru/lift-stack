from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Profile
from app.schemas import ProfileCreate, ProfileResponse

router = APIRouter()


@router.post("/profiles", response_model=ProfileResponse)
def create_profile(
    profile: ProfileCreate, db: Session = Depends(get_db)
) -> ProfileResponse:
    db_profile = Profile(name=profile.name)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile


@router.get("/profiles", response_model=list[ProfileResponse])
def list_profiles(db: Session = Depends(get_db)) -> list[ProfileResponse]:
    return db.query(Profile).all()


@router.get("/profiles/{profile_id}", response_model=ProfileResponse)
def get_profile(profile_id: UUID, db: Session = Depends(get_db)) -> ProfileResponse:
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
