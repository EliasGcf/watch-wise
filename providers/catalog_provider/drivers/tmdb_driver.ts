import { client as tmdbClient } from '#generated/tmdb/client.gen'
import { TmdbSdk } from '#generated/tmdb/sdk.gen'
import type {
  CatalogProvider,
  CatalogTitleResult,
  TmdbCatalogProviderConfig,
  ItemType,
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

  async search(query: string): Promise<CatalogTitleResult[]> {
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
      if (!result.id) return []
      if (result.media_type !== 'movie' && result.media_type !== 'tv') return []

      const type = result.media_type === 'movie' ? 'movie' : 'series'
      const name = result.media_type === 'movie' ? result.title : result.name
      return [
        {
          provider: 'tmdb',
          providerId: String(result.id),
          type,
          name: name || 'Unknown',
          bannerUrl: imageUrl(result.backdrop_path ?? result.poster_path),
          releaseDate: result.release_date || null,
          duration: null,
          summary: result.overview || null,
        },
      ]
    })
  }

  async find(type: ItemType, providerId: string): Promise<CatalogTitleResult | null> {
    if (type === 'movie') return this.findMovieById(providerId)

    return this.findShowById(providerId)
  }

  async findMovieById(providerId: string): Promise<CatalogTitleResult | null> {
    const response = await this.tmdb.movie.details({
      throwOnError: false,
      path: { movie_id: Number(providerId) },
      query: { language: 'en-US' },
    })

    if (response.error) {
      throw new CatalogProviderError('TMDB movie details request failed', { cause: response.error })
    }

    if (!response.data?.id) return null

    return {
      provider: 'tmdb',
      providerId: String(response.data.id),
      type: 'movie',
      name: response.data.title || 'Unknown',
      bannerUrl: imageUrl(response.data.backdrop_path ?? response.data.poster_path),
      releaseDate: response.data.release_date || null,
      duration: response.data.runtime ?? null,
      summary: response.data.overview || null,
    }
  }

  async findShowById(providerId: string): Promise<CatalogTitleResult | null> {
    const response = await this.tmdb.tv.series.details({
      throwOnError: false,
      path: { series_id: Number(providerId) },
      query: { language: 'en-US' },
    })

    if (response.error) {
      throw new CatalogProviderError('TMDB show details request failed', { cause: response.error })
    }

    if (!response.data?.id) return null

    return {
      provider: 'tmdb',
      providerId: String(response.data.id),
      type: 'series',
      name: response.data.name || 'Unknown',
      bannerUrl: imageUrl(response.data.backdrop_path ?? response.data.poster_path),
      releaseDate: response.data.first_air_date || null,
      duration: null,
      summary: response.data.overview || null,
    }
  }
}

function imageUrl(path: string | undefined) {
  return path ? `https://image.tmdb.org/t/p/w780${path}` : null
}
