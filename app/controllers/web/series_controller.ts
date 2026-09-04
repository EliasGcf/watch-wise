import { pagination } from '#config/pagination'
import type { Serie as CatalogSerie } from '#providers/catalog/types'
import { catalog } from '#services/catalog_provider'
import { matchesSerieStatus } from '#services/series_progress'
import SerieTransformer from '#transformers/serie_transformer'
import { indexSeriesValidator } from '#validators/series'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeriesController {
  async index({ auth, inertia, request }: HttpContext) {
    const { q = '', page = 1, status = 'all' } = await request.validateUsing(indexSeriesValidator)

    const seriesQuery = auth.user!.related('series').query()

    seriesQuery
      .apply((scopes) => scopes.search({ name: q }))
      .withCount('watchedEpisodes', (watched) => watched.whereNot('season', 0))

    const catalogSeries = new Map<number, CatalogSerie>()

    if (status === 'not-started') {
      seriesQuery.whereDoesntHave('watchedEpisodes', (watched) => watched.whereNot('season', 0))
    }

    if (status === 'watching' || status === 'finished') {
      seriesQuery.whereHas('watchedEpisodes', (watched) => watched.whereNot('season', 0))

      // ponytail: derive from live catalog; materialize progress if filtered libraries become slow.
      const candidates = await seriesQuery.clone()
      const matchingIds: Array<number | null> = []

      for (let index = 0; index < candidates.length; index += 8) {
        const batch = candidates.slice(index, index + 8)
        matchingIds.push(
          ...(await Promise.all(
            batch.map(async (serie) => {
              const catalogSerie = await catalog.findSerieById(serie.providerId)
              if (!catalogSerie) {
                throw new Error(`Serie with providerId "${serie.providerId}" not found in catalog.`)
              }

              catalogSeries.set(serie.id, catalogSerie)
              return matchesSerieStatus(
                Number(serie.$extras.watchedEpisodes_count),
                catalogSerie.releasedEpisodesCount,
                status
              )
                ? serie.id
                : null
            })
          ))
        )
      }

      seriesQuery.whereIn(
        'id',
        matchingIds.filter((id): id is number => id !== null)
      )
    }

    const series = await seriesQuery.orderBy('id', 'desc').paginate(page, pagination.perPage)

    return inertia.render('library/series/index', {
      query: q,
      status,
      series: inertia
        .scroll(SerieTransformer.paginate(series.all(), series.getMeta(), catalogSeries))
        .matchOn('id'),
    })
  }

  async show({ auth, inertia, params }: HttpContext) {
    const serie = await auth
      .user!.related('series')
      .query()
      .where('id', params.id)
      .withCount('watchedEpisodes', (watched) => watched.whereNot('season', 0))
      .preload('watchedEpisodes')
      .firstOrFail()

    return inertia.render('library/series/show', {
      serie: SerieTransformer.transform(serie).useVariant('withCatalog'),
    })
  }
}
