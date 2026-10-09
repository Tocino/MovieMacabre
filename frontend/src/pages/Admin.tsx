
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  createVotingSession,
  getVotingSession,
  getMovies,
  addMoviesToSession,
  removeMoviesFromSession,
  closeVoting,
  openVoting,
  getVotingResults,
  getCurrentUser,
} from "../services/api";

import type { VotingSession } from "../types/session";
import type { Movie } from "../types/movie";
import type { VotingResults } from "../types/vote";
import AppHeader from "../components/AppHeader";

function Admin() {
  // -------------------------
  // State
  // -------------------------

  const [sessionName, setSessionName] =
    useState("");

  const [sessionCode, setSessionCode] =
    useState("");

  const [session, setSession] =
    useState<VotingSession | null>(null);

  const [movies, setMovies] =
    useState<Movie[]>([]);

  const [
    selectedMovieIds,
    setSelectedMovieIds,
  ] = useState<number[]>([]);

  const [error, setError] =
    useState("");

  const [
    votingResults,
    setVotingResults,
  ] = useState<VotingResults | null>(null);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const navigate = useNavigate();

const [username, setUsername] =
  useState("");

  // -------------------------
  // Authentication
  // -------------------------

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser =
          await getCurrentUser();

        if (!currentUser.is_admin) {
          navigate("/login");
          return;
        }
        setUsername(currentUser.username)
      } catch {
        sessionStorage.removeItem(
          "access_token"
        );

        navigate("/login");
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, [navigate]);

  // -------------------------
  // Load movies
  // -------------------------

  async function loadMovies() {
    try {
      const movieData =
        await getMovies();

      setMovies(movieData);
      setSelectedMovieIds([]);
      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Could not load movies"
      );
    }
  }

  // -------------------------
  // Voting results
  // -------------------------

  useEffect(() => {
    if (!session) {
      return;
    }

    const code = session.code;

    async function refreshResults() {
      try {
        const results =
          await getVotingResults(code);

        setVotingResults(results);
      } catch (error) {
        console.error(
          "Failed to refresh voting results:",
          error
        );
      }
    }

    // Load immediately
    refreshResults();

    // Refresh every 5 seconds
    const intervalId =
      setInterval(
        refreshResults,
        5000
      );

    return () => {
      clearInterval(intervalId);
    };
  }, [session?.code]);

  // -------------------------
  // Create session
  // -------------------------

  async function handleCreateSession() {
    if (!sessionName.trim()) {
      setError(
        "Please enter a session name"
      );

      return;
    }

    try {
      const newSession =
        await createVotingSession(
          sessionName
        );

      setSession(newSession);
      setVotingResults(null);
      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Could not create voting session"
      );
    }
  }

  // -------------------------
  // Load existing session
  // -------------------------

  async function handleLoadSession() {
    if (!sessionCode.trim()) {
      setError(
        "Please enter a session code"
      );

      return;
    }

    try {
      const existingSession =
        await getVotingSession(
          sessionCode
            .trim()
            .toUpperCase()
        );

      if (!existingSession) {
        setError(
          "Session not found"
        );

        return;
      }

      setSession(existingSession);
      setVotingResults(null);
      setSelectedMovieIds([]);
      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Could not load session"
      );
    }
  }

  // -------------------------
  // Select movies
  // -------------------------

  function toggleMovie(
    movieId: number
  ) {
    setSelectedMovieIds(
      (currentIds) => {
        if (
          currentIds.includes(movieId)
        ) {
          return currentIds.filter(
            (id) =>
              id !== movieId
          );
        }

        return [
          ...currentIds,
          movieId,
        ];
      }
    );
  }

  // -------------------------
  // Add movies
  // -------------------------

  async function handleAddMovies() {
    if (!session) {
      setError(
        "Create a session first"
      );

      return;
    }

    if (
      selectedMovieIds.length === 0
    ) {
      setError(
        "Select at least one movie"
      );

      return;
    }

    try {
      const updatedSession =
        await addMoviesToSession(
          session.code,
          selectedMovieIds
        );

      setSession(updatedSession);
      setSelectedMovieIds([]);
      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Could not add movies to session"
      );
    }
  }

  // -------------------------
  // Remove movie
  // -------------------------

  async function handleRemoveMovie(
    movieId: number
  ) {
    if (!session) {
      return;
    }

    try {
      const updatedSession =
        await removeMoviesFromSession(
          session.code,
          [movieId]
        );

      setSession(updatedSession);
      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Could not remove movie"
      );
    }
  }

  // -------------------------
  // Open / close voting
  // -------------------------

  async function handleVotingStatus() {
    if (!session) {
      return;
    }

    try {
      let updatedSession;

      if (session.is_active) {
        updatedSession =
          await closeVoting(
            session.code
          );
      } else {
        updatedSession =
          await openVoting(
            session.code
          );
      }

      setSession(updatedSession);
      setError("");
    } catch (error) {
      console.error(
        "Failed to change voting status:",
        error
      );

      setError(
        "Could not change voting status"
      );
    }
  }

  // -------------------------
  // Available movies
  // -------------------------

  const availableMovies =
    movies.filter((movie) => {
      if (!session) {
        return true;
      }

      return !session.movies.some(
        (sessionMovie) =>
          sessionMovie.id ===
          movie.id
      );
    });

  // -------------------------
  // Dashboard statistics
  // -------------------------

  const totalVotes =
    votingResults?.results.reduce(
      (total, movie) =>
        total + movie.votes,
      0
    ) ?? 0;

  const highestVoteCount =
    votingResults?.results[0]
      ?.votes ?? 0;

  const leaders =
    votingResults?.results.filter(
      (movie) =>
        movie.votes ===
          highestVoteCount &&
        highestVoteCount > 0
    ) ?? [];

  // -------------------------
  // Authentication loading
  // -------------------------

  if (checkingAuth) {
    return (
      <p>Checking login...</p>
    );
  }

  // -------------------------
  // Page
  // -------------------------

  return (
  <>
    <AppHeader
      username={username}
    />

    <main className="app-page">

      {/* Session setup */}
      <section className="panel">
        <h2>Session Management</h2>

        <h3>Load Existing Session</h3>

        <div className="form-row">
          <input
            type="text"
            placeholder="Session Code"
            value={sessionCode}
            onChange={(event) =>
              setSessionCode(
                event.target.value
              )
            }
          />

          <button
            className="button-primary"
            onClick={
              handleLoadSession
            }
          >
            Load Session
          </button>
        </div>

        <h3>
          Create Voting Session
        </h3>

        <div className="form-row">
          <input
            type="text"
            placeholder="Session Name"
            value={sessionName}
            onChange={(event) =>
              setSessionName(
                event.target.value
              )
            }
          />

          <button
            className="button-primary"
            onClick={
              handleCreateSession
            }
          >
            Create Session
          </button>
        </div>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}
      </section>

      {/* Current session */}
      {session && (
        <section className="panel">
          <h2>{session.name}</h2>

          <p>
            Session Code:{" "}
            <strong>
              {session.code}
            </strong>
          </p>

          <p>
            Status:{" "}
            <span
              className={
                session.is_active
                  ? "status-active"
                  : "status-inactive"
              }
            >
              {session.is_active
                ? "● Active"
                : "● Closed"}
            </span>
          </p>

          {/* Stats */}
          <div className="stats">
            <div className="stat-card">
              <span className="stat-label">
                Movies
              </span>

              <span className="stat-value">
                {
                  session.movies
                    .length
                }
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                Voters
              </span>

              <span className="stat-value">
                {votingResults
                  ?.total_voters ?? 0}
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                Total Votes
              </span>

              <span className="stat-value">
                {totalVotes}
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                Current Leader
              </span>

              <span className="stat-value">
                {leaders.length === 0
                  ? "No votes"
                  : leaders.length ===
                      1
                    ? leaders[0]
                        .title
                    : "Tie"}
              </span>
            </div>
          </div>

          {/* Session controls */}
          <div className="form-row">
            <button
              className={
                session.is_active
                  ? "button-danger"
                  : "button-primary"
              }
              onClick={
                handleVotingStatus
              }
            >
              {session.is_active
                ? "Close Voting"
                : "Open Voting"}
            </button>

            <button
              onClick={() =>
                navigate(
                  `/voting/${session.code}/results`,
                  {
                    state: {
                      from: "admin",
                    },
                  }
                )
              }
            >
              View Results
            </button>
          </div>

          {/* Session movies */}
          <h3>
            Movies in Session
          </h3>

          {session.movies.length ===
          0 ? (
            <p>
              No movies added yet.
            </p>
          ) : (
            <div className="movie-list">
              {session.movies.map(
                (movie) => (
                  <div
                    className="movie-row"
                    key={movie.id}
                  >
                    <div>
                      <span className="movie-title">
                        {movie.title}
                      </span>

                      <span className="movie-details">
                        {" "}
                        ({movie.year})
                        {" — "}
                        Scare Rating:{" "}
                        {
                          movie.scare_rating
                        }
                        {" — "}
                        {movie.subgenres
                          .map(
                            (
                              subgenre
                            ) =>
                              subgenre.name
                          )
                          .join(", ")}
                      </span>
                    </div>

                    <div className="movie-actions">
                      <button
                        className="button-danger"
                        onClick={() =>
                          handleRemoveMovie(
                            movie.id
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      )}

      {/* Available movies */}
      <section className="panel">
        <div className="form-row">
          <h2>
            Available Movies
          </h2>

          <button
            onClick={loadMovies}
          >
            Refresh
          </button>
        </div>

        <div className="movie-list">
          {availableMovies.map(
            (movie) => (
              <label
                className="movie-row"
                key={movie.id}
              >
                <input
                  type="checkbox"
                  checked={selectedMovieIds.includes(
                    movie.id
                  )}
                  onChange={() =>
                    toggleMovie(
                      movie.id
                    )
                  }
                />

                <div>
                  <span className="movie-title">
                    {movie.title}
                  </span>

                  <span className="movie-details">
                    {" "}
                    ({movie.year})
                    {" — "}
                    Scare Rating:{" "}
                    {
                      movie.scare_rating
                    }
                    {" — "}
                    {movie.subgenres
                      .map(
                        (
                          subgenre
                        ) =>
                          subgenre.name
                      )
                      .join(", ")}
                  </span>
                </div>
              </label>
            )
          )}
        </div>

        <div className="form-row">
          <button
            className="button-primary"
            onClick={
              handleAddMovies
            }
            disabled={
              selectedMovieIds.length ===
              0
            }
          >
            Add Selected Movies
            {selectedMovieIds.length >
              0 &&
              ` (${selectedMovieIds.length})`}
          </button>
        </div>
      </section>
    </main>
    </>
  );
}

export default Admin;
