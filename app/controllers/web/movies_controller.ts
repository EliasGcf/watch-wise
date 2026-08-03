import MovieTransformer from '#transformers/movie_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class MoviesController {
  async index({ auth, inertia, request }: HttpContext) {
    const query = String(request.input('q', '')).trim()
    const movies = await auth
      .user!.related('movies')
      .query()
      .apply((scopes) => scopes.search({ name: query }))
      .preload('watched')

    return inertia.render('library/movies', {
      query,
      movies: MovieTransformer.transform(movies),
    })
  }
}
