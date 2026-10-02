from pydantic import BaseModel, Field


# --------------------------------
# Subgenre schemas
# --------------------------------

class SubgenreCreate(BaseModel):
    name: str


class SubgenreResponse(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }


# --------------------------------
# Movie schemas
# --------------------------------

class MovieCreate(BaseModel):
    title: str
    year: int
    scare_rating: int = Field(ge=1, le=5)
    subgenre_ids: list[int] = []


class MovieUpdate(BaseModel):
    title: str | None = None
    year: int | None = None
    scare_rating: int | None = Field(
        default=None,
        ge=1,
        le=5
    )
    subgenre_ids: list[int] | None = None


class MovieResponse(BaseModel):
    id: int
    title: str
    year: int
    scare_rating: int
    subgenres: list[SubgenreResponse] = []

    model_config = {
        "from_attributes": True
    }

class VotingSessionCreate(BaseModel):
    name: str


class VotingSessionResponse(BaseModel):
    id: int
    name: str
    code: str
    is_active: bool

    model_config = {
        "from_attributes": True
    }

class AddMoviesToSession(BaseModel):
    movie_ids: list[int] = Field(min_length=1)

class RemoveMoviesFromSession(BaseModel):
    movie_ids: list[int] = Field(min_length=1)

class VoteCreate(BaseModel):
    user_id: int
    movie_id: int

class VoteResponse(BaseModel):
    id: int
    user_id: int
    session_id: int
    movie_id: int

    model_config = {
        "from_attributes": True
    }

class UserCreate(BaseModel):
    username: str
    is_admin: bool
    is_active: bool

class UserResponse(BaseModel):
    id: int
    username: str

    model_config = {
        "from_attributes": True
    }