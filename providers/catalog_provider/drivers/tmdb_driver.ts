import { client as tmdbClient } from '#generated/tmdb/client.gen'
import { TmdbSdk } from '#generated/tmdb/sdk.gen'
import type {
  CatalogEpisode,
  CatalogProvider,
  CatalogSeason,
  CatalogSearchResult,
  TmdbCatalogProviderConfig,
  ItemType,
  FindResult,
  Movie,
  Serie,
} from '#providers/catalog_provider/types'
import { CatalogProviderError } from '#providers/catalog_provider/types'

export default class TmdbCatalogProviderDriver implements CatalogProvider {
  constructor(
    private config: TmdbCatalogProviderConfig,
    private tmdb: TmdbSdk = new TmdbSdk()
  ) {
    if (!this.config.accessToken) throw new CatalogProviderError('TMDB access token is required.')
    tmdbClient.setConfig({ headers: { Authorization: `Bearer ${this.config.accessToken}` } })
  }

  async search(query: string): Promise<CatalogSearchResult[]> {
    const response = await this.tmdb.search.multi({
      throwOnError: false,
      query: {
        query,
        include_adult: false,
        language: 'en-US',
      },
    })

    if (response.error) {
      throw new CatalogProviderError('TMDB search request failed', { cause: response.error })
    }

    if (!response.data?.results) return []

    return response.data.results.flatMap((result) => {
      if (result.media_type !== 'movie' && result.media_type !== 'tv') return []

      const type = result.media_type === 'movie' ? 'movie' : 'serie'
      const name = result.media_type === 'movie' ? result.title : result.name
      const bannerPath = result.backdrop_path
      const posterPath = result.poster_path

      return [
        {
          provider: 'tmdb',
          id: String(result.id),
          type,
          name: name,
          bannerPath,
          bannerUrl: makeImageUrl(this.config.baseImageUrl, bannerPath),
          posterPath,
          posterUrl: makeImageUrl(this.config.baseImageUrl, posterPath),
          releasedAt: result.release_date,
          summary: result.overview,
        },
      ]
    })
  }

  async find(type: ItemType, providerId: string): Promise<FindResult | null> {
    if (type === 'movie') return this.findMovieById(providerId)

    return this.findSerieById(providerId)
  }

  async findMovieById(providerId: string): Promise<Movie | null> {
    const response = await this.tmdb.movie.details({
      throwOnError: false,
      path: { movie_id: Number(providerId) },
      query: { language: 'en-US' },
    })

    if (response.error) {
      throw new CatalogProviderError('TMDB movie details request failed', { cause: response.error })
    }

    if (!response.data?.id) return null
    const bannerPath = response.data.backdrop_path
    const posterPath = response.data.poster_path

    return {
      provider: 'tmdb',
      id: String(response.data.id),
      type: 'movie',
      name: response.data.title,
      bannerPath,
      bannerUrl: makeImageUrl(this.config.baseImageUrl, bannerPath),
      posterPath,
      posterUrl: makeImageUrl(this.config.baseImageUrl, posterPath),
      releasedAt: response.data.release_date,
      duration: response.data.runtime,
      summary: response.data.overview,
    }
  }

  async findSerieById(providerId: string): Promise<Serie | null> {
    const response = await this.tmdb.tv.series.details({
      throwOnError: false,
      path: { series_id: Number(providerId) },
      query: { language: 'en-US' },
    })

    if (response.error) {
      throw new CatalogProviderError('TMDB serie details request failed', { cause: response.error })
    }

    if (!response.data?.id) return null
    const bannerPath = response.data.backdrop_path
    const posterPath = response.data.poster_path

    return {
      provider: 'tmdb',
      id: String(response.data.id),
      type: 'serie',
      name: response.data.name,
      bannerPath,
      bannerUrl: makeImageUrl(this.config.baseImageUrl, bannerPath),
      posterPath,
      posterUrl: makeImageUrl(this.config.baseImageUrl, posterPath),
      releasedAt: response.data.first_air_date,
      summary: response.data.overview,
    }
  }

  async seasons(providerId: string): Promise<CatalogSeason[]> {
    const series = await this.tmdb.tv.series.details({
      throwOnError: false,
      path: { series_id: Number(providerId) },
      query: { language: 'en-US' },
    })

    if (series.error) {
      throw new CatalogProviderError('TMDB serie details request failed', { cause: series.error })
    }

    if (!series.data?.seasons) return []

    return series.data.seasons.map((season) => ({
      season: season.season_number,
      name: season.name,
    }))
  }

  async episodes(providerId: string, season: number): Promise<CatalogEpisode[]> {
    const response = await this.tmdb.tv.season.details({
      throwOnError: false,
      path: { series_id: Number(providerId), season_number: season },
      query: { language: 'en-US' },
    })

    if (response.error) {
      throw new CatalogProviderError('TMDB season details request failed', {
        cause: response.error,
      })
    }

    return (
      response.data?.episodes.map((episode) => ({
        providerId: `${providerId}:s${episode.season_number}:e${episode.episode_number}`,
        season: episode.season_number,
        episode: episode.episode_number,
        name: episode.name,
        releasedAt: episode.air_date,
        duration: episode.runtime,
        summary: episode.overview,
        isSpecial: episode.season_number === 0 || episode.episode_type === 'special',
      })) ?? []
    )
  }

  async findEpisode(
    serieId: string,
    season: number,
    episode: number
  ): Promise<CatalogEpisode | null> {
    const response = await this.tmdb.tv.episode.details({
      throwOnError: false,
      path: { series_id: Number(serieId), season_number: season, episode_number: episode },
      query: { language: 'en-US' },
    })

    if (response.error) {
      throw new CatalogProviderError('TMDB episode details request failed', {
        cause: response.error,
      })
    }

    if (!response.data?.id) return null

    return {
      providerId: `${serieId}:s${response.data.season_number}:e${response.data.episode_number}`,
      season: response.data.season_number,
      episode: response.data.episode_number,
      name: response.data.name,
      releasedAt: response.data.air_date,
      duration: response.data.runtime,
      summary: response.data.overview,
      isSpecial: response.data.season_number === 0,
    }
  }
}

function makeImageUrl(baseImageUrl: string, path: string) {
  return new URL(path.replace(/^\/+/, ''), baseImageUrl).toString()
}
