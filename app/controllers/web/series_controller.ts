import SerieTransformer from '#transformers/serie_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeriesController {
  async index({ auth, inertia, request }: HttpContext) {
    const query = String(request.input('q', '')).trim()

    const series = await auth
      .user!
      .related('series')
      .query()
      .apply((scopes) => scopes.search({ name: query }))

    return inertia.render('library/series/index', {
      query,
      series: SerieTransformer.transform(series),
    })
  }

  async show({ auth, inertia, params }: HttpContext) {
    const serie = await auth
      .user!
      .related('series')
      .query()
      .where('id', params.id)
      .preload('watchedEpisodes')
      .firstOrFail()

    return inertia.render('library/series/show', {
      serie: SerieTransformer.transform(serie).useVariant('withCatalog'),
    })
  }
}
