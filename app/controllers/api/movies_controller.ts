import Movie from '#models/movie'
import MovieTransformer from '#transformers/movie_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class MoviesController {
  async index({ auth, serialize }: HttpContext) {
    const movies = await Movie.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')
    return serialize(MovieTransformer.transform(movies))
  }
}
