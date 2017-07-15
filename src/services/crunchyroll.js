import Log from "../utils/logger"
import Trakt from "trakt.tv"

import { TraktOptions } from "../utils/constants"

export default class Crunchyroll {
  constructor() {
    this.Player = document.querySelector("#video_html5_api")
    this.Api = new Trakt(TraktOptions)
    chrome.storage.sync.get("token", val => {
      if (val.token) {
        this.Api.import_token(val.token)
      }
    })
  }

  CheckValidPage() {
    return !!this.Player
  }

  GetEpisodeInfo() {
    const rgx = /\/(.*?)\/episode-(\d+)-/
    const matches = rgx.exec(location.pathname)
    return {
      queryTitle: matches[1],
      absoluteEpisode: matches[2]
    }
  }

  SearchEpisode(queryTitle, absoluteEpisode) {
    debugger

    this.Api.search
      .text({ type: "show", query: queryTitle })
      .then(data => {
        if (!data || data.length <= 0) {
          Log("error", "Show not found: " + queryTitle)
        }

        const searchResult = data[0]

        return searchResult.show.ids.slug
      })
      .then(data => this.Api.seasons.summary({ id: data, extended: "full" }))
      .then(data => {
        const seasons = data.filter(season => season.title !== "Specials")
        for (var i = 0; i < seasons.length; i++) {
          var season = seasons[i]
          if
        }
        console.log(data)
      })
  }

  StartScrobble() {
    chrome.storage.sync.get("token", val => {
      if (val.token) {
        const episodeInfo = this.GetEpisodeInfo()
        const show = this.SearchEpisode(
          episodeInfo.queryTitle,
          episodeInfo.absoluteEpisode
        )
        this.Api.scrobble.start()
      }
    })
  }

  StopScrobble() {}
}
