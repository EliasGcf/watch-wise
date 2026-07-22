import LibraryItem from '#models/library_item'
import Movie from '#models/movie'
import Show from '#models/show'
import catalog from '#services/catalog_provider'
import { addLibraryEntryValidator } from '#validators/library_entry'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class LibraryController {
  async index({ auth, inertia }: HttpContext) {
    const entries = await LibraryItem.forUser(auth.user!.id)

    return inertia.render('library/index', {
      entries: entries.map((entry) => ({
        id: entry.id,
        provider: entry.provider,
        providerId: entry.providerId,
        type: entry.type,
        name: entry.name,
        bannerUrl: entry.bannerUrl,
        releaseDate: entry.releaseDate?.toISODate() ?? null,
        summary: entry.summary,
      })),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(addLibraryEntryValidator)
    const EntryModel = payload.type === 'movie' ? Movie : Show
    const existingEntry = await EntryModel.query()
      .where('userId', auth.user!.id)
      .where('provider', payload.provider)
      .where('providerId', payload.providerId)
      .first()

    if (existingEntry) {
      session.flash('error', `${existingEntry.name} is already in your library.`)
      return response.redirect().back()
    }

    const item = await catalog.find(payload.type, payload.providerId)

    if (!item) {
      session.flash('error', 'Catalog title could not be found.')
      return response.redirect().back()
    }

    await EntryModel.create({
      userId: auth.user!.id,
      provider: item.provider,
      providerId: item.providerId,
      name: item.name,
      bannerUrl: item.bannerUrl,
      releaseDate: item.releaseDate ? DateTime.fromISO(item.releaseDate) : null,
      summary: item.summary,
    })

    session.flash('success', `${item.name} was added to your library.`)
    return response.redirect().toRoute('app.library.index')
  }
}
