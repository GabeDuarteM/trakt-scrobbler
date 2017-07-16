import TraktApi from "trakt.tv"
import { TraktOptions } from "./constants"
import moment from "moment"

export default class Api {
  constructor() {
    this.Trakt = new TraktApi(TraktOptions)
    chrome.storage.sync.get("token", val => {
      if (val.token) {
        this.Trakt.import_token(val.token)
      } else {
        this.NoToken = true
      }
    })
  }

  async GetShow(title) {
    const show = await this.Trakt.search.text({ type: "show", query: title }).then(show => {
      if (!show || show.length <= 0) {
        Log("error", "Show not found: " + title)
      }

      return show[0].show
    })
    return show
  }

  async GetEpisode({ showSlug, seasonNum, episodeNum, absoluteNum }) {
    if (absoluteNum) {
      const seasonAndEpisode = await this.ConvertAbsoluteEpisode(showSlug, absoluteNum)

      seasonNum = seasonAndEpisode.seasonNum
      episodeNum = seasonAndEpisode.episodeNum
    }

    const episode = await this.Trakt.episodes.summary({ id: showSlug, season: seasonNum, episode: episodeNum })

    return episode
  }

  StartPauseScrobble(episode, progress, isScrobblePlaying) {
    if (isScrobblePlaying) {
      return this.Trakt.scrobble.start({ episode, progress })
    } else {
      return this.Trakt.scrobble.pause({ episode, progress })
    }
  }

  StopScrobble(episode, progress) {
    return this.Trakt.scrobble.stop({ episode, progress })
  }

  async WatchEpisode(episode) {
    const watches = await this.Trakt.sync.history.get({ type: "episodes", id: episode.ids.trakt })
    console.log(watches)
    if (this.CheckIfShouldWatch(watches)) {
      return this.Trakt.sync.history.add({ episodes: [episode] })
    }
  }

  CheckIfShouldWatch(watches) {
    if (!watches) {
      return true
    }
    const watchedDate = moment(watches[0].watched_at.slice(0, watches[0].watched_at.length))
    const watchedHoursAgo = moment().diff(watchedDate, "hours")
    console.log(watchedHoursAgo)
    return watchedHoursAgo >= 3
  }

  async GetSeasons(showSlug) {
    const seasons = await this.Trakt.seasons.summary({
      id: showSlug,
      extended: "full"
    })
    return seasons.filter(season => season.title !== "Specials")
  }

  GetSeasonFromAbsoluteEp(seasons, absoluteNum) {
    let totalEpisodes = 0
    for (let i = 0; i < seasons.length; i++) {
      const season = seasons[i]

      totalEpisodes += season.episode_count
      if (totalEpisodes >= absoluteNum) {
        return season
      }
    }
  }

  async ConvertAbsoluteEpisode(showSlug, absoluteNum) {
    const seasons = await this.GetSeasons(showSlug)
    const season = this.GetSeasonFromAbsoluteEp(seasons, absoluteNum)

    const seasonsBefore = seasons.filter(x => x.number <= season.number)
    const totalEpisodes = seasonsBefore.reduce((prev, currSeason) => prev + currSeason.episode_count, 0)

    return this.CalculateSeasonAndEpisodeNumber(season, absoluteNum, totalEpisodes)
  }

  CalculateSeasonAndEpisodeNumber(season, absoluteNum, totalEpisodes) {
    const episodesOutsideCurrentSeason = totalEpisodes - season.episode_count
    const episodeNum = absoluteNum - episodesOutsideCurrentSeason

    return { seasonNum: season.number, episodeNum }
  }
}
