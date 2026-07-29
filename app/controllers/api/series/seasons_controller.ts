import Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import SerieTransformer from '#transformers/serie_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class SeasonsController {
  async watch({ auth, params, serialize }: HttpContext) {
    const serie = await Serie.findByOrFail({ id: params.id, userId: auth.user!.id })
    const episodes = await catalog.episodes(serie.providerId, Number(params.season))

    await db.transaction(async (trx) => {
      serie.useTransaction(trx)
      await serie.watchEpisodes(episodes.filter(isReleasedEpisode))
    })
    await serie.load('watchedEpisodes')

    return serialize(SerieTransformer.transform(serie))
  }

  async watchAll({ auth, params, serialize }: HttpContext) {
    const serie = await Serie.findByOrFail({ id: params.id, userId: auth.user!.id })
    const catalogSerie = await catalog.findSerieById(serie.providerId)

    if (!catalogSerie) {
      throw new Error(`Serie with providerId ${serie.providerId} not found in catalog`)
    }

    const episodesBySeason = await Promise.all(
      catalogSerie.seasons.map((season) => catalog.episodes(serie.providerId, season.number))
    )

    await db.transaction(async (trx) => {
      serie.useTransaction(trx)
      await serie.watchEpisodes(episodesBySeason.flat().filter(isReleasedEpisode))
    })
    await serie.load('watchedEpisodes')

    return serialize(SerieTransformer.transform(serie))
  }
}

function isReleasedEpisode(episode: { releasedAt: string | null }) {
  return episode.releasedAt ? DateTime.fromISO(episode.releasedAt) <= DateTime.now() : false
}
