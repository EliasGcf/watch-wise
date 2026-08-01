import LibraryItem from '#models/library_item'
import Movie from '#models/movie'
import Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import MovieTransformer from '#transformers/movie_transformer'
import SerieTransformer from '#transformers/serie_transformer'
import { addLibraryEntryValidator } from '#validators/library_entry'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class LibraryController {
  async index({ inertia, auth, request }: HttpContext) {
    const query = String(request.input('q', '')).trim()
    const applySearch = (builder: ReturnType<typeof Serie.query>) => {
      if (query) builder.whereRaw('lower(name) like ?', [`%${query.toLowerCase()}%`])
    }

    const [series, movies] = await Promise.all([
      Serie.query().where('userId', auth.user!.id).if(query, applySearch),
      Movie.query().where('userId', auth.user!.id).if(query, applySearch),
    ])

    return inertia.render('library/index', {
      query,
      series: SerieTransformer.transform(series),
      movies: MovieTransformer.transform(movies),
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

    await db.transaction(async (trx) => {
      entry.useTransaction(trx)
      await entry.delete()
    })

    session.flash('success', `${entry.name} was removed from your library.`)
    return response.redirect().back()
  }
}
