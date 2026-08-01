import Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import CatalogEpisodeTransformer from '#transformers/catalog/episode_transformer'
import SerieTransformer from '#transformers/serie_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class EpisodesController {
  async index({ auth, params, serialize }: HttpContext) {
    const serie = await Serie.query()
      .where('id', params.id)
      .where('userId', auth.user!.id)
      .preload('watchedEpisodes', (query) => query.where('season', Number(params.season)))
      .firstOrFail()

    const episodes = await catalog.episodes(serie.providerId, Number(params.season))

    return serialize(CatalogEpisodeTransformer.transform(episodes, serie.watchedEpisodes))
  }

  async watch({ auth, params, response, serialize }: HttpContext) {
    const serie = await Serie.findByOrFail({ id: params.id, userId: auth.user!.id })
    const episode = await catalog.findEpisode(
      serie.providerId,
      Number(params.season),
      Number(params.episode)
    )

    if (!episode) {
      return response.notFound({ error: 'Episode could not be found in the catalog.' })
    }

    if (!episode.releasedAt || DateTime.fromISO(episode.releasedAt) > DateTime.now()) {
      return response.unprocessableEntity({ error: `${episode.name} has not been released yet.` })
    }

    await serie.watchEpisode(episode)
    await serie.load('watchedEpisodes')

    return serialize(SerieTransformer.transform(serie))
  }

  async unwatch({ auth, params, serialize }: HttpContext) {
    const serie = await Serie.findByOrFail({ id: params.id, userId: auth.user!.id })

    await serie.unwatchEpisode(Number(params.season), Number(params.episode))
    await serie.load('watchedEpisodes')

    return serialize(SerieTransformer.transform(serie))
  }
}
