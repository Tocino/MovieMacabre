from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import VoteCreate, VoteResponse
from app.services import vote_service


router = APIRouter(
    prefix="/voting",
    tags=["Votes"]
)


@router.post(
    "/{code}/votes",
    response_model=VoteResponse,
    status_code=201
)
def cast_vote(
    code: str,
    vote_data: VoteCreate,
    db: Session = Depends(get_db)
):
    try:
        return vote_service.cast_vote(
            db=db,
            code=code,
            user_id=vote_data.user_id,
            movie_id=vote_data.movie_id
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )