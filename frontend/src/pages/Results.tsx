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
  getVotingResults
} from "../services/api"

import type {
  VotingResults
} from "../types/vote"



function Results() {

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
    <div>

      <h1>MovieMacabre</h1>

      <h2>Voting Results</h2>

      {results && (
        <>

          <h3>
            {results.session_name}
          </h3>

          {results.results.map(
            (movie, index) => (

              <div key={movie.movie_id}>

                <strong>
                  {index + 1}. {movie.title}
                </strong>

                {" — "}

                {movie.votes === 1
                  ? "1 vote"
                  : `${movie.votes} votes`
                }

              </div>

            )
          )}
            <br />

            <button onClick={handleBack}>
            Back
            </button>
        </>
      )}

    </div>
  )
}





export default Results