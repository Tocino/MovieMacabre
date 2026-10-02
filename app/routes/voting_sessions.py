from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    VotingSessionCreate,
    VotingSessionResponse,
    AddMoviesToSession,
)
from app.services import voting_service


router = APIRouter(
    prefix="/sessions",
    tags=["Voting Sessions"]
)


@router.post(
    "/",
    response_model=VotingSessionResponse,
    status_code=201
)
def create_session(
    session_data: VotingSessionCreate,
    db: Session = Depends(get_db)
):

    return voting_service.create_voting_session(
        db,
        session_data
    )


@router.get(
    "/join/{code}",
    response_model=VotingSessionResponse
)
def join_session(
    code: str,
    db: Session = Depends(get_db)
):

    voting_session = voting_service.get_session_by_code(
        db,
        code
    )

    if voting_session is None:
        raise HTTPException(
            status_code=404,
            detail="Invalid or inactive session code"
        )

    return voting_session

@router.post(
    "/{code}/movies",
    response_model=VotingSessionResponse
)
def add_movies_to_session(
    code: str,
    data: AddMoviesToSession,
    db: Session = Depends(get_db)
):
    try:
        voting_session = voting_service.add_movies_to_session(
            db,
            code,
            data.movie_ids
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    if voting_session is None:
        raise HTTPException(
            status_code=404,
            detail="Voting session not found"
        )

    return voting_session

@router.post(
    "/{code}/removemovies",
    response_model=VotingSessionResponse
)
def remove_movies_from_session(
    movie_ids: list[int],
    code: str,
    db: Session = Depends(get_db)
):

    voting_session = voting_service.remove_movies_from_session(
        db,
        code,
        movie_ids
    )

    if voting_session is None:
        raise HTTPException(
            status_code=404,
            detail="Voting session not found: {code}"
        )

    return voting_session