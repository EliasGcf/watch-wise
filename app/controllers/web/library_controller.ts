import MovieTransformer from '#transformers/movie_transformer'
import SerieTransformer from '#transformers/serie_transformer'
import { loadLibraryListing } from '#services/library_listing'
import { libraryQueryValidator } from '#validators/library'
import type { HttpContext } from '@adonisjs/core/http'

export default class LibraryController {
  async index({ inertia, auth, request }: HttpContext) {
    const { q } = await request.validateUsing(libraryQueryValidator)
    const { query, loadedAt, series, movies, seriesCount, moviesCount } = await loadLibraryListing(
      auth.user!,
      q ?? ''
    )

    return inertia.render('library/index', {
      query,
      loadedAt,
      series: SerieTransformer.transform(series),
      movies: MovieTransformer.transform(movies),
      seriesCount,
      moviesCount,
    })
  }
}
