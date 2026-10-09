from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import VoteCreate, VoteResponse, VotingResults
from app.services import vote_service
from app.models import User
from app.services.user_service import get_current_user

router = APIRouter(
    prefix="/voting",
    tags=["Votes"]
)


@router.post(
    "/{code}/votes",
    response_model=list[VoteResponse],
    status_code=201
)
def cast_vote(
    code: str,
    vote_data: VoteCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):
    try:
        return vote_service.cast_vote(
            db=db,
            code=code,
            user_id=current_user.id,
            movie_ids=vote_data.movie_ids
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get(
    "/{code}/votes",
    response_model=list[int]
)
def get_user_votes(
    code: str,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):
    try:
        return vote_service.get_user_votes(
            db=db,
            code=code,
            user_id=current_user.id
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

@router.get(
    "/{code}/results",
    response_model=VotingResults
)
def get_results(
    code: str,
    db: Session = Depends(get_db)
):
    try:
        return vote_service.get_voting_results(
            db=db,
            code=code
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

@router.get(
    "/{code}/votes/{user_id}",
    response_model=list[int]
)
def get_user_votes(
    code: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    try:
        return vote_service.get_user_votes(
            db=db,
            code=code,
            user_id=user_id
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )    