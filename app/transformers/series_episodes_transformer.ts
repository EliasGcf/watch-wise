import type { CatalogSeason } from '#providers/catalog_provider/types'
import { DateTime } from 'luxon'

type WatchedEpisodeSnapshot = {
  watchedAt: DateTime
}

type SeriesEpisodesResource = {
  id: number
  name: string
  seasons: CatalogSeason[]
  watchedByEpisode: Map<string, WatchedEpisodeSnapshot>
}

export default class SeriesEpisodesTransformer {
  static transform(resource: SeriesEpisodesResource) {
    return {
      id: resource.id,
      name: resource.name,
      seasons: resource.seasons.map((season) => ({
        seasonNumber: season.seasonNumber,
        name: season.name,
        episodes: season.episodes.map((episode) => {
          const watched = resource.watchedByEpisode.get(
            episodeKey(episode.seasonNumber, episode.episodeNumber)
          )

          return {
            providerId: episode.providerId,
            seasonNumber: episode.seasonNumber,
            episodeNumber: episode.episodeNumber,
            name: episode.name,
            releasedAt: episode.releasedAt,
            runtime: episode.runtime,
            summary: episode.summary,
            isReleased: isReleased(episode.releasedAt),
            isSpecial: episode.isSpecial,
            watched: watched ? { watchedAt: watched.watchedAt.toISO() } : null,
          }
        }),
      })),
    }
  }
}

function episodeKey(seasonNumber: number, episodeNumber: number) {
  return `${seasonNumber}:${episodeNumber}`
}

function isReleased(releasedAt: string | null) {
  return Boolean(releasedAt && DateTime.fromISO(releasedAt) <= DateTime.now())
}
