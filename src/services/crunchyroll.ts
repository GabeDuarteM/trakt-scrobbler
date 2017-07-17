import { ErrorLog } from "../utils/logger"
import TraktApi from "../utils/api"
import { sleep } from "../utils/helper"
import { ShowT, EpisodeT } from "../../typings/trakt.tv"
import { Service } from "./service"

export default class Crunchyroll extends Service {
  Player: HTMLVideoElement
  Show: ShowT
  Episode: EpisodeT
  Api: TraktApi
  IsScrobblePlaying: boolean
  Watched: boolean

  constructor() {
    super()
    this.Player = document.querySelector("#video_html5_api") as HTMLVideoElement
    this.Api = new TraktApi()
    this.IsScrobblePlaying = false
    this.Watched = false

    this.SetPlayerEvents()
  }

  async SetPlayerEvents(): Promise<void> {
    if (this.CheckValidPage()) {
      this.Player.onplay = await this.StartPauseScrobble.bind(this, true)
      this.Player.onpause = await this.StartPauseScrobble.bind(this, false)
      window.onunload = await this.StopScrobble
    }
  }

  CheckValidPage(): boolean {
    return !!this.Player
  }

  GetEpisodeInfo(): EpisodeInfoT {
    const rgx = /\/(.*?)\/episode-(\d+)-/
    const matches = rgx.exec(location.pathname)

    if (matches) {
      return {
        queryTitle: matches[1],
        absoluteEpisode: Number(matches[2])
      }
    }

    throw ErrorLog("No match found for the current episode:")
  }

  async StartPauseScrobble(isStart = !this.IsScrobblePlaying): Promise<void> {
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

  StopScrobble(): Promise<void> {
    const progressPercentage = Math.floor(this.Player.currentTime / this.Player.duration * 100)
    return this.Api.StopScrobble(this.Episode, progressPercentage).then(() => {
      console.log("Scrobble stoppado")
    })
  }

  async FillEpisodeIfNecessary(): Promise<void> {
    if (!this.Episode) {
      const episodeInfo = this.GetEpisodeInfo()
      this.Show = await this.Api.GetShow(episodeInfo.queryTitle)
      this.Episode = await this.Api.GetEpisode({
        showSlug: this.Show.ids.slug,
        absoluteNum: episodeInfo.absoluteEpisode
      })
    }
  }

  async CheckIfReadyToScrobble(): Promise<boolean> {
    if (this.Api.NoToken || this.Watched) {
      return false
    }

    await this.FillEpisodeIfNecessary()

    while (this.Player.currentTime === 0) {
      await sleep(100)
    }

    return true
  }
}

interface EpisodeInfoT {
  queryTitle: string
  absoluteEpisode: number
}
