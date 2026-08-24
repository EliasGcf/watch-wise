import { catalog } from '#services/catalog_provider'
import { loadLibraryListing, loadSeriesListing } from '#services/library_listing'
import MovieTransformer from '#transformers/movie_transformer'
import SerieTransformer from '#transformers/serie_transformer'
import { libraryQueryValidator } from '#validators/library'
import { addLibraryEntryValidator } from '#validators/library_entry'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class LibraryController {
  async index({ auth, request, serialize }: HttpContext) {
    const { q } = await request.validateUsing(libraryQueryValidator)
    const { query, loadedAt, series, movies, seriesCount, moviesCount } = await loadLibraryListing(
      auth.user!,
      q ?? ''
    )

    return serialize({
      query,
      loadedAt,
      series: SerieTransformer.transform(series),
      movies: MovieTransformer.transform(movies),
      seriesCount,
      moviesCount,
    })
  }

  async seriesIndex({ auth, request, serialize }: HttpContext) {
    const { q } = await request.validateUsing(libraryQueryValidator)
    const { query, loadedAt, series } = await loadSeriesListing(auth.user!, q ?? '')

    return serialize({ query, loadedAt, series: SerieTransformer.transform(series) })
  }

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
