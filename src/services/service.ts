import { ShowT, EpisodeT } from "../../typings/trakt.tv"

export abstract class Service {
  abstract StartPauseScrobble(): Promise<void>
  abstract StopScrobble(): Promise<void>
  abstract CheckValidPage(): boolean
  Player: HTMLVideoElement
  Show: ShowT
  Episode: EpisodeT
  Api: any
  IsScrobblePlaying: boolean
  Watched: boolean
}
