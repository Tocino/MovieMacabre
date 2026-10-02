from fastapi import FastAPI

from app.database import Base, engine
from app.routes import movies, genres, users, voting_sessions, votes

# Import models so SQLAlchemy knows about them
from app import models


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="Halloween Movie Voter",
    description="API for creating movie lists and voting on movies",
    version="0.1.0"
)


# Register routes
app.include_router(movies.router)
app.include_router(genres.router)
app.include_router(voting_sessions.router)
app.include_router(votes.router)
app.include_router(users.router)

# Simple test route
@app.get("/")
def home():
    return {
        "message": "Halloween Movie Voter API is running"
    }