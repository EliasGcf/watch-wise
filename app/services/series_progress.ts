import type Serie from '#models/serie'
import { WatchedEpisode } from '#models/watched_mark'
import type { Serie as CatalogSerie } from '#providers/catalog/types'

export async function calculateSerieProgress(serie: Serie, catalogSerie: CatalogSerie) {
  const watchedEpisodesCount = await WatchedEpisode.query()
    .where('userId', serie.userId)
    .where('libraryEntryId', serie.id)
    .whereNot('season', 0)
    .count('* as total')
    .firstOrFail()

  const total = Number(watchedEpisodesCount.$extras.total)
  const released = catalogSerie.releasedEpisodesCount
  if (released === 0) return 0

  return Math.min(100, Math.max(0, Math.round((total / released) * 100)))
}
