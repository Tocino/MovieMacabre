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

import type {
  Subgenre,
} from "../types/subgenre";

type TokenResponse = {
  access_token: string;
  token_type: string;
};

type GenerateMoviesOptions = {
  movie_count: number;
  min_scare_rating: number;
  exclude_watched: boolean;
  subgenre_ids: number[];
};

const API_URL =
  "http://127.0.0.1:8000";


/*
 * Helpers
 */

function getAccessToken(): string {
  const token =
    sessionStorage.getItem(
      "access_token"
    );

  if (!token) {
    throw new Error(
      "Not logged in"
    );
  }

  return token;
}


async function authenticatedFetch(
  path: string,
  options: RequestInit = {}
) {
  const token =
    getAccessToken();

  const headers =
    new Headers(
      options.headers
    );

  headers.set(
    "Authorization",
    `Bearer ${token}`
  );

  return fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    }
  );
}


async function handleResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<T> {
  if (!response.ok) {
    let message =
      fallbackMessage;

    try {
      const error =
        await response.json();

      if (error.detail) {
        message =
          error.detail;
      }
    } catch {
      // Response did not contain JSON.
    }

    throw new Error(
      message
    );
  }

  return response.json();
}


/*
 * Authentication
 */

export async function loginUser(
  username: string,
  password: string
): Promise<TokenResponse> {
  const formData =
    new URLSearchParams();

  formData.append(
    "username",
    username
  );

  formData.append(
    "password",
    password
  );

  const response = await fetch(
    `${API_URL}/users/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: formData,
    }
  );

  return handleResponse<TokenResponse>(
    response,
    "Login failed"
  );
}


export async function registerUser(
  username: string,
  password: string
) {
  const response = await fetch(
    `${API_URL}/users/`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  return handleResponse(
    response,
    "Failed to create account"
  );
}


export async function getCurrentUser():
  Promise<User> {
  const response =
    await authenticatedFetch(
      "/users/me"
    );

  return handleResponse<User>(
    response,
    "Unable to get current user"
  );
}


export function logoutUser() {
  sessionStorage.removeItem(
    "access_token"
  );
}


/*
 * Voting Sessions
 */

export async function getVotingSession(
  code: string
): Promise<VotingSession | null> {
  const response = await fetch(
    `${API_URL}/sessions/join/${code}`
  );

  if (
    response.status === 404
  ) {
    return null;
  }

  return handleResponse<VotingSession>(
    response,
    "Failed to get voting session"
  );
}


export async function createVotingSession(
  name: string
): Promise<VotingSession> {
  const response =
    await authenticatedFetch(
      "/sessions/",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      }
    );

  return handleResponse<VotingSession>(
    response,
    "Failed to create voting session"
  );
}


export async function addMoviesToSession(
  code: string,
  movieIds: number[]
): Promise<VotingSession> {
  const response =
    await authenticatedFetch(
      `/sessions/${code}/movies`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          movie_ids: movieIds,
        }),
      }
    );

  return handleResponse<VotingSession>(
    response,
    "Failed to add movies"
  );
}


export async function removeMoviesFromSession(
  code: string,
  movieIds: number[]
): Promise<VotingSession> {
  const response =
    await authenticatedFetch(
      `/sessions/${code}/removemovies`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          movieIds
        ),
      }
    );

  return handleResponse<VotingSession>(
    response,
    "Failed to remove movies"
  );
}

export async function generateSessionMovies(
  code: string,
  options: GenerateMoviesOptions
): Promise<VotingSession> {
  const response =
    await authenticatedFetch(
      `/sessions/${code}/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          options
        ),
      }
    );

  return handleResponse<VotingSession>(
    response,
    "Failed to generate movies"
  );
}

export async function closeVoting(
  code: string
): Promise<VotingSession> {
  const response =
    await authenticatedFetch(
      `/sessions/${code}/close`,
      {
        method: "PATCH",
      }
    );

  return handleResponse<VotingSession>(
    response,
    "Failed to close voting"
  );
}


export async function openVoting(
  code: string
): Promise<VotingSession> {
  const response =
    await authenticatedFetch(
      `/sessions/${code}/open`,
      {
        method: "PATCH",
      }
    );

  return handleResponse<VotingSession>(
    response,
    "Failed to open voting"
  );
}


/*
 * Movies
 */

export async function getMovies():
  Promise<Movie[]> {
  const response = await fetch(
    `${API_URL}/movies/list/`
  );

  return handleResponse<Movie[]>(
    response,
    "Failed to get movies"
  );
}


/*
 * Voting
 */

export async function getUserVotes(
  code: string
): Promise<number[]> {
  const response =
    await authenticatedFetch(
      `/voting/${code}/votes`
    );

  return handleResponse<number[]>(
    response,
    "Failed to load votes"
  );
}


export async function castVote(
  code: string,
  movieIds: number[]
) {
  const response =
    await authenticatedFetch(
      `/voting/${code}/votes`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          movie_ids: movieIds,
        }),
      }
    );

  return handleResponse(
    response,
    "Failed to submit vote"
  );
}


export async function getVotingResults(
  code: string
): Promise<VotingResults> {
  const response = await fetch(
    `${API_URL}/voting/${code}/results`
  );

  return handleResponse<VotingResults>(
    response,
    "Failed to load voting results"
  );
}


export async function getVotingSessions():
  Promise<VotingSession[]> {
  const response =
    await authenticatedFetch(
      "/sessions/"
    );

  return handleResponse<VotingSession[]>(
    response,
    "Failed to load voting sessions"
  );
}

export async function getSubgenres():
  Promise<Subgenre[]> {
  const response = await fetch(
    `${API_URL}/movies/subgenres`
  );

  return handleResponse<Subgenre[]>(
    response,
    "Failed to load subgenres"
  );
}


export async function setMovieWatched(
  movieId: number,
  watched: boolean
): Promise<Movie> {
  const response =
    await authenticatedFetch(
      `/movies/${movieId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          watched,
        }),
      }
    );

  return handleResponse<Movie>(
    response,
    "Failed to update movie"
  );
}