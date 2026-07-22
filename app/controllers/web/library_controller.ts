import LibraryEntry from '#models/library_entry'
import { addLibraryEntryValidator } from '#validators/library_entry'
import type { HttpContext } from '@adonisjs/core/http'

export default class LibraryController {
  async index({ auth, inertia }: HttpContext) {
    const entries = await LibraryEntry.query()
      .where('userId', auth.user!.id)
      .orderBy('createdAt', 'desc')

    return inertia.render('library/index', { entries })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(addLibraryEntryValidator)
    const existingEntry = await LibraryEntry.query()
      .where('userId', auth.user!.id)
      .where('provider', payload.provider)
      .where('providerId', payload.providerId)
      .first()

    if (existingEntry) {
      session.flash('error', `${payload.name} is already in your library.`)
      return response.redirect().back()
    }

    await LibraryEntry.create({
      userId: auth.user!.id,
      provider: payload.provider,
      providerId: payload.providerId,
      type: payload.type,
      name: payload.name,
      bannerUrl: payload.bannerUrl,
      releaseYear: payload.releaseYear,
      summary: payload.summary,
    })

    session.flash('success', `${payload.name} was added to your library.`)
    return response.redirect().toRoute('app.library.index')
  }
}
