import Log from "../utils/logger"
import Trakt from "trakt.tv"

import { TraktOptions } from "../utils/constants"

export default class Crunchyroll {
  constructor() {
    this.PlayerSelector = "#showmedia_video_player"
    this.Player = document.querySelector(this.PlayerSelector)
    this.Trakt = new Trakt(TraktOptions)
  }

  checkValidPage() {
    return !!this.Player
  }

  startScrobble() {
    debugger
    var a = this.Trakt.get_url()
  }

  stopScrobble() {}
}
