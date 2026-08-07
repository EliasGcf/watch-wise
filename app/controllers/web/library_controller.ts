import MovieTransformer from '#transformers/movie_transformer'
import SerieTransformer from '#transformers/serie_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class LibraryController {
  async index({ inertia, auth, request }: HttpContext) {
    const query = String(request.input('q', '')).trim()
    const user = auth.user!

    const [series, movies, [seriesCount], [moviesCount]] = await Promise.all([
      user
        .related('series')
        .query()
        .apply((scopes) => scopes.search({ name: query }))
        .limit(6),
      user
        .related('movies')
        .query()
        .apply((scopes) => scopes.search({ name: query }))
        .preload('watched')
        .limit(6),
      user
        .related('series')
        .query()
        .apply((scopes) => scopes.search({ name: query }))
        .count('* as total'),
      user
        .related('movies')
        .query()
        .apply((scopes) => scopes.search({ name: query }))
        .count('* as total'),
    ])

    return inertia.render('library/index', {
      query,
      series: SerieTransformer.transform(series),
      movies: MovieTransformer.transform(movies),
      seriesCount: Number(seriesCount.$extras.total),
      moviesCount: Number(moviesCount.$extras.total),
    })
  }
}
