import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  getVotingResults,
  setMovieWatched,
} from "../services/api";

import type {
  VotingResults,
} from "../types/vote";

import type {
  User,
} from "../types/user";

import AppHeader from "../components/AppHeader";


function Results() {
  const { user } =
    useOutletContext<{
      user: User;
    }>();

  const { code } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from;

  // -------------------------
  // State
  // -------------------------

  const [results, setResults] =
    useState<VotingResults | null>(null);

  const [
    watchedMessage,
    setWatchedMessage,
  ] = useState("");

  const [
    isMarkingWatched,
    setIsMarkingWatched,
  ] = useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");


  // -------------------------
  // Load results
  // -------------------------

  useEffect(() => {
    async function loadResults() {
      if (!code) {
        setLoadError(
          "Session code not found."
        );
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const votingResults =
          await getVotingResults(code);

        setResults(votingResults);
      } catch (error) {
        console.error(
          "Failed to load voting results:",
          error
        );

        if (error instanceof Error) {
          setLoadError(error.message);
        } else {
          setLoadError(
            "Could not load voting results."
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadResults();
  }, [code]);


  // -------------------------
  // Result calculations
  // -------------------------

  const highestVotes =
    results?.results[0]?.votes ?? 0;

  const winners =
    highestVotes > 0
      ? results?.results.filter(
          (movie) =>
            movie.votes === highestVotes
        ) ?? []
      : [];

  const totalVotes =
    results?.results.reduce(
      (total, movie) =>
        total + movie.votes,
      0
    ) ?? 0;


  // -------------------------
  // Navigation
  // -------------------------

  function handleBack() {
    if (from === "admin") {
      navigate("/admin");
      return;
    }

    navigate(
      `/voting/${code}`
    );
  }


  // -------------------------
  // Mark winner watched
  // -------------------------

  async function handleMarkWinnerWatched() {
    if (winners.length !== 1) {
      return;
    }

    const winner = winners[0];

    try {
      setIsMarkingWatched(true);
      setWatchedMessage("");

      await setMovieWatched(
        winner.movie_id,
        true
      );
      setResults((currentResults) => {
        if (!currentResults) {
          return null;
        }

        return {
          ...currentResults,
          results:
            currentResults.results.map(
              (movie) =>
                movie.movie_id ===
                winner.movie_id
                  ? {
                      ...movie,
                      watched: true,
                    }
                  : movie
            ),
        };
      });


      setWatchedMessage(
        `${winner.title} marked as watched.`
      );
    } catch (error) {
      console.error(
        "Failed to mark winner as watched:",
        error
      );

      setWatchedMessage(
        "Could not mark the winner as watched."
      );
    } finally {
      setIsMarkingWatched(false);
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

        {isLoading && (
          <section className="panel">
            <p>
              Loading results...
            </p>
          </section>
        )}

        {!isLoading && loadError && (
          <section className="panel">
            <p className="error-message">
              {loadError}
            </p>

            <button
              type="button"
              onClick={handleBack}
            >
              Back
            </button>
          </section>
        )}

        {!isLoading &&
          !loadError &&
          results && (
          <>
            {/* Session summary */}

            <section className="panel">

              <h2>
                {results.session_name}
              </h2>

              <p>
                Session Code:{" "}
                <strong>
                  {results.code}
                </strong>
              </p>

              <div className="stats">

                <div className="stat-card">
                  <span className="stat-label">
                    Voters
                  </span>

                  <span className="stat-value">
                    {results.total_voters}
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-label">
                    Movies
                  </span>

                  <span className="stat-value">
                    {results.results.length}
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

              </div>


              {/* Single winner */}

              {winners.length === 1 && (
                <div className="winner-summary">

                  <h3>
                    ★ Winner
                  </h3>

                  <p>
                    <strong>
                      {winners[0].title}
                    </strong>
                    {" — "}
                    {winners[0].votes}{" "}
                    {winners[0].votes === 1
                      ? "vote"
                      : "votes"}
                  </p>

                  {user.is_admin && (
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={
                        handleMarkWinnerWatched
                      }
                      disabled={
                        isMarkingWatched ||
                        winners[0].watched
                      }
                    >
                      {isMarkingWatched
                        ? "Updating..."
                        : winners[0].watched
                          ? "✓ Watched"
                          : `Mark ${winners[0].title} as Watched`}
                    </button>
                  )}

                  {watchedMessage && (
                    <p className="success-message">
                      {watchedMessage}
                    </p>
                  )}

                </div>
              )}


              {/* Tie */}

              {winners.length > 1 && (
                <div className="winner-summary">

                  <h3>
                    ★ Tie for First
                  </h3>

                  <p>
                    {winners
                      .map(
                        (movie) =>
                          movie.title
                      )
                      .join(", ")}
                    {" — "}
                    {highestVotes} votes each
                  </p>

                </div>
              )}


              {/* No votes */}

              {highestVotes === 0 && (
                <p>
                  No votes have been cast yet.
                </p>
              )}

            </section>


            {/* Results */}

            <section className="panel">

              <h2>
                Results
              </h2>

              <div className="results-list">

                {results.results.map(
                  (movie) => {

                    const percentage =
                      highestVotes === 0
                        ? 0
                        : (
                            movie.votes /
                            highestVotes
                          ) * 100;

                    const rank =
                      results.results.findIndex(
                        (result) =>
                          result.votes ===
                          movie.votes
                      ) + 1;

                    const isWinner =
                      highestVotes > 0 &&
                      movie.votes ===
                        highestVotes;

                    return (
                      <div
                        className={`result-row ${
                          isWinner
                            ? "result-winner"
                            : ""
                        }`}
                        key={movie.movie_id}
                      >

                        <div className="result-heading">

                          <span className="result-title">
                            {rank}.{" "}
                            {movie.title}

                            {isWinner && (
                              <span className="winner-label">
                                {" "}★ Winner
                              </span>
                            )}
                          </span>

                          <span className="result-votes">
                            {movie.votes}{" "}
                            {movie.votes === 1
                              ? "vote"
                              : "votes"}
                          </span>

                        </div>

                        <div className="result-bar">

                          <div
                            className="result-bar-fill"
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

              <div className="form-row">
                <button
                  type="button"
                  onClick={handleBack}
                >
                  Back
                </button>
              </div>

            </section>
          </>
        )}

      </main>
    </>
  );
}

export default Results;