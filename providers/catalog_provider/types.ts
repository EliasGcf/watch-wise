export type CatalogProviderDriverName = 'fake' | 'tmdb'

export type ItemType = 'movie' | 'series'

export type CatalogTitleResult = {
  provider: CatalogProviderDriverName
  providerId: string
  type: ItemType
  name: string
  bannerUrl: string | null
  releasedAt: string | null
  duration: number | null
  summary: string | null
}

export abstract class CatalogProvider {
  abstract search(query: string): Promise<CatalogTitleResult[]>
  abstract find(type: ItemType, providerId: string): Promise<CatalogTitleResult | null>
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
