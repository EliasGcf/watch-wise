import Serie from '#models/serie'
import SerieTransformer from '#transformers/serie_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeriesController {
  async show({ auth, inertia, params }: HttpContext) {
    const serie = await Serie.query()
      .where('id', params.id)
      .where('userId', auth.user!.id)
      .withCount('watchedEpisodes')
      .firstOrFail()

    return inertia.render('library/series/show', {
      serie: SerieTransformer.transform(serie).useVariant('withCatalog'),
    })
  }
}
