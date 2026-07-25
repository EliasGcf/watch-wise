import Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import SerieTransformer from '#transformers/serie_transformer'
import SeriesEpisodesTransformer from '#transformers/series_episodes_transformer'
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

    return serialize(
      SeriesEpisodesTransformer.transformSeasons({
        id: serie.id,
        name: serie.name,
        seasons: await catalog.seasons(serie.providerId),
      })
    )
  }

  async episodes({ auth, params, serialize }: HttpContext) {
    const serie = await Serie.query()
      .where('id', params.id)
      .where('userId', auth.user!.id)
      .preload('watchedEpisodes')
      .firstOrFail()

    const watchedByEpisode = new Map(
      serie.watchedEpisodes.map((mark) => [`${mark.season}:${mark.episode}`, mark])
    )

    return serialize(
      SeriesEpisodesTransformer.transformEpisodes({
        season: Number(params.season),
        episodes: await catalog.episodes(serie.providerId, Number(params.season)),
        watchedByEpisode,
      })
    )
  }
}
