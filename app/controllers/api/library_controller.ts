import LibraryItem from '#models/library_item'
import Movie from '#models/movie'
import Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import { addLibraryEntryValidator } from '#validators/library_entry'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class LibraryController {
  async store({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(addLibraryEntryValidator)
    const EntryModel = payload.type === 'movie' ? Movie : Serie
    const existingEntry = await EntryModel.query()
      .where('userId', auth.user!.id)
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

    const entry = await EntryModel.create({
      userId: auth.user!.id,
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
    const entry = await LibraryItem.findByOrFail({ id: params.id, userId: auth.user!.id })

    await db.transaction(async (trx) => {
      entry.useTransaction(trx)
      await entry.delete()
    })

    return response.noContent()
  }
}
