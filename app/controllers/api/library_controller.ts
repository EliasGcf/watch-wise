import Movie from '#models/movie'
import Show from '#models/show'
import type { HttpContext } from '@adonisjs/core/http'

export default class LibraryController {
  async movies({ auth }: HttpContext) {
    const movies = await Movie.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')

    return {
      movies: movies.map((movie) => ({
        id: movie.id,
        provider: movie.provider,
        providerId: movie.providerId,
        type: movie.type,
        name: movie.name,
        bannerUrl: movie.bannerUrl,
        releaseDate: movie.releaseDate?.toISODate() ?? null,
        summary: movie.summary,
        watched: Boolean(movie.watched),
      })),
    }
  }

  async series({ auth }: HttpContext) {
    const series = await Show.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')

    return {
      series: series.map((show) => ({
        id: show.id,
        provider: show.provider,
        providerId: show.providerId,
        type: show.type,
        name: show.name,
        bannerUrl: show.bannerUrl,
        releaseDate: show.releaseDate?.toISODate() ?? null,
        summary: show.summary,
      })),
    }
  }
}
