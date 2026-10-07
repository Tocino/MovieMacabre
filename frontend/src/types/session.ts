import type { Movie } from "./movie"

export interface VotingSession {
  id: number
  name: string
  code: string
  is_active: boolean
  movies: Movie[]
}