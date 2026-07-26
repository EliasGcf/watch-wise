import {
  fakeGet3MovieByMovieIdResponse,
  fakeGet3SearchMultiResponse,
  fakeGet3TvBySeriesIdResponse,
} from '#generated/tmdb/@faker-js/faker.gen'
import type {
  CatalogEpisode,
  CatalogSeason,
  CatalogProvider,
  CatalogSearchResult,
  FindResult,
  FakeCatalogProviderConfig,
  ItemType,
} from '#providers/catalog_provider/types'
import { CatalogProviderError } from '#providers/catalog_provider/types'

export default class FakeCatalogProviderDriver implements CatalogProvider {
  constructor(private config: FakeCatalogProviderConfig) {}

  async search(query: string): Promise<CatalogSearchResult[]> {
    if (query === this.config.failureQuery) {
      throw new CatalogProviderError('Fake catalog provider failure')
    }

    const response = fakeGet3SearchMultiResponse()
    response.results = [
      {
        ...response.results[0],
        id: 1,
        media_type: 'movie',
        title: 'Heat',
        name: 'Heat',
        backdrop_path: '/movie-1.jpg',
        poster_path: '/movie-1-poster.jpg',
        release_date: '1995-12-15',
        overview: 'A professional thief and a relentless detective collide.',
      },
      {
        ...response.results[1],
        id: 1,
        media_type: 'tv',
        title: 'Heat Vision and Jack',
        name: 'Heat Vision and Jack',
        backdrop_path: '/series-1.jpg',
        poster_path: '/series-1-poster.jpg',
        release_date: '1999-01-01',
        overview: 'A pilot about a super-intelligent astronaut.',
      },
      {
        ...response.results[2],
        id: 2,
        media_type: 'movie',
        title: 'Unknown Heat',
        name: 'Unknown Heat',
        backdrop_path: '/movie-2.jpg',
        poster_path: '/movie-2-poster.jpg',
        release_date: '2000-01-01',
        overview: 'A fake generated movie result.',
      },
    ]

    return response.results.flatMap((result) => {
      if (result.media_type !== 'movie' && result.media_type !== 'tv') return []
      const bannerPath = result.backdrop_path
      const posterPath = result.poster_path

      return [
        {
          provider: 'tmdb',
          id: result.media_type === 'movie' ? `movie-${result.id}` : `series-${result.id}`,
          type: result.media_type === 'movie' ? 'movie' : 'serie',
          name: result.media_type === 'movie' ? result.title : result.name,
          bannerPath,
          bannerUrl: makeImageUrl(this.config.baseImageUrl, bannerPath),
          posterPath,
          posterUrl: makeImageUrl(this.config.baseImageUrl, posterPath),
          releasedAt: result.release_date,
          summary: result.overview,
        },
      ]
    })
  }

  async find(type: ItemType, providerId: string): Promise<FindResult | null> {
    if (type === 'movie' && providerId === 'movie-1') {
      const movie = fakeGet3MovieByMovieIdResponse()
      movie.id = 1
      movie.title = 'Heat'
      movie.backdrop_path = '/movie-1.jpg'
      movie.poster_path = '/movie-1-poster.jpg'
      movie.release_date = '1995-12-15'
      movie.runtime = 170
      movie.overview = 'A professional thief and a relentless detective collide.'
      const bannerPath = movie.backdrop_path
      const posterPath = movie.poster_path

      return {
        provider: 'tmdb',
        id: providerId,
        type: 'movie',
        name: movie.title,
        bannerPath,
        bannerUrl: makeImageUrl(this.config.baseImageUrl, bannerPath),
        posterPath,
        posterUrl: makeImageUrl(this.config.baseImageUrl, posterPath),
        releasedAt: movie.release_date,
        duration: movie.runtime,
        summary: movie.overview,
      }
    }

    if (type === 'serie' && providerId === 'series-1') {
      const series = fakeGet3TvBySeriesIdResponse()
      series.id = 1
      series.name = 'Heat Vision and Jack'
      series.backdrop_path = '/series-1.jpg'
      series.poster_path = '/series-1-poster.jpg'
      series.first_air_date = '1999-01-01'
      series.overview = 'A pilot about a super-intelligent astronaut.'
      const bannerPath = series.backdrop_path
      const posterPath = series.poster_path

      return {
        provider: 'tmdb',
        id: providerId,
        type: 'serie',
        name: series.name,
        bannerPath,
        bannerUrl: makeImageUrl(this.config.baseImageUrl, bannerPath),
        posterPath,
        posterUrl: makeImageUrl(this.config.baseImageUrl, posterPath),
        releasedAt: series.first_air_date,
        summary: series.overview,
      }
    }

    if (type === 'movie' && providerId === 'movie-2') {
      const movie = fakeGet3MovieByMovieIdResponse()
      movie.id = 2
      movie.title = 'Unknown Heat'
      movie.backdrop_path = '/movie-2.jpg'
      movie.poster_path = '/movie-2-poster.jpg'
      movie.release_date = '2000-01-01'
      movie.runtime = 90
      movie.overview = 'A fake generated movie result.'
      const bannerPath = movie.backdrop_path
      const posterPath = movie.poster_path

      return {
        provider: 'tmdb',
        id: providerId,
        type: 'movie',
        name: movie.title,
        bannerPath,
        bannerUrl: makeImageUrl(this.config.baseImageUrl, bannerPath),
        posterPath,
        posterUrl: makeImageUrl(this.config.baseImageUrl, posterPath),
        releasedAt: movie.release_date,
        duration: movie.runtime,
        summary: movie.overview,
      }
    }

    if (type === 'movie' && providerId === 'movie-unknown-runtime') {
      const movie = fakeGet3MovieByMovieIdResponse()
      movie.id = 3
      movie.title = 'Unknown Runtime Heat'
      movie.backdrop_path = '/movie-unknown-runtime.jpg'
      movie.poster_path = '/movie-unknown-runtime-poster.jpg'
      movie.release_date = '2001-01-01'
      movie.runtime = 0
      movie.overview = 'A movie without a known runtime.'
      const bannerPath = movie.backdrop_path
      const posterPath = movie.poster_path

      return {
        provider: 'tmdb',
        id: providerId,
        type: 'movie',
        name: movie.title,
        bannerPath,
        bannerUrl: makeImageUrl(this.config.baseImageUrl, bannerPath),
        posterPath,
        posterUrl: makeImageUrl(this.config.baseImageUrl, posterPath),
        releasedAt: movie.release_date,
        duration: null,
        summary: movie.overview,
      }
    }

    return null
  }

