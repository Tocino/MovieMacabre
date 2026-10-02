from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Movie, Subgenre
from app.routes import movies
from app.schemas import MovieCreate, MovieUpdate


# --------------------------------------------------
# GET ALL MOVIES
# --------------------------------------------------

def get_all_genres(db: Session):

    statement = (
        select(Subgenre)
    )

    movies = db.scalars(statement).all()

    return movies



