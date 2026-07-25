import LibraryItem from '#models/library_item'
import Movie from '#models/movie'
import Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import { addLibraryEntryValidator } from '#validators/library_entry'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class LibraryController {
  async index({ inertia }: HttpContext) {
    return inertia.render('library/index', {})
  }

  async seriesShow({ auth, inertia, params }: HttpContext) {
    const serie = await Serie.findByOrFail({ id: params.id, userId: auth.user!.id })

    return inertia.render('library/series/show', {
      serie: {
        id: serie.id,
        name: serie.name,
        summary: serie.summary,
        bannerUrl: serie.bannerUrl,
        posterUrl: serie.posterUrl,
        provider: serie.provider,
        providerId: serie.providerId,
      },
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(addLibraryEntryValidator)
    const EntryModel = payload.type === 'movie' ? Movie : Serie
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
      providerId: item.id,
      name: item.name,
      bannerPath: item.bannerPath,
      posterPath: item.posterPath,
      releasedAt: item.releasedAt ? DateTime.fromISO(item.releasedAt) : null,
      summary: item.summary,
    })

    session.flash('success', `${item.name} was added to your library.`)
    return response.redirect().toRoute('app.library.index')
  }

  async destroy({ auth, params, response, session }: HttpContext) {
    const entry = await LibraryItem.findByOrFail({ id: params.id, userId: auth.user!.id })

    await entry.delete()

    session.flash('success', `${entry.name} was removed from your library.`)
    return response.redirect().back()
  }
}
