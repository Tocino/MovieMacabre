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
  getCurrentUser,
  getVotingResults,
} from "../services/api"

import type {
  VotingResults
} from "../types/vote"

import AppHeader from "../components/AppHeader";


function Results() {

    const [username, setUsername] =
      useState("");

    const { code } = useParams()

    const location = useLocation()
    const navigate = useNavigate()

    const from = location.state?.from
    const user = location.state?.user

    const [results, setResults] =
    useState<VotingResults | null>(null)

  useEffect(() => {

    async function loadResults() {

      if (!code) {
        return
      }

      const votingResults =
        await getVotingResults(code)

      setResults(votingResults)
    }

    loadResults()

  }, [code])

  useEffect(() => {
  async function checkAuth() {
    try {
      const currentUser =
        await getCurrentUser();

      setUsername(
        currentUser.username
      );
    } catch {
      sessionStorage.removeItem(
        "access_token"
      );

      navigate("/login");
    }
  }

  checkAuth();
}, [navigate]);

function handleBack() {

  if (from === "admin") {
    navigate("/admin")
    return
  }

  navigate(
    `/vote/${code}`,
    {
      state: {
        user: user
      }
    }
  )
}

return (
  <>
    <AppHeader
      username={username}
    />
  <main className="app-page">


    {!results && (
      <section className="panel">
        <p>Loading results...</p>
      </section>
    )}

    {results && (
      <>
        <section className="panel">

          <h2>{results.session_name}</h2>

          <p>
            Session Code:{" "}
            <strong>{results.code}</strong>
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
                {results.results.reduce(
                  (total, movie) =>
                    total + movie.votes,
                  0
                )}
              </span>
            </div>

          </div>

        </section>


        <section className="panel">

          <h2>Results</h2>

          <div className="results-list">

            {results.results.map(
              (movie, index) => {

                const highestVotes =
                  results.results[0]?.votes ?? 0

                const percentage =
                  highestVotes === 0
                    ? 0
                    : (
                        movie.votes /
                        highestVotes
                      ) * 100

                return (
                  <div
                    className="result-row"
                    key={movie.movie_id}
                  >

                    <div className="result-heading">

                      <span className="result-title">
                        {index + 1}.{" "}
                        {movie.title}
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
                            `${percentage}%`
                        }}
                      />

                    </div>

                  </div>
                )
              }
            )}

          </div>

          <div className="form-row">
            <button onClick={handleBack}>
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





export default Results