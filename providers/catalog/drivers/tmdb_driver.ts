import { client as tmdbClient } from '#generated/tmdb/client.gen'
import { TmdbSdk } from '#generated/tmdb/sdk.gen'
import type {
  Episode,
  CatalogProvider,
  CatalogSearchResult,
  TmdbCatalogProviderConfig,
  ItemType,
  FindResult,
  Movie,
  Serie,
  ImageKind,
  ImageSize,
} from '#providers/catalog/types'
import { CatalogProviderError } from '#providers/catalog/types'
import { createCacheDecorator } from '#decorators/cache_decorator'

const cache = createCacheDecorator({ prefixKey: 'tmdb' })

const TMDB_IMAGE_SIZES: Record<ImageKind, Record<ImageSize, string>> = {
  poster: { sm: 'w342', md: 'w500', lg: 'w780', original: 'original' },
  banner: { sm: 'w300', md: 'w780', lg: 'w1280', original: 'original' },
}

export default class TmdbCatalogProviderDriver implements CatalogProvider {
  constructor(
    private config: TmdbCatalogProviderConfig,
    private tmdb: TmdbSdk = new TmdbSdk()
  ) {
    if (!this.config.accessToken) throw new CatalogProviderError('TMDB access token is required.')
    tmdbClient.setConfig({ headers: { Authorization: `Bearer ${this.config.accessToken}` } })
  }

  imageUrl(kind: ImageKind, path: string | null, size: ImageSize) {
    if (!path) return null

    return `${this.config.baseImageUrl}${TMDB_IMAGE_SIZES[kind][size]}/${path.replace(/^\/+/, '')}`
  }

  @cache()
  async search(query: string): Promise<CatalogSearchResult[]> {
    const response = await this.tmdb.search.multi({
      throwOnError: false,
      query: {
        query,
        include_adult: false,
        language: 'en-US',
      },
    })
    if (response.error) {
      throw new CatalogProviderError('TMDB search request failed', { cause: response.error })
    }
    if (!response.data?.results) return []
    return mapSearchResults(response.data.results)
  }

  @cache()
  async weekTrending(): Promise<CatalogSearchResult[]> {
    const response = await this.tmdb.trending.all({
      throwOnError: false,
      path: { time_window: 'week' },
      query: { language: 'en-US' },
    })
    if (response.error) {
      throw new CatalogProviderError('TMDB trending request failed', { cause: response.error })
    }
    if (!response.data?.results) return []
    return mapSearchResults(response.data.results)
  }

  @cache()
  async find(type: ItemType, providerId: string): Promise<FindResult | null> {
    if (type === 'movie') return this.findMovieById(providerId)

    return this.findSerieById(providerId)
  }

  @cache()
  async findMovieById(providerId: string): Promise<Movie | null> {
    const response = await this.tmdb.movie.details({
      throwOnError: false,
      path: { movie_id: Number(providerId) },
      query: { language: 'en-US' },
    })
    if (response.error) {
      throw new CatalogProviderError('TMDB movie details request failed', { cause: response.error })
    }
    if (!response.data?.id) return null
    const bannerPath = response.data.backdrop_path
    const posterPath = response.data.poster_path
    if (!response.data.title) return null

    return {
      provider: 'tmdb',
      id: String(response.data.id),
      type: 'movie',
      name: response.data.title,
      bannerPath: bannerPath ?? null,
      posterPath: posterPath ?? null,
      releasedAt: response.data.release_date ?? null,
      duration: response.data.runtime ?? null,
      summary: response.data.overview ?? null,
    }
  }

