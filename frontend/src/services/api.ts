const API_URL = "http://127.0.0.1:8000"
import type { VotingSession } from "../types/session"
import type { Movie } from "../types/movie"
import type { VotingResults } from "../types/vote"

export async function createUser(username: string) {
  const response = await fetch(`${API_URL}/users/`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      username: username,
      is_admin: false,
      is_active: true,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create user")
  }

  return response.json()
}

export async function getUserByUsername(username: string) {
  const response = await fetch(
    `${API_URL}/users/by-username/${username}`
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error("Failed to get user")
  }

  return response.json()
}

export async function getOrCreateUser(username: string) {
  const user = await getUserByUsername(username)

  if (user) {
    return user
  }

  return createUser(username)
}

export async function getVotingSession(
  code: string
): Promise<VotingSession | null> {

  const response = await fetch(
    `${API_URL}/sessions/join/${code}`
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error("Failed to get voting session")
  }

  return response.json()
}

export async function createVotingSession(
  name: string
): Promise<VotingSession> {

  const response = await fetch(
    `${API_URL}/sessions/`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: name,
      }),
    }
  )

  if (!response.ok) {
    throw new Error("Failed to create voting session")
  }

  return response.json()
}

export async function getMovies(): Promise<Movie[]> {
  const response = await fetch(
    `${API_URL}/movies/list/`
  )

  if (!response.ok) {
    throw new Error("Failed to get movies")
  }

  return response.json()
}

export async function addMoviesToSession(
  code: string,
  movieIds: number[]
): Promise<VotingSession> {

  const response = await fetch(
    `${API_URL}/sessions/${code}/movies`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        movie_ids: movieIds,
      }),
    }
  )

  if (!response.ok) {
    throw new Error("Failed to add movies to session")
  }

  return response.json()
}

export async function removeMoviesFromSession(
  code: string,
  movieIds: number[]
): Promise<VotingSession> {
  const response = await fetch(
    `${API_URL}/sessions/${code}/removemovies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movieIds),
    }
  )

  if (!response.ok) {
    throw new Error(
      "Failed to remove movies from session"
    )
  }

  return response.json()
}



export async function getVotingResults(
  code: string
): Promise<VotingResults> {

  const response = await fetch(
    `http://localhost:8000/voting/${code}/results`
  )

  if (!response.ok) {
    throw new Error("Failed to load voting results")
  }

  return response.json()
}


export async function getUserVotes(
  code: string,
  userId: number
): Promise<number[]> {

  const response = await fetch(
    `http://localhost:8000/voting/${code}/votes/${userId}`
  )

  if (!response.ok) {
    throw new Error(
      "Failed to load user votes"
    )
  }

  return response.json()
}

export async function closeVoting(
  code: string
) {
  const response = await fetch(
    `http://localhost:8000/sessions/${code}/close`,
    {
      method: "PATCH"
    }
  )

  if (!response.ok) {
    throw new Error(
      "Failed to close voting"
    )
  }

  return response.json()
}


export async function openVoting(
  code: string
) {
  const response = await fetch(
    `http://localhost:8000/sessions/${code}/open`,
    {
      method: "PATCH"
    }
  )

  if (!response.ok) {
    throw new Error(
      "Failed to open voting"
    )
  }

  return response.json()
}