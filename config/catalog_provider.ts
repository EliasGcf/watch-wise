import env from '#start/env'
import type { CatalogProviderConfig } from '#providers/catalog_provider/types'

const catalogProviderConfig: CatalogProviderConfig = {
  default: env.get('CATALOG_PROVIDER_DRIVER'),
  drivers: {
    fake: {
      failureQuery: 'fail',
      results: [
        {
          provider: 'tmdb',
          providerId: 'movie-1',
          type: 'movie',
          name: 'Heat',
          bannerUrl: 'https://image.tmdb.org/t/p/w780/movie-1.jpg',
          releaseDate: '1995-12-15',
          summary: 'A professional thief and a relentless detective collide.',
        },
        {
          provider: 'tmdb',
          providerId: 'series-1',
          type: 'series',
          name: 'Heat Vision and Jack',
          bannerUrl: 'https://image.tmdb.org/t/p/w780/series-1.jpg',
          releaseDate: '1999-01-01',
          summary: 'A pilot about a super-intelligent astronaut.',
        },
        {
          provider: 'tmdb',
          providerId: 'movie-2',
          type: 'movie',
          name: 'Unknown Heat',
          bannerUrl: null,
          releaseDate: null,
          summary: null,
        },
      ],
    },
    tmdb: {
      accessToken: env.get('TMDB_ACCESS_TOKEN'),
    },
  },
}

export default catalogProviderConfig
