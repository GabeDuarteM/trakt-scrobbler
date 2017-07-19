interface IIds {
  trakt: number
  slug: string
  tvdb: number
  imdb: string
  tmdb: number
  tvrage: number
}

export interface ISeason {
  number: number
  ids: IIds
  rating: number
  votes: number
  episode_count: number
  aired_episodes: number
  title: string
  overview: string
  first_aired: string
}

export interface IShow {
  title: string
  year: number
  ids: IIds
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

interface ITypeResult {
  title: string
  year: number
  ids: IIds
  season: number
  number: number
}

export interface ITextQueryResult {
  type: "show" | "movie"
  score: number
  show: ITypeResult
  movie: ITypeResult
}

export interface IEpisode {
  season: number
  number: number
  title: string
  ids: IIds
  number_abs: number
  overview: string
  rating: number
  votes: number
  first_aired: string
  updated_at: string
  available_translations: string[]
  runtime: number
}

export interface IWatch {
  id: number
  watched_at: string
  action: "scrobble" | "checkin" | "watch"
  type: "movie" | "episode"
  movie: ITypeResult
}

export interface ITraktOptions {
  client_id: string
  client_secret: string
  redirect_uri: string
}

export interface IToken {
  access_token: string
  expires: number
  refresh_token: string
}
