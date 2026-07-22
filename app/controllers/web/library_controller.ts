import Movie from '#models/movie'
import Show from '#models/show'
import catalogProvider from '#services/catalog_provider'
import { addLibraryEntryValidator } from '#validators/library_entry'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class LibraryController {
  async index({ auth, inertia }: HttpContext) {
    const movies = await Movie.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')
    const shows = await Show.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')
    const entries = [...movies, ...shows].sort(
      (left, right) => right.createdAt.toMillis() - left.createdAt.toMillis()
    )

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

    const title = await catalogProvider.find(payload.providerId, payload.type)

    if (!title || title.provider !== payload.provider) {
      session.flash('error', 'Catalog title could not be found.')
      return response.redirect().back()
    }

    await EntryModel.create({
      userId: auth.user!.id,
      provider: title.provider,
      providerId: title.providerId,
      name: title.name,
      bannerUrl: title.bannerUrl,
      releaseDate: title.releaseDate ? DateTime.fromISO(title.releaseDate) : null,
      summary: title.summary,
    })

    session.flash('success', `${title.name} was added to your library.`)
    return response.redirect().toRoute('app.library.index')
  }
}
