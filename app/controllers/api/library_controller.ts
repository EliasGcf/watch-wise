import Movie from '#models/movie'
import Show from '#models/show'
import MovieTransformer from '#transformers/movie_transformer'
import ShowTransformer from '#transformers/show_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class LibraryController {
  async movies({ auth, serialize }: HttpContext) {
    const movies = await Movie.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')
    return serialize(MovieTransformer.transform(movies))
  }

  async series({ auth, serialize }: HttpContext) {
    const series = await Show.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')
    return serialize(ShowTransformer.transform(series))
  }
}
