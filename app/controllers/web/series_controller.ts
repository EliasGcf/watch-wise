import SerieTransformer from '#transformers/serie_transformer'
import { loadSeriesListing } from '#services/library_listing'
import { libraryQueryValidator } from '#validators/library'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeriesController {
  async index({ auth, inertia, request }: HttpContext) {
    const { q } = await request.validateUsing(libraryQueryValidator)
    const { query, loadedAt, series } = await loadSeriesListing(auth.user!, q ?? '')

    return inertia.render('library/series/index', {
      query,
      loadedAt,
      series: SerieTransformer.transform(series),
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
