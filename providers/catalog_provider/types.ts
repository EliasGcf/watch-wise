export type CatalogProviderDriverName = 'fake' | 'tmdb'

export type CatalogTitleResult = {
  provider: 'tmdb'
  providerId: string
  type: 'movie' | 'series'
  name: string
  bannerUrl: string | null
  releaseDate: string | null
  summary: string | null
}

export abstract class CatalogProvider {
  abstract search(query: string): Promise<CatalogTitleResult[]>
  abstract find(
    providerId: string,
    type: CatalogTitleResult['type']
  ): Promise<CatalogTitleResult | null>
}

export interface CatalogProviderDriver {
  search(query: string): Promise<CatalogTitleResult[]>
  find(providerId: string, type: CatalogTitleResult['type']): Promise<CatalogTitleResult | null>
}

export class CatalogProviderError extends Error {}

export type TmdbCatalogProviderConfig = {
  accessToken?: string
}

export type FakeCatalogProviderConfig = {
  failureQuery: string
  results: CatalogTitleResult[]
}

export type CatalogProviderConfig = {
  default: CatalogProviderDriverName
  drivers: {
    fake: FakeCatalogProviderConfig
    tmdb: TmdbCatalogProviderConfig
  }
}
