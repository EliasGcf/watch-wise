import {
  fakeGet3MovieByMovieIdResponse,
  fakeGet3SearchMultiResponse,
  fakeGet3TvBySeriesIdResponse,
} from '#generated/tmdb/@faker-js/faker.gen'
import type {
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
          bannerUrl: new URL(bannerPath, this.config.baseImageUrl).toString(),
          posterPath,
          posterUrl: new URL(posterPath, this.config.baseImageUrl).toString(),
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
        bannerUrl: new URL(bannerPath, this.config.baseImageUrl).toString(),
        posterPath,
        posterUrl: new URL(posterPath, this.config.baseImageUrl).toString(),
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
        bannerUrl: new URL(bannerPath, this.config.baseImageUrl).toString(),
        posterPath,
        posterUrl: new URL(posterPath, this.config.baseImageUrl).toString(),
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
        bannerUrl: new URL(bannerPath, this.config.baseImageUrl).toString(),
        posterPath,
        posterUrl: new URL(posterPath, this.config.baseImageUrl).toString(),
        releasedAt: movie.release_date,
        duration: movie.runtime,
        summary: movie.overview,
      }
    }

    return null
  }
}
