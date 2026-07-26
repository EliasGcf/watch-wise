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
} & ({ type: 'movie'; duration: number | null } | { type: 'serie' })

export type Movie = Extract<FindResult, { type: 'movie' }>
export type Serie = Extract<FindResult, { type: 'serie' }>

export type CatalogEpisode = {
  providerId: string
  season: number
  episode: number
  name: string
  releasedAt: string
  duration: number | null
  summary: string
  isSpecial: boolean
}

export type CatalogSeason = {
  season: number
  name: string
}

export abstract class CatalogProvider {
  abstract search(query: string): Promise<CatalogSearchResult[]>
  abstract find(type: ItemType, providerId: string): Promise<Movie | Serie | null>
  abstract seasons(providerId: string): Promise<CatalogSeason[]>
  abstract episodes(providerId: string, season: number): Promise<CatalogEpisode[]>
  abstract findEpisode(
    serieId: string,
    season: number,
    episode: number
  ): Promise<CatalogEpisode | null>
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
