# app/services/movie_service.py

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import Movie, Subgenre
from app.routes import movies
from app.schemas import MovieCreate, MovieUpdate


# --------------------------------------------------
# GET ALL MOVIES
# --------------------------------------------------

def get_all_movies(db: Session):

    statement = (
        select(Movie)
        .options(
            selectinload(Movie.subgenres)
        )
    )

    movies = db.scalars(statement).all()

    return movies


# --------------------------------------------------
# GET ONE MOVIE
# --------------------------------------------------

def get_movie(db: Session, movie_id: int):

    statement = (
        select(Movie)
        .where(Movie.id == movie_id)
    )

    movie = db.scalar(statement)

    return movie


# --------------------------------------------------
# CREATE MOVIE
# --------------------------------------------------

def create_movie(
    db: Session,
    movie_data: MovieCreate
):

    movie = Movie(
        title=movie_data.title,
        year=movie_data.year,
        scare_rating=movie_data.scare_rating
    )

    # Find the requested subgenres
    if movie_data.subgenre_ids:

        statement = (
            select(Subgenre)
            .where(
                Subgenre.id.in_(
                    movie_data.subgenre_ids
                )
            )
        )

        subgenres = db.scalars(statement).all()

        movie.subgenres = list(subgenres)

    db.add(movie)

    db.commit()

    db.refresh(movie)

    return movie


# --------------------------------------------------
# UPDATE MOVIE
# --------------------------------------------------

def update_movie(
    db: Session,
    movie_id: int,
    movie_data: MovieUpdate
):

    movie = get_movie(
        db,
        movie_id
    )

    if movie is None:
        return None

    # Only update values the user actually supplied

    if movie_data.title is not None:
        movie.title = movie_data.title

    if movie_data.year is not None:
        movie.year = movie_data.year

    if movie_data.scare_rating is not None:
        movie.scare_rating = movie_data.scare_rating

    # Update subgenres if supplied
    if movie_data.subgenre_ids is not None:

        statement = (
            select(Subgenre)
            .where(
                Subgenre.id.in_(
                    movie_data.subgenre_ids
                )
            )
        )

        subgenres = db.scalars(statement).all()

        movie.subgenres = list(subgenres)

    db.commit()

    db.refresh(movie)

    return movie


# --------------------------------------------------
# DELETE MOVIE
# --------------------------------------------------

def delete_movie(
    db: Session,
    movie_id: int
):

    movie = get_movie(
        db,
        movie_id
    )

    if movie is None:
        return None

    db.delete(movie)

    db.commit()

    return movie


# --------------------------------------------------
# GET MOVIES BY SUBGENRE
# --------------------------------------------------

def get_movies_by_subgenre(
    db: Session,
    subgenre_name: str
):
    print(f"Getting movies by subgenre: {subgenre_name}")
    statement = (
        select(Movie)
        .join(Movie.subgenres)
        .where(
            Subgenre.name == subgenre_name
        )
    )
    movies = db.scalars(statement).all()

    print(f"Found {len(movies)} movies for subgenre: {subgenre_name}")

    return movies


# --------------------------------------------------
# GET MOVIE LIST
# --------------------------------------------------

def get_movies_list(
    db: Session,
):
    genres = set()
    movie_ids = set()
    movie_list = []

    while len(movie_list) < 5:
        statement = (
            select(Movie)
            .where(
                Movie.watched.is_(False),
                Movie.id.not_in(movie_ids),
                ~Movie.subgenres.any(Subgenre.name.in_(genres))
            )
            .options(selectinload(Movie.subgenres))
            .order_by(func.random())
            .limit(1)
        )
        movie = db.scalar(statement)

        if movie is None:
            break

        movie_list.append(movie)
        movie_ids.add(movie.id)
        genres.update(subgenre.name for subgenre in movie.subgenres)

    return movie_list