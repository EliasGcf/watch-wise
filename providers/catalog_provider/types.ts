export type CatalogDriver = 'fake' | 'tmdb'

export type ItemType = 'movie' | 'serie'

export type CatalogSearchResult = {
  provider: CatalogDriver
  id: string
  name: string
  releasedAt: string
  summary: string
  bannerUrl: string
} & ({ type: 'movie' } | { type: 'serie' })

export type FindResult = {
  provider: CatalogDriver
  id: string
  name: string
  releasedAt: string
  summary: string
  bannerUrl: string
} & ({ type: 'movie'; duration: number } | { type: 'serie' })

export type Movie = Extract<FindResult, { type: 'movie' }>
export type Serie = Extract<FindResult, { type: 'serie' }>

export abstract class CatalogProvider {
  abstract search(query: string): Promise<CatalogSearchResult[]>
  abstract find(type: ItemType, providerId: string): Promise<Movie | Serie | null>
}

export class CatalogProviderError extends Error {}

export type TmdbCatalogProviderConfig = {
  accessToken?: string
}

export type FakeCatalogProviderConfig = {
  failureQuery: string
}

export type CatalogProviderConfig = {
  default: CatalogDriver
  drivers: {
    fake: FakeCatalogProviderConfig
    tmdb: TmdbCatalogProviderConfig
  }
}
