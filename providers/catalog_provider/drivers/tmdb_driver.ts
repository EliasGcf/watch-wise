import { client as tmdbClient } from '#generated/tmdb/client.gen'
import { TmdbSdk } from '#generated/tmdb/sdk.gen'
import type {
  CatalogProvider,
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
          bannerUrl: new URL(bannerPath, this.config.baseImageUrl).toString(),
          posterPath,
          posterUrl: new URL(posterPath, this.config.baseImageUrl).toString(),
          releasedAt: result.release_date,
          summary: result.overview,
        },
      ]
    })
  }

  async find(type: ItemType, providerId: string): Promise<FindResult | null> {
    if (type === 'movie') return this.findMovieById(providerId)

    return this.findShowById(providerId)
  }

  async findMovieById(providerId: string): Promise<Movie | Serie | null> {
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
      bannerUrl: new URL(bannerPath, this.config.baseImageUrl).toString(),
      posterPath,
      posterUrl: new URL(posterPath, this.config.baseImageUrl).toString(),
      releasedAt: response.data.release_date,
      duration: response.data.runtime,
      summary: response.data.overview,
    }
  }

  async findShowById(providerId: string): Promise<Serie | null> {
    const response = await this.tmdb.tv.series.details({
      throwOnError: false,
      path: { series_id: Number(providerId) },
      query: { language: 'en-US' },
    })

    if (response.error) {
      throw new CatalogProviderError('TMDB show details request failed', { cause: response.error })
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
      bannerUrl: new URL(bannerPath, this.config.baseImageUrl).toString(),
      posterPath,
      posterUrl: new URL(posterPath, this.config.baseImageUrl).toString(),
      releasedAt: response.data.first_air_date,
      summary: response.data.overview,
    }
  }
}
