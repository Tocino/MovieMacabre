import {
  useEffect,
  useState
} from "react"

import {
  useParams,
  useLocation,
  useNavigate
} from "react-router-dom"

import {
  getVotingSession,
  getUserVotes
} from "../services/api"

import type {
  VotingSession
} from "../types/session"



function Voting() {

  const [submitMessage, setSubmitMessage] =
    useState("")

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [submitError, setSubmitError] =
    useState("")

  const { code } = useParams()

  const location = useLocation()

  const from = location.state?.from

  const storedUser =
    sessionStorage.getItem("user")

  const user =
    location.state?.user ??
    (storedUser
      ? JSON.parse(storedUser)
      : null)
        
  const [session, setSession] =
    useState<VotingSession | null>(null)

  const [selectedMovieIds, setSelectedMovieIds] =
    useState<number[]>([])

  const navigate = useNavigate()

  // Load the voting session
  useEffect(() => {

    async function loadSession() {

      if (!code) {
        return
      }

      const votingSession =
        await getVotingSession(code)

      setSession(votingSession)
    }

    loadSession()

  }, [code])


  useEffect(() => {

  async function loadUserVotes() {

    if (!code || !user) {
      return
    }

    const movieIds =
      await getUserVotes(
        code,
        user.id
      )

    setSelectedMovieIds(movieIds)
  }

  loadUserVotes()

}, [code, user?.id])


  // ↓↓↓ TOGGLE GOES HERE ↓↓↓

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

async function handleSubmitVote() {

  if (!user) {
    setSubmitError("No user found")
    return
  }

  setIsSubmitting(true)
  setSubmitMessage("")
  setSubmitError("")

  try {

    const response = await fetch(
      `http://localhost:8000/voting/${code}/votes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          movie_ids: selectedMovieIds,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()

      throw new Error(
        error.detail ||
        "Failed to submit vote"
      )
    }

    await response.json()

    setSubmitMessage(
      "Your votes have been submitted!"
    )

  } catch (error) {

    console.error(
      "Error submitting votes:",
      error
    )

    setSubmitError(
      "Could not submit your votes. Please try again."
    )

  } finally {

    setIsSubmitting(false)

  }
}

  // ↓↓↓ THEN THE RETURN ↓↓↓

  return (
    <div>

      <h1>MovieMacabre</h1>

      {session && (
        <>
          <h2>{session.name}</h2>

          <p>
            Welcome {user?.username}
          </p>

          <h3>
            Select the movies you want to watch
          </h3>

          {session.movies.map((movie) => (

            <div key={movie.id}>

              <input
                type="checkbox"
                checked={
                  selectedMovieIds.includes(
                    movie.id
                  )
                }
                onChange={() =>
                  toggleMovie(movie.id)
                }
              />

              <strong>
                {movie.title}
              </strong>

              {" "}({movie.year})

              {" — Scare Rating: "}
              {movie.scare_rating}

              {" — Genre: "}

              {movie.subgenres
                .map(
                  (subgenre) =>
                    subgenre.name
                )
                .join(", ")}

            </div>

          ))}

          <br />

          <button
            onClick={handleSubmitVote}
            disabled={
              selectedMovieIds.length === 0 ||
              isSubmitting
            }
          >
            {isSubmitting
              ? "Submitting..."
              : "Submit Vote"
            }
          </button>
          <button
            onClick={() =>
              navigate(
                `/voting/${code}/results`,
                {
                  state: {
                    from: "voting",
                    user: user
                  }
                }
              )
            }
          >
            View Results
          </button>
          {submitMessage && (
            <p>{submitMessage}</p>
          )}

          {submitError && (
            <p>{submitError}</p>
          )}
        </>
      )}

    </div>
  )
}

export default Voting