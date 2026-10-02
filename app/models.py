from pydantic.v1 import BaseModel
from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Movie(Base):

    __tablename__ = "movies"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    year: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    scare_rating: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    watched: Mapped[bool] = mapped_column(
        nullable=False,
        default=False
    )

    subgenres: Mapped[list["Subgenre"]] = relationship(
    secondary="movie_subgenres",
    back_populates="movies"
)

class Subgenre(Base):
    __tablename__ = "subgenres"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        "genre",
        String(100),
        nullable=False,
        unique=True
    )

    movies: Mapped[list["Movie"]] = relationship(
        secondary="movie_subgenres",
        back_populates="subgenres"
    )

class MovieSubgenres(Base):

    __tablename__ = "movie_subgenres"

    movie_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("movies.id"),
        primary_key=True
    )

    subgenre_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("subgenres.id"),
        primary_key=True
    )

class AppState(Base):
    __tablename__ = "app_state"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    last_subgenre_id: Mapped[int | None] = mapped_column(
        ForeignKey("subgenres.id"),
        nullable=True
    )

class VotingSession(Base):
    __tablename__ = "voting_sessions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    code: Mapped[str] = mapped_column(
        String(6),
        unique=True,
        nullable=False,
        index=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

class MovieSession(Base):
    __tablename__ = "movie_sessions"

    movie_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("movies.id"),
        primary_key=True
    )

    session_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("voting_sessions.id"),
        primary_key=True
    )

class Vote(Base):
    __tablename__ = "votes"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    session_id: Mapped[int] = mapped_column(
        ForeignKey("voting_sessions.id"),
        nullable=False
    )

    movie_id: Mapped[int] = mapped_column(
        ForeignKey("movies.id"),
        nullable=False
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    is_admin: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )