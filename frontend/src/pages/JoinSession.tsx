import { useState } from "react"

function JoinSession() {
  const [username, setUsername] = useState("")
  const [sessionCode, setSessionCode] = useState("")

  function handleJoin() {
  console.log("Username:", username)
  console.log("Session code:", sessionCode)
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
    </div>
  )
}

export default JoinSession