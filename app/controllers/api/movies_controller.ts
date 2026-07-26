import Movie from '#models/movie'
import { catalog } from '#services/catalog_provider'
import MovieTransformer from '#transformers/movie_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class MoviesController {
  async index({ auth, serialize }: HttpContext) {
    const movies = await Movie.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')
    return serialize(MovieTransformer.transform(movies))
  }

  async watch({ auth, params, response, session, serialize }: HttpContext) {
    const movie = await Movie.findByOrFail({ id: params.id, userId: auth.user!.id })
    if (!movie.isReleased) {
      session.flash('error', `${movie.name} has not been released yet.`)
      return response.unprocessableEntity({ error: `${movie.name} has not been released yet.` })
    }

    const catalogMovie = await catalog.find('movie', movie.providerId)
    if (!catalogMovie || catalogMovie.type !== 'movie') {
      session.flash('error', 'Movie could not be found in the catalog.')
      return response.notFound({ error: 'Movie could not be found in the catalog.' })
    }

    await movie.watch(catalogMovie.duration)
    session.flash('success', `${movie.name} was marked as watched.`)
    return serialize(MovieTransformer.transform(movie))
  }

  async unwatch({ auth, params, session, serialize }: HttpContext) {
    const movie = await Movie.findByOrFail({ id: params.id, userId: auth.user!.id })
    await movie.unwatch()
    session.flash('success', `${movie.name} is no longer marked as watched.`)
    return serialize(MovieTransformer.transform(movie))
  }
}
