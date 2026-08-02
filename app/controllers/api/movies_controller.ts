import Movie from '#models/movie'
import { catalog } from '#services/catalog_provider'
import MovieTransformer from '#transformers/movie_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class MoviesController {
  async watch({ auth, params, response, serialize }: HttpContext) {
    const movie = await Movie.findByOrFail({ id: params.id, userId: auth.user!.id })
    if (!movie.isReleased) {
      return response.unprocessableEntity({ error: `${movie.name} has not been released yet.` })
    }

    const catalogMovie = await catalog.find('movie', movie.providerId)
    if (!catalogMovie || catalogMovie.type !== 'movie') {
      return response.notFound({ error: 'Movie could not be found in the catalog.' })
    }

    await movie.watch(catalogMovie.duration)
    await movie.load('watched')
    return serialize(MovieTransformer.transform(movie))
  }

  async unwatch({ auth, params, serialize }: HttpContext) {
    const movie = await Movie.findByOrFail({ id: params.id, userId: auth.user!.id })
    await movie.unwatch()
    return serialize(MovieTransformer.transform(movie))
  }
}
