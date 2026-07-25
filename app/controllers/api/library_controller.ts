import Movie from '#models/movie'
import Serie from '#models/serie'
import { EpisodeWatchedMark } from '#models/watched_mark'
import { catalog } from '#services/catalog_provider'
import MovieTransformer from '#transformers/movie_transformer'
import SerieTransformer from '#transformers/serie_transformer'
import SeriesEpisodesTransformer from '#transformers/series_episodes_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class LibraryController {
  async movies({ auth, serialize }: HttpContext) {
    const movies = await Movie.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')
    return serialize(MovieTransformer.transform(movies))
  }

  async series({ auth, serialize }: HttpContext) {
    const series = await Serie.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')
    return serialize(SerieTransformer.transform(series))
  }

  async seriesSeasons({ auth, params, serialize }: HttpContext) {
    const serie = await Serie.query()
      .where('id', params.id)
      .where('userId', auth.user!.id)
      .firstOrFail()

    return serialize(
      SeriesEpisodesTransformer.transformSeasons({
        id: serie.id,
        name: serie.name,
        seasons: await catalog.seasons(serie.providerId),
      })
    )
  }

  async seasonEpisodes({ auth, params, serialize }: HttpContext) {
    const serie = await Serie.query()
      .where('id', params.id)
      .where('userId', auth.user!.id)
      .firstOrFail()
    const watchedEpisodes = await EpisodeWatchedMark.query()
      .where('userId', auth.user!.id)
      .where('libraryEntryId', serie.id)
      .where('season', Number(params.season))
    const watchedByEpisode = new Map(
      watchedEpisodes.map((mark) => [`${mark.season}:${mark.episode}`, mark])
    )

    return serialize(
      SeriesEpisodesTransformer.transformEpisodes({
        season: Number(params.season),
        episodes: await catalog.seasonEpisodes(serie.providerId, Number(params.season)),
        watchedByEpisode,
      })
    )
  }
}
