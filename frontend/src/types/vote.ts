export type MovieResult = {
  movie_id: number
  title: string
  votes: number
}

export type VotingResults = {
  session_name: string
  code: string
  total_voters: number
  results: MovieResult[]
}