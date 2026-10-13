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
    watched: bool | None = None


class MovieResponse(BaseModel):
    id: int
    title: str
    year: int
    scare_rating: int
    subgenres: list[SubgenreResponse] = Field(
        default_factory=list
    )

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
    movies: list[MovieResponse] = Field(
        default_factory=list
    )    
    model_config = {
        "from_attributes": True
    }

class AddMoviesToSession(BaseModel):
    movie_ids: list[int] = Field(min_length=1)

class RemoveMoviesFromSession(BaseModel):
    movie_ids: list[int] = Field(min_length=1)

class VoteCreate(BaseModel):
    movie_ids: list[int]

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
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    is_admin: bool
    is_active: bool

    model_config = {
        "from_attributes": True
    }


class UserLogin(BaseModel):
    username: str
    password: str


class MovieResult(BaseModel):
    movie_id: int
    title: str
    votes: int
    watched: bool


class VotingResults(BaseModel):
    session_name: str
    code: str
    results: list[MovieResult]
    total_voters: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str



class GenerateMoviesRequest(BaseModel):
    movie_count: int = Field(
        default=6,
        ge=1,
        le=20
    )

    min_scare_rating: int = Field(
        default=3,
        ge=1,
        le=5
    )

    exclude_watched: bool = True

    subgenre_ids: list[int] = Field(
        default_factory=list
    )