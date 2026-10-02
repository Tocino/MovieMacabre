from fastapi import FastAPI

from .database import Base, engine
from . import movies


app = FastAPI()


Base.metadata.create_all(bind=engine)