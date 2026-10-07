import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  createVotingSession, 
  getVotingSession, 
  getMovies, 
  addMoviesToSession,
  removeMoviesFromSession, 
  closeVoting,
  openVoting
} from "../services/api"
import type { VotingSession } from "../types/session"
import type { Movie } from "../types/movie"


function Admin() {

  async function handleRemoveMovie(
    movieId: number
  ) {
    if (!session) {
      return
    }

    try {
      const updatedSession =
        await removeMoviesFromSession(
          session.code,
          [movieId]
        )

      setSession(updatedSession)
      setError("")
    } catch (error) {
      console.error(error)
      setError("Could not remove movie")
    }
  }

  async function handleLoadSession() {

    if (!sessionCode.trim()) {
      setError("Please enter a session code")
      return
    }

    try {
      const existingSession =
        await getVotingSession(
          sessionCode.trim().toUpperCase()
        )

      if (!existingSession) {
        setError("Session not found")
        return
      }

      setSession(existingSession)

      setSelectedMovieIds([])

      setError("")

    } catch (error) {
      console.error(error)

      setError("Could not load session")
    }
  }
  async function loadMovies() {
    try {
      const movieData = await getMovies()

      setMovies(movieData)
      setSelectedMovieIds([])
      setError("")
    } catch (error) {
      console.error(error)
      setError("Could not load movies")
    }
  }

  useEffect(() => {
    loadMovies()
  }, [])

  function toggleMovie(movieId: number) {
    setSelectedMovieIds((currentIds) => {

      if (currentIds.includes(movieId)) {
        return currentIds.filter(
          (id) => id !== movieId
        )
      }

      return [
        ...currentIds,
        movieId
      ]
    })
  }
  const [sessionName, setSessionName] = useState("")

  const [sessionCode, setSessionCode] = useState("")

  const [session, setSession] =
    useState<VotingSession | null>(null)

  const [movies, setMovies] =
  useState<Movie[]>([])

  const [selectedMovieIds, setSelectedMovieIds] =
    useState<number[]>([])

  const [error, setError] = useState("")

  const availableMovies = movies.filter((movie) => {
    if (!session) {
      return true
    }

    return !session.movies.some(
      (sessionMovie) =>
        sessionMovie.id === movie.id
    )
  })

  const navigate = useNavigate()

  async function handleCreateSession() {
    if (!sessionName.trim()) {
      setError("Please enter a session name")
      return
    }

    try {
      const newSession =
        await createVotingSession(sessionName)

      setSession(newSession)
      setError("")

    } catch (error) {
      console.error(error)
      setError("Could not create voting session")
    }
  }
  async function handleAddMovies() {

    if (!session) {
      setError("Create a session first")
      return
    }

    if (selectedMovieIds.length === 0) {
      setError("Select at least one movie")
      return
    }

    try {

      const updatedSession =
        await addMoviesToSession(
          session.code,
          selectedMovieIds
        )

      setSession(updatedSession)

      setSelectedMovieIds([])

      setError("")

    } catch (error) {

      console.error(error)

      setError(
        "Could not add movies to session"
      )
    }
  }

async function handleVotingStatus() {

  if (!session) {
    return
  }

  try {

    let updatedSession

    if (session.is_active) {
      updatedSession =
        await closeVoting(session.code)
    } else {
      updatedSession =
        await openVoting(session.code)
    }

    setSession(updatedSession)

  } catch (error) {

    console.error(
      "Failed to change voting status:",
      error
    )

  }
}

  return (
    <div>
      <h1>MovieMacabre Admin</h1>
      <h2>Load Existing Session</h2>

      <input
        type="text"
        placeholder="Session Code"
        value={sessionCode}
        onChange={(event) =>
          setSessionCode(event.target.value)
        }
      />

      <button onClick={handleLoadSession}>
        Load Session
      </button>

      <button
        onClick={() =>
          navigate(
            `/voting/${session.code}/results`,
            {
              state: {
                from: "admin"
              }
            }
          )
        }
      >
        View Results
      </button>

      <h2>Create Voting Session</h2>

      <input
        type="text"
        placeholder="Session Name"
        value={sessionName}
        onChange={(event) =>
          setSessionName(event.target.value)
        }
      />

      <button onClick={handleCreateSession}>
        Create Session
      </button>

      {error && (
        <p>{error}</p>
      )}

      {session && (
        <div>
          <h2>Current Session</h2>

          <p>Name: {session.name}</p>
          <p>Code: {session.code}</p>
          <p>Status: {session.is_active ? "Active" : "Inactive"}</p>

          <button
            onClick={handleVotingStatus}
          >
            {session.is_active
              ? "Close Voting"
              : "Open Voting"}
          </button>

          <h3>Movies in Session</h3>

          {session.movies.length === 0 ? (
            <p>No movies added yet.</p>
          ) : (
            session.movies.map((movie) => (
              <div key={movie.id}>
                <strong>{movie.title}</strong> ({movie.year})
                <span> — Scare Rating: {movie.scare_rating}</span>
                <span>
                  {" — Genre: "}
                  {movie.subgenres
                    .map((subgenre) => subgenre.name)
                    .join(", ")}
                </span>

                <button
                  onClick={() =>
                    handleRemoveMovie(movie.id)
                  }
                >
                  Remove
                </button>

              </div>
            ))
          )}
        </div>
      )}

<h2>Movies</h2>

<button onClick={loadMovies}>
  Refresh Movies
</button>

{availableMovies.map((movie) => (
  <div key={movie.id}>

    <input
      type="checkbox"
      checked={selectedMovieIds.includes(movie.id)}
      onChange={() => toggleMovie(movie.id)}
    />

    <strong>
      {movie.title}
    </strong>

    <span>
      {" "}({movie.year})
    </span>

    <span>
      {" "}— Scare Rating: {movie.scare_rating}
    </span>

    <div>
      {movie.subgenres.map((subgenre) => (
        <span key={subgenre.id}>
          {subgenre.name}{" "}
        </span>
      ))}
    </div>

  </div>
))}
    <button onClick={handleAddMovies}>
      Add Selected Movies
    </button> 
    </div>
  )
}

export default Admin