from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Vote, MovieSession
from app.services.voting_service import get_session_by_code


def cast_vote(
    db: Session,
    code: str,
    user_id: int,
    movie_id: int
):
    # Find the voting session
    voting_session = get_session_by_code(
        db,
        code
    )

    if voting_session is None:
        raise ValueError("Voting session not found")

    # Make sure this movie is actually part of the session
    movie_session = db.scalar(
        select(MovieSession)
        .where(
            MovieSession.session_id == voting_session.id,
            MovieSession.movie_id == movie_id
        )
    )

    if movie_session is None:
        raise ValueError(
            "Movie is not part of this voting session"
        )

    # Check whether this user already voted
    existing_vote = db.scalar(
        select(Vote)
        .where(
            Vote.session_id == voting_session.id,
            Vote.user_id == user_id
        )
    )

    if existing_vote is not None:
        raise ValueError(
            "User has already voted in this session"
        )

    # Create the vote
    vote = Vote(
        session_id=voting_session.id,
        movie_id=movie_id,
        user_id=user_id
    )

    db.add(vote)
    db.commit()
    db.refresh(vote)

    return vote