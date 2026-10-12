import random
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.services.voting_service import get_session_by_code
from app.models import Movie, Subgenre, Vote

def generate_movies_for_session(
    db: Session,
    code: str,
    movie_count: int,
    min_scare_rating: int,
    exclude_watched: bool,
    subgenre_ids: list[int]
):
    voting_session = get_session_by_code(
        db,
        code
    )

    if voting_session is None:
        raise ValueError(
            "Voting session not found"
        )

    if not voting_session.is_active:
        raise ValueError(
            "Cannot generate movies for a closed session"
        )

    # Prevent changing the ballot
    # after voting has started.
    vote_exists = db.scalar(
        select(Vote.id)
        .where(
            Vote.session_id
            == voting_session.id
        )
        .limit(1)
    )

    if vote_exists is not None:
        raise ValueError(
            "Cannot regenerate movies after voting has started"
        )

    # ---------------------------------
    # Find eligible movies
    # ---------------------------------

    statement = (
        select(Movie)
        .where(
            Movie.scare_rating
            >= min_scare_rating
        )
    )

    if exclude_watched:
        statement = statement.where(
            Movie.watched.is_(False)
        )

    if subgenre_ids:
        statement = (
            statement
            .join(Movie.subgenres)
            .where(
                Subgenre.id.in_(
                    subgenre_ids
                )
            )
            .distinct()
        )

    movies = list(
        db.scalars(statement).all()
    )

    if len(movies) < movie_count:
        raise ValueError(
            "Not enough movies match "
            "the selected criteria"
        )

    # Randomize the initial pool so
    # identical requests can produce
    # different ballots.
    random.shuffle(movies)

    selected_movies = []
    selected_movie_ids = set()

    # Keep track of which selected
    # subgenres are already represented.
    covered_subgenre_ids = set()

    requested_subgenre_ids = set(
        subgenre_ids
    )

    # ---------------------------------
    # Build a diverse ballot
    # ---------------------------------

    while (
        len(selected_movies)
        < movie_count
    ):
        best_movies = []
        best_new_coverage = 0

        for movie in movies:
            if (
                movie.id
                in selected_movie_ids
            ):
                continue

            movie_subgenre_ids = {
                subgenre.id
                for subgenre
                in movie.subgenres
            }

            # Only count genres that
            # the admin selected.
            relevant_subgenre_ids = (
                movie_subgenre_ids
                & requested_subgenre_ids
            )

            new_subgenre_ids = (
                relevant_subgenre_ids
                - covered_subgenre_ids
            )

            new_coverage = len(
                new_subgenre_ids
            )

            if (
                new_coverage
                > best_new_coverage
            ):
                best_new_coverage = (
                    new_coverage
                )

                best_movies = [
                    movie
                ]

            elif (
                new_coverage
                == best_new_coverage
                and new_coverage > 0
            ):
                best_movies.append(
                    movie
                )

        # Nothing remaining can add
        # another new subgenre.
        if not best_movies:
            break

        # Randomly choose among movies
        # with equal coverage.
        movie = random.choice(
            best_movies
        )

        selected_movies.append(
            movie
        )

        selected_movie_ids.add(
            movie.id
        )

        movie_subgenre_ids = {
            subgenre.id
            for subgenre
            in movie.subgenres
        }

        covered_subgenre_ids.update(
            movie_subgenre_ids
            & requested_subgenre_ids
        )

    # ---------------------------------
    # Fill remaining ballot positions
    # ---------------------------------

    if (
        len(selected_movies)
        < movie_count
    ):
        remaining_movies = [
            movie
            for movie in movies
            if (
                movie.id
                not in selected_movie_ids
            )
        ]

        needed = (
            movie_count
            - len(selected_movies)
        )

        selected_movies.extend(
            random.sample(
                remaining_movies,
                needed
            )
        )

    # ---------------------------------
    # Replace session ballot
    # ---------------------------------

    voting_session.movies.clear()

    voting_session.movies.extend(
        selected_movies
    )

    db.commit()
    db.refresh(
        voting_session
    )

    return voting_session