from app.models import User
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.schemas import UserCreate
from fastapi import HTTPException

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

    user = User(
        username=user_data.username,
        is_admin=user_data.is_admin,
        is_active=user_data.is_active
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

