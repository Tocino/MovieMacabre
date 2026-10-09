
import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  getVotingSession,
  getUserVotes,
  castVote,
  getCurrentUser,
  logoutUser
} from "../services/api";

import type {
  VotingSession,
} from "../types/session";

import AppHeader from "../components/AppHeader";

function Voting() {
  const [submitMessage, setSubmitMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [session, setSession] =
    useState<VotingSession | null>(null);

  const [
    selectedMovieIds,
    setSelectedMovieIds,
  ] = useState<number[]>([]);

  const { code } = useParams();

  const navigate = useNavigate();

  // -------------------------
  // Check authentication
  // -------------------------

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser =
          await getCurrentUser();

        setUsername(
          currentUser.username
        );
      } catch (error) {
        console.error(
          "Authentication failed:",
          error
        );

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
  // Load voting session
  // -------------------------

  useEffect(() => {
    async function loadSession() {
      if (!code) {
        return;
      }

      try {
        const votingSession =
          await getVotingSession(code);

        setSession(votingSession);
      } catch (error) {
        console.error(
          "Failed to load voting session:",
          error
        );
      }
    }

    loadSession();

    const intervalId =
      setInterval(
        loadSession,
        5000
      );

    return () => {
      clearInterval(intervalId);
    };
  }, [code]);

  // -------------------------
  // Load current user's votes
  // -------------------------

  useEffect(() => {
    async function loadUserVotes() {
      if (!code || checkingAuth) {
        return;
      }

      try {
        const movieIds =
          await getUserVotes(code);

        setSelectedMovieIds(
          movieIds
        );
      } catch (error) {
        console.error(
          "Failed to load user votes:",
          error
        );
      }
    }

    loadUserVotes();
  }, [code, checkingAuth]);

  // -------------------------
  // Toggle movie
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
            (id) => id !== movieId
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
  // Submit vote
  // -------------------------

  async function handleSubmitVote() {
    if (!code) {
      setSubmitError(
        "Session code not found."
      );

      return;
    }

    if (!session?.is_active) {
      setSubmitError(
        "Voting is closed for this session."
      );

      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");
    setSubmitError("");

    try {
      await castVote(
        code,
        selectedMovieIds
      );

      setSubmitMessage(
        "Your votes have been submitted!"
      );
    } catch (error) {
      console.error(
        "Error submitting votes:",
        error
      );

      if (error instanceof Error) {
        setSubmitError(
          error.message
        );
      } else {
        setSubmitError(
          "Could not submit your votes. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // -------------------------
  // Authentication loading
  // -------------------------

  if (checkingAuth) {
    return (
      <p>Checking login...</p>
    );
  }


function handleLogout() {
  logoutUser();
  navigate("/login");
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

      {!session && (
        <section className="panel">
          <p>
            Loading session...
          </p>
        </section>
      )}

      {session && (
        <>
          {/* Session information */}

          <section className="panel">
            <h2>
              {session.name}
            </h2>

            <p>
              Welcome{" "}
              <strong>
                {username}
              </strong>
            </p>

            <button
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>

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
                  ? "● Voting Open"
                  : "● Voting Closed"}
              </span>
            </p>
          </section>

          {/* Voting */}

          <section className="panel">
            <h2>
              Select Your Movies
            </h2>

            <p>
              Choose all the movies you
              would like to watch.
            </p>

            {!session.is_active && (
              <p className="error-message">
                Voting is closed for this
                session. Your previous
                selections are shown below.
              </p>
            )}

            <div className="movie-list">
              {session.movies.map(
                (movie) => (
                  <label
                    className="movie-row"
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
                      disabled={
                        !session.is_active
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

            {/* Voting controls */}

            <div className="form-row">
              <button
                className="button-primary"
                onClick={
                  handleSubmitVote
                }
                disabled={
                  selectedMovieIds.length ===
                    0 ||
                  isSubmitting ||
                  !session.is_active
                }
              >
                {isSubmitting
                  ? "Submitting..."
                  : `Submit Vote${
                      selectedMovieIds.length >
                      0
                        ? ` (${selectedMovieIds.length})`
                        : ""
                    }`}
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/voting/${code}/results`,
                    {
                      state: {
                        from: "voting",
                      },
                    }
                  )
                }
              >
                View Results
              </button>
            </div>

            {/* Messages */}

            {submitMessage && (
              <p className="success-message">
                {submitMessage}
              </p>
            )}

            {submitError && (
              <p className="error-message">
                {submitError}
              </p>
            )}
          </section>
        </>
      )}
    </main>
    </>
  );
}

export default Voting;

