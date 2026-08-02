import Serie from '#models/serie'
import SerieTransformer from '#transformers/serie_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeriesController {
  async index({ auth, inertia, request }: HttpContext) {
    const query = String(request.input('q', '')).trim()
    const series = await Serie.search({ name: query }).where('userId', auth.user!.id)

    return inertia.render('library/series/index', {
      query,
      series: SerieTransformer.transform(series),
    })
  }

  async show({ auth, inertia, params }: HttpContext) {
    const serie = await Serie.query()
      .where('id', params.id)
      .where('userId', auth.user!.id)
      .preload('watchedEpisodes')
      .firstOrFail()

    return inertia.render('library/series/show', {
      serie: SerieTransformer.transform(serie).useVariant('withCatalog'),
    })
  }
}
