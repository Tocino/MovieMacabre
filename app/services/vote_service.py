from sqlalchemy import select, delete, func
from sqlalchemy.orm import Session

from app.models import Vote, MovieSession, Movie
from app.services.voting_service import get_session_by_code


def cast_vote(
    db: Session,
    code: str,
    user_id: int,
    movie_ids: list[int]
):
    voting_session = get_session_by_code(db, code)

    if voting_session is None:
        raise ValueError("Voting session not found")

    if not voting_session.is_active:
        raise ValueError(
            "Voting is closed for this session"
        )

    # Verify all selected movies belong to this session
    statement = (
        select(MovieSession)
        .where(
            MovieSession.session_id == voting_session.id,
            MovieSession.movie_id.in_(movie_ids)
        )
    )

    movie_sessions = db.scalars(statement).all()

    if len(movie_sessions) != len(set(movie_ids)):
        raise ValueError(
            "One or more selected movies are not in this session"
        )

    # Remove this user's previous votes for this session
    statement = (
        delete(Vote)
        .where(
            Vote.session_id == voting_session.id,
            Vote.user_id == user_id
        )
    )

    db.execute(statement)

    # Create the user's new votes
    votes = []

    for movie_id in movie_ids:
        vote = Vote(
            user_id=user_id,
            session_id=voting_session.id,
            movie_id=movie_id
        )

        db.add(vote)
        votes.append(vote)

    db.commit()

    for vote in votes:
        db.refresh(vote)

    return votes



def get_voting_results(
    db: Session,
    code: str
):
    voting_session = get_session_by_code(db, code)

    if voting_session is None:
        raise ValueError("Voting session not found")

    statement = (
        select(
            Movie.id,
            Movie.title,
            func.count(Vote.id).label("votes")
        )
        .join(
            MovieSession,
            MovieSession.movie_id == Movie.id
        )
        .outerjoin(
            Vote,
            (Vote.movie_id == Movie.id) &
            (Vote.session_id == voting_session.id)
        )
        .where(
            MovieSession.session_id == voting_session.id
        )
        .group_by(
            Movie.id,
            Movie.title
        )
        .order_by(
            func.count(Vote.id).desc()
        )
    )

    rows = db.execute(statement).all()

    return {
        "session_name": voting_session.name,
        "code": voting_session.code,
        "results": [
            {
                "movie_id": row.id,
                "title": row.title,
                "votes": row.votes
            }
            for row in rows
        ]
    }


def get_user_votes(
    db: Session,
    code: str,
    user_id: int
):
    voting_session = get_session_by_code(
        db,
        code
    )

    if voting_session is None:
        raise ValueError(
            "Voting session not found"
        )

    statement = (
        select(Vote.movie_id)
        .where(
            Vote.session_id == voting_session.id,
            Vote.user_id == user_id
        )
    )

    movie_ids = db.scalars(statement).all()

    return list(movie_ids)