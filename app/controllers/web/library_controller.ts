import Movie from '#models/movie'
import Serie from '#models/serie'
import MovieTransformer from '#transformers/movie_transformer'
import SerieTransformer from '#transformers/serie_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class LibraryController {
  async index({ inertia, auth, request }: HttpContext) {
    const query = String(request.input('q', '')).trim()
    const applySearch = (builder: ReturnType<typeof Serie.query>) => {
      if (query) builder.whereRaw('lower(name) like ?', [`%${query.toLowerCase()}%`])
    }

    const [series, movies] = await Promise.all([
      Serie.query().where('userId', auth.user!.id).if(query, applySearch),
      Movie.query().where('userId', auth.user!.id).if(query, applySearch),
    ])

    return inertia.render('library/index', {
      query,
      series: SerieTransformer.transform(series),
      movies: MovieTransformer.transform(movies),
    })
  }
}
