import { useState } from "react"
import { createUser, getUserByUsername, getOrCreateUser, getVotingSession } from "../services/api"
import { useNavigate } from "react-router-dom"

function JoinSession() {
  const [username, setUsername] = useState("")
  const [sessionCode, setSessionCode] = useState("")
  const navigate = useNavigate()
  const [error, setError] = useState("")

async function handleJoin() {
  try {
    const user =
      await getOrCreateUser(username)

    const session =
      await getVotingSession(sessionCode)

    if (!session) {
      setError("Invalid session code")
      return
    }

    sessionStorage.setItem(
      "user",
      JSON.stringify(user)
    )
    navigate(
      `/vote/${session.code}`,
      {
        state: {
          user: user
        }
      }
    )

  } catch (error) {
    console.error(error)
  }
}



  return (
    <div>
      <h1>MovieMacabre</h1>
      <h2>Join Movie Night</h2>

      <div>
        <label>Username</label>

        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </div>

      <div>
        <label>Session Code</label>

        <input
          type="text"
          value={sessionCode}
          onChange={(event) => setSessionCode(event.target.value)}
        />
      </div>

      <button onClick={handleJoin}>
        Join Session
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  )
}

export default JoinSession