import type {
  CatalogProviderDriver,
  CatalogTitleResult,
  TmdbCatalogProviderConfig,
} from '#providers/catalog_provider/types'
import { CatalogProviderError } from '#providers/catalog_provider/types'

type TmdbMultiSearchResult = {
  id?: number
  media_type: string
  title?: string
  name?: string
  release_date?: string
  first_air_date?: string
  overview?: string
}

type TmdbMultiSearchResponse = {
  results?: TmdbMultiSearchResult[]
}

export default class TmdbCatalogProviderDriver implements CatalogProviderDriver {
  constructor(private config: TmdbCatalogProviderConfig) {}

  async search(query: string): Promise<CatalogTitleResult[]> {
    if (!this.config.accessToken) {
      throw new CatalogProviderError('TMDB access token is not configured')
    }

    const url = new URL('https://api.themoviedb.org/3/search/multi')
    url.searchParams.set('query', query)
    url.searchParams.set('include_adult', 'false')
    url.searchParams.set('language', 'en-US')

    let response: Response

    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          Accept: 'application/json',
        },
      })
    } catch (error) {
      throw new CatalogProviderError('TMDB search request failed', { cause: error })
    }

    if (!response.ok) {
      throw new CatalogProviderError('TMDB search returned an unsuccessful response')
    }

    let payload: TmdbMultiSearchResponse

    try {
      payload = (await response.json()) as TmdbMultiSearchResponse
    } catch (error) {
      throw new CatalogProviderError('TMDB search returned invalid JSON', { cause: error })
    }

    return (payload.results ?? []).reduce<CatalogTitleResult[]>((results, result) => {
      if (!result.id) {
        return results
      }

      if (result.media_type === 'movie') {
        results.push({
          provider: 'tmdb',
          providerTitleId: String(result.id),
          type: 'movie',
          name: result.title ?? 'Untitled movie',
          releaseYear: yearFromDate(result.release_date),
          summary: result.overview || null,
        })
      }

      if (result.media_type === 'tv') {
        results.push({
          provider: 'tmdb',
          providerTitleId: String(result.id),
          type: 'series',
          name: result.name ?? 'Untitled series',
          releaseYear: yearFromDate(result.first_air_date),
          summary: result.overview || null,
        })
      }

      return results
    }, [])
  }
}

function yearFromDate(date: string | undefined) {
  if (!date) {
    return null
  }

  const year = Number.parseInt(date.slice(0, 4), 10)
  return Number.isNaN(year) ? null : year
}
