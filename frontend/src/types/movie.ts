export interface Subgenre {
  id: number
  name: string
}

export interface Movie {
  id: number
  title: string
  year: number
  scare_rating: number
  subgenres: Subgenre[]
  watched: boolean
}