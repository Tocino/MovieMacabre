
from fastapi import APIRouter, Depends, Query
from app.database import get_db
from app.services import user_service
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# -----------------------------------------
# ADD USER
# -----------------------------------------

@router.post(
    "/",
    response_model=UserResponse,
    status_code=201
)
def add_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    return user_service.add_user(db, user_data)


# -----------------------------------------
# GET ONE USER By ID
# -----------------------------------------

@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
    
):
    return user_service.get_user(db, user_id)


# -----------------------------------------
# GET ONE USER By Username
# -----------------------------------------

@router.get(
    "/by-username/{username}",
    response_model=UserResponse,
)
def get_user_by_username(
    username: str,
    db: Session = Depends(get_db)
):
    return user_service.get_user_by_username(db, username)