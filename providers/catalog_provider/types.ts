export type CatalogProviderDriverName = 'tmdb'

export type CatalogTitleResult = {
  provider: 'tmdb'
  providerTitleId: string
  type: 'movie' | 'series'
  name: string
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

export type CatalogProviderConfig = {
  default: CatalogProviderDriverName
  drivers: {
    tmdb: TmdbCatalogProviderConfig
  }
}
