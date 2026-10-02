import sqlite3
import json


with open("data/scare_roulette_movies.json", "r", encoding="utf-8") as file:
    data = json.load(file)

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

def create_movies_table(movies):
    # --------------------------------------------------
    # 1. CONNECT TO DATABASE
    # --------------------------------------------------

    connection = sqlite3.connect("movies.db")

    # Makes returned rows easier to work with
    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()


    # --------------------------------------------------
    # 2. CREATE TABLE
    # --------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            year INTEGER NOT NULL,
            scare_rating INTEGER NOT NULL
        )
    """)

    connection.commit()


    # --------------------------------------------------
    # 3. ADD SOME MOVIES
    # --------------------------------------------------
    for movie in movies:
        cursor.execute("""
            INSERT INTO movies (title, year, scare_rating)
            VALUES (?, ?, ?)
        """, (movie["title"], movie["year"], movie["scare_rating"]))

    connection.commit()


def create_subgenres_table(genres):
    # --------------------------------------------------
    # 1. CONNECT TO DATABASE
    # --------------------------------------------------

    connection = sqlite3.connect("movies.db")

    # Makes returned rows easier to work with
    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()


    # --------------------------------------------------
    # 2. CREATE TABLE
    # --------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subgenres (
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
            INSERT INTO subgenres (genre)
            VALUES (?)
        """, (genre,))

    connection.commit()


def create_movie_subgenres_table(movies, subgenres):
     
    # --------------------------------------------------
    # 1. CONNECT TO DATABASE
    # --------------------------------------------------

    connection = sqlite3.connect("movies.db")

    # Makes returned rows easier to work with
    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()


    # --------------------------------------------------
    # 2. CREATE TABLE
    # --------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS movie_subgenres (
            movie_id INTEGER NOT NULL,
            subgenre_id INTEGER NOT NULL
        )
    """)

    connection.commit()

 
    # --------------------------------------------------
    # 3. ADD GENRES TRANSLATION DATA
    # --------------------------------------------------
    for movie in movies:
        title = movie["title"]

        cursor.execute("""
        SELECT id
        FROM movies
        WHERE title = ?
        """, (title,))

        movie_id = cursor.fetchone()

        for movie_subgenre in movie["genres"]:
            cursor.execute("""
            SELECT id
            FROM subgenres
            WHERE genre = ?
            """, (movie_subgenre,))

            subgenre_id = cursor.fetchone()

            cursor.execute("""
                INSERT INTO movie_subgenres (movie_id, subgenre_id)
                VALUES (?, ?)
            """, (movie_id["id"] if movie_id else None, subgenre_id["id"] if subgenre_id else None))

            connection.commit()


if __name__ == "__main__":
    movies = data["movies"]
    create_movies_table(movies)
    create_subgenres_table(genres)
    create_movie_subgenres_table(movies, genres)