import { catalog } from '#services/catalog_provider'
import { addLibraryEntryValidator } from '#validators/library_entry'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class LibraryController {
  async store({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(addLibraryEntryValidator)
    const user = auth.user!
    const relation = payload.type === 'movie' ? user.related('movies') : user.related('series')
    const existingEntry = await relation
      .query()
      .where('provider', payload.provider)
      .where('providerId', payload.providerId)
      .first()

    if (existingEntry) {
      return response.conflict({ error: `${existingEntry.name} is already in your library.` })
    }

    const item = await catalog.find(payload.type, payload.providerId)

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

  async destroy({ auth, params, response }: HttpContext) {
    const entry = await auth
      .user!.related('libraryEntries')
      .query()
      .where('id', params.id)
      .firstOrFail()

    await db.transaction(async (trx) => {
      entry.useTransaction(trx)
      await entry.delete()
    })

    return response.noContent()
  }
}
