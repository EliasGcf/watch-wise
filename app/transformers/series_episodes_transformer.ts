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
        season: season.season,
        name: season.name,
        episodes: season.episodes.map((episode) => {
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
      })),
    }
  }
}

function episodeKey(season: number, episode: number) {
  return `${season}:${episode}`
}

function isReleased(releasedAt: string) {
  return DateTime.fromISO(releasedAt) <= DateTime.now()
}
