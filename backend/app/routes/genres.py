from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import SubgenreResponse
from app.services import genre_service


router = APIRouter(
    prefix="/genre",
    tags=["Genres"]
)


# -----------------------------------------
# GET ALL MOVIES
# -----------------------------------------

@router.get(
    "/",
    response_model=list[SubgenreResponse]
)
def get_genres(
    db: Session = Depends(get_db)
):
    return genre_service.get_all_genres(db)
