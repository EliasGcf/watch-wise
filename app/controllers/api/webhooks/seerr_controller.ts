import User from '#models/user'
import { catalog } from '#services/catalog_provider'
import env from '#start/env'
import { seerrWebhookValidator } from '#validators/seerr_webhook'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { timingSafeEqual } from 'node:crypto'

export default class SeerrController {
  async handle({ request, response }: HttpContext) {
    const username = env.get('SEERR_USERNAME')
    const authHeader = env.get('SEERR_AUTH_HEADER')

    if (!username || !authHeader) {
      return response.serviceUnavailable({ error: 'Seerr webhook is not configured.' })
    }

    if (!this.hasValidAuthHeader(request.header('authorization'), authHeader)) {
      return response.unauthorized({ error: 'Invalid webhook authorization header.' })
    }

    if (request.input('notification_type') !== 'MEDIA_AUTO_APPROVED') {
      return response.noContent()
    }

    const payload = await request.validateUsing(seerrWebhookValidator)

    if (payload.request.requestedBy_username !== username) {
      return response.forbidden({ error: 'Unknown requester.' })
    }

    const user = await User.findBy('username', username)

    if (!user) {
      return response.internalServerError({ error: 'Seerr user was not found.' })
    }

    const type = payload.media.media_type === 'tv' ? 'serie' : 'movie'
    const relation = type === 'movie' ? user.related('movies') : user.related('series')
    const existingEntry = await relation
      .query()
      .where('provider', 'tmdb')
      .where('providerId', payload.media.tmdbId)
      .first()

    if (existingEntry) {
      return response.noContent()
    }

    const item = await catalog.find(type, payload.media.tmdbId)

    if (!item) {
      return response.notFound({ error: 'Catalog title could not be found.' })
    }

    const entry = await relation.create({
      provider: item.provider,
      providerId: item.id,
      name: item.name,
      bannerPath: item.bannerPath,
      posterPath: item.posterPath,
      releasedAt: item.releasedAt ? DateTime.fromISO(item.releasedAt) : null,
      summary: item.summary,
    })

    return response.created(entry)
  }

  private hasValidAuthHeader(header: string | undefined, expected: { release: () => string }) {
    const secret = expected.release()
    if (!header || header.length !== secret.length) return false

    return timingSafeEqual(Buffer.from(header), Buffer.from(secret))
  }
}
