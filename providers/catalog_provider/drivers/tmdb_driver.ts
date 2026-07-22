import { client as tmdbClient } from '#generated/tmdb/client.gen'
import { TmdbSdk } from '#generated/tmdb/sdk.gen'
import type {
  CatalogProviderDriver,
  CatalogTitleResult,
  TmdbCatalogProviderConfig,
} from '#providers/catalog_provider/types'
import { CatalogProviderError } from '#providers/catalog_provider/types'
import dayjs from 'dayjs'

export default class TmdbCatalogProviderDriver implements CatalogProviderDriver {
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
      const releaseDate = result.release_date ? dayjs(result.release_date) : null

      return [
        {
          provider: 'tmdb',
          providerTitleId: String(result.id),
          type,
          name: name || 'Unknown',
          bannerUrl: imageUrl(result.backdrop_path ?? result.poster_path),
          releaseYear: releaseDate?.isValid() ? releaseDate.year() : null,
          summary: result.overview || null,
        },
      ]
    })
  }
}

function imageUrl(path: string | undefined) {
  return path ? `https://image.tmdb.org/t/p/w780${path}` : null
}
