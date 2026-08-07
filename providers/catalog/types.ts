export type CatalogDriver = 'fake' | 'tmdb'

export type ItemType = 'movie' | 'serie'

export type CatalogSearchResult = {
  provider: CatalogDriver
  id: string
  name: string
  releasedAt: string | null
  summary: string | null
  bannerPath: string | null
  bannerUrl: string | null
  posterPath: string | null
  posterUrl: string | null
} & ({ type: 'movie' } | { type: 'serie' })

export type FindResult = {
  provider: CatalogDriver
  id: string
  name: string
  releasedAt: string | null
  summary: string | null
  bannerPath: string | null
  bannerUrl: string | null
  posterPath: string | null
  posterUrl: string | null
} & (
  | { type: 'movie'; duration: number | null }
  | {
      type: 'serie'
      episodesCount: number
      seasons: Array<{ name: string; number: number; episodesCount: number }>
    }
)

export type Movie = Extract<FindResult, { type: 'movie' }>
export type Serie = Extract<FindResult, { type: 'serie' }>

export type Episode = {
  providerId: string
  season: number
  episode: number
  name: string
  releasedAt: string | null
  duration: number | null
  summary: string | null
  isSpecial: boolean
}

export abstract class CatalogProvider {
  abstract search(query: string): Promise<CatalogSearchResult[]>
  abstract weekTrending(): Promise<CatalogSearchResult[]>
  abstract find(type: ItemType, providerId: string): Promise<Movie | Serie | null>
  abstract findMovieById(providerId: string): Promise<Movie | null>
  abstract findSerieById(providerId: string): Promise<Serie | null>
  abstract episodes(providerId: string, season: number): Promise<Episode[]>
  abstract findEpisode(serieId: string, season: number, episode: number): Promise<Episode | null>
}

export class CatalogProviderError extends Error {}

export type TmdbCatalogProviderConfig = {
  baseImageUrl: `${string}/`
  accessToken?: string
  cacheEnabled?: boolean
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
