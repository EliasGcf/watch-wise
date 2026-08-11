import { catalog } from '#services/catalog_provider'
import CatalogEpisodeTransformer from '#transformers/catalog/episode_transformer'
import SerieTransformer from '#transformers/serie_transformer'
import { watchEpisodeValidator } from '#validators/episode'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class EpisodesController {
  async index({ auth, params, serialize }: HttpContext) {
    const serie = await auth
      .user!.related('series')
      .query()
      .where('id', params.id)
      .preload('watchedEpisodes', (query) => query.where('season', Number(params.season)))
      .firstOrFail()

    const episodes = await catalog.episodes(serie.providerId, Number(params.season))

    return serialize(CatalogEpisodeTransformer.transform(episodes, serie.watchedEpisodes))
  }

  async watch({ auth, params, request, response, serialize }: HttpContext) {
    const serie = await auth.user!.related('series').query().where('id', params.id).firstOrFail()
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

    const payload = await request.validateUsing(watchEpisodeValidator)
    await serie.watchEpisode(episode, payload.deleteFile ?? false)
    await serie.load('watchedEpisodes')

    return serialize(SerieTransformer.transform(serie))
  }

  async watchBefore({ auth, params, response, serialize }: HttpContext) {
    const serie = await auth.user!.related('series').query().where('id', params.id).firstOrFail()
    const season = Number(params.season)
    const episodeNumber = Number(params.episode)
    const episode = await catalog.findEpisode(serie.providerId, season, episodeNumber)

    if (!episode) {
      return response.notFound({ error: 'Episode could not be found in the catalog.' })
    }

    if (!episode.releasedAt || DateTime.fromISO(episode.releasedAt) > DateTime.now()) {
      return response.unprocessableEntity({ error: `${episode.name} has not been released yet.` })
    }

    const catalogSerie = await catalog.findSerieById(serie.providerId)

    if (!catalogSerie) {
      throw new Error(`Serie with providerId ${serie.providerId} not found in catalog`)
    }

    const seasons = catalogSerie.seasons.filter(
      (catalogSeason) => catalogSeason.number !== 0 && catalogSeason.number <= season
    )

    const episodesBySeason = await Promise.all(
      seasons.map((catalogSeason) => catalog.episodes(serie.providerId, catalogSeason.number))
    )

    const before = episodesBySeason.flatMap((episodes, index) =>
      episodes.filter((candidate) => {
        if (candidate.isSpecial) return false
        if (seasons[index].number === season && candidate.episode >= episodeNumber) return false

        return isReleasedEpisode(candidate)
      })
    )

    await db.transaction(async (trx) => {
      serie.useTransaction(trx)
      await serie.watchEpisodes([episode, ...before])
    })

    await serie.load('watchedEpisodes')

    return serialize(SerieTransformer.transform(serie))
  }

  async unwatch({ auth, params, serialize }: HttpContext) {
    const serie = await auth.user!.related('series').query().where('id', params.id).firstOrFail()

    await serie.unwatchEpisode(Number(params.season), Number(params.episode))
    await serie.load('watchedEpisodes')

    return serialize(SerieTransformer.transform(serie))
  }
}

function isReleasedEpisode(episode: { releasedAt: string | null }) {
  return episode.releasedAt ? DateTime.fromISO(episode.releasedAt) <= DateTime.now() : false
}
