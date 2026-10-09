const API_URL = "http://127.0.0.1:8000"
import type { VotingSession } from "../types/session"
import type { Movie } from "../types/movie"
import type { VotingResults } from "../types/vote"


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
) {
  const token =
    sessionStorage.getItem(
      "access_token"
    );

  if (!token) {
    throw new Error("Not logged in");
  }

  const response = await fetch(
    "http://localhost:8000/sessions/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "Failed to create voting session"
    );
  }

  return response.json();
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
) {
  const token =
    sessionStorage.getItem(
      "access_token"
    );

  if (!token) {
    throw new Error("Not logged in");
  }

  const response = await fetch(
    `http://localhost:8000/sessions/${code}/movies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        movie_ids: movieIds,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "Failed to add movies"
    );
  }

  return response.json();
}


export async function removeMoviesFromSession(
  code: string,
  movieIds: number[]
) {
  const token =
    sessionStorage.getItem(
      "access_token"
    );

  if (!token) {
    throw new Error(
      "Not logged in"
    );
  }

  const response = await fetch(
    `http://localhost:8000/sessions/${code}/removemovies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(
        movieIds
      ),
    }
  );

  if (!response.ok) {
    const error =
      await response.json();

    throw new Error(
      error.detail ||
      "Failed to remove movies"
    );
  }

  return response.json();
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
  code: string
) {
  const token =
    sessionStorage.getItem(
      "access_token"
    );

  if (!token) {
    throw new Error(
      "Not logged in"
    );
  }

  const response = await fetch(
    `http://localhost:8000/voting/${code}/votes`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "Failed to load votes"
    );
  }

  return response.json();
}


export async function closeVoting(
  code: string
) {
  const token =
    sessionStorage.getItem(
      "access_token"
    );

  if (!token) {
    throw new Error(
      "Not logged in"
    );
  }

  const response = await fetch(
    `http://localhost:8000/sessions/${code}/close`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "Failed to close voting"
    );
  }

  return response.json();
}


export async function openVoting(
  code: string
) {
  const token =
    sessionStorage.getItem(
      "access_token"
    );

  if (!token) {
    throw new Error("Not logged in");
  }

  const response = await fetch(
    `http://localhost:8000/sessions/${code}/open`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "Failed to open voting"
    );
  }

  return response.json();
}


export async function loginUser(
  username: string,
  password: string
) {
  const response = await fetch(
    "http://localhost:8000/users/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Login failed"
    );
  }

  return response.json();
}


export async function getCurrentUser() {
  const token =
    sessionStorage.getItem(
      "access_token"
    );

  if (!token) {
    throw new Error(
      "Not logged in"
    );
  }

  const response = await fetch(
    "http://localhost:8000/users/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to get current user"
    );
  }

  return response.json();
}


export async function castVote(
  code: string,
  movieIds: number[]
) {
  const token =
    sessionStorage.getItem(
      "access_token"
    );

  if (!token) {
    throw new Error(
      "Not logged in"
    );
  }

  const response = await fetch(
    `http://localhost:8000/voting/${code}/votes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        movie_ids: movieIds,
      }),
    }
  );

  if (!response.ok) {
    const error =
      await response.json();

    throw new Error(
      error.detail ||
      "Failed to submit vote"
    );
  }

  return response.json();
}


export async function registerUser(
  username: string,
  password: string
) {
  const response = await fetch(
    "http://localhost:8000/users/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "Failed to create account"
    );
  }

  return response.json();
}


export function logoutUser() {
  sessionStorage.removeItem(
    "access_token"
  );
}