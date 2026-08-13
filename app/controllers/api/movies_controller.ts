import { catalog } from '#services/catalog_provider'
import MovieTransformer from '#transformers/movie_transformer'
import { watchMovieValidator } from '#validators/movie'
import type { HttpContext } from '@adonisjs/core/http'

export default class MoviesController {
  async watch({ auth, params, request, response, serialize }: HttpContext) {
    const movie = await auth.user!.related('movies').query().where('id', params.id).firstOrFail()
    if (!movie.isReleased) {
      return response.unprocessableEntity({ error: `${movie.name} has not been released yet.` })
    }

    const catalogMovie = await catalog.find('movie', movie.providerId)
    if (!catalogMovie || catalogMovie.type !== 'movie') {
      return response.notFound({ error: 'Movie could not be found in the catalog.' })
    }

    const payload = await request.validateUsing(watchMovieValidator)
    await movie.watch(catalogMovie.duration, payload.deleteFile)
    return serialize(MovieTransformer.transform(movie))
  }

  async unwatch({ auth, params, serialize }: HttpContext) {
    const movie = await auth.user!.related('movies').query().where('id', params.id).firstOrFail()
    await movie.unwatch()
    return serialize(MovieTransformer.transform(movie))
  }
}
