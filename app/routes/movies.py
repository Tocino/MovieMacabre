from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import MovieCreate, MovieUpdate, MovieResponse
from app.services import movie_service


router = APIRouter(
    prefix="/movies",
    tags=["Movies"]
)


# -----------------------------------------
# GET ALL MOVIES
# -----------------------------------------

@router.get(
    "/",
    response_model=list[MovieResponse]
)
def get_movies(
    db: Session = Depends(get_db)
):
    return movie_service.get_all_movies(db)


# -----------------------------------------
# GET MOVIES BY SUBGENRE
# -----------------------------------------

@router.get(
    "/subgenre/{subgenre_name}",
    response_model=list[MovieResponse]
)
def get_movies_by_subgenre(
    subgenre_name: str,
    db: Session = Depends(get_db)
):
    return movie_service.get_movies_by_subgenre(
        db,
        subgenre_name
    )

# -----------------------------------------
# GET MOVIES BY SUBGENRE
# -----------------------------------------

@router.get(
    "/list/",
    response_model=list[MovieResponse]
)
def get_movies_list(
    db: Session = Depends(get_db)
):
    return movie_service.get_movies_list(db)



# -----------------------------------------
# GET ONE MOVIE
# -----------------------------------------

@router.get(
    "/{movie_id}",
    response_model=MovieResponse
)
def get_movie(
    movie_id: int,
    db: Session = Depends(get_db)
):

    movie = movie_service.get_movie(
        db,
        movie_id
    )

    if movie is None:
        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )

    return movie


# -----------------------------------------
# CREATE MOVIE
# -----------------------------------------

@router.post(
    "/",
    response_model=MovieResponse,
    status_code=201
)
def create_movie(
    movie: MovieCreate,
    db: Session = Depends(get_db)
):

    return movie_service.create_movie(
        db,
        movie
    )


# -----------------------------------------
# UPDATE MOVIE
# -----------------------------------------

@router.patch(
    "/{movie_id}",
    response_model=MovieResponse
)
def update_movie(
    movie_id: int,
    movie: MovieUpdate,
    db: Session = Depends(get_db)
):

    updated_movie = movie_service.update_movie(
        db,
        movie_id,
        movie
    )

    if updated_movie is None:
        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )

    return updated_movie


# -----------------------------------------
# DELETE MOVIE
# -----------------------------------------

@router.delete(
    "/{movie_id}",
    status_code=204
)
def delete_movie(
    movie_id: int,
    db: Session = Depends(get_db)
):

    movie = movie_service.delete_movie(
        db,
        movie_id
    )

    if movie is None:
        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )

    return None