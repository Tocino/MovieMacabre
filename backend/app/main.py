import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import voting_sessions

# Import models so SQLAlchemy knows about them
from app import models
from app.routes import genres, movies, users, votes


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="Halloween Movie Voter",
    description="API for creating movie lists and voting on movies",
    version="0.1.0"
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.get("/health")
def health_check():
    return {"status": "healthy"}    