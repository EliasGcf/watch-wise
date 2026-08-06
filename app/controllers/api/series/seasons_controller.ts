import { catalog } from '#services/catalog_provider'
import SerieTransformer from '#transformers/serie_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class SeasonsController {
  async watch({ auth, params, serialize }: HttpContext) {
    const serie = await auth.user!.related('series').query().where('id', params.id).firstOrFail()
    const episodes = await catalog.episodes(serie.providerId, Number(params.season))

    await db.transaction(async (trx) => {
      serie.useTransaction(trx)
      await serie.watchEpisodes(episodes.filter(isReleasedEpisode))
    })
    await serie.load('watchedEpisodes')

    return serialize(SerieTransformer.transform(serie))
  }

  async watchAll({ auth, params, serialize }: HttpContext) {
    const serie = await auth.user!.related('series').query().where('id', params.id).firstOrFail()
    const catalogSerie = await catalog.findSerieById(serie.providerId)

    if (!catalogSerie) {
      throw new Error(`Serie with providerId ${serie.providerId} not found in catalog`)
    }

    const episodesBySeason = await Promise.all(
      catalogSerie.seasons
        .filter((season) => season.number !== 0)
        .map((season) => catalog.episodes(serie.providerId, season.number))
    )

    await db.transaction(async (trx) => {
      serie.useTransaction(trx)
      await serie.watchEpisodes(
        episodesBySeason
          .flat()
          .filter((episode) => isReleasedEpisode(episode) && !episode.isSpecial)
      )
    })
    await serie.load('watchedEpisodes')

    return serialize(SerieTransformer.transform(serie))
  }
}

function isReleasedEpisode(episode: { releasedAt: string | null }) {
  return episode.releasedAt ? DateTime.fromISO(episode.releasedAt) <= DateTime.now() : false
}
