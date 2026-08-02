from sqlalchemy import create_engine

from app.models import Base


def test_database_setup():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    assert Base.metadata.tables["exercises"] is not None
    assert Base.metadata.tables["profiles"] is not None
    assert Base.metadata.tables["workout_templates"] is not None
    assert Base.metadata.tables["workout_template_exercises"] is not None
    assert Base.metadata.tables["workouts"] is not None
    assert Base.metadata.tables["workout_sets"] is not None
