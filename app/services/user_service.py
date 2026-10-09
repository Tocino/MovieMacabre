from app.models import User
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.schemas import UserCreate
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.security import hash_password, verify_password, decode_access_token
from app.database import get_db

# --------------------------------------------------
# GET ALL USERS
# --------------------------------------------------



def get_all_users(db: Session):

    statement = (
        select(User) 
    )

    users = db.scalars(statement).all()

    return users


# --------------------------------------------------
# GET ONE User By ID
# --------------------------------------------------

def get_user(db: Session, user_id: int):

    statement = (
        select(User)
        .where(User.id == user_id)
    )

    user = db.scalar(statement)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user

# --------------------------------------------------
# GET ONE User By Username
# --------------------------------------------------

def find_user_by_username(
    db: Session,
    username: str
):
    statement = (
        select(User)
        .where(User.username == username)
    )

    return db.scalar(statement)


def get_user_by_username(
    db: Session,
    username: str
):
    user = find_user_by_username(db, username)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# --------------------------------------------------
# ADD USER
# --------------------------------------------------

def add_user(
    db: Session,
    user_data: UserCreate
):
    existing_user = find_user_by_username(
        db,
        user_data.username
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=409,
            detail="User with this username already exists"
        )

    hashed_password = hash_password(
        user_data.password
    )

    user = User(
        username=user_data.username,
        hashed_password=hashed_password,
        is_admin=False,
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user




# --------------------------------------------------
# AUTHENTICATE USER
# --------------------------------------------------

def authenticate_user(
    db: Session,
    username: str,
    password: str
):
    user = find_user_by_username(
        db,
        username
    )

    if user is None:
        return None

    if not user.is_active:
        return None

    if not user.hashed_password:
        return None

    if not verify_password(
        password,
        user.hashed_password
    ):
        return None

    return user


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/users/login"
)


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    user_id = decode_access_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = db.get(
        User,
        user_id
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User is inactive"
        )

    return user


# --------------------------------------------------
# REQUIRE ADMIN
# --------------------------------------------------

def require_admin(
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user
