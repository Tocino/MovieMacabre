import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  createVotingSession,
  getVotingSession,
  getMovies,
  addMoviesToSession,
  removeMoviesFromSession,
  closeVoting,
  openVoting,
  getVotingResults,
  getVotingSessions,
  generateSessionMovies,
  getSubgenres,
  setMovieWatched,
} from "../services/api";

import type {
  Subgenre,
} from "../types/subgenre";

import type {
  VotingSession,
} from "../types/session";

import type {
  Movie,
} from "../types/movie";

import type {
  VotingResults,
} from "../types/vote";

import type {
  User,
} from "../types/user";

import AppHeader from "../components/AppHeader";


function Admin() {
  const { user } =
    useOutletContext<{
      user: User;
    }>();

  const navigate = useNavigate();


  // -------------------------
  // Session state
  // -------------------------

  const [
    sessionName,
    setSessionName,
  ] = useState("");

  const [
    sessionCode,
    setSessionCode,
  ] = useState("");

  const [
    session,
    setSession,
  ] = useState<VotingSession | null>(
    null
  );

  const [
    votingSessions,
    setVotingSessions,
  ] = useState<VotingSession[]>([]);


  // -------------------------
  // Movie state
  // -------------------------

  const [
    movies,
    setMovies,
  ] = useState<Movie[]>([]);

  const [
    selectedMovieIds,
    setSelectedMovieIds,
  ] = useState<number[]>([]);


  // -------------------------
  // Generator state
  // -------------------------

  const [
    subgenres,
    setSubgenres,
  ] = useState<Subgenre[]>([]);

  const [
    selectedSubgenreIds,
    setSelectedSubgenreIds,
  ] = useState<number[]>([]);

  const [
    movieCount,
    setMovieCount,
  ] = useState(6);

  const [
    minScareRating,
    setMinScareRating,
  ] = useState(3);

  const [
    excludeWatched,
    setExcludeWatched,
  ] = useState(true);

  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);


  // -------------------------
  // Results / errors
  // -------------------------

  const [
    error,
    setError,
  ] = useState("");

  const [
    votingResults,
    setVotingResults,
  ] = useState<VotingResults | null>(
    null
  );


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
  // Load voting sessions
  // -------------------------

  async function loadSessions() {
    try {
      const sessions =
        await getVotingSessions();

      setVotingSessions(
        sessions
      );
    } catch (error) {
      console.error(
        "Failed to load sessions:",
        error
      );
    }
  }


  // -------------------------
  // Initial data
  // -------------------------

  useEffect(() => {
    loadMovies();
    loadSessions();
  }, []);


  useEffect(() => {
    async function loadSubgenres() {
      try {
        const data =
          await getSubgenres();

        setSubgenres(data);

        // Select all subgenres
        // by default.
        setSelectedSubgenreIds(
          data.map(
            (subgenre) =>
              subgenre.id
          )
        );
      } catch (error) {
        console.error(
          "Failed to load subgenres:",
          error
        );
      }
    }

    loadSubgenres();
  }, []);


  // -------------------------
  // Voting results
  // -------------------------

  useEffect(() => {
    if (!session) {
      return;
    }

    const code =
      session.code;

    async function refreshResults() {
      try {
        const results =
          await getVotingResults(
            code
          );

        setVotingResults(
          results
        );
      } catch (error) {
        console.error(
          "Failed to refresh voting results:",
          error
        );
      }
    }

    // Load immediately.
    refreshResults();

    // Then refresh every 5 seconds.
    const intervalId =
      setInterval(
        refreshResults,
        5000
      );

    return () => {
      clearInterval(
        intervalId
      );
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
          sessionName.trim()
        );

      setSession(newSession);

      setSessionCode(
        newSession.code
      );

      setVotingResults(null);
      setSelectedMovieIds([]);

      await loadSessions();

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

  async function handleLoadSession(
    code?: string
  ) {
    const codeToLoad =
      code ??
      sessionCode
        .trim()
        .toUpperCase();

    if (!codeToLoad) {
      setError(
        "Please enter a session code"
      );

      return;
    }

    try {
      const existingSession =
        await getVotingSession(
          codeToLoad
        );

      if (!existingSession) {
        setError(
          "Session not found"
        );

        return;
      }

      setSession(
        existingSession
      );

      setSessionCode(
        existingSession.code
      );

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
          currentIds.includes(
            movieId
          )
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

      setSession(
        updatedSession
      );

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

      setSession(
        updatedSession
      );

      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Could not remove movie"
      );
    }
  }


  // -------------------------
  // Subgenre selection
  // -------------------------

  function toggleSubgenre(
    subgenreId: number
  ) {
    setSelectedSubgenreIds(
      (current) => {
        if (
          current.includes(
            subgenreId
          )
        ) {
          return current.filter(
            (id) =>
              id !== subgenreId
          );
        }

        return [
          ...current,
          subgenreId,
        ];
      }
    );
  }


  // -------------------------
  // Generate movies
  // -------------------------

  async function handleGenerateMovies() {
    if (!session) {
      setError(
        "Create or load a session first"
      );

      return;
    }

    if (
      selectedSubgenreIds.length === 0
    ) {
      setError(
        "Select at least one subgenre"
      );

      return;
    }

    if (
      movieCount < 1
    ) {
      setError(
        "Movie count must be at least 1"
      );

      return;
    }

    try {
      setIsGenerating(true);
      setError("");

      const updatedSession =
        await generateSessionMovies(
          session.code,
          {
            movie_count:
              movieCount,

            min_scare_rating:
              minScareRating,

            exclude_watched:
              excludeWatched,

            subgenre_ids:
              selectedSubgenreIds,
          }
        );

      setSession(
        updatedSession
      );

      setSelectedMovieIds([]);
    } catch (error) {
      console.error(
        "Failed to generate movies:",
        error
      );

      if (
        error instanceof Error
      ) {
        setError(
          error.message
        );
      } else {
        setError(
          "Could not generate movies"
        );
      }
    } finally {
      setIsGenerating(false);
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

      if (
        session.is_active
      ) {
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

      setSession(
        updatedSession
      );

      await loadSessions();

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
    movies.filter(
      (movie) => {
        if (!session) {
          return true;
        }

        return !session.movies.some(
          (sessionMovie) =>
            sessionMovie.id ===
            movie.id
        );
      }
    );


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


async function handleWatchedStatus(
  movieId: number,
  watched: boolean
) {
  try {
    await setMovieWatched(
      movieId,
      watched
    );

    // Update the main movie list.
    setMovies(
      (currentMovies) =>
        currentMovies.map(
          (movie) =>
            movie.id === movieId
              ? {
                  ...movie,
                  watched,
                }
              : movie
        )
    );

    // Update the currently loaded
    // session as well.
    setSession(
      (currentSession) => {
        if (!currentSession) {
          return null;
        }

        return {
          ...currentSession,
          movies:
            currentSession.movies.map(
              (movie) =>
                movie.id === movieId
                  ? {
                      ...movie,
                      watched,
                    }
                  : movie
            ),
        };
      }
    );

    setError("");
  } catch (error) {
    console.error(
      "Failed to update watched status:",
      error
    );

    setError(
      "Could not update watched status"
    );
  }
}


  // -------------------------
  // Page
  // -------------------------

  return (
    <>
      <AppHeader
        username={user.username}
      />

      <main className="app-page">

        {/* Session Management */}

        <section className="panel">
          <h2>
            Session Management
          </h2>

          <h3>
            Load Existing Session
          </h3>

          <div className="form-row">
            <input
              type="text"
              placeholder="Session Code"
              value={sessionCode}
              onChange={(event) =>
                setSessionCode(
                  event.target.value
                    .toUpperCase()
                )
              }
            />

            <button
              type="button"
              onClick={() =>
                handleLoadSession()
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
              type="button"
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


        {/* Generate Ballot */}

        {session && (
          <section className="panel">
            <h2>
              Generate Ballot
            </h2>

            <div className="form-row">
              <label>
                Number of Movies
              </label>

              <input
                type="number"
                min="1"
                max="20"
                value={movieCount}
                onChange={(event) =>
                  setMovieCount(
                    Number(
                      event.target.value
                    )
                  )
                }
              />
            </div>

            <div className="form-row">
              <label>
                Minimum Scare Rating
              </label>

              <select
                value={
                  minScareRating
                }
                onChange={(event) =>
                  setMinScareRating(
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                <option value={1}>
                  1+
                </option>

                <option value={2}>
                  2+
                </option>

                <option value={3}>
                  3+
                </option>

                <option value={4}>
                  4+
                </option>

                <option value={5}>
                  5
                </option>
              </select>
            </div>

            <label>
              <input
                type="checkbox"
                checked={
                  excludeWatched
                }
                onChange={(event) =>
                  setExcludeWatched(
                    event.target.checked
                  )
                }
              />

              {" "}
              Exclude watched movies
            </label>
            <div className="generator-subgenres">
              <h3>
                Subgenres
              </h3>

              <div className="form-row">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() =>
                    setSelectedSubgenreIds(
                      subgenres.map(
                        (subgenre) =>
                          subgenre.id
                      )
                    )
                  }
                >
                  Select All
                </button>

                <button
                  type="button"
                  className="button-secondary"
                  onClick={() =>
                    setSelectedSubgenreIds([])
                  }
                >
                  Clear All
                </button>
              </div>

  {subgenres.map(
    (subgenre) => (
      <label
        key={subgenre.id}
        className="subgenre-option"
      >
        <input
          type="checkbox"
          checked={
            selectedSubgenreIds.includes(
              subgenre.id
            )
          }
          onChange={() =>
            toggleSubgenre(
              subgenre.id
            )
          }
        />

        {" "}
        {subgenre.name}
      </label>
    )
  )}
</div>

            <button
              type="button"
              className="button-primary"
              onClick={
                handleGenerateMovies
              }
              disabled={
                isGenerating ||
                !session.is_active ||
                selectedSubgenreIds
                  .length === 0
              }
            >
              {isGenerating
                ? "Generating..."
                : "Generate Movies"}
            </button>
          </section>
        )}


        {/* Current Session */}

        {session && (
          <section className="panel">
            <h2>
              {session.name}
            </h2>

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
                    : leaders.length === 1
                      ? leaders[0]
                          .title
                      : "Tie"}
                </span>
              </div>
            </div>


            {/* Session Controls */}

            <div className="form-row">
              <button
                type="button"
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
                type="button"
                onClick={() =>
                  navigate(
                    `/voting/${session.code}/results`,
                    {
                      state: {
                        from:
                          "admin",
                      },
                    }
                  )
                }
              >
                View Results
              </button>
            </div>


            {/* Session Movies */}

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
                          type="button"
                          className="button-secondary"
                          onClick={() =>
                            handleWatchedStatus(
                              movie.id,
                              !movie.watched
                            )
                          }
                        >
                          {movie.watched
                            ? "Mark Unwatched"
                            : "Mark Watched"}
                        </button>

                        <button
                          type="button"
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


        {/* Available Movies */}

        <section className="panel">
          <div className="form-row">
            <h2>
              Available Movies
            </h2>

            <button
              type="button"
              onClick={
                loadMovies
              }
            >
              Refresh
            </button>
          </div>

          <div className="movie-list">
            {availableMovies.map(
              (movie) => (
                <label
                  className={`movie-row ${
                    selectedMovieIds.includes(movie.id)
                      ? "movie-row-selected"
                      : ""
                  }`}
                  key={movie.id}
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedMovieIds.includes(
                        movie.id
                      )
                    }
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
              type="button"
              className="button-primary"
              onClick={
                handleAddMovies
              }
              disabled={
                selectedMovieIds
                  .length === 0
              }
            >
              Add Selected Movies

              {selectedMovieIds.length >
                0 &&
                ` (${selectedMovieIds.length})`}
            </button>
          </div>
        </section>


        {/* Previous Sessions */}

        <section className="panel">
          <h2>
            Previous Sessions
          </h2>

          {votingSessions.length ===
          0 ? (
            <p>
              No sessions yet.
            </p>
          ) : (
            votingSessions.map(
              (votingSession) => (
                <div
                  key={
                    votingSession.id
                  }
                  className="session-history-row"
                >
                  <div>
                    <strong>
                      {
                        votingSession.name
                      }
                    </strong>

                    {" — "}
                    {
                      votingSession.code
                    }
                    {" — "}

                    {votingSession.is_active
                      ? "Active"
                      : "Closed"}
                  </div>

                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() =>
                      handleLoadSession(
                        votingSession.code
                      )
                    }
                  >
                    Load
                  </button>
                </div>
              )
            )
          )}
        </section>

      </main>
    </>
  );
}

export default Admin;