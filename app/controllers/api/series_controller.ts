import Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import SerieTransformer from '#transformers/serie_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeriesController {
  async index({ auth, serialize }: HttpContext) {
    const series = await Serie.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')
    return serialize(SerieTransformer.transform(series))
  }

  async show({ auth, params, serialize }: HttpContext) {
    const serie = await Serie.query()
      .where('id', params.id)
      .where('userId', auth.user!.id)
      .firstOrFail()

    serie.seasons = await catalog.seasons(serie.providerId)

    return serialize(SerieTransformer.transform(serie))
  }

  async episodes({ auth, params, serialize }: HttpContext) {
    const serie = await Serie.query()
      .where('id', params.id)
      .where('userId', auth.user!.id)
      .preload('watchedEpisodes', (query) => query.where('season', Number(params.season)))
      .firstOrFail()

    const episodes = await catalog.episodes(serie.providerId, Number(params.season))

    return serialize(SerieTransformer.transform(serie, episodes).useVariant('forEpisodes'))
  }
}
