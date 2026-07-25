export type CatalogDriver = 'fake' | 'tmdb'

export type ItemType = 'movie' | 'serie'

export type CatalogSearchResult = {
  provider: CatalogDriver
  id: string
  name: string
  releasedAt: string
  summary: string
  bannerPath: string
  bannerUrl: string
  posterPath: string
  posterUrl: string
} & ({ type: 'movie' } | { type: 'serie' })

export type FindResult = {
  provider: CatalogDriver
  id: string
  name: string
  releasedAt: string
  summary: string
  bannerPath: string
  bannerUrl: string
  posterPath: string
  posterUrl: string
} & ({ type: 'movie'; duration: number } | { type: 'serie' })

export type Movie = Extract<FindResult, { type: 'movie' }>
export type Serie = Extract<FindResult, { type: 'serie' }>

export type CatalogEpisode = {
  providerId: string
  seasonNumber: number
  episodeNumber: number
  name: string
  releasedAt: string
  runtime: number
  summary: string
  isSpecial: boolean
}

export type CatalogSeason = {
  seasonNumber: number
  name: string
  episodes: CatalogEpisode[]
}

export abstract class CatalogProvider {
  abstract search(query: string): Promise<CatalogSearchResult[]>
  abstract find(type: ItemType, providerId: string): Promise<Movie | Serie | null>
  abstract seasons(providerId: string): Promise<CatalogSeason[]>
}

export class CatalogProviderError extends Error {}

export type TmdbCatalogProviderConfig = {
  baseImageUrl: `${string}/`
  accessToken?: string
}

export type FakeCatalogProviderConfig = {
  baseImageUrl: `${string}/`
  failureQuery: string
}

export type CatalogProviderConfig = {
  default: CatalogDriver
  drivers: {
    fake: FakeCatalogProviderConfig
    tmdb: TmdbCatalogProviderConfig
  }
}
