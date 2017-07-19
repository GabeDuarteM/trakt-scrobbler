import * as moment from "moment"
import * as TraktApi from "trakt.tv"

import { IEpisode, ISeason, IShow, ITextQueryResult, IWatch } from "../../typings/trakt.tv"
import { TraktOptions } from "./constants"
import { ErrorLog, Log } from "./logger"

export default class Api {
  public NoToken: boolean
  private Trakt: any

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

  public async GetShow(title: string): Promise<IShow> {
    const show: IShow = await this.Trakt.search
      .text({ type: "show", query: title })
      .then((data: ITextQueryResult[]) => {
        if (!data || data.length <= 0) {
          throw ErrorLog("Show not found: " + title)
        }

        return data[0].show
      })

    return show
  }

  public async GetEpisode({ showSlug, seasonNum, episodeNum, absoluteNum }: IGetEpisodeParams) {
    if (absoluteNum) {
      const seasonAndEpisode = await this.ConvertAbsoluteEpisode(showSlug, absoluteNum)

      seasonNum = seasonAndEpisode.seasonNum
      episodeNum = seasonAndEpisode.episodeNum
    }

    const episode: IEpisode = await this.Trakt.episodes.summary({
      episode: episodeNum,
      id: showSlug,
      season: seasonNum
    })

    return episode
  }

  public StartPauseScrobble(episode: IEpisode, progress: number, isScrobblePlaying: boolean): Promise<void> {
    if (isScrobblePlaying) {
      return this.Trakt.scrobble.start({ episode, progress })
    } else {
      return this.Trakt.scrobble.pause({ episode, progress })
    }
  }

  public StopScrobble(episode: IEpisode, progress: number): Promise<void> {
    return this.Trakt.scrobble.stop({ episode, progress })
  }

  public async WatchEpisode(episode: IEpisode): Promise<void> {
    const watches: IWatch[] = await this.Trakt.sync.history.get({ type: "episodes", id: episode.ids.trakt })
    if (this.CheckIfShouldWatch(watches)) {
      return this.Trakt.sync.history.add({ episodes: [episode] })
    }
  }

  private CheckIfShouldWatch(watches: IWatch[]): boolean {
    if (!watches) {
      return true
    }
    const watchedDate: moment.Moment = moment(watches[0].watched_at.slice(0, watches[0].watched_at.length))
    const watchedHoursAgo: number = moment().diff(watchedDate, "hours")

    return watchedHoursAgo >= 3
  }

  private async GetSeasons(showSlug: string): Promise<ISeason[]> {
    const seasons: ISeason[] = await this.Trakt.seasons.summary({
      extended: "full",
      id: showSlug
    })

    return seasons.filter(season => season.title !== "Specials")
  }

  private GetSeasonFromAbsoluteEp(seasons: ISeason[], absoluteNum: number): ISeason {
    let totalEpisodes = 0
    for (const season of seasons) {
      totalEpisodes += season.episode_count
      if (totalEpisodes >= absoluteNum) {
        return season
      }
    }

    throw ErrorLog("Episode not found.")
  }

  private async ConvertAbsoluteEpisode(showSlug: string, absoluteNum: number): Promise<IS00E00> {
    const seasons = await this.GetSeasons(showSlug)
    const season = this.GetSeasonFromAbsoluteEp(seasons, absoluteNum)

    const seasonsBefore = seasons.filter(x => x.number <= season.number)
    const totalEpisodes = seasonsBefore.reduce((prev, currSeason) => prev + currSeason.episode_count, 0)

    return this.CalculateSeasonAndEpisodeNumber(season, absoluteNum, totalEpisodes)
  }

  private CalculateSeasonAndEpisodeNumber(season: ISeason, absoluteNum: number, totalEpisodes: number): IS00E00 {
    const episodesOutsideCurrentSeason = totalEpisodes - season.episode_count
    const episodeNum = absoluteNum - episodesOutsideCurrentSeason

    return { seasonNum: season.number, episodeNum }
  }
}

interface IS00E00 {
  seasonNum: number
  episodeNum: number
}

interface IGetEpisodeParams {
  showSlug: string
  seasonNum?: number
  episodeNum?: number
  absoluteNum?: number
}
