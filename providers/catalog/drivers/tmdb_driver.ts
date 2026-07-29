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
} from '#providers/catalog/types'
import { CatalogProviderError } from '#providers/catalog/types'

export default class TmdbCatalogProviderDriver implements CatalogProvider {
  constructor(
    private config: TmdbCatalogProviderConfig,
    private tmdb: TmdbSdk = new TmdbSdk()
  ) {
    if (!this.config.accessToken) throw new CatalogProviderError('TMDB access token is required.')
    tmdbClient.setConfig({ headers: { Authorization: `Bearer ${this.config.accessToken}` } })
  }

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

    return response.data.results.flatMap((result) => {
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
          name: name,
          bannerPath: bannerPath ?? null,
          bannerUrl: makeImageUrl(this.config.baseImageUrl, bannerPath),
          posterPath: posterPath ?? null,
          posterUrl: makeImageUrl(this.config.baseImageUrl, posterPath),
          releasedAt: releasedAt ?? null,
          summary: result.overview ?? null,
        },
      ]
    })
  }

  async find(type: ItemType, providerId: string): Promise<FindResult | null> {
    if (type === 'movie') return this.findMovieById(providerId)

    return this.findSerieById(providerId)
  }

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
      bannerUrl: makeImageUrl(this.config.baseImageUrl, bannerPath),
      posterPath: posterPath ?? null,
      posterUrl: makeImageUrl(this.config.baseImageUrl, posterPath),
      releasedAt: response.data.release_date ?? null,
      duration: response.data.runtime ?? null,
      summary: response.data.overview ?? null,
    }
  }

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
    const seasons = response.data.seasons?.flatMap((season) => {
      if (season.season_number === undefined || season.episode_count === undefined) return []

      return [
        {
          name: season.name ?? `Season ${season.season_number}`,
          number: season.season_number,
          episodesCount: season.episode_count,
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
      bannerUrl: makeImageUrl(this.config.baseImageUrl, bannerPath),
      posterPath: posterPath ?? null,
      posterUrl: makeImageUrl(this.config.baseImageUrl, posterPath),
      releasedAt: response.data.first_air_date ?? null,
      summary: response.data.overview ?? null,
      episodesCount: seasons
        .filter((season) => season.number !== 0)
        .reduce((total, season) => total + season.episodesCount, 0),
      seasons,
    }
  }

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
    if (
      response.data.season_number === undefined ||
      response.data.episode_number === undefined
    ) {
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

function makeImageUrl(baseImageUrl: string, path?: string) {
  if (!path) return null

  return new URL(path.replace(/^\/+/, ''), baseImageUrl).toString()
}
