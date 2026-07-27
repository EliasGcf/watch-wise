import { type events } from '#generated/events'
import Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import { WatchedEpisode } from '#models/watched_mark'

type Event =
  | InstanceType<typeof events.EpisodeWatched>
  | InstanceType<typeof events.EpisodeUnwatched>

export default class UpdateSeriesProgress {
  async handle(event: Event) {
    const queryOptions = event.watched.$trx ? { client: event.watched.$trx } : undefined

    const serie = await Serie.query(queryOptions)
      .where('id', event.watched.libraryEntryId)
      .firstOrFail()

    const catalogSerie = await catalog.findSerieById(serie.providerId)

    if (!catalogSerie) {
      throw new Error(`Serie with providerId ${serie.providerId} not found in catalog`)
    }

    const watchedEpisodesCount = await WatchedEpisode.query(queryOptions)
      .where('userId', event.watched.userId)
      .where('libraryEntryId', event.watched.libraryEntryId)
      .count('* as total')
      .firstOrFail()

    const total = Number(watchedEpisodesCount.$extras.total)

    const progress = Math.min(
      100,
      Math.max(0, Math.round((total / catalogSerie.episodesCount) * 100))
    )

    await Serie.query(queryOptions).where('id', serie.id).update({ progress })
  }
}
