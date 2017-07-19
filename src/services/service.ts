import { IEpisode, IShow } from "../../typings/trakt.tv"
import TraktApi from "../utils/api"

export abstract class Service {
  protected Player: HTMLVideoElement
  protected Show: IShow
  protected Episode: IEpisode
  protected Api: TraktApi
  protected IsScrobblePlaying: boolean
  protected Watched: boolean

  constructor() {
    this.Api = new TraktApi()
    this.IsScrobblePlaying = false
    this.Watched = false
  }

  public abstract StartPauseScrobble(): Promise<void>
  public abstract StopScrobble(): Promise<void>

  public CheckValidPage(): boolean {
    return !!this.Player
  }
}
