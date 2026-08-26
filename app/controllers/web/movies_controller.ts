import MovieTransformer from '#transformers/movie_transformer'
import { indexMoviesValidator } from '#validators/movies'
import type { HttpContext } from '@adonisjs/core/http'

export default class MoviesController {
  async index({ auth, inertia, request }: HttpContext) {
    const { q = '', page = 1, status = 'all' } = await request.validateUsing(indexMoviesValidator)

    const moviesQuery = auth.user!.related('movies').query()

    moviesQuery.apply((scopes) => scopes.search({ name: q }))

    if (status === 'watched') moviesQuery.whereHas('watched', () => {})
    if (status === 'unwatched') moviesQuery.whereDoesntHave('watched', () => {})

    const movies = await moviesQuery.orderBy('id', 'desc').preload('watched').paginate(page, 24)

    return inertia.render('library/movies', {
      query: q,
      status,
      movies: inertia
        .scroll(MovieTransformer.paginate(movies.all(), movies.getMeta()))
        .matchOn('id'),
    })
  }
}
