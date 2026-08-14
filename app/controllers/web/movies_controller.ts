import MovieTransformer from '#transformers/movie_transformer'
import { indexMoviesValidator } from '#validators/movies'
import type { HttpContext } from '@adonisjs/core/http'

export default class MoviesController {
  async index({ auth, inertia, request }: HttpContext) {
    const { q = '', status = 'all' } = await request.validateUsing(indexMoviesValidator)

    const moviesQuery = auth.user!.related('movies').query()

    moviesQuery.apply((scopes) => scopes.search({ name: q }))

    if (status === 'watched') moviesQuery.whereHas('watched', () => {})
    if (status === 'unwatched') moviesQuery.whereDoesntHave('watched', () => {})

    const movies = await moviesQuery.preload('watched')

    return inertia.render('library/movies', {
      query: q,
      status,
      movies: MovieTransformer.transform(movies),
    })
  }
}
