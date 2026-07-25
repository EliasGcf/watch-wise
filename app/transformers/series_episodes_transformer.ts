import type { CatalogEpisode, CatalogSeason } from '#providers/catalog_provider/types'
import { DateTime } from 'luxon'

type WatchedEpisodeSnapshot = {
  watchedAt: DateTime
}

type SeriesSeasonsResource = {
  id: number
  name: string
  seasons: CatalogSeason[]
}

type SeasonEpisodesResource = {
  season: number
  episodes: CatalogEpisode[]
  watchedByEpisode: Map<string, WatchedEpisodeSnapshot>
}

export default class SeriesEpisodesTransformer {
  static transformSeasons(resource: SeriesSeasonsResource) {
    return {
      id: resource.id,
      name: resource.name,
      seasons: resource.seasons.map((season) => ({
        season: season.season,
        name: season.name,
      })),
    }
  }

  static transformEpisodes(resource: SeasonEpisodesResource) {
    return {
      season: resource.season,
      episodes: resource.episodes.map((episode) => {
        const watched = resource.watchedByEpisode.get(episodeKey(episode.season, episode.episode))

        return {
          providerId: episode.providerId,
          season: episode.season,
          episode: episode.episode,
          name: episode.name,
          releasedAt: episode.releasedAt,
          duration: episode.duration,
          summary: episode.summary,
          isReleased: isReleased(episode.releasedAt),
          isSpecial: episode.isSpecial,
          watched: watched ? { watchedAt: watched.watchedAt.toISO() } : null,
        }
      }),
    }
  }
}

function episodeKey(season: number, episode: number) {
  return `${season}:${episode}`
}

function isReleased(releasedAt: string) {
  return DateTime.fromISO(releasedAt) <= DateTime.now()
}
