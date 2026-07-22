import env from '#start/env'
import type { CatalogProviderConfig } from '#providers/catalog_provider/types'

const catalogProviderConfig: CatalogProviderConfig = {
  default: env.get('CATALOG_PROVIDER_DRIVER', 'tmdb'),
  drivers: {
    fake: {
      failureQuery: 'fail',
      results: [
        {
          provider: 'tmdb',
          providerTitleId: 'movie-1',
          type: 'movie',
          name: 'Heat',
          bannerUrl: 'https://image.tmdb.org/t/p/w780/movie-1.jpg',
          releaseYear: 1995,
          summary: 'A professional thief and a relentless detective collide.',
        },
        {
          provider: 'tmdb',
          providerTitleId: 'series-1',
          type: 'series',
          name: 'Heat Vision and Jack',
          bannerUrl: 'https://image.tmdb.org/t/p/w780/series-1.jpg',
          releaseYear: 1999,
          summary: 'A pilot about a super-intelligent astronaut.',
        },
      ],
    },
    tmdb: {
      accessToken: env.get('TMDB_ACCESS_TOKEN'),
    },
  },
}

export default catalogProviderConfig
