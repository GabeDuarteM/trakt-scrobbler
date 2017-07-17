import * as TraktApi from "trakt.tv"
import * as moment from "moment"

import { TraktOptions } from "./constants"
import { EpisodeT, SeasonT, ShowT, TextQueryResultT, WatchT } from "../../typings/trakt.tv"
import { ErrorLog, Log } from "./logger"

export default class Api {
  Trakt: any
  NoToken: boolean
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

  async GetShow(title: string): Promise<ShowT> {
    const show: ShowT = await this.Trakt.search.text({ type: "show", query: title }).then((show: TextQueryResultT[]) => {
      if (!show || show.length <= 0) {
        throw ErrorLog("Show not found: " + title)
      }

      return show[0].show
    })
    return show
  }

  async GetEpisode({ showSlug, seasonNum, episodeNum, absoluteNum }: GetEpisodeParams) {
    if (absoluteNum) {
      const seasonAndEpisode = await this.ConvertAbsoluteEpisode(showSlug, absoluteNum)

      seasonNum = seasonAndEpisode.seasonNum
      episodeNum = seasonAndEpisode.episodeNum
    }

    const episode: EpisodeT = await this.Trakt.episodes.summary({
      id: showSlug,
      season: seasonNum,
      episode: episodeNum
    })

    return episode
  }

  StartPauseScrobble(episode: EpisodeT, progress: number, isScrobblePlaying: boolean): Promise<void> {
    if (isScrobblePlaying) {
      return this.Trakt.scrobble.start({ episode, progress })
    } else {
      return this.Trakt.scrobble.pause({ episode, progress })
    }
  }

  StopScrobble(episode: EpisodeT, progress: number): Promise<void> {
    return this.Trakt.scrobble.stop({ episode, progress })
  }

  async WatchEpisode(episode: EpisodeT): Promise<void> {
    const watches: WatchT[] = await this.Trakt.sync.history.get({ type: "episodes", id: episode.ids.trakt })
    if (this.CheckIfShouldWatch(watches)) {
      return this.Trakt.sync.history.add({ episodes: [episode] })
    }
  }

  CheckIfShouldWatch(watches: WatchT[]): boolean {
    if (!watches) {
      return true
    }
    const watchedDate: moment.Moment = moment(watches[0].watched_at.slice(0, watches[0].watched_at.length))
    const watchedHoursAgo: number = moment().diff(watchedDate, "hours")
    return watchedHoursAgo >= 3
  }

  async GetSeasons(showSlug: string): Promise<SeasonT[]> {
    const seasons: SeasonT[] = await this.Trakt.seasons.summary({
      id: showSlug,
      extended: "full"
    })
    return seasons.filter(season => season.title !== "Specials")
  }

  GetSeasonFromAbsoluteEp(seasons: SeasonT[], absoluteNum: number): SeasonT {
    let totalEpisodes = 0
    for (let i = 0; i < seasons.length; i++) {
      const season = seasons[i]

      totalEpisodes += season.episode_count
      if (totalEpisodes >= absoluteNum) {
        return season
      }
    }

    throw ErrorLog("Episode not found.")
  }

  async ConvertAbsoluteEpisode(showSlug: string, absoluteNum: number): Promise<S00E00> {
    const seasons = await this.GetSeasons(showSlug)
    const season = this.GetSeasonFromAbsoluteEp(seasons, absoluteNum)

    const seasonsBefore = seasons.filter(x => x.number <= season.number)
    const totalEpisodes = seasonsBefore.reduce((prev, currSeason) => prev + currSeason.episode_count, 0)

    return this.CalculateSeasonAndEpisodeNumber(season, absoluteNum, totalEpisodes)
  }

  CalculateSeasonAndEpisodeNumber(season: SeasonT, absoluteNum: number, totalEpisodes: number): S00E00 {
    const episodesOutsideCurrentSeason = totalEpisodes - season.episode_count
    const episodeNum = absoluteNum - episodesOutsideCurrentSeason

    return { seasonNum: season.number, episodeNum }
  }
}

interface S00E00 {
  seasonNum: number
  episodeNum: number
}

interface GetEpisodeParams {
  showSlug: string
  seasonNum?: number
  episodeNum?: number
  absoluteNum?: number
}
