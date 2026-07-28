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
} & (
  | { type: 'movie'; duration: number }
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
  releasedAt: string
  duration: number
  summary: string
  isSpecial: boolean
}

export abstract class CatalogProvider {
  abstract search(query: string): Promise<CatalogSearchResult[]>
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
