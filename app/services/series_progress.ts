import type Serie from '#models/serie'
import { WatchedEpisode } from '#models/watched_mark'
import { catalog } from '#services/catalog_provider'

export async function calculateSerieProgress(serie: Serie) {
  const catalogSerie = await catalog.findSerieById(serie.providerId)

  if (!catalogSerie) {
    throw new Error(`Serie with providerId ${serie.providerId} not found in catalog`)
  }

  const watchedEpisodesCount = await WatchedEpisode.query()
    .where('userId', serie.userId)
    .where('libraryEntryId', serie.id)
    .whereNot('season', 0)
    .count('* as total')
    .firstOrFail()

  const total = Number(watchedEpisodesCount.$extras.total)

  return Math.min(100, Math.max(0, Math.round((total / catalogSerie.episodesCount) * 100)))
}
