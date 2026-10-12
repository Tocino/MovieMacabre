
from fastapi import APIRouter, Depends, HTTPException, Query
from app.database import get_db
from app.services import user_service
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from app.security import create_access_token
from app.models import User
from app.services.user_service import get_current_user
from fastapi.security import OAuth2PasswordRequestForm

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


# -----------------------------------------
# AUTHENTICATE USER
# -----------------------------------------

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = user_service.authenticate_user(
        db=db,
        username=form_data.username,
        password=form_data.password
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    access_token = create_access_token(
        user.id
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(
        get_current_user
    )
):
    return current_user


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

