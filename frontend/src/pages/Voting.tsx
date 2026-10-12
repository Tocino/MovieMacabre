
import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
  useOutletContext
} from "react-router-dom";

import {
  getVotingSession,
  getUserVotes,
  castVote,
} from "../services/api";

import type {
  VotingSession,
} from "../types/session";

import type {
  User,
} from "../types/user";

import AppHeader from "../components/AppHeader";

function Voting() {
  const { user } = useOutletContext<{ user: User }>();

  const [submitMessage, setSubmitMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const [session, setSession] =
    useState<VotingSession | null>(null);

  const [
    selectedMovieIds,
    setSelectedMovieIds,
  ] = useState<number[]>([]);

  const { code } = useParams();

  const navigate = useNavigate();

  const [
    saveMessage,
    setSaveMessage,
  ] = useState("");

  const [
    savedMovieIds,
    setSavedMovieIds,
  ] = useState<number[]>([]);

  const hasUnsavedChanges =
    selectedMovieIds.length !==
      savedMovieIds.length ||
    selectedMovieIds.some(
      (id) =>
        !savedMovieIds.includes(id)
    );

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
      if (!code) {
        return;
      }

      try {
        const movieIds =
          await getUserVotes(code);

        setSelectedMovieIds(
          movieIds
        );
        setSavedMovieIds(movieIds);
      } catch (error) {
        console.error(
          "Failed to load user votes:",
          error
        );
      }
    }

    loadUserVotes();
  }, [code]);

  // -------------------------
  // Toggle movie
  // -------------------------

  function toggleMovie(
    movieId: number
  ) {
    setSaveMessage("");
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
    setSaveMessage("");

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

      setSaveMessage(
        selectedMovieIds.length === 0
          ? "Your votes have been cleared."
          : "Your votes have been saved!"
      );

      setSavedMovieIds(
        selectedMovieIds,
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
  // Page
  // -------------------------

return (
  <>
    <AppHeader
      username={user.username}
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
                {user.username}
              </strong>
            </p>

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
              <p className="selection-count">
                {selectedMovieIds.length === 0
                  ? "No movies selected"
                  : `${selectedMovieIds.length} ${
                      selectedMovieIds.length === 1
                        ? "movie"
                        : "movies"
                    } selected`}
              </p>
              {hasUnsavedChanges && (
                <p className="unsaved-message">
                  You have unsaved changes.
                </p>
              )}
              <button
                type="button"
                className="button-primary"
                onClick={handleSubmitVote}
                disabled={
                  isSubmitting ||
                  !session.is_active
                }
              >
                {isSubmitting
                  ? "Saving..."
                  : selectedMovieIds.length === 0
                    ? "Clear My Votes"
                    : "Save My Votes"}
              </button>

              <button
                type="button"
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
                disabled={hasUnsavedChanges}
              >
                View Results
              </button>
              {hasUnsavedChanges && (
                <p className="unsaved-message">
                  Save your changes before viewing results.
                </p>
              )}
            </div>

            {/* Messages */}

            {saveMessage && (
              <p className="success-message">
                {saveMessage}
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

