import Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class EpisodesController {
  async watch({ auth, params, response, session }: HttpContext) {
    const entry = await Serie.findByOrFail({ id: params.id, userId: auth.user!.id })
    const episode = await findCatalogEpisode(
      entry.providerId,
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

    await entry.watchEpisode(episode)

    session.flash('success', `${episode.name} was marked as watched.`)
    return response.redirect().back()
  }

  async unwatch({ auth, params, response, session }: HttpContext) {
    const entry = await Serie.findByOrFail({ id: params.id, userId: auth.user!.id })

    await entry.unwatchEpisode(Number(params.season), Number(params.episode))

    session.flash('success', 'Episode is no longer marked as watched.')
    return response.redirect().back()
  }
}

async function findCatalogEpisode(providerId: string, season: number, episode: number) {
  const episodes = await catalog.seasonEpisodes(providerId, season)
  return episodes.find((catalogEpisode) => catalogEpisode.episode === episode)
}
