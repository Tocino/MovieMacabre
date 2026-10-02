import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import MovieSession, VotingSession, Movie
from app.schemas import VotingSessionCreate


CODE_CHARACTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def generate_code(length: int = 6):

    return "".join(
        secrets.choice(CODE_CHARACTERS)
        for _ in range(length)
    )


def create_unique_code(db: Session):

    while True:

        code = generate_code()

        existing_session = db.scalar(
            select(VotingSession)
            .where(VotingSession.code == code)
        )

        if existing_session is None:
            return code


def create_voting_session(
    db: Session,
    session_data: VotingSessionCreate
):

    code = create_unique_code(db)

    voting_session = VotingSession(
        name=session_data.name,
        code=code,
        is_active=True
    )

    db.add(voting_session)
    db.commit()
    db.refresh(voting_session)

    return voting_session


def get_session_by_code(
    db: Session,
    code: str
):

    statement = (
        select(VotingSession)
        .where(VotingSession.code == code.upper())
        .where(VotingSession.is_active.is_(True))
    )

    return db.scalar(statement)

def add_movies_to_session(
    db: Session,
    code: str,
    movie_ids: list[int]
):
    voting_session = get_session_by_code(db, code)

    if voting_session is None:
        return None

    # Find which requested movies actually exist
    statement = (
        select(Movie.id)
        .where(Movie.id.in_(movie_ids))
    )

    valid_ids = set(
        db.scalars(statement).all()
    )

    requested_ids = set(movie_ids)

    invalid_ids = requested_ids - valid_ids

    if invalid_ids:
        raise ValueError(
            f"Invalid movie IDs: {sorted(invalid_ids)}"
        )

    # Find movies already in this session
    statement = (
        select(MovieSession.movie_id)
        .where(
            MovieSession.session_id == voting_session.id,
            MovieSession.movie_id.in_(valid_ids)
        )
    )

    existing_ids = set(
        db.scalars(statement).all()
    )

    # Add only movies that aren't already there
    new_ids = valid_ids - existing_ids

    for movie_id in new_ids:

        session_movie = MovieSession(
            session_id=voting_session.id,
            movie_id=movie_id
        )

        db.add(session_movie)

    db.commit()
    db.refresh(voting_session)

    return voting_session


def remove_movies_from_session(
    db: Session,
    code: str,
    movie_ids: list[int]
):

    voting_session = get_session_by_code(db, code)

    if voting_session is None:
        return None

    for movie_id in movie_ids:
        existing = db.scalar(
            select(MovieSession)
            .where(MovieSession.session_id == voting_session.id)
            .where(MovieSession.movie_id == movie_id)
        )
        if existing is not None:
            db.delete(existing)

    db.commit()
    db.refresh(voting_session)
    return voting_session