  async seasons(providerId: string): Promise<CatalogSeason[]> {
    if (providerId !== 'series-1' && providerId !== 'series-1-changed') return []

    return [
      { season: 0, name: 'Specials' },
      { season: 1, name: 'Season 1' },
    ]
  }

  async episodes(providerId: string, season: number): Promise<CatalogEpisode[]> {
    if (providerId !== 'series-1' && providerId !== 'series-1-changed') return []

    const firstEpisodeName = providerId === 'series-1-changed' ? 'Changed Pilot' : 'Pilot'
    const firstEpisodeRuntime = providerId === 'series-1-changed' ? 99 : 24

    if (season === 0) {
      return [
        {
          providerId: 'episode-0-1',
          season: 0,
          episode: 1,
          name: 'Unaired Pilot',
          releasedAt: '1999-01-01',
          duration: 28,
          summary: 'The original special episode.',
          isSpecial: true,
        },
      ]
    }

    if (season === 1) {
      return [
        {
          providerId: 'episode-1-1',
          season: 1,
          episode: 1,
          name: firstEpisodeName,
          releasedAt: '1999-01-01',
          duration: firstEpisodeRuntime,
          summary: 'Jack Austin meets his talking motorcycle.',
          isSpecial: false,
        },
        {
          providerId: 'episode-1-2',
          season: 1,
          episode: 2,
          name: 'Future Episode',
          releasedAt: '2999-01-01',
          duration: 25,
          summary: 'An episode from the future.',
          isSpecial: false,
        },
        {
          providerId: 'episode-1-3',
          season: 1,
          episode: 3,
          name: 'Unknown Runtime Episode',
          releasedAt: '1999-01-08',
          duration: null,
          summary: 'An episode without a known runtime.',
          isSpecial: false,
        },
      ]
    }

    return []
  }

  async findEpisode(
    serieId: string,
    season: number,
    episode: number
  ): Promise<CatalogEpisode | null> {
    if (serieId !== 'series-1' && serieId !== 'series-1-changed') return null

    const firstEpisodeName = serieId === 'series-1-changed' ? 'Changed Pilot' : 'Pilot'
    const firstEpisodeRuntime = serieId === 'series-1-changed' ? 99 : 24

    if (season === 0 && episode === 1) {
      return {
        providerId: 'episode-0-1',
        season: 0,
        episode: 1,
        name: 'Unaired Pilot',
        releasedAt: '1999-01-01',
        duration: 28,
        summary: 'The original special episode.',
        isSpecial: true,
      }
    }

    if (season === 1 && episode === 1) {
      return {
        providerId: 'episode-1-1',
        season: 1,
        episode: 1,
        name: firstEpisodeName,
        releasedAt: '1999-01-01',
        duration: firstEpisodeRuntime,
        summary: 'Jack Austin meets his talking motorcycle.',
        isSpecial: false,
      }
    }

    if (season === 1 && episode === 2) {
      return {
        providerId: 'episode-1-2',
        season: 1,
        episode: 2,
        name: 'Future Episode',
        releasedAt: '2999-01-01',
        duration: 25,
        summary: 'An episode from the future.',
        isSpecial: false,
      }
    }

    if (season === 1 && episode === 3) {
      return {
        providerId: 'episode-1-3',
        season: 1,
        episode: 3,
        name: 'Unknown Runtime Episode',
        releasedAt: '1999-01-08',
        duration: null,
        summary: 'An episode without a known runtime.',
        isSpecial: false,
      }
    }

    return null
  }
}

function makeImageUrl(baseImageUrl: string, path: string) {
  return new URL(path.replace(/^\/+/, ''), baseImageUrl).toString()
}
