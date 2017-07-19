import { IEpisode, IShow } from "../../typings/trakt.tv"
import { sleep } from "../utils/helper"
import { ErrorLog } from "../utils/logger"
import { Service } from "./service"

export default class Crunchyroll extends Service {
  constructor() {
    super()
    this.Player = document.querySelector("#video_html5_api") as HTMLVideoElement

    this.SetPlayerEvents()
  }

  public async StartPauseScrobble(isStart = !this.IsScrobblePlaying): Promise<void> {
    if (!await this.CheckIfReadyToScrobble()) {
      return
    }

    const progressPercentage = Math.floor(this.Player.currentTime / this.Player.duration * 100)

    if (progressPercentage < 90) {
      this.Api.StartPauseScrobble(this.Episode, progressPercentage, isStart).then(() => {
        this.IsScrobblePlaying = isStart
      })
    } else {
      this.Api.WatchEpisode(this.Episode).then(() => {
        this.Watched = true
      })
    }
  }

  public StopScrobble(): Promise<void> {
    const progressPercentage = Math.floor(this.Player.currentTime / this.Player.duration * 100)

    return this.Api.StopScrobble(this.Episode, progressPercentage)
  }

  private async SetPlayerEvents(): Promise<void> {
    if (this.CheckValidPage()) {
      this.Player.onplay = await this.StartPauseScrobble.bind(this, true)
      this.Player.onpause = await this.StartPauseScrobble.bind(this, false)
      window.onunload = await this.StopScrobble
    }
  }

  private GetEpisodeInfo(): IEpisodeInfo {
    const rgx = /\/(.*?)\/episode-(\d+)-/
    const matches = rgx.exec(location.pathname)

    if (matches) {
      return {
        absoluteEpisode: Number(matches[2]),
        queryTitle: matches[1]
      }
    }

    throw ErrorLog("No match found for the current episode:")
  }

  private async FillEpisodeIfNecessary(): Promise<void> {
    if (!this.Episode) {
      const episodeInfo = this.GetEpisodeInfo()
      this.Show = await this.Api.GetShow(episodeInfo.queryTitle)
      this.Episode = await this.Api.GetEpisode({
        absoluteNum: episodeInfo.absoluteEpisode,
        showSlug: this.Show.ids.slug
      })
    }
  }

  private async CheckIfReadyToScrobble(): Promise<boolean> {
    if (this.Api.NoToken || this.Watched) {
      return false
    }

    await this.FillEpisodeIfNecessary()

    while (this.Player.currentTime === 0) {
      await sleep(2000)
    }

    return true
  }
}

interface IEpisodeInfo {
  queryTitle: string
  absoluteEpisode: number
}