  @cache()
  async findSerieById(providerId: string): Promise<Serie | null> {
    const response = await this.tmdb.tv.series.details({
      throwOnError: false,
      path: { series_id: Number(providerId) },
      query: { language: 'en-US' },
    })
    if (response.error) {
      throw new CatalogProviderError('TMDB serie details request failed', { cause: response.error })
    }
    if (!response.data) return null
    const bannerPath = response.data.backdrop_path
    const posterPath = response.data.poster_path
    const lastSeason = response.data.last_episode_to_air?.season_number
    const lastEpisode = response.data.last_episode_to_air?.episode_number
    const allReleased = lastSeason === undefined || lastSeason === 0 || lastEpisode === undefined
    const seasons =
      response.data.seasons?.flatMap((season) => {
        if (season.season_number === undefined || season.episode_count === undefined) return []
        const releasedEpisodesCount =
          season.season_number === 0 || allReleased
            ? season.episode_count
            : season.season_number < lastSeason
              ? season.episode_count
              : season.season_number === lastSeason
                ? Math.min(lastEpisode, season.episode_count)
                : 0
        return [
          {
            name: season.name ?? `Season ${season.season_number}`,
            number: season.season_number,
            episodesCount: season.episode_count,
            releasedEpisodesCount,
          },
        ]
      }) ?? []
    if (!response.data.id || !response.data.name) return null

    return {
      provider: 'tmdb',
      id: String(response.data.id),
      type: 'serie',
      name: response.data.name,
      bannerPath: bannerPath ?? null,
      posterPath: posterPath ?? null,
      releasedAt: response.data.first_air_date ?? null,
      summary: response.data.overview ?? null,
      inProduction: response.data.in_production ?? true,
      episodesCount: seasons
        .filter((season) => season.number !== 0)
        .reduce((total, season) => total + season.episodesCount, 0),
      releasedEpisodesCount: seasons
        .filter((season) => season.number !== 0)
        .reduce((total, season) => total + season.releasedEpisodesCount, 0),
      seasons,
    }
  }

  @cache()
  async episodes(providerId: string, season: number): Promise<Episode[]> {
    const response = await this.tmdb.tv.season.details({
      throwOnError: false,
      path: { series_id: Number(providerId), season_number: season },
      query: { language: 'en-US' },
    })
    if (response.error) {
      throw new CatalogProviderError('TMDB season details request failed', {
        cause: response.error,
      })
    }
    if (!response.data?.episodes) return []
    return response.data.episodes.flatMap((episode) => {
      if (
        !episode.id ||
        episode.season_number === undefined ||
        episode.episode_number === undefined
      ) {
        return []
      }
      return [
        {
          providerId: String(episode.id),
          season: episode.season_number,
          episode: episode.episode_number,
          name: episode.name ?? `Episode ${episode.episode_number}`,
          releasedAt: episode.air_date ?? null,
          duration: episode.runtime ?? null,
          summary: episode.overview ?? null,
          isSpecial: episode.season_number === 0 || episode.episode_type === 'special',
        },
      ]
    })
  }

  @cache()
  async findEpisode(serieId: string, season: number, episode: number): Promise<Episode | null> {
    const response = await this.tmdb.tv.episode.details({
      throwOnError: false,
      path: { series_id: Number(serieId), season_number: season, episode_number: episode },
      query: { language: 'en-US' },
    })
    if (response.error) {
      throw new CatalogProviderError('TMDB episode details request failed', {
        cause: response.error,
      })
    }
    if (!response.data?.id) return null
    if (response.data.season_number === undefined || response.data.episode_number === undefined) {
      return null
    }

    return {
      providerId: String(response.data.id),
      season: response.data.season_number,
      episode: response.data.episode_number,
      name: response.data.name ?? `Episode ${response.data.episode_number}`,
      releasedAt: response.data.air_date ?? null,
      duration: response.data.runtime ?? null,
      summary: response.data.overview ?? null,
      isSpecial: response.data.season_number === 0,
    }
  }
}

type SearchApiResult = {
  id?: number
  title?: string
  name?: string
  backdrop_path?: string
  poster_path?: string
  release_date?: string
  overview?: string
  media_type?: string
}

function mapSearchResults(results: SearchApiResult[]): CatalogSearchResult[] {
  return results.flatMap((result) => {
    if (result.media_type !== 'movie' && result.media_type !== 'tv') return []
    const type = result.media_type === 'movie' ? 'movie' : 'serie'
    const name = result.media_type === 'movie' ? result.title : result.name
    const releasedAt = result.release_date
    const bannerPath = result.backdrop_path
    const posterPath = result.poster_path
    if (!result.id || !name) return []
    return [
      {
        provider: 'tmdb',
        id: String(result.id),
        type,
        name,
        bannerPath: bannerPath ?? null,
        posterPath: posterPath ?? null,
        releasedAt: releasedAt ?? null,
        summary: result.overview ?? null,
      },
    ]
  })
}
