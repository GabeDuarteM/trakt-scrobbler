interface IdsT {
  trakt: number
  slug: string
  tvdb: number
  imdb: string
  tmdb: number
  tvrage: number
}

export interface SeasonT {
  number: number
  ids: IdsT
  rating: number
  votes: number
  episode_count: number
  aired_episodes: number
  title: string
  overview: string
  first_aired: string
}

export interface ShowT {
  title: string
  year: number
  ids: IdsT
  overview: string
  first_aired: string
  airs: {
    day: string
    time: string
    timezone: string
  }
  runtime: number
  certification: string
  network: string
  country: string
  trailer: string
  homepage: string
  status: string
  rating: number
  votes: number
  updated_at: string
  language: string
  available_translations: string[]
  genres: string[]
  aired_episodes: number
}

interface TypeResultT {
  title: string
  year: number
  ids: IdsT
  season: number
  number: number
}

export interface TextQueryResultT {
  type: "show" | "movie"
  score: number
  show: TypeResultT
  movie: TypeResultT
}

export interface EpisodeT {
  season: number
  number: number
  title: string
  ids: IdsT
  number_abs: number
  overview: string
  rating: number
  votes: number
  first_aired: string
  updated_at: string
  available_translations: string[]
  runtime: number
}

export interface WatchT {
  id: number
  watched_at: string
  action: "scrobble" | "checkin" | "watch"
  type: "movie" | "episode"
  movie: TypeResultT
}

export interface TraktOptionsT {
  client_id: string
  client_secret: string
  redirect_uri: string
}

export interface TokenT {
  access_token: string
  expires: number
  refresh_token: string
}
