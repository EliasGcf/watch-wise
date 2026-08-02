import Movie from '#models/movie'
import Serie from '#models/serie'
import MovieTransformer from '#transformers/movie_transformer'
import SerieTransformer from '#transformers/serie_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class LibraryController {
  async index({ inertia, auth, request }: HttpContext) {
    const query = String(request.input('q', '')).trim()

    const [series, movies, seriesCount, moviesCount] = await Promise.all([
      Serie.search({ name: query }).where('userId', auth.user!.id).limit(4),
      Movie.search({ name: query }).where('userId', auth.user!.id).preload('watched').limit(4),
      Serie.search({ name: query }).where('userId', auth.user!.id).count('* as total'),
      Movie.search({ name: query }).where('userId', auth.user!.id).count('* as total'),
    ])

    return inertia.render('library/index', {
      query,
      series: SerieTransformer.transform(series),
      movies: MovieTransformer.transform(movies),
      seriesCount: Number(seriesCount[0].$extras.total),
      moviesCount: Number(moviesCount[0].$extras.total),
    })
  }
}
