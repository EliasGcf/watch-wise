import { pagination } from '#config/pagination'
import SerieTransformer from '#transformers/serie_transformer'
import { indexSeriesValidator } from '#validators/series'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeriesController {
  async index({ auth, inertia, request }: HttpContext) {
    const { q = '', page = 1 } = await request.validateUsing(indexSeriesValidator)

    const series = await auth
      .user!.related('series')
      .query()
      .apply((scopes) => scopes.search({ name: q }))
      .orderBy('id', 'desc')
      .paginate(page, pagination.perPage)

    return inertia.render('library/series/index', {
      query: q,
      series: inertia
        .scroll(SerieTransformer.paginate(series.all(), series.getMeta()))
        .matchOn('id'),
    })
  }

  async show({ auth, inertia, params }: HttpContext) {
    const serie = await auth
      .user!.related('series')
      .query()
      .where('id', params.id)
      .preload('watchedEpisodes')
      .firstOrFail()

    return inertia.render('library/series/show', {
      serie: SerieTransformer.transform(serie).useVariant('withCatalog'),
    })
  }
}
