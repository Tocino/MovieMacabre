import sqlite3
import json

# translation database for movie genres

genres = [
    "body-horror",
    "creature",
    "family-halloween",
    "folk-occult",
    "found-footage",
    "horror",
    "horror-comedy",
    "psychological",
    "sci-fi",
    "slasher",
    "spooky-fun",
    "supernatural",
    "vampire",   
    "zombie"  
]
def create_table(genres):
    # --------------------------------------------------
    # 1. CONNECT TO DATABASE
    # --------------------------------------------------

    connection = sqlite3.connect("movie_subgenres.db")

    # Makes returned rows easier to work with
    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()


    # --------------------------------------------------
    # 2. CREATE TABLE
    # --------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS genres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            genre TEXT NOT NULL
        )
    """)

    connection.commit()


    # --------------------------------------------------
    # 3. ADD SOME MOVIES
    # --------------------------------------------------
    for genre in genres:
        cursor.execute("""
            INSERT INTO genres (genre)
            VALUES (?)
        """, (genre,))

    connection.commit()



if __name__ == "__main__":
    create_table(genres)