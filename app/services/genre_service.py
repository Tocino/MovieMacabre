from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Movie, Subgenre



# --------------------------------------------------
# GET ALL SUBGENRES
# --------------------------------------------------

def get_all_subgenres(
    db: Session
):
    statement = (
        select(Subgenre)
        .order_by(Subgenre.name)
    )

    subgenres = (
        db.scalars(statement).all()
    )

    return list(subgenres)

