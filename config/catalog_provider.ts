import env from '#start/env'
import type { CatalogProviderConfig } from '#providers/catalog_provider/types'

const catalogProviderConfig: CatalogProviderConfig = {
  default: env.get('CATALOG_PROVIDER_DRIVER'),
  drivers: {
    fake: {
      baseImageUrl: 'http://localhost:3000/images/',
      failureQuery: 'fail',
    },
    tmdb: {
      baseImageUrl: 'https://image.tmdb.org/t/p/original/',
      accessToken: env.get('TMDB_ACCESS_TOKEN'),
    },
  },
}

export default catalogProviderConfig
