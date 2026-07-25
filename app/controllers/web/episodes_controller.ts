import Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class EpisodesController {
  async watch({ auth, params, response, session }: HttpContext) {
    const serie = await Serie.findByOrFail({ id: params.id, userId: auth.user!.id })
    const episode = await catalog.findEpisode(
      serie.providerId,
      Number(params.season),
      Number(params.episode)
    )

    if (!episode) {
      session.flash('error', 'Episode could not be found in the catalog.')
      return response.redirect().back()
    }

    if (DateTime.fromISO(episode.releasedAt) > DateTime.now()) {
      session.flash('error', `${episode.name} has not been released yet.`)
      return response.redirect().back()
    }

    await serie.watchEpisode(episode)

    session.flash('success', `${episode.name} was marked as watched.`)
    return response.redirect().back()
  }

  async unwatch({ auth, params, response, session }: HttpContext) {
    const serie = await Serie.findByOrFail({ id: params.id, userId: auth.user!.id })

    await serie.unwatchEpisode(Number(params.season), Number(params.episode))

    session.flash('success', 'Episode is no longer marked as watched.')
    return response.redirect().back()
  }
}
