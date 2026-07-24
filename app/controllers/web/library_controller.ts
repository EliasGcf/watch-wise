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

  async watch({ auth, params, response, session }: HttpContext) {
    const entry = await Movie.findByOrFail({ id: params.id, userId: auth.user!.id })

    if (!entry.isReleased) {
      session.flash('error', `${entry.name} has not been released yet.`)
      return response.redirect().back()
    }

    const catalogMovie = await catalog.find('movie', entry.providerId)

    if (!catalogMovie) {
      session.flash('error', 'Movie could not be found in the catalog.')
      return response.redirect().back()
    }

    await entry.watch(catalogMovie.type === 'movie' ? catalogMovie.duration : null)

    session.flash('success', `${entry.name} was marked as watched.`)
    return response.redirect().back()
  }

  async unwatch({ auth, params, response, session }: HttpContext) {
    const entry = await Movie.findByOrFail({ id: params.id, userId: auth.user!.id })

    await entry.unwatch()

    session.flash('success', `${entry.name} is no longer marked as watched.`)
    return response.redirect().back()
  }
}
