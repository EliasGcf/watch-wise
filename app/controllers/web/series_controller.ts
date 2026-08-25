import SerieTransformer from '#transformers/serie_transformer'
import { loadSeriesListing } from '#services/library_listing'
import { libraryQueryValidator } from '#validators/library'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeriesController {
  async index({ auth, inertia, request, serialize }: HttpContext) {
    const { q } = await request.validateUsing(libraryQueryValidator)
    const { query, series } = await loadSeriesListing(auth.user!, q ?? '')

    const initialData = await serialize.withoutWrapping({
      series: SerieTransformer.transform(series),
    })

    return inertia.render('library/series/index', {
      query,
      initialData,
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
