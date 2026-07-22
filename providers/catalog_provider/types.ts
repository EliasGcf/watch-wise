export type CatalogProviderDriverName = 'fake' | 'tmdb'

export type CatalogTitleResult = {
  provider: 'tmdb'
  providerTitleId: string
  type: 'movie' | 'series'
  name: string
  bannerUrl: string | null
  releaseYear: number | null
  summary: string | null
}

export abstract class CatalogProvider {
  abstract search(query: string): Promise<CatalogTitleResult[]>
}

export interface CatalogProviderDriver {
  search(query: string): Promise<CatalogTitleResult[]>
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
