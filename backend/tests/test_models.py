from datetime import UTC, datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.models import Base, Profile, Workout


def test_database_setup():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    assert Base.metadata.tables["exercises"] is not None
    assert Base.metadata.tables["profiles"] is not None
    assert Base.metadata.tables["workout_templates"] is not None
    assert Base.metadata.tables["workout_template_exercises"] is not None
    assert Base.metadata.tables["workouts"] is not None
    assert Base.metadata.tables["workout_sets"] is not None


def test_profile_workouts_relationship():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        profile = Profile(name="Test Profile")
        session.add(profile)
        session.commit()
        session.refresh(profile)

        workout = Workout(
            profile_id=profile.id,
            name="Test Workout",
            started_at=datetime.now(UTC),
        )
        session.add(workout)
        session.commit()
        session.refresh(profile)

        assert len(profile.workouts) == 1
        assert profile.workouts[0].id == workout.id
        assert workout.profile.id == profile.id
